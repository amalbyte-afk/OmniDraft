import pytest


@pytest.mark.asyncio
async def test_missing_auth_returns_sse(test_client):
    response = await test_client.post(
        "/api/chat/stream",
        json={"mode": "draft", "message": "test"},
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_health_without_auth(test_client):
    response = await test_client.get("/api/health")
    assert response.status_code == 200
