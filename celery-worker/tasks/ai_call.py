from celery_app import app
from db import get_mongo_client
from bson import ObjectId

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
    
    