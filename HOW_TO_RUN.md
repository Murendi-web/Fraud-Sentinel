# 🚀 How to Run Fraud Sentinel

## The Easy Way (Recommended)

### Mac / Linux
```bash
# Unzip and enter the folder
unzip fraud-sentinel.zip
cd fraud-sentinel

# Run the one-shot setup script
chmod +x start.sh
./start.sh
```

### Windows
```
Double-click  start.bat
```

That's it. The script installs everything and opens both servers.

---

## Manual Setup (if the script doesn't work)

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.11+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| Anthropic API key | — | https://console.anthropic.com |

---

### Step 1 — Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it:
source venv/bin/activate          # Mac/Linux
venv\Scripts\activate.bat        # Windows CMD
venv\Scripts\Activate.ps1        # Windows PowerShell

# If pip times out, increase timeout:
pip install -r requirements.txt --timeout 120 --retries 5 --no-cache-dir

# Set up your environment file
cp .env.example .env
# Open .env and add:  ANTHROPIC_API_KEY=sk-ant-your-key-here

# Start the API
python main.py
```

✅ API live at http://localhost:8000  
✅ Swagger docs at http://localhost:8000/docs

---

### Step 2 — Frontend (new terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

✅ Dashboard live at http://localhost:5173

---

## Troubleshooting

### pip times out
```bash
pip install -r requirements.txt --timeout 180 --retries 5 --no-cache-dir
```

### anthropic package not found / wrong version
```bash
pip install anthropic --upgrade
```

### Port already in use (backend)
```bash
# Kill whatever is on port 8000:
lsof -ti:8000 | xargs kill   # Mac/Linux
netstat -ano | findstr :8000  # Windows — then taskkill /PID <pid> /F
```

### Frontend can't reach backend (CORS error)
Make sure your `frontend/.env` has:
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### No transactions appearing
The backend simulator auto-starts. Check the backend terminal for errors.  
If ANTHROPIC_API_KEY is missing, the AI analysis button will use rule-based fallback — everything else still works.

---

## How to Use the App

1. Open http://localhost:5173
2. Transactions stream in automatically every 3 seconds
3. **Click any row** → opens the Detail Panel on the right
4. **⚡ ANALYSE WITH AI** → Claude gives a LEGITIMATE/SUSPICIOUS/FRAUDULENT verdict
5. **APPROVE / REVIEW / BLOCK** buttons update the transaction status
6. **⏸ PAUSE** freezes the stream so you can read transactions calmly
7. Switch to the **Analytics** tab for risk charts and geographic breakdown

---

## Push to GitHub (Portfolio)

### Step 1 — Create repo on GitHub
1. Go to https://github.com/new
2. Name: `fraud-sentinel`
3. Visibility: **Public**
4. Do NOT add README (we have one)
5. Click **Create repository**

### Step 2 — Push your code
```bash
# From the fraud-sentinel/ root folder:
git init
git add .
git commit -m "feat: AI-powered card fraud detection system — FastAPI + React + Claude"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fraud-sentinel.git
git push -u origin main
```

### Step 3 — Make it look great on GitHub
On your repo page, click the ⚙ gear icon next to **About** and set:
- **Description:** `AI-powered real-time credit & debit card fraud detection — FastAPI + React + Claude AI (ZAR, South Africa)`
- **Topics:** `fraud-detection` `fintech` `fastapi` `react` `claude-ai` `south-africa` `banking` `python` `websocket`
- **Website:** (your deployed URL if you have one)

### Step 4 — Pin it to your profile
- Go to your GitHub profile page
- Click **"Customize your pins"**
- Select `fraud-sentinel` ✅

---

## Project Structure

```
fraud-sentinel/
├── start.sh / start.bat          ← One-command launcher
├── backend/
│   ├── main.py                   ← FastAPI app + WebSocket endpoint
│   ├── requirements.txt
│   ├── .env.example
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── transactions.py   ← GET/POST/PATCH + AI analysis
│   │   │   └── analytics.py      ← Dashboard stats, risk breakdown
│   │   ├── core/
│   │   │   ├── config.py         ← Settings from .env
│   │   │   └── database.py       ← Async SQLAlchemy + SQLite
│   │   ├── models/
│   │   │   ├── db_models.py      ← ORM table definition
│   │   │   └── schemas.py        ← Pydantic schemas
│   │   ├── services/
│   │   │   ├── risk_engine.py    ← Weighted fraud scoring (0-100)
│   │   │   ├── claude_service.py ← Claude AI integration
│   │   │   ├── simulator.py      ← SA transaction generator
│   │   │   └── ws_manager.py     ← WebSocket broadcaster
│   │   └── utils/formatters.py
│   └── tests/test_api.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── common/           ← RiskGauge, Sparkline, StatCard
│   │   │   ├── transactions/     ← Table, Row, DetailPanel
│   │   │   ├── analytics/        ← Charts, location heatmap
│   │   │   ├── alerts/           ← Critical alert banners
│   │   │   └── layout/           ← Header
│   │   ├── hooks/
│   │   │   ├── useTransactions.js
│   │   │   └── useAnalytics.js
│   │   ├── services/
│   │   │   ├── api.js            ← All REST calls
│   │   │   └── websocket.js      ← Auto-reconnect WS client
│   │   └── utils/theme.js        ← fmtZAR(), colours, riskLevel()
│   └── package.json
│
└── docker-compose.yml
```

---

## Environment Variables

### backend/.env
```
ANTHROPIC_API_KEY=sk-ant-...        # Required for AI analysis
DATABASE_URL=sqlite+aiosqlite:///./fraud_sentinel.db
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SIMULATE_TRANSACTIONS=true          # Set false to disable auto-stream
SIMULATION_INTERVAL_SECONDS=3       # Seconds between transactions
```

### frontend/.env
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```
