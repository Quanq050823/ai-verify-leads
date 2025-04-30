from celery_app import app
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from config import Config
import json
import requests

from utils.dbUtils import get_node_settings, get_user_calendar_conn, update_tokens, get_lead, update_lead_status_and_current_node
from datetime import datetime, timedelta

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
            'requestId': f"meet-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
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
            'expiry': credentials.expiry.isoformat() if credentials.expiry else None
        })

def extract_meet_link(event):
    """Extract the Google Meet link from the event."""
    if 'conferenceData' in event and 'entryPoints' in event['conferenceData']:
        for entry_point in event['conferenceData']['entryPoints']:
            if entry_point.get('entryPointType') == 'video':
                return entry_point.get('uri')
    return None

@app.task(name="tasks.googleCalendar")
def google_calendar(message):
    try:
        print(f"Received message {message} ...")

        settings = get_node_settings(message)
        conn = get_user_calendar_conn(message, settings["connection"])
        tokens = conn["tokens"]
        lead = get_lead(message)

        credentials = create_credentials(tokens)
    
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            refresh_tokens_if_needed(credentials, tokens, message, settings["connection"])

        
        service = build('calendar', 'v3', credentials=credentials)

        now = datetime.utcnow()
        duration_hours = int(settings.get('duration', 1))
        end_time = now + timedelta(hours=duration_hours)

        start_time_str = now.isoformat() + 'Z'
        end_time_str = end_time.isoformat() + 'Z'
        time_zone = message.get('time_zone', 'UTC')

        event_body = build_event_body(settings, lead, start_time_str, end_time_str, time_zone)

        event = service.events().insert(
            calendarId='primary',
            body=event_body,
            conferenceDataVersion=1
        ).execute()

        refresh_tokens_if_needed(credentials, tokens, message, settings["connection"])

        calendar_link = event.get('htmlLink')
        meet_link = extract_meet_link(event)

        update_lead_status_and_current_node(message["leadId"], 2, message["targetNode"])

        return {
            'calendar_link': calendar_link,
            'meet_link': meet_link
        }
    except Exception as e:
        print(f"Error creating calendar event: {e}")
        raise