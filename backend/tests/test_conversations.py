import pytest


@pytest.mark.asyncio
@pytest.mark.xfail(reason="Requires real Supabase credentials")
async def test_list_conversations_returns_list(test_client, auth_headers):
    response = await test_client.get("/api/conversations", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
