"""Run this to initialize Supabase database tables and seed data."""
import os
import sys
from supabase import create_client

SUPABASE_URL = "https://fegbaqkmjqxiphsndodk.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZ2JhcWttanF4aXBoc25kb2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDU1NjcwMCwiZXhwIjoyMTAwMTMyNzAwfQ.oZLkb-MDggwNHB1stnzEC75rggxxS1QhEPt75iN7L80"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Since supabase-py uses PostgREST which doesn't support DDL,
# we'll use the underlying httpx client to call the Management API
# The service_role key can also be used for Management API calls
# when the project allows it. Let's try direct SQL via the project's pg connection.

import httpx

# Try the SQL endpoint with service_role key
sql_script = """
-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_tokens_used INT NOT NULL DEFAULT 0
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('draft', 'summarize', 'creative')),
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('draft', 'summarize', 'creative')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'sparkles',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
"""

response = httpx.post(
    "https://api.supabase.com/v1/projects/fegbaqkmjqxiphsndodk/database/sql",
    headers={
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "X-Supabase-Client": "omnidraft-init"
    },
    json={"query": sql_script}
)
print(f"Tables creation: {response.status_code}")
if response.status_code != 200:
    print(f"  Error: {response.text}")

# Try with the OAuth token instead
print()
print("Trying with OAuth token...")
oauth_token = "sbp_oauth_437a070747c78d4c6473d0703ac2df03a68f8606"
response = httpx.post(
    "https://api.supabase.com/v1/projects/fegbaqkmjqxiphsndodk/database/sql",
    headers={
        "Authorization": f"Bearer {oauth_token}",
        "Content-Type": "application/json"
    },
    json={"query": sql_script}
)
print(f"Tables creation with OAuth: {response.status_code}")
if response.status_code != 200:
    print(f"  Error: {response.text}")

# Now let's check if tables exist by querying them
print()
print("Checking tables...")
key = SUPABASE_SERVICE_KEY
try:
    resp = httpx.get(
        "https://fegbaqkmjqxiphsndodk.supabase.co/rest/v1/templates?select=count",
        headers={"apikey": key, "Authorization": f"Bearer {key}"}
    )
    print(f"Templates table: {resp.status_code} - {resp.text}")
except Exception as e:
    print(f"Templates table error: {e}")
