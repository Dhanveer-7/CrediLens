import os
import jwt
import datetime
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv
import pypdf

# Load environmental variables
load_dotenv()

# Import database module
import database

app = FastAPI(title="Loan Fine-Print Explainer API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "credilens-secret-key-987654")
JWT_ALGORITHM = "HS256"

# Helper for JWT Tokens
def create_token(email: str) -> str:
    payload = {
        "email": email.lower(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> str:
    try:
        # Check if token starts with Bearer
        if token.startswith("Bearer "):
            token = token.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["email"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Dependency to protect routes
def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    return verify_token(authorization)

# Gemini API Client helper
def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gemini API Key is missing. Please set GEMINI_API_KEY in the backend/.env file."
        )
    return genai.Client(api_key=api_key)

# Pydantic Schemas for Structured Output
class LoanSummary(BaseModel):
    loan_amount: str = Field(description="The principal loan amount requested or approved, with currency symbol (e.g. ₹5,00,000)")
    interest_rate: str = Field(description="Annual interest rate with type (fixed, floating, etc.) (e.g. 11.5% per year)")
    processing_fee: str = Field(description="Fees charged for processing the loan, with percentage and total amount if calculated (e.g. ₹10,000 (2%))")
    late_payment_penalty: str = Field(description="Charges for missed or delayed payments (e.g. ₹1,000 for every missed monthly payment)")
    pre_closure_charges: str = Field(description="Foreclosure/prepayment penalties for paying off the loan early (e.g. 3% of remaining principal)")
    loan_duration: str = Field(description="The tenure of the loan in years or months (e.g. 5 Years)")
    estimated_emi: str = Field(description="Estimated Monthly Installment, with currency (e.g. ₹10,989 per month)")

class HiddenCharge(BaseModel):
    charge_name: str = Field(description="Name of the charge (e.g. GST on Processing Fee, Bounce Charge)")
    amount_or_rate: str = Field(description="The financial cost (e.g. 18% of processing fee, ₹500 per bounce)")
    description: str = Field(description="Context of when this charge is applied in simple words")
    is_suspicious_or_unfair: bool = Field(description="True if this charge is higher than usual or hidden in deep text")

class RiskAssessment(BaseModel):
    risk_score: int = Field(description="A numeric score from 0 (very safe) to 100 (extremely risky)")
    risk_level: str = Field(description="Safe, Moderate Risk, or High Risk")
    key_risks: List[str] = Field(description="Short reasons for the risk score (e.g. 'High interest rate', 'Severe late fees')")
    recommendations: List[str] = Field(description="Actionable advice for the user (e.g. 'Ask for waiver of pre-closure fee')")

class DictionaryTerm(BaseModel):
    term: str = Field(description="The difficult financial/legal word (e.g. Collateral, Foreclosure, Amortization)")
    definition: str = Field(description="A simple, everyday explanation of what this term means")

class SimplifiedClause(BaseModel):
    original_clause: str = Field(description="The legal/complex sentence from the agreement")
    simplified_explanation: str = Field(description="The plain-language, easy translation of what it actually means")
    risk_level: str = Field(description="Risk level of this specific clause (Low, Medium, High)")

class LoanAnalysisResponse(BaseModel):
    is_valid_loan_document: bool = Field(description="True if the uploaded document is a loan agreement, loan offer letter, loan sanction letter, or promissory note. False if it is a general article, research paper, invoice, receipt, ID card, or unrelated document.")
    invalid_reason: Optional[str] = Field(description="If is_valid_loan_document is False, provide a clear explanation of why this document is not a valid loan document.")
    summary: LoanSummary
    hidden_charges: List[HiddenCharge]
    risk_assessment: RiskAssessment
    simplified_clauses: List[SimplifiedClause]
    dictionary: List[DictionaryTerm]

# Auth Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    fullname: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str

# Chat Schema
class ChatMessage(BaseModel):
    role: str # 'user' or 'model'
    text: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage]
    analysis_context: str

# Translation Schema
class TranslationRequest(BaseModel):
    analysis_data: LoanAnalysisResponse
    target_language: str # 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'

# API Routes

@app.get("/")
def read_root():
    return {"message": "Welcome to Loan Fine-Print Explainer API", "status": "online"}

@app.post("/api/auth/register")
def register(user_data: UserRegister):
    existing = database.get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")
    
    hashed = database.hash_password(user_data.password)
    user = database.create_user(user_data.email, hashed, user_data.fullname)
    if not user:
        raise HTTPException(status_code=400, detail="Failed to create user")
    
    token = create_token(user["email"])
    return {"token": token, "email": user["email"], "fullname": user["fullname"]}

@app.post("/api/auth/login")
def login(login_data: UserLogin):
    user = database.get_user_by_email(login_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # We retrieve the actual record from database including password hash
    raw_user = database.get_raw_user_for_login(login_data.email)
    if not database.verify_password(login_data.password, raw_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = create_token(user["email"])
    return {"token": token, "email": user["email"], "fullname": user["fullname"]}

@app.get("/api/auth/me")
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
    }

# Document Analysis Route
@app.post("/api/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    email: str = Depends(get_current_user)
):
    # Read the file contents
    file_bytes = await file.read()
    
    # Determine the file type and content
    filename = file.filename
    content_type = file.content_type
    
    # Extract text from digital PDF first if possible to feed as extra context
    extracted_text = ""
    is_digital_pdf = False
    
    if filename.lower().endswith('.pdf'):
        try:
            # Save bytes to a temp file or read in-memory
            # pypdf allows in-memory streams
            import io
            pdf_stream = io.BytesIO(file_bytes)
            reader = pypdf.PdfReader(pdf_stream)
            pages_text = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    pages_text.append(t)
            extracted_text = "\n".join(pages_text)
            if len(extracted_text.strip()) > 150:
                is_digital_pdf = True
        except Exception as e:
            print(f"Error in pypdf text extraction: {e}")
            
    # Connect to Gemini
    client = get_gemini_client()
    
    prompt = """
    You are an expert financial analyst, lawyer, and loan auditor.
    Analyze the uploaded document.
    First, evaluate whether the document is a valid loan agreement, loan offer letter, loan sanction letter, or promissory note.
    Set `is_valid_loan_document` to true or false. If false, specify a clear reason in `invalid_reason` (e.g. 'This is an academic research paper, not a loan agreement.') and you can fill out the remaining fields with dummy/default empty values.
    If true:
    1. Extract all core summary values (principal, interest, fees, EMI, tenure).
    2. Identify all hidden charges (including GST, processing charges, prepayment penalties, late fee rates, bounce fees, insurance requirements).
    3. Calculate a detailed Risk Score from 0 to 100, where:
       - 0-30: Safe (standard interest rate, low penalties, transparent clauses)
       - 31-60: Moderate Risk (some high fees, standard foreclosure penalties, slightly complex terms)
       - 61-100: High Risk (excessive late payment charges, pre-closure penalties, hidden costs, suspicious terms)
       Detail key risks and give actionable advice.
    4. Simplify at least 4 complex legal clauses into plain everyday English.
    5. Construct a glossary of difficult terms found in this document (e.g. Collateral, APR, Amortization, Foreclosure).
    
    Return the output in exact JSON schema structure.
    """
    
    try:
        # Call Gemini using Structured Output
        if is_digital_pdf:
            # We can send the extracted text to keep it fast
            contents = [
                f"Document Name: {filename}\nExtracted Text Content:\n{extracted_text}",
                prompt
            ]
        else:
            # For scanned PDF or images, we stream the bytes to Gemini for visual OCR + analysis
            mime_type = content_type if content_type else "application/pdf"
            part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
            contents = [part, prompt]
            
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LoanAnalysisResponse,
                temperature=0.1
            )
        )
        
        # Parse the JSON response
        import json
        analysis_json = json.loads(response.text)
        
        # Save to database
        doc_id = database.save_analysis(email, filename, analysis_json)
        analysis_json["_id"] = doc_id
        
        return analysis_json
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

# Translation Route
@app.post("/api/translate")
async def translate_report(
    req: TranslationRequest,
    email: str = Depends(get_current_user)
):
    client = get_gemini_client()
    
    prompt = f"""
    You are a professional financial translator. 
    Translate all user-facing content (descriptions, simplified explanations, term definitions, advice, names, warnings) in the provided JSON data into the regional Indian language: {req.target_language}.
    
    Ensure:
    1. Financial numbers, percentages, and currencies (like ₹, %, Years) are kept intact.
    2. Translate the explanation text to make it extremely clear and understandable for a middle-class citizen in India who speaks {req.target_language}.
    3. Keep technical terms themselves in English script or transliterated, but write the definitions fully in {req.target_language}.
    
    Return the response in the exact same JSON format.
    """
    
    try:
        import json
        # Convert Pydantic object back to JSON string for prompting
        json_data = req.analysis_data.model_dump_json()
        
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=[json_data, prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LoanAnalysisResponse,
                temperature=0.1
            )
        )
        
        translated_json = json.loads(response.text)
        return translated_json
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

