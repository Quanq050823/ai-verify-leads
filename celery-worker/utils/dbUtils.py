from db import get_mongo_client
from bson import ObjectId

def get_lead(message):
    client = get_mongo_client()
    db = client.get_default_database()
    collection = db["leads"]
    
    lead = collection.find_one({"_id": ObjectId(message["leadId"])})
    if not lead:
        raise ValueError(f"Lead with ID {message.get("leadId")} not found.")
    
    return lead

def get_node_settings(message):
    client = get_mongo_client()
    db = client.get_default_database()
    collection = db["flows"]
    
    flow = collection.find_one({"_id": ObjectId(message["flowId"])})
    if not flow:
        raise ValueError(f"Flow with ID {message.get("flowId")} not found.")
    
    nodes = flow["nodeData"]["nodes"]
    settings = {}
    for node in nodes:
        if node["id"] == message["targetNode"]:
            node_data = node
            settings = node_data["data"]["settings"]
            # print (f"questions: {settings}")
            break
    else:
        raise ValueError(f"Node with ID {message.get("nodeId")} not found.")
    
    return settings

def get_user_calendar_conn(message, connectionId):
    client = get_mongo_client()
    db = client.get_default_database()
    collection = db["users"]
    
    user = collection.find_one({"_id": ObjectId(message["userId"])})
    if not user:
        raise ValueError(f"User with ID {message.get("userId")} not found.")
    
    connections = user["calendarConnection"]
    conn = {}
    for connection in connections:
        if connection["_id"] == ObjectId(connectionId):
            conn = connection
            # print (f"settings: {conn}")
            break
    
    return conn

def update_tokens(userId, connectionId, tokens):
    client = get_mongo_client()
    db = client.get_default_database()
    collection = db["users"]
    
    user = collection.find_one({"_id": ObjectId(userId)})
    if not user:
        raise ValueError(f"User with ID {userId} not found.")
    
    connections = user["calendarConnection"]
    for connection in connections:
        if connection["_id"] == ObjectId(connectionId):
            connection["tokens"] = tokens
            break
    
    collection.update_one({"_id": ObjectId(userId)}, {"$set": {"calendarConnection": connections}})
    
def update_lead_status_and_current_node(leadId, status, currentNode):
    client = get_mongo_client()
    db = client.get_default_database()
    collection = db["leads"]
    
    lead = collection.find_one({"_id": ObjectId(leadId)})
    if not lead:
        raise ValueError(f"Lead with ID {leadId} not found.")
    
    collection.update_one({"_id": ObjectId(leadId)}, {"$set": {"status": status, "nodeId": currentNode}})