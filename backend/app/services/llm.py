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


def _build_payload(mode: str, message: str, file_content: str | None) -> dict:
    system_prompt = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["draft"])
    user_content = message
    if file_content:
        user_content = f"{message}\n\n---\n{file_content}"

    return {
        "model": settings.nvidia_model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.7,
        "max_tokens": settings.max_tokens,
        "stream": True,
    }


async def stream_nvidia_chat(
    mode: str,
    message: str,
    file_content: str | None = None,
) -> AsyncGenerator[str, None]:
    payload = _build_payload(mode, message, file_content)
    headers = {
        "Authorization": f"Bearer {settings.nvidia_api_key}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
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
                        delta = (
                            chunk.get("choices", [{}])[0]
                            .get("delta", {})
                            .get("content", "")
                        )
                        if delta:
                            yield delta
                    except json.JSONDecodeError:
                        logger.warning("Failed to parse SSE chunk: %s", data_str)
        except httpx.TimeoutException:
            logger.error("NVIDIA API request timed out")
            yield " [Request timed out. Please try again.]"
        except httpx.HTTPStatusError as e:
            logger.error("NVIDIA API HTTP error: %s", e)
            yield f" [API error: {e.response.status_code}]"
        except httpx.RequestError as e:
            logger.error("NVIDIA API connection error: %s", e)
            yield " [Connection error. Please try again.]"
