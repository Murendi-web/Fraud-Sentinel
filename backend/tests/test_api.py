"""Basic API smoke tests. Run with: pytest tests/"""
import pytest
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["currency"] == "ZAR"


@pytest.mark.asyncio
async def test_list_transactions_empty():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/transactions")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_analytics_summary():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/analytics/summary")
    assert r.status_code == 200
