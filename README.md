# Fraud Sentinel

> AI-powered real-time credit & debit card fraud detection — ZAR localised for South Africa.

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)

## Project Structure

```
fraud-sentinel/
├── backend/           # FastAPI Python API
│   ├── app/
│   │   ├── api/routes/    transactions.py, analytics.py
│   │   ├── core/          config.py, database.py
│   │   ├── models/        db_models.py, schemas.py
│   │   ├── services/      risk_engine.py, claude_service.py, simulator.py, ws_manager.py
│   │   └── utils/         formatters.py
│   ├── tests/
│   ├── main.py
│   └── requirements.txt
├── frontend/          # React + Vite UI
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── utils/
├── docker-compose.yml
└── HOW_TO_RUN.md
```

## Quick Start

See **HOW_TO_RUN.md** for full setup, run, and GitHub deployment instructions.

## API Docs

Once running: http://localhost:8000/docs
