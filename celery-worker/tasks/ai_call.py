from celery_app import app
from db import get_mongo_client
from bson import ObjectId
import json
import requests

@app.task(name="tasks.ai_call")
def ai_call(message):
    print(f"Received message: {message}")
    
    # Declare db
    client = get_mongo_client()
    db = client.get_default_database()
    collection = db["flows"]
    
    flow = collection.find_one({"_id": ObjectId(message["flowId"])})
    if not flow:
        raise ValueError(f"Flow with ID {message.get("flowId")} not found.")
    
    nodes = flow["nodeData"]["nodes"]
    questions = []
    for node in nodes:
        if node["id"] == message["targetNode"]:
            node_data = node
            questions = node_data["data"]["settings"]["questions"]
            print (f"questions: {questions}")
            break
    else:
        raise ValueError(f"Node with ID {message.get("nodeId")} not found.")
    
    # Make API request to external calling service
    url = "https://callflow143.primas.net:1501/system/CallFlow/outreach/195"
    headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI5MTZjNjgzMi00YjZjLTQ5ZDAtOTA3OC1mMzIxOGUwNjgyNDgiLCJuYW1lIjoiYWRtaW5AcHJpbWFzLm5ldCIsInJvbGUiOiI5OTktU3VwZXJBZG1pbiIsImxhc3Rsb2dpbiI6IjUvMjYvMjAyMyAxMDoxMDo0OSBBTSIsInBpY3R1cmUiOiIiLCJuYmYiOjE2ODUwNzA2NTUsImV4cCI6MjAwMDY4OTg0OSwiaWF0IjoxNjg1MDcwNjU1fQ.dnGhU1U72CI2k_BOS2IU1j1Bk5D8YSfv1ZD505_vUEc",  # Replace 'Token' with actual token if you have one
        "Content-Type": "application/json"
    }
    body = {
        "phoneNumber": message.get("phoneNumber", "50001"),  # default for testing
        "callerId": "",
        "callerNumber": message.get("callerNumber", "6545621000"),
        "attribute": json.dumps({"questions": questions}), 
        "outreachType": "phonecall",
        "ExtendData": {}
    }

    try:
        response = requests.post(url, headers=headers, json=body, verify=False)
        response.raise_for_status()
        print("Call API Response:", response.json())
        return response.json()
    except requests.RequestException as e:
        print("Error calling external API:", str(e))
        raise
