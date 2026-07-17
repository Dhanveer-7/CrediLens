import os
import datetime
import json
import uuid
from bson import ObjectId
from pymongo import MongoClient
import bcrypt

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGODB_URI") or "mongodb://localhost:27017"

# Strip quotes if present
if isinstance(MONGO_URI, str):
    MONGO_URI = MONGO_URI.strip().strip("'").strip('"')

# Initialize client with certificate authority bundle and ignore invalid certs for local TLS compatibility
client_kwargs = {
    "serverSelectionTimeoutMS": 2000,
    "tlsAllowInvalidCertificates": True # Failsafe for Python 3.14 TLS alert errors
}

if "mongodb+srv://" in MONGO_URI:
    try:
        import certifi
        client_kwargs["tlsCAFile"] = certifi.where()
    except ImportError:
        pass

# Failsafe Local JSON database path
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "local_db.json")

def _load_local_db():
    if not os.path.exists(LOCAL_DB_PATH):
        return {"users": [], "history": []}
    try:
        with open(LOCAL_DB_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"users": [], "history": []}

def _save_local_db(data):
    try:
        with open(LOCAL_DB_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print("Failed to write local database:", e)

# Setup MongoDB Collections
MONGO_AVAILABLE = True
try:
    client = MongoClient(MONGO_URI, **client_kwargs)
    client.admin.command('ping')
    db = client["credilens"]
    users_col = db["users"]
    history_col = db["history"]
    print("SUCCESS: Connected to MongoDB Atlas!")
except Exception as e:
    MONGO_AVAILABLE = False
    print("WARNING: MongoDB Atlas connection failed. Defaulting to Local File DB mode.")
    print(f"Error detail: {e}")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

# User Operations
def create_user(email: str, password_hash: str, fullname: str = "") -> dict:
    user = {
        "email": email.lower(),
        "password": password_hash,
        "fullname": fullname,
        "created_at": datetime.datetime.utcnow(),
        "preferred_language": "en"
    }
    
    if MONGO_AVAILABLE:
        try:
            result = users_col.insert_one(user)
            user_copy = user.copy()
            user_copy["_id"] = str(result.inserted_id)
            user_copy.pop("password", None)
            user_copy["created_at"] = user_copy["created_at"].isoformat() if hasattr(user_copy["created_at"], "isoformat") else str(user_copy["created_at"])
            return user_copy
        except Exception as e:
            print("MongoDB insert failed, falling back to local DB:", e)
            
    # Fallback to local DB
    db_data = _load_local_db()
    # Check if already exists in local DB
    for u in db_data["users"]:
        if u["email"] == email.lower():
            u_copy = u.copy()
            u_copy.pop("password", None)
            return u_copy
            
    user["_id"] = str(uuid.uuid4())
    user["created_at"] = datetime.datetime.utcnow().isoformat()
    db_data.setdefault("users", []).append(user)
    _save_local_db(db_data)
    
    user_copy = user.copy()
    user_copy.pop("password", None)
    return user_copy

def get_user_by_email(email: str) -> dict:
    if MONGO_AVAILABLE:
        try:
            user = users_col.find_one({"email": email.lower()})
            if user:
                user["_id"] = str(user["_id"])
                user.pop("password", None)
                if isinstance(user.get("created_at"), datetime.datetime):
                    user["created_at"] = user["created_at"].isoformat()
                return user
            return None
        except Exception as e:
            print("MongoDB find_one failed, falling back to local DB:", e)
            
    # Fallback to local DB
    db_data = _load_local_db()
    for u in db_data["users"]:
        if u["email"] == email.lower():
            u_copy = u.copy()
            u_copy["_id"] = str(u_copy.get("_id", uuid.uuid4()))
            u_copy.pop("password", None)
            return u_copy
    return None

def get_raw_user_for_login(email: str) -> dict:
    """Helper to retrieve user containing password hash for verification."""
    if MONGO_AVAILABLE:
        try:
            return users_col.find_one({"email": email.lower()})
        except Exception as e:
            print("MongoDB get_raw_user failed, falling back to local DB:", e)
            
    # Fallback to local DB
    db_data = _load_local_db()
    for u in db_data["users"]:
        if u["email"] == email.lower():
            return u.copy()
    return None

def update_user_language(email: str, lang: str):
    if MONGO_AVAILABLE:
        try:
            users_col.update_one({"email": email.lower()}, {"$set": {"preferred_language": lang}})
            return
        except Exception as e:
            print("MongoDB update failed, falling back to local DB:", e)
            
    # Fallback to local DB
    db_data = _load_local_db()
    for u in db_data["users"]:
        if u["email"] == email.lower():
            u["preferred_language"] = lang
            _save_local_db(db_data)
            break

# History Operations
def save_analysis(email: str, filename: str, analysis_data: dict) -> str:
    # Get user profile for name
    user = get_user_by_email(email)
    fullname = user.get("fullname", "") if user else ""

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
    
    if MONGO_AVAILABLE:
        try:
            result = history_col.insert_one(record)
            return str(result.inserted_id)
        except Exception as e:
            print("MongoDB insert failed for history, falling back to local DB:", e)
            
    # Fallback to local DB
    db_data = _load_local_db()
    record["_id"] = str(uuid.uuid4())
    record["timestamp"] = datetime.datetime.utcnow().isoformat()
    db_data.setdefault("history", []).append(record)
    _save_local_db(db_data)
    return record["_id"]

def get_user_history(email: str) -> list:
    if MONGO_AVAILABLE:
        try:
            cursor = history_col.find({"email": email.lower()}).sort("timestamp", -1)
            history_list = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                if isinstance(doc.get("timestamp"), datetime.datetime):
                    doc["timestamp"] = doc["timestamp"].isoformat()
                history_list.append(doc)
            return history_list
        except Exception as e:
            print("MongoDB find failed for history, falling back to local DB:", e)
            
    # Fallback to local DB
    db_data = _load_local_db()
    history_list = []
    for doc in db_data.get("history", []):
        if doc.get("email", "").lower() == email.lower():
            doc_copy = doc.copy()
            doc_copy["_id"] = str(doc_copy.get("_id", uuid.uuid4()))
            if isinstance(doc_copy.get("timestamp"), datetime.datetime):
                doc_copy["timestamp"] = doc_copy["timestamp"].isoformat()
            history_list.append(doc_copy)
            
    # Sort locally by timestamp descending
    try:
        history_list.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    except Exception:
        pass
    return history_list
