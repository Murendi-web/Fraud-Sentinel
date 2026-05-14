@echo off
TITLE Fraud Sentinel Setup

echo.
echo  Fraud Sentinel — Setup
echo ================================
echo.

:: ── Backend ──────────────────────────────────────────────────────────────
echo [1/4] Creating Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo [2/4] Installing Python packages (this may take 2-3 minutes)...
pip install --upgrade pip --quiet
pip install -r requirements.txt --timeout 120 --retries 5 --no-cache-dir

if not exist .env (
    copy .env.example .env
    echo.
    echo  ACTION REQUIRED:
    echo  Open backend\.env and add your ANTHROPIC_API_KEY
    echo  Get one free at: https://console.anthropic.com
    echo.
    pause
)

echo [3/4] Installing frontend packages...
cd ..\frontend
call npm install

if not exist .env (
    copy .env.example .env
)

echo [4/4] Launching servers...
cd ..

:: Start backend
start "Fraud Sentinel - Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

timeout /t 3 /nobreak >nul

:: Start frontend
start "Fraud Sentinel - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo  Both servers starting in separate windows!
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  API Docs: http://localhost:8000/docs
echo.
pause