# Chatbot Route
@app.post("/api/chat")
async def chat_with_loan(
    req: ChatRequest,
    email: str = Depends(get_current_user)
):
    client = get_gemini_client()
    
    # Formulate conversational prompt
    system_instruction = f"""
    You are a friendly, highly accessible AI financial adviser helping a middle-class borrower understand their loan agreement.
    Answer the user's question clearly, in plain language, avoiding legal terms.
    If the question is in Hindi, Tamil, Telugu, Kannada, or Malayalam, reply in that language!
    
    Below is the analysis context of their uploaded loan document:
    --------------------------------------------------
    {req.analysis_context}
    --------------------------------------------------
    
    Use this context to answer specific details about their loan. If the information isn't in the context, guide them politely.
    """
    
    # Map history to Gemini API format
    contents = []
    for msg in req.history:
        contents.append(
            types.Content(
                role="user" if msg.role == "user" else "model",
                parts=[types.Part.from_text(text=msg.text)]
            )
        )
    # Add active user message
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=req.message)]
        )
    )
    
    try:
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4
            )
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

# Comparison Pydantic Models for structured outputs
class ComparisonMetric(BaseModel):
    loan_1_value: str = Field(description="Value for Loan 1")
    loan_2_value: str = Field(description="Value for Loan 2")
    comparison_verdict: str = Field(description="Comparison explanation and which is better (e.g. 'Loan 1 is 2% cheaper')")

