from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskSignals(BaseModel):
    amount_risk: str
    is_foreign: bool
    is_night: bool
    velocity_per_hour: int
    high_risk_merchant: bool


class AIAnalysis(BaseModel):
    verdict: str
    confidence: int
    reasoning: str
    recommendation: str
    key_factors: List[str]
    analysed_at: datetime


class TransactionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    merchant: str
    merchant_category: str = "RETAIL"
    location: str
    card_type: str = "Visa"
    card_number: str
    user_id: str
    currency: str = "ZAR"


class TransactionResponse(BaseModel):
    id: str
    txn_ref: str
    created_at: datetime
    user_id: str
    card_number: str
    card_type: str
    amount: float
    merchant: str
    merchant_category: str
    location: str
    currency: str
    risk_score: int
    risk_level: str
    is_flagged: bool
    velocity: int
    is_foreign: bool
    is_night: bool
    is_high_risk_merchant: bool
    status: str
    risk_signals: RiskSignals
    ai_analysis: Optional[AIAnalysis] = None
    model_config = {"from_attributes": True}


class PaginatedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    has_next: bool


class DashboardSummary(BaseModel):
    total_transactions: int
    total_volume_zar: float
    flagged_count: int
    flag_rate_pct: float
    critical_count: int
    avg_risk_score: float
    approved_count: int
    blocked_count: int
    reviewing_count: int


class RiskDistributionItem(BaseModel):
    level: str
    count: int
    percentage: float


class MerchantRiskItem(BaseModel):
    merchant: str
    transaction_count: int
    avg_risk_score: float
    total_volume_zar: float


class LocationRiskItem(BaseModel):
    location: str
    transaction_count: int
    avg_risk_score: float
    flagged_count: int
