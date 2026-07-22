import logging

from fastapi import APIRouter, Query, HTTPException, Request
from fastapi.responses import PlainTextResponse

from app.services.supabase_db import get_conversation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/{conversation_id}")
async def export_conversation(
    request: Request,
    conversation_id: str,
    format: str = Query("txt", pattern="^(txt|md|pdf)$"),
):
    user_id = getattr(request.state, "user_id", None)
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(
            status_code=404,
            detail={"detail": "Conversation not found", "code": "not_found"},
        )
    if conv.get("user_id") and user_id and conv["user_id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail={"detail": "Not authorized to export this conversation", "code": "forbidden"},
        )

    if format == "pdf":
        raise HTTPException(
            status_code=501,
            detail={"detail": "PDF export not yet implemented", "code": "validation_error"},
        )

    lines = [f"# {conv['title']}\n", f"Mode: {conv['mode']}\n\n"]
    for msg in conv.get("messages", []):
        prefix = "**You:**" if msg["role"] == "user" else "**Assistant:**"
        lines.append(f"{prefix}\n{msg['content']}\n\n")

    body = "".join(lines)
    media_type = "text/markdown" if format == "md" else "text/plain"
    filename = f"omnidraft-{conversation_id[:8]}.{format}"

    return PlainTextResponse(
        content=body,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
