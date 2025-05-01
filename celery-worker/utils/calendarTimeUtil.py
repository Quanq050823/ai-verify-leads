import json
import requests
from datetime import datetime, timedelta, time, timezone
from datetime import datetime, timedelta

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request


#--------------- Get available time slots ---------------#
def get_busy_slots(service, calendar_id='primary', days_ahead=14):
    now = datetime.now(timezone.utc)  # Make now timezone-aware
    time_min = now.isoformat()
    time_max = (now + timedelta(days=days_ahead)).isoformat()

    events_result = service.freebusy().query(body={
        "timeMin": time_min,
        "timeMax": time_max,
        "timeZone": "UTC",
        "items": [{"id": calendar_id}]
    }).execute()

    busy = events_result['calendars'][calendar_id].get('busy', [])
    busy_slots = [
        (datetime.fromisoformat(b['start'].replace('Z', '+00:00')),
         datetime.fromisoformat(b['end'].replace('Z', '+00:00')))
        for b in busy
    ]
    return busy_slots

def get_working_days(start_date, startWeekday = 0, endWeekday = 4, num_days=7):
    days = []
    date = start_date
    tmp = 0
    while tmp < num_days:
        print(f"{startWeekday} | {endWeekday} | {date.weekday()}")
        if startWeekday <= date.weekday() <= endWeekday:  # Weekdays only (0-4 are Monday to Friday)
            days.append(date)
        date += timedelta(days=1)
        tmp += 1
    print(f"Working days: {days}")
    return days

def generate_time_slots(date, start_hour, end_hour, interval):
    slots = []
    current = datetime.combine(date.date(), start_hour, tzinfo=timezone.utc)
    end = datetime.combine(date.date(), end_hour, tzinfo=timezone.utc)
    while current < end:
        slot_end = current + timedelta(minutes=interval)
        slots.append((current, slot_end))
        current = slot_end
    return slots

def is_time_slot_available(slot_start, slot_end, busy_slots):
    for busy_start, busy_end in busy_slots:
        if slot_start < busy_end and slot_end > busy_start:
            return False
    return True

def find_nearest_available_slot(busy_slots, startWeekday =0, endWeekday=4, start_hour=8, end_hour=17, interval=60):
    now = datetime.now(timezone.utc)  # Make now timezone-aware
    working_days = get_working_days(now, startWeekday, endWeekday)

    for day in working_days:
        slots = generate_time_slots(day, start_hour, end_hour, interval)
        for slot_start, slot_end in slots:
            if slot_start < now:
                continue
            if is_time_slot_available(slot_start, slot_end, busy_slots):
                return slot_start
    return None