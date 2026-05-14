"""Claude AI fraud analysis — async, with rule-based fallback."""
import json
import logging
from datetime import datetime

import anthropic
from app.core.config import settings
from app.models.schemas import AIAnalysis

logger = logging.getLogger(__name__)
_client: anthropic.AsyncAnthropic | None = None


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


SYSTEM = (
    "You are a senior fraud analyst at a South African bank specialising in ZAR card fraud. "
    "Respond ONLY with valid JSON — no markdown fences, no preamble."
)


def _prompt(t: dict) -> str:
    return f"""Analyse this transaction for fraud.

Reference:  {t['txn_ref']}
Amount:     R{t['amount']:,.2f} ZAR
Merchant:   {t['merchant']} [{t['merchant_category']}]
Location:   {t['location']}
Card:       {t['card_type']} {t['card_number']}
User:       {t['user_id']}
Risk Score: {t['risk_score']}/100 ({t['risk_level']})
Foreign:    {t['is_foreign']}
Night:      {t['is_night']}
High-Risk Merchant: {t['is_high_risk_merchant']}
Velocity:   {t['velocity']} txn/hr

Return JSON only:
{{
  "verdict":        "LEGITIMATE" | "SUSPICIOUS" | "FRAUDULENT",
  "confidence":     0-100,
  "reasoning":      "2-3 sentence analysis",
  "recommendation": "APPROVE" | "REVIEW" | "BLOCK",
  "key_factors":    ["factor1","factor2","factor3"]
}}"""


async def analyse_transaction(txn: dict) -> AIAnalysis:
    try:
        client = _get_client()
        resp = await client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=512,
            system=SYSTEM,
            messages=[{"role": "user", "content": _prompt(txn)}],
        )
        raw  = resp.content[0].text.strip().replace("```json","").replace("```","").strip()
        data = json.loads(raw)
        return AIAnalysis(
            verdict=data["verdict"],
            confidence=int(data["confidence"]),
            reasoning=data["reasoning"],
            recommendation=data["recommendation"],
            key_factors=data.get("key_factors", []),
            analysed_at=datetime.utcnow(),
        )
    except Exception as exc:
        logger.warning(f"Claude fallback: {exc}")
        score = txn.get("risk_score", 0)
        verdict = "FRAUDULENT" if score >= 80 else "SUSPICIOUS" if score >= 60 else "LEGITIMATE"
        rec     = "BLOCK"      if score >= 80 else "REVIEW"     if score >= 60 else "APPROVE"
        return AIAnalysis(
            verdict=verdict, confidence=score,
            reasoning="Rule-based fallback — Claude API unavailable.",
            recommendation=rec,
            key_factors=["Rule-based scoring", "Threshold evaluation"],
            analysed_at=datetime.utcnow(),
        )
