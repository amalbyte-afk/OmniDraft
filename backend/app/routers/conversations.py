import logging

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.services.supabase_db import (
    get_conversations,
    get_conversation,
    delete_conversation,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


def _get_auth_token(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


@router.get("")
async def list_conversations(request: Request):
    user_id = request.state.user_id
    auth_token = _get_auth_token(request)
    convs = get_conversations(user_id, auth_token=auth_token)
    return convs


@router.get("/{conversation_id}")
async def read_conversation(request: Request, conversation_id: str):
    user_id = request.state.user_id
    auth_token = _get_auth_token(request)
    conv = get_conversation(conversation_id, auth_token=auth_token)
    if not conv:
        return JSONResponse(
            status_code=404,
            content={"detail": "Conversation not found", "code": "not_found"},
        )
    if conv["user_id"] != user_id:
        return JSONResponse(
            status_code=403,
            content={"detail": "Access denied", "code": "auth_failed"},
        )
    return conv


@router.delete("/{conversation_id}")
async def remove_conversation(request: Request, conversation_id: str):
    user_id = request.state.user_id
    auth_token = _get_auth_token(request)
    conv = get_conversation(conversation_id, auth_token=auth_token)
    if not conv:
        return JSONResponse(
            status_code=404,
            content={"detail": "Conversation not found", "code": "not_found"},
        )
    if conv["user_id"] != user_id:
        return JSONResponse(
            status_code=403,
            content={"detail": "Access denied", "code": "auth_failed"},
        )
    delete_conversation(conversation_id, auth_token=auth_token)
    return {"detail": "Conversation deleted"}
