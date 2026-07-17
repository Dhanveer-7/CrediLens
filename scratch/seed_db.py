import os
import sys
import json
import io
import datetime
from dotenv import load_dotenv
import pypdf
from google import genai
from google.genai import types

sys.path.insert(0, 'backend')
import database

load_dotenv("backend/.env")

# 1. Create Demo User
print("--------------------------------------------------")
print("Seeding database...")
demo_email = "demo@credilens.com"
demo_pass = "password123"

existing = database.get_user_by_email(demo_email)
if not existing:
    hashed = database.hash_password(demo_pass)
    user = database.create_user(demo_email, hashed, "Demo Borrower")
    print(f"Created Demo User: {demo_email} (Password: {demo_pass})")
else:
    print(f"Demo User {demo_email} already exists.")

# 2. Analyze and Seed Sample Documents
sample_files = [
    ("sample_documents/hdfc_personal_loan_offer.pdf", "HDFC Bank Personal Loan Offer"),
    ("sample_documents/sbi_home_loan_agreement.pdf", "SBI Home Loan Agreement"),
    ("sample_documents/quick_payday_loan_terms.pdf", "QuickCash Payday Loan Terms")
]

# Standard prompt and schema from main.py
from pydantic import BaseModel, Field
from typing import List, Optional

class LoanSummary(BaseModel):
    loan_amount: str
    interest_rate: str
    processing_fee: str
    late_payment_penalty: str
    pre_closure_charges: str
    loan_duration: str
    estimated_emi: str

class HiddenCharge(BaseModel):
    charge_name: str
    amount_or_rate: str
    description: str
    is_suspicious_or_unfair: bool

class RiskAssessment(BaseModel):
    risk_score: int
    risk_level: str
    key_risks: List[str]
    recommendations: List[str]

class DictionaryTerm(BaseModel):
    term: str
    definition: str

class SimplifiedClause(BaseModel):
    original_clause: str
    simplified_explanation: str
    risk_level: str

class LoanAnalysisResponse(BaseModel):
    is_valid_loan_document: bool
    invalid_reason: Optional[str]
    summary: LoanSummary
    hidden_charges: List[HiddenCharge]
    risk_assessment: RiskAssessment
    simplified_clauses: List[SimplifiedClause]
    dictionary: List[DictionaryTerm]

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY is not configured in backend/.env. Cannot seed analysis history.")
    sys.exit(1)

client = genai.Client(api_key=api_key)

prompt = """
Analyze the uploaded document.
First, evaluate whether the document is a valid loan agreement, loan offer letter, loan sanction letter, or promissory note.
Set `is_valid_loan_document` to true or false. If false, specify a clear reason in `invalid_reason`.
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

for filepath, label in sample_files:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (file not found)")
        continue
        
    # Check if this document has already been seeded for the demo user
    filename = os.path.basename(filepath)
    already_seeded = database.history_col.find_one({"email": demo_email, "filename": filename})
    if already_seeded:
        print(f"Document {filename} already seeded in history.")
        continue

    print(f"Extracting & analyzing {filename} using Gemini API...")
    try:
        with open(filepath, 'rb') as f:
            file_bytes = f.read()
            
        # Parse text via pypdf
        pdf_stream = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_stream)
        pages_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                pages_text.append(t)
        extracted_text = "\n".join(pages_text)
        
        # Call Gemini
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=[
                f"Document Name: {filename}\nExtracted Text Content:\n{extracted_text}",
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LoanAnalysisResponse,
                temperature=0.1
            )
        )
        
        analysis_json = json.loads(response.text)
        
        # Save to database history
        doc_id = database.save_analysis(demo_email, filename, analysis_json)
        print(f"Successfully analyzed and saved: {label} (DB ID: {doc_id})")
        
    except Exception as e:
        print(f"Failed to analyze {filename}: {e}")

print("Seeding completed successfully!")
print("--------------------------------------------------")
