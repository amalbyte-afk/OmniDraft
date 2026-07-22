import logging
import sys
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.middleware.auth import AuthMiddleware
from app.routers import auth, chat, conversations, templates, upload, export
from app.services.ratelimit import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format='{"time": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}',
        datefmt="%Y-%m-%dT%H:%M:%S",
        stream=sys.stdout,
    )
    app.state.limiter = limiter
    yield


app = FastAPI(
    title="OmniDraft API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_origin_regex=r"https?://omni-draft\.duckdns\.org(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(conversations.router)
app.include_router(templates.router)
app.include_router(upload.router)
app.include_router(export.router)


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/health")
async def api_health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "code": "internal_error"},
    )
