import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Create output folder
os.makedirs("sample_documents", exist_ok=True)

styles = getSampleStyleSheet()
normal_style = styles['Normal']

# Define custom styles
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=colors.HexColor('#1E1B4B'), # Royal Navy
    spaceAfter=15
)

section_style = ParagraphStyle(
    'SectionTitle',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=12,
    leading=16,
    textColor=colors.HexColor('#B45309'), # Satin Gold / Amber
    spaceBefore=12,
    spaceAfter=6
)

body_style = ParagraphStyle(
    'BodyTextCustom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#334155'), # Slate Grey
    spaceAfter=8
)

bullet_style = ParagraphStyle(
    'BulletCustom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    leftIndent=15,
    textColor=colors.HexColor('#334155'),
    spaceAfter=6
)

def build_pdf(filename, title, content_list):
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    # Title
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 10))
    
    for item_type, text in content_list:
        if item_type == 'section':
            story.append(Paragraph(text, section_style))
            story.append(Spacer(1, 4))
        elif item_type == 'bullet':
            story.append(Paragraph(f"• {text}", bullet_style))
        elif item_type == 'text':
            story.append(Paragraph(text, body_style))
            story.append(Spacer(1, 4))
            
    doc.build(story)
    print(f"Generated PDF: {filename}")

# ==================== 1. HDFC PERSONAL LOAN OFFER ====================
hdfc_content = [
    ('text', "Date: July 15, 2026"),
    ('text', "Borrower Name: Rahul Sharma"),
    ('text', "Reference ID: HDFC-PL-2026-98745"),
    ('section', "1. Loan Terms Summary"),
    ('bullet', "<b>Sanctioned Loan Amount:</b> INR 5,00,000 (Rupees Five Lakhs Only) disbursed to the registered bank account."),
    ('bullet', "<b>Annual Interest Rate:</b> 11.25% per annum (Fixed rate of interest)."),
    ('bullet', "<b>Loan Duration / Tenure:</b> 60 Months (5 Years)."),
    ('bullet', "<b>Processing Fee:</b> An administrative fee of 1.5% of the total loan amount (equivalent to INR 7,500) will be deducted at the time of disbursement."),
    ('bullet', "<b>Estimated EMI:</b> INR 10,935 per month (Approximate monthly installment payable on the 5th of each month)."),
    ('section', "2. Additional Fees & Penal Charges"),
    ('bullet', "<b>Late Payment Penalty:</b> In the event of default or delayed payment of EMI, a penal interest of 2% per month will be charged on the outstanding EMI amount, subject to a minimum charge of INR 500 per missed payment."),
    ('bullet', "<b>EMI Bounce Charge:</b> A processing fee of INR 500 will be levied for each failed transaction or auto-debit bounce due to insufficient funds."),
    ('bullet', "<b>Pre-closure / Foreclosure Charge:</b> If the borrower decides to repay the outstanding principal amount and close the loan account before the completion of the 60-month tenure, a pre-closure fee equivalent to 3% of the remaining outstanding principal balance will be applicable. No foreclosure is allowed during the first 12 EMI cycles."),
    ('bullet', "<b>Taxes:</b> A Goods and Services Tax (GST) of 18% is applicable on the processing fees, EMI bounce charges, and foreclosure fees, which is mandatory under Government regulations."),
    ('section', "3. Declaration and Agreement"),
    ('text', "The borrower hereby agrees to the terms and conditions outlined in this sanction letter. By signing below, the borrower acknowledges that they understand the repayment schedule, interest rates, and penal charges applicable under this contract. Collateral security is not required for this unsecured personal loan product.")
]

build_pdf(
    "sample_documents/hdfc_personal_loan_offer.pdf", 
    "HDFC BANK - PERSONAL LOAN SANCTION LETTER", 
    hdfc_content
)

