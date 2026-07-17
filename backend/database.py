import os
import datetime
from bson import ObjectId
from pymongo import MongoClient
import bcrypt

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017"

# Strip quotes if present
if isinstance(MONGO_URI, str):
    MONGO_URI = MONGO_URI.strip().strip("'").strip('"')

# Initialize client with certificate authority bundle to prevent SSL TLS alerts on Windows
client_kwargs = {}
if "mongodb+srv://" in MONGO_URI:
    try:
        import certifi
        client_kwargs["tlsCAFile"] = certifi.where()
    except ImportError:
        pass

client = MongoClient(MONGO_URI, **client_kwargs)
db = client["credilens"]

users_col = db["users"]
history_col = db["history"]

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

# User Operations
def create_user(email: str, password_hash: str, fullname: str = "") -> dict:
    # Check if user already exists
    if users_col.find_one({"email": email.lower()}):
        return None
    
    user = {
        "email": email.lower(),
        "password": password_hash,
        "fullname": fullname,
        "created_at": datetime.datetime.utcnow(),
        "preferred_language": "en"
    }
    result = users_col.insert_one(user)
    user["_id"] = str(result.inserted_id)
    user.pop("password", None)
    return user

def get_user_by_email(email: str) -> dict:
    user = users_col.find_one({"email": email.lower()})
    if user:
        user["_id"] = str(user["_id"])
        user.pop("password", None) # Exclude password hash from response
        return user
    return None

def update_user_language(email: str, lang: str):
    users_col.update_one({"email": email.lower()}, {"$set": {"preferred_language": lang}})

# History Operations
def save_analysis(email: str, filename: str, analysis_data: dict) -> str:
    # Fetch user's full name from database
    user = users_col.find_one({"email": email.lower()})
    fullname = user.get("fullname", "") if user else ""

    # We store the analysis data along with some quick-search metadata
    summary = analysis_data.get("summary", {})
    risk = analysis_data.get("risk_assessment", {})
    
    record = {
        "email": email.lower(),
        "fullname": fullname,
        "filename": filename,
        "timestamp": datetime.datetime.utcnow(),
        "loan_amount": summary.get("loan_amount", "N/A"),
        "interest_rate": summary.get("interest_rate", "N/A"),
        "estimated_emi": summary.get("estimated_emi", "N/A"),
        "risk_score": risk.get("risk_score", 0),
        "risk_level": risk.get("risk_level", "Unknown"),
        "analysis": analysis_data
    }
    result = history_col.insert_one(record)
    return str(result.inserted_id)

def get_user_history(email: str) -> list:
    cursor = history_col.find({"email": email.lower()}).sort("timestamp", -1)
    history = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        # Format timestamp as ISO string
        if isinstance(doc.get("timestamp"), datetime.datetime):
            doc["timestamp"] = doc["timestamp"].isoformat()
        history.append(doc)
    return history

def get_analysis_by_id(analysis_id: str, email: str) -> dict:
    try:
        doc = history_col.find_one({"_id": ObjectId(analysis_id), "email": email.lower()})
        if doc:
            doc["_id"] = str(doc["_id"])
            if isinstance(doc.get("timestamp"), datetime.datetime):
                doc["timestamp"] = doc["timestamp"].isoformat()
            return doc
    except Exception:
        pass
    return None
