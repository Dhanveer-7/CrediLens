import os
from dotenv import load_dotenv
from google import genai

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

test_models = ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite']

if api_key:
    client = genai.Client(api_key=api_key)
    for model_name in test_models:
        print(f"Testing connection with model: {model_name}...")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=f"Say 'Successful call with {model_name}!'"
            )
            print(f"SUCCESS: {model_name} is active and working!")
            print("Response:", response.text.strip())
            print("--------------------------------------------------")
            break # Exit loop once we find a working model!
        except Exception as e:
            print(f"FAILED {model_name}: {e}")
            print("--------------------------------------------------")
else:
    print("No API Key found.")
