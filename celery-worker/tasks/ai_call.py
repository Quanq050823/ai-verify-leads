from celery_app import app
from db import get_mongo_client
from bson import ObjectId
import json
import requests
from utils.dbUtils import * 

from tasks.base_tasks_handler import BaseTaskHandler

@app.task(name="tasks.aiCall", base=BaseTaskHandler, bind=True, max_retries=3)
def ai_call(self, message):
    try:
        print(f"Received message: {message}")
        
        settings = get_node_settings(message)
        questions = settings.get("questions", [])
        data = {
            "leadId": message["leadId"],
            "questions": settings["questions"],
            "introduction": settings["introduction"],
            "goodByeMessage": settings["goodByeMessage"],
        }
        update_lead_status_and_current_node(message["leadId"], 2, message["targetNode"])
            
        # Make API request to external calling service
        url = "https://poc.io.vn/system/CallFlow/outreach/2"
        headers = {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI5MTZjNjgzMi00YjZjLTQ5ZDAtOTA3OC1mMzIxOGUwNjgyNDgiLCJuYW1lIjoiYWRtaW5AcHJpbWFzLm5ldCIsInJvbGUiOiI5OTktU3VwZXJBZG1pbiIsImxhc3Rsb2dpbiI6IjUvMjYvMjAyMyAxMDoxMDo0OSBBTSIsInBpY3R1cmUiOiIiLCJuYmYiOjE2ODUwNzA2NTUsImV4cCI6MjAwMDY4OTg0OSwiaWF0IjoxNjg1MDcwNjU1fQ.dnGhU1U72CI2k_BOS2IU1j1Bk5D8YSfv1ZD505_vUEc",  # Replace 'Token' with actual token if you have one
            "Content-Type": "application/json"
        }
        body = {
            "phoneNumber": message.get("phoneNumber", "50002"),  # default for testing
            "callerId": "",
            "callerNumber": message.get("callerNumber", "6545621000"),
            "attribute": json.dumps(data), 
            "outreachType": "phonecall",
            "ExtendData": {}
        }

        response = requests.post(url, headers=headers, json=body, verify=False)
        response.raise_for_status()
        print("Call API Response:", response.json())
        return response.json()
    except requests.RequestException as e:
        print("Error calling external API:", str(e))
        if self.request.retries < self.max_retries:
            countdown = 5  # Retry after 5 seconds
            raise self.retry(exc=e, countdown=countdown)
        raise

