@echo off
echo Starting Drishti Scan FastAPI Backend on http://127.0.0.1:8000 ...
cd backend
if not exist "venv\Scripts\python.exe" (
    echo Python virtual environment not found in backend\venv.
    echo Please create it and install requirements:
    echo   python -m venv venv
    echo   venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)
set PYTHONPATH=.
venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
