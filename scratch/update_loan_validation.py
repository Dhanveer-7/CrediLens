import os

main_py_path = r"c:\Users\Dhanveer\OneDrive\Desktop\CrediLens\backend\main.py"

if os.path.exists(main_py_path):
    with open(main_py_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the new schema block
    old_schema = """class LoanAnalysisResponse(BaseModel):
    summary: LoanSummary
    hidden_charges: List[HiddenCharge]
    risk_assessment: RiskAssessment
    simplified_clauses: List[SimplifiedClause]
    dictionary: List[DictionaryTerm]"""

    new_schema = """class LoanAnalysisResponse(BaseModel):
    is_valid_loan_document: bool = Field(description="True if the uploaded document is a loan agreement, loan offer letter, loan sanction letter, or promissory note. False if it is a general article, research paper, invoice, receipt, ID card, or unrelated document.")
    invalid_reason: Optional[str] = Field(description="If is_valid_loan_document is False, provide a clear explanation of why this document is not a valid loan document.")
    summary: LoanSummary
    hidden_charges: List[HiddenCharge]
    risk_assessment: RiskAssessment
    simplified_clauses: List[SimplifiedClause]
    dictionary: List[DictionaryTerm]"""

    # Define the new prompt block
    old_prompt = """    prompt = \"\"\"
    You are an expert financial analyst, lawyer, and loan auditor.
    Analyze the uploaded loan agreement document. 
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
    \"\"\""""

    new_prompt = """    prompt = \"\"\"
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
    \"\"\""""

    content = content.replace(old_schema, new_schema)
    content = content.replace(old_prompt, new_prompt)

    with open(main_py_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated main.py with loan document validation.")
else:
    print("Error: main.py not found.")
