"""Multi-factor fraud risk scoring engine — ZAR thresholds, SA context."""
import random
from dataclasses import dataclass

HIGH_AMOUNT     = 10_000   # R10,000
CRITICAL_AMOUNT = 40_000   # R40,000

HIGH_RISK_MERCHANTS = {
    "Crypto Exchange", "Casino Online", "Wire Transfer",
    "Unknown Vendor", "Forex Broker", "Online Gambling",
}

FOREIGN_LOCATIONS = {
    "Lagos, NG", "Moscow, RU", "Singapore, SG", "Sao Paulo, BR",
    "Seoul, KR", "Dubai, UAE", "Beijing, CN", "Istanbul, TR",
    "Miami, US", "London, UK", "Zurich, CH",
}

NIGHT_HOURS = set(range(23, 24)) | set(range(0, 5))
HIGH_VELOCITY = 8


@dataclass
class RiskBreakdown:
    final_score: int
    risk_level: str
    is_flagged: bool


def risk_level(score: int) -> str:
    if score < 30: return "LOW"
    if score < 60: return "MEDIUM"
    if score < 80: return "HIGH"
    return "CRITICAL"


def compute_risk(amount: float, merchant: str, location: str,
                 velocity: int, hour: int) -> RiskBreakdown:
    score = 10.0
    if amount > CRITICAL_AMOUNT:  score += 35
    elif amount > HIGH_AMOUNT:    score += 20
    elif amount > 5_000:          score += 8
    if location in FOREIGN_LOCATIONS:     score += 20
    if merchant in HIGH_RISK_MERCHANTS:   score += 25
    if hour in NIGHT_HOURS:               score += 10
    if velocity > HIGH_VELOCITY:          score += 15
    elif velocity > 5:                    score += 7
    score += random.uniform(-5, 5)
    final = max(0, min(99, round(score)))
    lvl   = risk_level(final)
    return RiskBreakdown(final_score=final, risk_level=lvl, is_flagged=final >= 60)
