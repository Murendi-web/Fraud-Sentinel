#!/bin/bash
# Fraud Sentinel — one-shot install & run script (Mac / Linux)
set -e

echo ""
echo "🛡️  Fraud Sentinel — Setup"
echo "================================"

# ── Backend ──────────────────────────────────────────────────────────────────
echo ""
echo "📦 Setting up backend..."
cd backend

python3 -m venv venv
source venv/bin/activate

# Install with timeout + fast mirror fallback
pip install --upgrade pip --quiet
pip install -r requirements.txt     --timeout 120     --retries 5     -i https://pypi.org/simple/     --no-cache-dir

# Create .env if missing
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  ACTION REQUIRED:"
    echo "   Open backend/.env and add your ANTHROPIC_API_KEY"
    echo "   Get one free at: https://console.anthropic.com"
    echo ""
    read -p "   Press ENTER once you've added your key..."
fi

echo "✅ Backend ready"
cd ..

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -f .env ]; then
    cp .env.example .env
fi

npm install --prefer-offline 2>/dev/null || npm install

echo "✅ Frontend ready"
cd ..

# ── Launch ────────────────────────────────────────────────────────────────────
echo ""
echo "🚀 Starting Fraud Sentinel..."
echo "   Backend  → http://localhost:8000"
echo "   Frontend → http://localhost:5173"
echo "   API Docs → http://localhost:8000/docs"
echo ""
echo "   Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Give backend 2s to boot
sleep 2

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait — kill both on Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" INT
wait
