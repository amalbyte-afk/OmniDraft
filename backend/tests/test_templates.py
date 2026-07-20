import pytest


@pytest.mark.asyncio
async def test_list_templates_returns_list(test_client):
    response = await test_client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_filter_templates_by_mode(test_client):
    response = await test_client.get("/api/templates?mode=draft")
    assert response.status_code == 200
    data = response.json()
    for t in data:
        assert t["mode"] == "draft"
