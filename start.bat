@echo off
echo ====================================================================
echo             Launching Loan Fine-Print Explainer (CrediLens)
echo ====================================================================
echo.
echo Starting FastAPI Backend in a new window...
start "CrediLens FastAPI Backend" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite React Frontend in a new window...
start "CrediLens React Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ====================================================================
echo Backend running at: http://127.0.0.1:8000
echo Frontend running at: check the newly opened React window (usually http://localhost:5173)
echo ====================================================================
pause
