@echo off
echo Running Drishti Scan Automated Pytest Suite...
cd backend
set PYTHONPATH=.
venv\Scripts\pytest tests -v
pause
