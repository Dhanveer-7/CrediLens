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

# Initialize client with certificate authority bundle to prevent SSL TLS alerts on Windows
client_kwargs = {}
if "mongodb+srv://" in MONGO_URI:
    try:
        import certifi
        client_kwargs["tlsCAFile"] = certifi.where()
    except ImportError:
        pass

# Failsafe Local JSON database configurations
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

class MockCursor:
    def __init__(self, items):
        self.items = items
        
    def sort(self, field, direction=-1):
        try:
            self.items.sort(key=lambda x: x.get(field, ""), reverse=(direction == -1))
        except Exception:
            pass
        return self
        
    def __iter__(self):
        return iter(self.items)

class LocalCollectionMock:
    def __init__(self, table_name: str):
        self.table_name = table_name # "users" or "history"
        
    def find_one(self, query: dict, projection: dict = None):
        db_data = _load_local_db()
        items = db_data.get(self.table_name, [])
        for item in items:
            match = True
            for k, v in query.items():
                if k == "email":
                    if item.get("email", "").lower() != v.lower():
                        match = False
                elif item.get(k) != v:
                    match = False
            if match:
                item_copy = item.copy()
                if projection and "password" in projection and projection["password"] == 0:
                    item_copy.pop("password", None)
                return item_copy
        return None
        
    def insert_one(self, document: dict):
        db_data = _load_local_db()
        if "_id" not in document:
            document["_id"] = str(uuid.uuid4())
        db_data.setdefault(self.table_name, []).append(document)
        _save_local_db(db_data)
        
        class InsertOneResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertOneResult(document["_id"])
        
    def update_one(self, query: dict, update: dict):
        db_data = _load_local_db()
        items = db_data.get(self.table_name, [])
        for item in items:
            match = True
            for k, v in query.items():
                if k == "email":
                    if item.get("email", "").lower() != v.lower():
                        match = False
                elif item.get(k) != v:
                    match = False
            if match:
                if "$set" in update:
                    for uk, uv in update["$set"].items():
                        item[uk] = uv
                _save_local_db(db_data)
                break
                
    def find(self, query: dict):
        db_data = _load_local_db()
        items = db_data.get(self.table_name, [])
        results = []
        for item in items:
            match = True
            for k, v in query.items():
                if k == "email":
                    if item.get("email", "").lower() != v.lower():
                        match = False
                elif item.get(k) != v:
                    match = False
            if match:
                results.append(item.copy())
        return MockCursor(results)

# Setup collections with fallback
MONGO_AVAILABLE = True
try:
    # Set a fast 2-second timeout to avoid locking the application
    client_kwargs["serverSelectionTimeoutMS"] = 2000
    client = MongoClient(MONGO_URI, **client_kwargs)
    client.admin.command('ping')
    db = client["credilens"]
    users_col = db["users"]
    history_col = db["history"]
    print("SUCCESS: Connected to MongoDB Atlas!")
except Exception as e:
    MONGO_AVAILABLE = False
    print("WARNING: MongoDB Atlas connection failed. Falling back to Local File DB mode!")
    print(f"Error detail: {e}")
    users_col = LocalCollectionMock("users")
    history_col = LocalCollectionMock("history")

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
        "created_at": datetime.datetime.utcnow().isoformat() if not MONGO_AVAILABLE else datetime.datetime.utcnow(),
        "preferred_language": "en"
    }
    result = users_col.insert_one(user)
    
    # Return user data without password hash
    user_copy = user.copy()
    user_copy["_id"] = str(result.inserted_id)
    user_copy.pop("password", None)
    return user_copy

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
        "timestamp": datetime.datetime.utcnow().isoformat() if not MONGO_AVAILABLE else datetime.datetime.utcnow(),
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
    history_list = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("timestamp"), datetime.datetime):
            doc["timestamp"] = doc["timestamp"].isoformat()
        history_list.append(doc)
    return history_list
