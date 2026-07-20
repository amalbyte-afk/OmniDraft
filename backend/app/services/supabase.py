import uuid
from datetime import datetime, timezone
from typing import Optional

from app.database import get_supabase


def create_conversation(
    user_id: str,
    mode: str,
    title: str = "New conversation",
) -> dict:
    supabase = get_supabase()
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


def get_conversations(user_id: str) -> list[dict]:
    supabase = get_supabase()
    result = (
        supabase.table("conversations")
        .select("id, title, mode, updated_at")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return result.data


def get_conversation(conversation_id: str) -> Optional[dict]:
    supabase = get_supabase()
    result = (
        supabase.table("conversations")
        .select("*")
        .eq("id", conversation_id)
        .single()
        .execute()
    )
    if not result.data:
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


def delete_conversation(conversation_id: str) -> None:
    supabase = get_supabase()
    supabase.table("messages").eq("conversation_id", conversation_id).delete().execute()
    supabase.table("conversations").eq("id", conversation_id).delete().execute()


def save_message(
    conversation_id: str,
    role: str,
    content: str,
) -> dict:
    supabase = get_supabase()
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    data = {
        "id": msg_id,
        "conversation_id": conversation_id,
        "role": role,
        "content": content,
        "created_at": now,
    }
    result = supabase.table("messages").insert(data).execute()

    supabase.table("conversations").eq("id", conversation_id).update(
        {"updated_at": now}
    ).execute()

    return result.data[0]


def get_templates(mode: Optional[str] = None) -> list[dict]:
    templates = [
        {
            "id": "d1",
            "mode": "draft",
            "title": "Blog Post",
            "description": "Write a compelling blog post",
            "prompt": "Write a blog post about",
            "icon": "PenLine",
        },
        {
            "id": "d2",
            "mode": "draft",
            "title": "Email",
            "description": "Draft a professional email",
            "prompt": "Draft an email about",
            "icon": "PenLine",
        },
        {
            "id": "d3",
            "mode": "draft",
            "title": "Essay",
            "description": "Structure an academic essay",
            "prompt": "Write an essay on the topic of",
            "icon": "PenLine",
        },
        {
            "id": "s1",
            "mode": "summarize",
            "title": "Article Summary",
            "description": "Condense an article",
            "prompt": "Summarize the following:",
            "icon": "AlignLeft",
        },
        {
            "id": "s2",
            "mode": "summarize",
            "title": "Bullet Points",
            "description": "Extract key points",
            "prompt": "Extract the key points from:",
            "icon": "AlignLeft",
        },
        {
            "id": "s3",
            "mode": "summarize",
            "title": "Executive Summary",
            "description": "High-level overview",
            "prompt": "Provide an executive summary of:",
            "icon": "AlignLeft",
        },
        {
            "id": "c1",
            "mode": "creative",
            "title": "Story Idea",
            "description": "Generate story concepts",
            "prompt": "Generate a creative story idea about",
            "icon": "Sparkles",
        },
        {
            "id": "c2",
            "mode": "creative",
            "title": "Poem",
            "description": "Write a poem",
            "prompt": "Write a poem about",
            "icon": "Sparkles",
        },
        {
            "id": "c3",
            "mode": "creative",
            "title": "Social Post",
            "description": "Viral social content",
            "prompt": "Write a social media post about",
            "icon": "Sparkles",
        },
    ]
    if mode:
        return [t for t in templates if t["mode"] == mode]
    return templates
