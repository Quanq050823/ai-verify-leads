from celery_app import app
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from config import Config
import json
import requests
from datetime import datetime, timedelta, time, timezone

from utils.dbUtils import *
from utils.calendarTimeUtil import *
from datetime import datetime, timedelta

@app.task(name="tasks.googleCalendar")
def google_calendar(message):
    try:
        print(f"Received message {message} ...")

        # Extract the connection ID from db
        settings = get_node_settings(message)
        conn = get_user_calendar_conn(message, settings["connection"])
        tokens = conn["tokens"]
        lead = get_lead(message)

        # Create credentials using the tokens
        credentials = create_credentials(tokens)
    
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            refresh_tokens_if_needed(credentials, tokens, message, settings["connection"])
        service = build('calendar', 'v3', credentials=credentials)

        # Prepare the time for the event
        now = datetime.now(timezone.utc) 
        duration_minute = int(settings.get('duration', 1))
        time_zone = 'UTC'

        busy_slots = get_busy_slots(service)
        # Convert UTC time to UTC+7 for finding available slots
        
        start_str = settings["startTime"]  # e.g., "09:00"
        end_str = settings["endTime"]      # e.g., "17:00"

        # Convert to datetime with today's date
        start_hour = datetime.strptime(start_str, "%H:%M") - timedelta(hours=7)
        end_hour = datetime.strptime(end_str, "%H:%M") - timedelta(hours=7)

        
        # Find nearest available slot in UTC+7 timezone
        next_slot = find_nearest_available_slot(busy_slots, 
            settings["startWorkday"], settings["endWorkday"], 
            start_hour.time(), end_hour.time(), duration_minute)

        if next_slot:
            start_time_str = next_slot.isoformat()
            end_time_str = (next_slot + timedelta(minutes=duration_minute)).isoformat()
            event_body = build_event_body(settings, lead, start_time_str, end_time_str, time_zone)
        else:
            print("No available time slots found.")
            return None

        event = service.events().insert(
            calendarId='primary',
            body=event_body,
            conferenceDataVersion=1
        ).execute()

        calendar_link = event.get('htmlLink')
        meet_link = extract_meet_link(event)

        # update_lead_status_and_current_node(message["leadId"], 2, message["targetNode"])

        return {
            'calendar_link': calendar_link,
            'meet_link': meet_link
        }
    except Exception as e:
        print(f"Error creating calendar event: {e}")
        # self.retry(exc=e, countdown=5, max_retries=3)
        raise

def create_credentials(tokens):
    """Create Google API credentials."""
    return Credentials(
        tokens['access_token'],
        refresh_token=tokens['refresh_token'],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=Config.GOOGLE_CLIENT_ID,
        client_secret=Config.GOOGLE_CLIENT_SECRET
    )

def build_event_body(settings, lead, start_time_str, end_time_str, time_zone):
    """Build the event body for Google Calendar."""
    conference_data = {
        'createRequest': {
            'requestId': f"meet-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            'conferenceSolutionKey': {
                'type': 'hangoutsMeet'
            }
        }
    }
    return {
        'summary': settings.get('eventName', 'No Title'),
        'description': settings.get('description', 'Meeting created automatically'),
        'start': {
            'dateTime': start_time_str,
            'timeZone': time_zone,
        },
        'end': {
            'dateTime': end_time_str,
            'timeZone': time_zone,
        },
        'attendees': [
            {'email': lead["leadData"]["email"]},
        ],
        'reminders': {
            'useDefault': True,
        },
        'conferenceData': conference_data
    }

def refresh_tokens_if_needed(credentials, tokens, message, connection):
    """Update tokens in the database if they were refreshed."""
    if credentials.token != tokens['access_token']:
        print("Token was refreshed, updating in database...")
        update_tokens(message["userId"], connection, {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'expiry_date': credentials.expiry,
            'refresh_token_expires_in': credentials.refresh_token_expires_in
        })

def extract_meet_link(event):
    """Extract the Google Meet link from the event."""
    if 'conferenceData' in event and 'entryPoints' in event['conferenceData']:
        for entry_point in event['conferenceData']['entryPoints']:
            if entry_point.get('entryPointType') == 'video':
                return entry_point.get('uri')
    return None
