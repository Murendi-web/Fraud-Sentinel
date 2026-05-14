"""ORM → Pydantic helpers."""
import json
from datetime import datetime
from app.models.db_models import Transaction
from app.models.schemas import AIAnalysis, RiskSignals, TransactionResponse


def to_dict(t: Transaction) -> dict:
    return {
        "id": t.id, "txn_ref": t.txn_ref,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "user_id": t.user_id, "card_number": t.card_number, "card_type": t.card_type,
        "amount": t.amount, "merchant": t.merchant, "merchant_category": t.merchant_category,
        "location": t.location, "currency": t.currency,
        "risk_score": t.risk_score, "risk_level": t.risk_level,
        "is_flagged": t.is_flagged, "velocity": t.velocity,
        "is_foreign": t.is_foreign, "is_night": t.is_night,
        "is_high_risk_merchant": t.is_high_risk_merchant, "status": t.status,
    }


def to_response(t: Transaction) -> TransactionResponse:
    ai = None
    if t.ai_verdict:
        ai = AIAnalysis(
            verdict=t.ai_verdict, confidence=t.ai_confidence or 0,
            reasoning=t.ai_reasoning or "", recommendation=t.ai_recommendation or "",
            key_factors=json.loads(t.ai_key_factors) if t.ai_key_factors else [],
            analysed_at=t.ai_analysed_at or datetime.utcnow(),
        )
    return TransactionResponse(
        id=t.id, txn_ref=t.txn_ref, created_at=t.created_at,
        user_id=t.user_id, card_number=t.card_number, card_type=t.card_type,
        amount=t.amount, merchant=t.merchant, merchant_category=t.merchant_category,
        location=t.location, currency=t.currency, risk_score=t.risk_score,
        risk_level=t.risk_level, is_flagged=t.is_flagged, velocity=t.velocity,
        is_foreign=t.is_foreign, is_night=t.is_night,
        is_high_risk_merchant=t.is_high_risk_merchant, status=t.status,
        risk_signals=RiskSignals(
            amount_risk="HIGH" if t.amount > 10000 else "LOW",
            is_foreign=t.is_foreign, is_night=t.is_night,
            velocity_per_hour=t.velocity, high_risk_merchant=t.is_high_risk_merchant,
        ),
        ai_analysis=ai,
    )
