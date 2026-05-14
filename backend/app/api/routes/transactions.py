"""Transactions REST endpoints."""
import json
import uuid
import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.db_models import Transaction
from app.models.schemas import TransactionCreate, TransactionResponse, PaginatedTransactions
from app.services.claude_service import analyse_transaction
from app.services.risk_engine import compute_risk, HIGH_RISK_MERCHANTS, FOREIGN_LOCATIONS
from app.utils.formatters import to_response, to_dict

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=PaginatedTransactions)
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    risk_level: Optional[str] = None,
    flagged_only: bool = False,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Transaction).order_by(desc(Transaction.created_at))
    if risk_level:
        stmt = stmt.where(Transaction.risk_level == risk_level.upper())
    if flagged_only:
        stmt = stmt.where(Transaction.is_flagged == True)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(or_(
            Transaction.txn_ref.like(like),
            Transaction.merchant.like(like),
            Transaction.user_id.like(like),
        ))
    total = (await db.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one()
    rows  = (await db.execute(stmt.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return PaginatedTransactions(
        items=[to_response(r) for r in rows], total=total,
        page=page, page_size=page_size, has_next=(page * page_size) < total,
    )


@router.post("", response_model=TransactionResponse, status_code=201)
async def create_transaction(body: TransactionCreate, db: AsyncSession = Depends(get_db)):
    hour = datetime.utcnow().hour
    rb   = compute_risk(body.amount, body.merchant, body.location, 0, hour)
    night_hours = set(range(23, 24)) | set(range(0, 5))
    txn = Transaction(
        id=str(uuid.uuid4()),
        txn_ref=f"TXN-M-{str(uuid.uuid4())[:8].upper()}",
        created_at=datetime.utcnow(),
        user_id=body.user_id, card_number=body.card_number, card_type=body.card_type,
        amount=body.amount, merchant=body.merchant,
        merchant_category=body.merchant_category, location=body.location,
        currency=body.currency,
        risk_score=rb.final_score, risk_level=rb.risk_level, is_flagged=rb.is_flagged,
        velocity=0, is_foreign=body.location in FOREIGN_LOCATIONS,
        is_night=hour in night_hours,
        is_high_risk_merchant=body.merchant in HIGH_RISK_MERCHANTS, status="PENDING",
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)
    return to_response(txn)


@router.get("/{txn_id}", response_model=TransactionResponse)
async def get_transaction(txn_id: str, db: AsyncSession = Depends(get_db)):
    txn = await db.get(Transaction, txn_id)
    if not txn:
        raise HTTPException(404, "Transaction not found")
    return to_response(txn)


@router.post("/{txn_id}/analyze", response_model=TransactionResponse)
async def ai_analyze(txn_id: str, db: AsyncSession = Depends(get_db)):
    txn = await db.get(Transaction, txn_id)
    if not txn:
        raise HTTPException(404, "Transaction not found")
    result = await analyse_transaction(to_dict(txn))
    txn.ai_verdict        = result.verdict
    txn.ai_confidence     = result.confidence
    txn.ai_reasoning      = result.reasoning
    txn.ai_recommendation = result.recommendation
    txn.ai_key_factors    = json.dumps(result.key_factors)
    txn.ai_analysed_at    = result.analysed_at
    if result.recommendation == "BLOCK":    txn.status = "BLOCKED"
    elif result.recommendation == "REVIEW": txn.status = "REVIEWING"
    elif result.recommendation == "APPROVE":txn.status = "APPROVED"
    await db.commit()
    await db.refresh(txn)
    return to_response(txn)


@router.patch("/{txn_id}/status", response_model=TransactionResponse)
async def update_status(txn_id: str, status: str, db: AsyncSession = Depends(get_db)):
    if status.upper() not in {"APPROVED", "BLOCKED", "REVIEWING", "PENDING"}:
        raise HTTPException(400, "Invalid status")
    txn = await db.get(Transaction, txn_id)
    if not txn:
        raise HTTPException(404, "Transaction not found")
    txn.status = status.upper()
    await db.commit()
    await db.refresh(txn)
    return to_response(txn)