# ==================== 2. SBI HOME LOAN AGREEMENT ====================
sbi_content = [
    ('text', "Date: June 22, 2026"),
    ('text', "Borrower Name: Priya Krishnan"),
    ('text', "Loan Account Reference: SBI-HL-665219"),
    ('section', "1. Core Loan Details"),
    ('bullet', "<b>Sanctioned Loan Amount:</b> INR 40,00,000 (Rupees Forty Lakhs Only) sanctioned for purchase of residential property."),
    ('bullet', "<b>Annual Interest Rate:</b> 8.50% per annum (Floating interest rate linked to SBI's external benchmark lending rate (EBLR))."),
    ('bullet', "<b>Loan Tenure:</b> 240 Months (20 Years)."),
    ('bullet', "<b>Processing Fee:</b> A promotional administrative fee of 0.35% of the sanctioned loan amount, capped at a maximum of INR 14,000."),
    ('bullet', "<b>Estimated EMI:</b> INR 34,713 per month."),
    ('section', "2. Repayment Policies & Statutory Clauses"),
    ('bullet', "<b>Late Payment Penalty:</b> A penal charge of 2% per annum will be levied on the default amount for the period of delay in payment of the EMI."),
    ('bullet', "<b>Foreclosure / Pre-closure Charges:</b> As per the Reserve Bank of India (RBI) guidelines, no pre-closure or prepayment charges shall be applicable for floating-rate home loans closed by individual borrowers using their own source of funds. Foreclosure charges are 0.00%."),
    ('bullet', "<b>Collateral Security:</b> Equitable mortgage of the property under purchase is mandatory. The borrower must submit original deeds and title documents as collateral security to the bank."),
    ('section', "3. Legal Terms & Covenants"),
    ('text', "The borrower agrees to maintain sufficient balance in the designated bank account for ECS/NACH auto-debit of EMIs. The floating rate of interest is subject to revision based on market rate movements, which may alter the loan tenure or EMI amount as per the bank's policies.")
]

build_pdf(
    "sample_documents/sbi_home_loan_agreement.pdf", 
    "STATE BANK OF INDIA - HOME LOAN AGREEMENT", 
    sbi_content
)

# ==================== 3. QUICKCASH PAYDAY LOAN TERMS ====================
payday_content = [
    ('text', "Date: July 17, 2026"),
    ('text', "Borrower Name: Amit Kumar"),
    ('text', "Agreement Reference: QC-MICRO-9921"),
    ('section', "1. Core Disbursement Parameters"),
    ('bullet', "<b>Sanctioned Loan Amount:</b> INR 25,000 (Rupees Twenty-Five Thousand Only)."),
    ('bullet', "<b>Annual Interest Rate:</b> 36.00% per annum (Compounded monthly, equivalent to 3% interest per month)."),
    ('bullet', "<b>Loan Duration:</b> 90 Days (3 Months)."),
    ('bullet', "<b>Processing Fee:</b> A mandatory upfront documentation and processing fee of 8.00% (INR 2,000) will be deducted from the disbursement amount. The net disbursed amount will be INR 23,000."),
    ('bullet', "<b>Estimated EMI:</b> INR 8,837 per month."),
    ('section', "2. Severe Late Payment & Prepayment Penalties"),
    ('bullet', "<b>Late Payment Penalty:</b> If the borrower fails to credit the monthly installment by the due date, a default penalty of INR 150 per day will be accumulated on top of the outstanding EMI amount. Furthermore, an additional weekly penal interest of 3% will be applied on the default principal amount."),
    ('bullet', "<b>Prepayment / Pre-closure Charge:</b> If the borrower closes the micro-loan before the 90-day period, a flat prepayment penalty of 5.00% of the original principal amount (INR 1,250) will be charged, regardless of the remaining balance."),
    ('bullet', "<b>Collateral Security:</b> This is an unsecured micro-credit product. No collateral is held. However, default will result in immediate negative reporting to CIBIL and all major credit rating agencies, along with legal collection actions."),
    ('section', "3. Collection and Consent Clause"),
    ('text', "By proceeding, the borrower gives explicit consent to the lender to debit their account automatically and contact reference contacts in the event of non-repayment. This is a high-cost short-term credit product. The borrower should evaluate their repayment capacity before signing.")
]

build_pdf(
    "sample_documents/quick_payday_loan_terms.pdf", 
    "QUICKCASH - SHORT-TERM MICRO-CREDIT AGREEMENT", 
    payday_content
)
