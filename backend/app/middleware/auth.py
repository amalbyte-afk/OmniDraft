import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from app.database import get_supabase

logger = logging.getLogger(__name__)

PUBLIC_PATHS = {"/api/templates", "/api/chat/stream", "/health", "/api/health"}
PUBLIC_PREFIXES = {"/docs", "/redoc", "/openapi.json"}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        if path in PUBLIC_PATHS or any(
            path.startswith(p) for p in PUBLIC_PREFIXES
        ):
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header", "code": "auth_failed"},
            )

        token = auth_header[7:]
        try:
            supabase = get_supabase()
            user = supabase.auth.get_user(token)
            request.state.user_id = user.user.id
        except Exception as e:
            logger.warning("JWT verification failed: %s", e)
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token", "code": "auth_failed"},
            )

        return await call_next(request)
