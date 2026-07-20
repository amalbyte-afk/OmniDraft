import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.fixture
def test_client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer test-token"}
