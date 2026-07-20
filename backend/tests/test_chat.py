import pytest


@pytest.mark.asyncio
async def test_streaming_endpoint_returns_sse(test_client, auth_headers):
    response = await test_client.post(
        "/api/chat/stream",
        json={"mode": "draft", "message": "Write a test email"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]


@pytest.mark.asyncio
async def test_invalid_mode_returns_422(test_client, auth_headers):
    response = await test_client.post(
        "/api/chat/stream",
        json={"mode": "invalid", "message": "test"},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_empty_message_returns_422(test_client, auth_headers):
    response = await test_client.post(
        "/api/chat/stream",
        json={"mode": "draft", "message": ""},
        headers=auth_headers,
    )
    assert response.status_code == 422
