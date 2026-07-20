import logging

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import PlainTextResponse

from app.services.supabase import get_conversation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/{conversation_id}")
async def export_conversation(
    conversation_id: str,
    format: str = Query("txt", pattern="^(txt|md|pdf)$"),
):
    conv = get_conversation(conversation_id)
    if not conv:
        raise HTTPException(
            status_code=404,
            detail={"detail": "Conversation not found", "code": "not_found"},
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
