from supabase import create_client, Client
from app.config import settings

supabase: Client | None = None


def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return supabase
