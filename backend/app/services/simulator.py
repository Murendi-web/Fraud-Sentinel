"""Background simulator — generates realistic SA card transactions."""
import asyncio
import json
import logging
import random
import uuid
from datetime import datetime

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.db_models import Transaction
from app.services.risk_engine import compute_risk, HIGH_RISK_MERCHANTS, FOREIGN_LOCATIONS
from app.services.ws_manager import WebSocketManager

logger = logging.getLogger(__name__)

MERCHANTS = [
    ("Checkers", "GROCERY"), ("Pick n Pay", "GROCERY"), ("Woolworths Food", "GROCERY"),
    ("Shoprite", "GROCERY"), ("Game", "ELECTRONICS"), ("Makro", "RETAIL"),
    ("Takealot", "ECOMMERCE"), ("Vodacom Store", "TELECOM"), ("MTN Store", "TELECOM"),
    ("Steers", "RESTAURANT"), ("Nando's", "RESTAURANT"), ("KFC South Africa", "RESTAURANT"),
    ("Engen Garage", "FUEL"), ("BP Express", "FUEL"), ("Shell Ultra City", "FUEL"),
    ("Nedbank ATM", "ATM"), ("ABSA ATM", "ATM"), ("FNB ATM", "ATM"),
    ("Crypto Exchange", "CRYPTO"), ("Casino Online", "GAMBLING"),
    ("Wire Transfer", "TRANSFER"), ("Unknown Vendor", "UNKNOWN"),
    ("Netflix ZA", "STREAMING"), ("Uber SA", "TRANSPORT"), ("Forex Broker", "FOREX"),
]

SA_LOCATIONS = [
    "Johannesburg, ZA", "Cape Town, ZA", "Durban, ZA", "Pretoria, ZA",
    "Port Elizabeth, ZA", "Bloemfontein, ZA", "East London, ZA", "Polokwane, ZA",
]
FOREIGN_LIST = list(FOREIGN_LOCATIONS)
CARDS = ["Visa", "Mastercard", "Amex", "Capitec", "Discovery Card"]
USERS = [f"USR-{str(i).zfill(4)}" for i in range(1, 201)]
_counter = 0


def _ref():
    global _counter
    _counter += 1
    return f"TXN-{str(_counter).zfill(6)}"


def generate_one() -> dict:
    merchant, cat = random.choice(MERCHANTS)
    location = random.choice(FOREIGN_LIST) if random.random() < 0.15 else random.choice(SA_LOCATIONS)
    amount   = round(random.uniform(5, 75_000), 2)
    velocity = random.randint(0, 15)
    hour     = datetime.utcnow().hour
    card     = random.choice(CARDS)
    user     = random.choice(USERS)
    last4    = random.randint(1000, 9999)

    rb = compute_risk(amount=amount, merchant=merchant, location=location,
                      velocity=velocity, hour=hour)
    return {
        "id": str(uuid.uuid4()), "txn_ref": _ref(),
        "created_at": datetime.utcnow().isoformat(),
        "user_id": user, "card_number": f"****{last4}", "card_type": card,
        "amount": amount, "merchant": merchant, "merchant_category": cat,
        "location": location, "currency": "ZAR",
        "risk_score": rb.final_score, "risk_level": rb.risk_level,
        "is_flagged": rb.is_flagged, "velocity": velocity,
        "is_foreign": location in FOREIGN_LOCATIONS,
        "is_night": hour in set(range(23, 24)) | set(range(0, 5)),
        "is_high_risk_merchant": merchant in HIGH_RISK_MERCHANTS,
        "status": "PENDING",
    }


class TransactionSimulator:
    def __init__(self, ws: WebSocketManager):
        self._ws = ws
        self._running = False

    async def start(self):
        self._running = True
        while self._running:
            await asyncio.sleep(settings.SIMULATION_INTERVAL_SECONDS)
            try:
                d = generate_one()
                async with AsyncSessionLocal() as session:
                    txn = Transaction(
                        id=d["id"], txn_ref=d["txn_ref"],
                        created_at=datetime.fromisoformat(d["created_at"]),
                        user_id=d["user_id"], card_number=d["card_number"],
                        card_type=d["card_type"], amount=d["amount"],
                        merchant=d["merchant"], merchant_category=d["merchant_category"],
                        location=d["location"], currency=d["currency"],
                        risk_score=d["risk_score"], risk_level=d["risk_level"],
                        is_flagged=d["is_flagged"], velocity=d["velocity"],
                        is_foreign=d["is_foreign"], is_night=d["is_night"],
                        is_high_risk_merchant=d["is_high_risk_merchant"],
                        status=d["status"],
                    )
                    session.add(txn)
                    await session.commit()
                await self._ws.broadcast(json.dumps({"type": "NEW_TRANSACTION", "data": d}))
            except Exception as e:
                logger.error(f"Simulator: {e}")

    def stop(self):
        self._running = False
