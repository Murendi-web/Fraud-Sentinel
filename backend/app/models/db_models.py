import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


def _uid() -> str:
    return str(uuid.uuid4())


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str]          = mapped_column(String(36), primary_key=True, default=_uid)
    txn_ref: Mapped[str]     = mapped_column(String(20), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    user_id: Mapped[str]     = mapped_column(String(20), index=True)
    card_number: Mapped[str] = mapped_column(String(12))
    card_type: Mapped[str]   = mapped_column(String(20))

    amount: Mapped[float]    = mapped_column(Float)
    merchant: Mapped[str]    = mapped_column(String(100))
    merchant_category: Mapped[str] = mapped_column(String(50))
    location: Mapped[str]    = mapped_column(String(100))
    currency: Mapped[str]    = mapped_column(String(3), default="ZAR")

    risk_score: Mapped[int]  = mapped_column(Integer, index=True)
    risk_level: Mapped[str]  = mapped_column(String(10), index=True)
    is_flagged: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    velocity: Mapped[int]    = mapped_column(Integer, default=0)
    is_foreign: Mapped[bool] = mapped_column(Boolean, default=False)
    is_night: Mapped[bool]   = mapped_column(Boolean, default=False)
    is_high_risk_merchant: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str]      = mapped_column(String(20), default="PENDING")

    ai_verdict: Mapped[str | None]        = mapped_column(String(20), nullable=True)
    ai_confidence: Mapped[int | None]     = mapped_column(Integer,    nullable=True)
    ai_reasoning: Mapped[str | None]      = mapped_column(Text,       nullable=True)
    ai_recommendation: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ai_key_factors: Mapped[str | None]    = mapped_column(Text,       nullable=True)
    ai_analysed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
