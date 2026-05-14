"""Analytics & dashboard endpoints."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.db_models import Transaction
from app.models.schemas import (
    DashboardSummary, RiskDistributionItem,
    MerchantRiskItem, LocationRiskItem,
)

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def summary(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Transaction))).scalars().all()
    total = len(rows)
    if total == 0:
        return DashboardSummary(total_transactions=0, total_volume_zar=0,
            flagged_count=0, flag_rate_pct=0, critical_count=0,
            avg_risk_score=0, approved_count=0, blocked_count=0, reviewing_count=0)
    flagged  = sum(1 for r in rows if r.is_flagged)
    critical = sum(1 for r in rows if r.risk_level == "CRITICAL")
    volume   = sum(r.amount for r in rows)
    avg_score = sum(r.risk_score for r in rows) / total
    return DashboardSummary(
        total_transactions=total,
        total_volume_zar=round(volume, 2),
        flagged_count=flagged,
        flag_rate_pct=round(flagged / total * 100, 1),
        critical_count=critical,
        avg_risk_score=round(avg_score, 1),
        approved_count=sum(1 for r in rows if r.status == "APPROVED"),
        blocked_count=sum(1 for r in rows if r.status == "BLOCKED"),
        reviewing_count=sum(1 for r in rows if r.status == "REVIEWING"),
    )


@router.get("/risk-distribution", response_model=List[RiskDistributionItem])
async def risk_distribution(db: AsyncSession = Depends(get_db)):
    rows  = (await db.execute(select(Transaction))).scalars().all()
    total = len(rows)
    if not total:
        return []
    result = []
    for level in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
        count = sum(1 for r in rows if r.risk_level == level)
        result.append(RiskDistributionItem(
            level=level, count=count,
            percentage=round(count / total * 100, 1),
        ))
    return result


@router.get("/merchant-risk", response_model=List[MerchantRiskItem])
async def merchant_risk(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Transaction))).scalars().all()
    merchants: dict = {}
    for r in rows:
        m = merchants.setdefault(r.merchant, {"count": 0, "score_sum": 0, "volume": 0})
        m["count"]     += 1
        m["score_sum"] += r.risk_score
        m["volume"]    += r.amount
    result = [
        MerchantRiskItem(
            merchant=name, transaction_count=v["count"],
            avg_risk_score=round(v["score_sum"] / v["count"], 1),
            total_volume_zar=round(v["volume"], 2),
        )
        for name, v in merchants.items()
    ]
    return sorted(result, key=lambda x: x.avg_risk_score, reverse=True)[:15]


@router.get("/location-risk", response_model=List[LocationRiskItem])
async def location_risk(db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Transaction))).scalars().all()
    locs: dict = {}
    for r in rows:
        l = locs.setdefault(r.location, {"count": 0, "score_sum": 0, "flagged": 0})
        l["count"]     += 1
        l["score_sum"] += r.risk_score
        if r.is_flagged: l["flagged"] += 1
    result = [
        LocationRiskItem(
            location=name, transaction_count=v["count"],
            avg_risk_score=round(v["score_sum"] / v["count"], 1),
            flagged_count=v["flagged"],
        )
        for name, v in locs.items()
    ]
    return sorted(result, key=lambda x: x.avg_risk_score, reverse=True)
