"""Fraud Sentinel — FastAPI entry point."""
import asyncio
import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import transactions, analytics
from app.services.simulator import TransactionSimulator
from app.services.ws_manager import WebSocketManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

ws_manager = WebSocketManager()
simulator  = TransactionSimulator(ws_manager)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("DB ready")
    if settings.SIMULATE_TRANSACTIONS:
        asyncio.create_task(simulator.start())
        logger.info("Simulator started")
    yield
    simulator.stop()


app = FastAPI(
    title="Fraud Sentinel API",
    description="AI-powered ZAR fraud detection",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(analytics.router,   prefix="/api/analytics",    tags=["Analytics"])


@app.get("/health", tags=["System"])
async def health():
    return {"status": "ok", "version": "1.0.0", "currency": "ZAR"}


@app.websocket("/ws/transactions")
async def ws_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000,
                reload=(settings.ENVIRONMENT == "development"))
