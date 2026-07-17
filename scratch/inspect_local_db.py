import sys
import json
sys.path.insert(0, 'backend')
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
uri = os.getenv('MONGODB_URI')
client = MongoClient(uri)
db = client["credilens"]

print("--------------------------------------------------")
print("INSPECTING LOCAL MONGO DATABASE STATUS")
print("Connection Target:", uri)
print("Active Collections:", db.list_collection_names())

print("\n--- USER SCHEMA FORMAT ---")
user = db["users"].find_one()
if user:
    user["_id"] = str(user["_id"])
    if "created_at" in user:
        user["created_at"] = str(user["created_at"])
    if "password" in user and user["password"]:
        user["password"] = user["password"][:15] + "..." # Masked password hash
    print(json.dumps(user, indent=2))
else:
    print("No user profiles found in local database.")

print("\n--- ANALYSIS HISTORY SCHEMA FORMAT ---")
history = db["history"].find_one()
if history:
    history["_id"] = str(history["_id"])
    if "timestamp" in history:
        history["timestamp"] = str(history["timestamp"])
    if "analysis" in history:
        history["analysis"] = "{ ... full Gemini-extracted structured JSON (EMI, fees, risks, simplified clauses) ... }"
    print(json.dumps(history, indent=2))
else:
    print("No history records found in local database.")
print("--------------------------------------------------")
