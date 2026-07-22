import json
import logging
from typing import AsyncGenerator

import httpx
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPTS = {
    "draft": "You are a professional writing assistant. Help users draft clear, well-structured content. Respond with the drafted content only.",
    "summarize": "You are a document summarization expert. Condense the provided content into key points while preserving meaning. Respond with the summary only.",
    "creative": "You are a creative writing partner. Generate imaginative, engaging content based on the user's prompts. Be original and inspiring.",
}


def nvidia_stream_timeout() -> httpx.Timeout:
    return httpx.Timeout(
        connect=10.0,
        read=settings.nvidia_read_timeout_seconds,
        write=30.0,
        pool=10.0,
    )


def nvidia_stream_models() -> tuple[str, ...]:
    if settings.nvidia_fallback_model == settings.nvidia_model:
        return (settings.nvidia_model,)
    return (settings.nvidia_model, settings.nvidia_fallback_model)


def nvidia_stream_delta(chunk: dict) -> str:
    choices = chunk.get("choices") or []
    if not choices:
        return ""
    return choices[0].get("delta", {}).get("content", "")


def _build_payload(
    mode: str,
    message: str,
    file_content: str | None,
    model: str,
) -> dict:
    system_prompt = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["draft"])
    user_content = message
    if file_content:
        user_content = f"{message}\n\n---\n{file_content}"

    return {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.7,
        "max_tokens": settings.max_tokens,
        "stream": True,
    }


async def _stream_nvidia_model(
    model: str,
    mode: str,
    message: str,
    file_content: str | None = None,
) -> AsyncGenerator[str, None]:
    payload = _build_payload(mode, message, file_content, model)
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    async with httpx.AsyncClient(timeout=nvidia_stream_timeout()) as client:
        async with client.stream(
            "POST",
            "https://integrate.api.nvidia.com/v1/chat/completions",
            json=payload,
            headers=headers,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data_str = line[6:].strip()
                if data_str == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_str)
                    delta = nvidia_stream_delta(chunk)
                    if delta:
                        yield delta
                except json.JSONDecodeError:
                    logger.warning("Failed to parse SSE chunk: %s", data_str)


async def stream_nvidia_chat(
    mode: str,
    message: str,
    file_content: str | None = None,
) -> AsyncGenerator[str, None]:
    models = nvidia_stream_models()

    for index, model in enumerate(models):
        received_content = False
        try:
            async for token in _stream_nvidia_model(model, mode, message, file_content):
                received_content = True
                yield token
            return
        except httpx.TimeoutException:
            if not received_content and index < len(models) - 1:
                logger.warning(
                    "NVIDIA model %s timed out before responding; retrying with %s",
                    model,
                    models[index + 1],
                )
                continue
            logger.error("NVIDIA API request timed out")
            yield " [Request timed out. Please try again.]"
            return
        except httpx.HTTPStatusError as exc:
            logger.error("NVIDIA API HTTP error: %s", exc)
            yield f" [API error: {exc.response.status_code}]"
            return
        except httpx.RequestError as exc:
            logger.error("NVIDIA API connection error: %s", exc)
            yield " [Connection error. Please try again.]"
            return
