import json
import logging
import time

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.chat import ChatRequest
from app.services.llm import stream_nvidia_chat
from app.services.supabase_db import (
    create_conversation,
    save_message,
    update_tokens_used,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/stream")
@limiter.limit("20/minute")
async def chat_stream(request: Request, body: ChatRequest):
    user_id = getattr(request.state, "user_id", "anonymous")
    tokens_used = 0
    start_time = time.time()

    async def event_generator():
        nonlocal tokens_used

        conv_id = body.conversation_id
        try:
            if not conv_id:
                conv = create_conversation(
                    user_id=user_id,
                    mode=body.mode.value,
                    title=body.message[:80],
                )
                conv_id = conv["id"]

            save_message(conv_id, "user", body.message)

            full_response = []
            async for token in stream_nvidia_chat(
                mode=body.mode.value,
                message=body.message,
                file_content=body.file_content,
            ):
                tokens_used += 1
                full_response.append(token)
                yield f"data: {json.dumps({'token': token})}\n\n"

            response_text = "".join(full_response)
            save_message(conv_id, "assistant", response_text, tokens_used)

            if user_id != "anonymous":
                update_tokens_used(user_id, tokens_used)

            yield f"data: {json.dumps({'done': True, 'conversation_id': conv_id, 'tokens_used': tokens_used})}\n\n"
        except Exception as e:
            logger.error("Chat stream error: %s", e)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
        finally:
            elapsed = int((time.time() - start_time) * 1000)
            logger.info(
                "chat_stream",
                extra={
                    "user_id": user_id,
                    "mode": body.mode.value,
                    "response_time_ms": elapsed,
                    "tokens_used": tokens_used,
                },
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
