from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Define the scopes
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Run the OAuth flow
flow = InstalledAppFlow.from_client_secrets_file('calendar_credentials.json', SCOPES)
creds = flow.run_local_server(port=0)

# Build the service
service = build('calendar', 'v3', credentials=creds)

event = {
    'summary': 'Appointment with Client',
    'location': '123 Main St, Anytown, USA',
    'description': 'Discuss project requirements.',
    'start': {
        'dateTime': '2025-04-28T10:00:00-07:00',
        'timeZone': 'America/Los_Angeles',
    },
    'end': {
        'dateTime': '2025-04-28T11:00:00-07:00',
        'timeZone': 'America/Los_Angeles',
    },
    'attendees': [
        {'email': 'akirajin149@gmail.com'},
    ],
    'reminders': {
        'useDefault': False,
        'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10},
        ],
    },
}

event = service.events().insert(calendarId='primary', body=event).execute()
print(f"Event created: {event.get('htmlLink')}")

from datetime import datetime, timedelta
import pytz

# Define the time range
tz = pytz.timezone('America/Los_Angeles')
start_time = tz.localize(datetime(2025, 4, 28, 10, 0, 0))
end_time = tz.localize(datetime(2025, 4, 28, 11, 0, 0))

body = {
    "timeMin": start_time.isoformat(),
    "timeMax": end_time.isoformat(),
    "timeZone": 'America/Los_Angeles',
    "items": [{"id": 'primary'}]
}

freebusy_result = service.freebusy().query(body=body).execute()
calendars = freebusy_result.get('calendars', {})
busy_times = calendars.get('primary', {}).get('busy', [])

if not busy_times:
    print("Time slot is available.")
    # Proceed to create the event
else:
    print("Time slot is busy. Choose another time.")

event['conferenceData'] = {
    'createRequest': {
        'requestId': 'sample123',
        'conferenceSolutionKey': {
            'type': 'hangoutsMeet'
        },
    }
}

event = service.events().insert(calendarId='primary', body=event, conferenceDataVersion=1).execute()
print(f"Google Meet Link: {event['hangoutLink']}")
