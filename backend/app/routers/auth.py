import logging

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.services.supabase_db import get_or_create_profile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthCallbackBody(BaseModel):
    user_id: str
    email: str


def _get_auth_token(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


@router.post("/callback")
async def auth_callback(request: Request, body: AuthCallbackBody):
    auth_token = _get_auth_token(request)
    try:
        profile = get_or_create_profile(body.user_id, body.email, auth_token=auth_token)
        return {"profile": profile}
    except Exception as e:
        logger.error("Auth callback error: %s", e)
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to create profile", "code": "internal_error"},
        )


@router.get("/me")
async def get_current_user(request: Request):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        return JSONResponse(
            status_code=401,
            content={"detail": "Not authenticated", "code": "auth_failed"},
        )
    auth_token = _get_auth_token(request)
    profile = get_or_create_profile(user_id, "", auth_token=auth_token)
    return {"user": profile}
