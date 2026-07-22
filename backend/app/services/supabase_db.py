import uuid
from datetime import datetime, timezone
from typing import Optional

from app.database import get_supabase


def _get_client(auth_token: str | None = None):
    return get_supabase(token=auth_token)


def create_conversation(user_id: str, mode: str, title: str = "New conversation", auth_token: str | None = None) -> dict:
    supabase = _get_client(auth_token)
    conv_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    data = {
        "id": conv_id,
        "user_id": user_id,
        "title": title,
        "mode": mode,
        "created_at": now,
        "updated_at": now,
    }
    result = supabase.table("conversations").insert(data).execute()
    return result.data[0]


def get_conversations(user_id: str, auth_token: str | None = None) -> list[dict]:
    supabase = _get_client(auth_token)
    result = (
        supabase.table("conversations")
        .select("id, title, mode, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


def get_conversation(conversation_id: str, auth_token: str | None = None) -> Optional[dict]:
    supabase = _get_client(auth_token)
    result = None
    try:
        result = (
            supabase.table("conversations")
            .select("*")
            .eq("id", conversation_id)
            .single()
            .execute()
        )
    except Exception:
        return None
    if not result or not result.data:
        return None
    conv = result.data
    msgs = (
        supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )
    conv["messages"] = msgs.data
    return conv


def delete_conversation(conversation_id: str, auth_token: str | None = None) -> None:
    supabase = _get_client(auth_token)
    supabase.table("messages").eq("conversation_id", conversation_id).delete().execute()
    supabase.table("conversations").eq("id", conversation_id).delete().execute()


def save_message(conversation_id: str, role: str, content: str, tokens_used: int = 0, auth_token: str | None = None) -> dict:
    supabase = _get_client(auth_token)
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    data = {
        "id": msg_id,
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "tokens_used": tokens_used,
        "created_at": now,
    }
    result = supabase.table("messages").insert(data).execute()

    supabase.table("conversations").eq("id", conversation_id).update(
        {"updated_at": now}
    ).execute()

    return result.data[0]


def get_templates(mode: Optional[str] = None) -> list[dict]:
    supabase = _get_client()
    query = supabase.table("templates").select("*").eq("is_active", True).order("sort_order")
    if mode:
        query = query.eq("mode", mode)
    result = query.execute()
    return result.data


def get_or_create_profile(user_id: str, email: str, auth_token: str | None = None) -> dict:
    supabase = _get_client(auth_token)
    try:
        existing = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        if existing.data:
            return existing.data
    except Exception:
        pass
    now = datetime.now(timezone.utc).isoformat()
    data = {"id": user_id, "email": email, "created_at": now, "total_tokens_used": 0}
    result = supabase.table("profiles").insert(data).execute()
    return result.data[0]


def update_tokens_used(user_id: str, tokens: int, auth_token: str | None = None) -> None:
    supabase = _get_client(auth_token)
    try:
        current = supabase.table("profiles").select("total_tokens_used").eq("id", user_id).single().execute()
        current_tokens = current.data.get("total_tokens_used", 0) if current.data else 0
        supabase.table("profiles").eq("id", user_id).update(
            {"total_tokens_used": current_tokens + tokens}
        ).execute()
    except Exception:
        pass
