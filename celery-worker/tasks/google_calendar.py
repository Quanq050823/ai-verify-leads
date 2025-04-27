from celery_app import app
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from config import Config
import json
import requests

from utils.dbUtils import get_node_settings, get_user_calendar_conn, update_tokens, get_lead, update_lead_status_and_current_node
from datetime import datetime, timedelta

@app.task(name = "tasks.googleCalendar")
def google_calendar(message):    
    try:
        print(f"Received message {message} ...")


        settings = get_node_settings(message)
        conn = get_user_calendar_conn(message, settings["connection"])
        tokens = conn["tokens"]
        lead = get_lead(message)
        update_lead_status_and_current_node(message["leadId"], 2, message["targetNode"])
        
        # 2. Create credentials
        credentials = Credentials(
            tokens['access_token'],
            refresh_token=tokens['refresh_token'],
            token_uri="https://oauth2.googleapis.com/token",
            client_id=Config.GOOGLE_CLIENT_ID,
            client_secret=Config.GOOGLE_CLIENT_SECRET  
        )

        # 3. Build Google Calendar API client
        service = build('calendar', 'v3', credentials=credentials)

        # Set start time to now and end time to 1 hour later
        now = datetime.utcnow()
        end_time = now + timedelta(hours=1)
        
        # Format times in ISO format for Google Calendar API
        start_time_str = now.isoformat() + 'Z'  # 'Z' indicates UTC time
        # Use duration from settings or default to 1 hour
        duration_hours = int(settings.get('duration', 1))
        end_time = now + timedelta(hours=duration_hours)
        end_time_str = end_time.isoformat() + 'Z'  # 'Z' indicates UTC time

        # Add conference data to create Google Meet link
        conference_data = {
            'createRequest': {
                'requestId': f"meet-{now.strftime('%Y%m%d%H%M%S')}",
                'conferenceSolutionKey': {
                    'type': 'hangoutsMeet'
                }
            }
        }

        event_body = {
            'summary': settings.get('eventName', 'No Title'),  # Event title
            'description': settings.get('description', 'Meeting created automatically'),
            'start': {
                'dateTime': start_time_str,
                'timeZone': message.get('time_zone', 'UTC'),
            },
            'end': {
                'dateTime': end_time_str,
                'timeZone': message.get('time_zone', 'UTC'),
            },
            'attendees': [
                {'email': lead["leadData"]["email"]},  # Attendee email from lead data
            ],
            'reminders': {
                'useDefault': True,
            },
            # Add conference data to create Google Meet
            'conferenceData': conference_data
        }

        # The conferenceDataVersion=1 parameter is required to enable the creation of Meet conferences
        event = service.events().insert(
            calendarId='primary',
            body=event_body,
            conferenceDataVersion=1
        ).execute()
        
        # Check if token was refreshed by comparing with original tokens
        if credentials.token != tokens['access_token']:
            print("Token was refreshed, updating in database...")
            update_tokens(message["userId"], settings["connection"], {
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
                'token_uri': credentials.token_uri,
                'client_id': credentials.client_id,
                'client_secret': credentials.client_secret,
                'expiry': credentials.expiry.isoformat() if credentials.expiry else None
            })
        
        # Return both the calendar event link and the Meet link if available
        calendar_link = event.get('htmlLink')
        meet_link = None
        if 'conferenceData' in event and 'entryPoints' in event['conferenceData']:
            for entry_point in event['conferenceData']['entryPoints']:
                if entry_point.get('entryPointType') == 'video':
                    meet_link = entry_point.get('uri')
                    break
        
        return {
            'calendar_link': calendar_link,
            'meet_link': meet_link
        }
    except Exception as e:
        print(f"Error creating calendar event: {e}")
        raise