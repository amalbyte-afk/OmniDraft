from typing import Optional

from fastapi import APIRouter, Query

from app.services.supabase import get_templates

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("")
async def list_templates(mode: Optional[str] = Query(None)):
    templates = get_templates(mode)
    return templates
