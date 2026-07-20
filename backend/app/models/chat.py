from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ModeEnum(str, Enum):
    draft = "draft"
    summarize = "summarize"
    creative = "creative"


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    mode: ModeEnum
    message: str = Field(..., min_length=1, max_length=10000)
    file_content: Optional[str] = None
