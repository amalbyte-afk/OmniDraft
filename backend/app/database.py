from supabase import create_client, Client
from app.config import settings

supabase: Client | None = None


def get_supabase(token: str | None = None) -> Client:
    global supabase
    if token:
        client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key,
        )
        client.postgrest.auth(token)
        return client
    if supabase is None:
        supabase = create_client(
            settings.supabase_url,
            settings.supabase_service_key,
        )
    return supabase
