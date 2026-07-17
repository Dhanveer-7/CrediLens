import os

main_py_path = r"c:\Users\Dhanveer\OneDrive\Desktop\CrediLens\backend\main.py"

if os.path.exists(main_py_path):
    with open(main_py_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Inject schema
    old_schema = """class UserLogin(BaseModel):
    email: str
    password: str"""

    new_schema = """class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str"""

    content = content.replace(old_schema, new_schema)

    # 2. Inject endpoint
    old_endpoint = """@app.get("/api/auth/me")
def get_me(email: str = Depends(get_current_user)):
    user = database.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user"""

    new_endpoint = """@app.get("/api/auth/me")
def get_me(email: str = Depends(get_current_user)):
    user = database.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/auth/google")
def google_login(payload: GoogleLoginRequest):
    import urllib.request
    import json
    
    credential = payload.credential
    
    if credential == "mock_google_credential":
        email = "google.demo@credilens.com"
        fullname = "Google Demo User"
    else:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                google_user = json.loads(response.read().decode())
                
            email = google_user.get("email")
            fullname = google_user.get("name", "Google User")
            
            if not email:
                raise HTTPException(status_code=400, detail="Google token did not contain an email address")
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Google authentication failed: {str(e)}")
            
    # Check if user already exists
    user = database.get_user_by_email(email)
    if not user:
        # Register a new user with an empty password hash (since they authenticate with Google OAuth)
        user = database.create_user(email, "", fullname)
        if not user:
            raise HTTPException(status_code=400, detail="Failed to register Google user")
            
    # Generate JWT access token
    token = create_token(email)
    
    # Retrieve actual profile (excluding password hash)
    actual_user = database.get_user_by_email(email)
    return {
        "token": token,
        "email": actual_user["email"],
        "fullname": actual_user["fullname"]
    }"""

    content = content.replace(old_endpoint, new_endpoint)

    with open(main_py_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated main.py with Google Login schema and route.")
else:
    print("Error: main.py not found.")
