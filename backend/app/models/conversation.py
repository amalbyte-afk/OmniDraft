from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime


class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime
    messages: Optional[list[MessageOut]] = None


class ConversationListItem(BaseModel):
    id: str
    title: str
    mode: str
    updated_at: datetime