class LoanComparisonResponse(BaseModel):
    loan_1_name: str = Field(description="Name or file identifier of Loan 1")
    loan_2_name: str = Field(description="Name or file identifier of Loan 2")
    loan_amount: ComparisonMetric
    interest_rate: ComparisonMetric
    processing_fee: ComparisonMetric
    estimated_emi: ComparisonMetric
    hidden_charges: ComparisonMetric
    total_repayment: ComparisonMetric
    risk_score: ComparisonMetric
    overall_verdict: str = Field(description="A clear summary of which loan represents the better, safer choice and why")
    better_choice: str = Field(description="Indicate 'Loan 1', 'Loan 2', or 'Both are comparable'")

# Compare Route
@app.post("/api/compare")
async def compare_loans(
    loan1: UploadFile = File(...),
    loan2: UploadFile = File(...),
    email: str = Depends(get_current_user)
):
    # Read files
    bytes1 = await loan1.read()
    bytes2 = await loan2.read()
    
    client = get_gemini_client()
    
    prompt = """
    You are an expert financial consultant. Compare the two uploaded loan agreements side-by-side.
    Analyze the loan amount, interest rate, processing fee, EMIs, hidden charges, total repayment amount, and risk scores.
    Give a definitive verdict on which loan is the safer and more economical option, detailing why.
    
    Provide the output in the exact JSON schema structure.
    """
    
    try:
        # Prepare parts
        part1 = types.Part.from_bytes(data=bytes1, mime_type=loan1.content_type if loan1.content_type else "application/pdf")
        part2 = types.Part.from_bytes(data=bytes2, mime_type=loan2.content_type if loan2.content_type else "application/pdf")
        
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=[
                part1,
                part2,
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LoanComparisonResponse,
                temperature=0.1
            )
        )
        
        import json
        return json.loads(response.text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")

# History Routes
@app.get("/api/history")
def get_history(email: str = Depends(get_current_user)):
    return database.get_user_history(email)

@app.get("/api/history/{analysis_id}")
def get_analysis(analysis_id: str, email: str = Depends(get_current_user)):
    doc = database.get_analysis_by_id(analysis_id, email)
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis report not found")
    return doc


# Machine Learning Predictor Endpoint (Trained on uploaded Kaggle Dataset)
class PredictApprovalRequest(BaseModel):
    age: int
    income: float
    loan_amount: float
    credit_score: int
    years_experience: int
    gender: str
    education: str
    employment_type: str

PREDICTOR_MODEL = None
PREDICTOR_ENCODERS = None

def get_predictor_resources():
    global PREDICTOR_MODEL, PREDICTOR_ENCODERS
    if PREDICTOR_MODEL is None or PREDICTOR_ENCODERS is None:
        import joblib
        model_path = os.path.join(os.path.dirname(__file__), "model", "loan_predictor.joblib")
        encoders_path = os.path.join(os.path.dirname(__file__), "model", "label_encoders.joblib")
        if os.path.exists(model_path) and os.path.exists(encoders_path):
            PREDICTOR_MODEL = joblib.load(model_path)
            PREDICTOR_ENCODERS = joblib.load(encoders_path)
        else:
            raise RuntimeError("Trained machine learning model files not found.")
    return PREDICTOR_MODEL, PREDICTOR_ENCODERS

@app.post("/api/predict-approval")
def predict_approval(req: PredictApprovalRequest):
    try:
        model, encoders = get_predictor_resources()
        import pandas as pd
        
        # Safe mapping for categorical features with Unknown fallback
        gender_val = req.gender if req.gender in encoders['Gender'].classes_ else 'Unknown'
        gender_encoded = int(encoders['Gender'].transform([gender_val])[0])
        
        edu_val = req.education if req.education in encoders['Education'].classes_ else 'Unknown'
        edu_encoded = int(encoders['Education'].transform([edu_val])[0])
        
        emp_val = req.employment_type if req.employment_type in encoders['EmploymentType'].classes_ else 'Unknown'
        emp_encoded = int(encoders['EmploymentType'].transform([emp_val])[0])
        
        input_row = pd.DataFrame([{
            'Age': req.age,
            'Income': req.income,
            'LoanAmount': req.loan_amount,
            'CreditScore': req.credit_score,
            'YearsExperience': req.years_experience,
            'Gender': gender_encoded,
            'Education': edu_encoded,
            'EmploymentType': emp_encoded
        }])
        
        # Compute predicted probability of approval (class 1)
        probabilities = model.predict_proba(input_row)[0]
        approval_prob = float(probabilities[1]) * 100.0
        prediction = int(model.predict(input_row)[0])
        
        # Compile financial diagnostic warnings/advices
        advices = []
        if req.credit_score < 580:
            advices.append("Your credit score is low (Poor). Focus on clearing outstanding bills and avoiding new loan inquiries to restore your rating.")
        elif req.credit_score < 670:
            advices.append("Your credit score is moderate (Fair). Keeping credit utilization below 30% and building a history of timely payments will boost approval odds.")
        elif req.credit_score < 740:
            advices.append("Your credit score is good. You are likely to qualify for standard interest rate brackets.")
        else:
            advices.append("Your credit score is outstanding (Excellent)! You qualify for premium prime loan interest rates and waivers.")

        # Evaluate Debt exposure (Loan Amount compared to Annual Income)
        annual_income = max(req.income * 12.0, 1.0)
        debt_to_income = req.loan_amount / annual_income
        if debt_to_income > 0.5:
            advices.append(f"High Debt-to-Income Exposure: Requested loan is {debt_to_income*100:.1f}% of your annual income. Lenders may request extra collateral.")
        else:
            advices.append("Healthy Debt-to-Income Ratio: Your request sits comfortably within standard annual repayment metrics.")

        return {
            "success": True,
            "approval_probability": round(approval_prob, 1),
            "prediction": prediction,
            "recommendations": advices
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
