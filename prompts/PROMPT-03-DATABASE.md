# Prompt 3: Database & Persistence — OmniDraft

## Vibe Profile
**Role**: Database Architect + Backend Engineer
**Platform**: Supabase PostgreSQL (managed, course-recommended hybrid approach)

## Product Brief
Set up the Supabase project with PostgreSQL schema, Row-Level Security (RLS) policies, and seed data for OmniDraft's template library. This provides all persistence: user data, conversations, messages, templates, and file metadata.

## Project Goals
- Define complete schema (4 tables)
- Enable Row-Level Security on all tables
- Create RLS policies for multi-tenant isolation (users see only their data)
- Seed template data (12+ pre-built prompts across 3 modes)
- Set up Supabase Auth (magic link)
- Configure Supabase Storage for file uploads

## Tech Stack
- Supabase (PostgreSQL 15+)
- Supabase Auth (built-in)
- Supabase Storage (S3-compatible)
- SQL (migrations via Supabase SQL Editor)

## Schema

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_tokens_used INT NOT NULL DEFAULT 0
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Table: `conversations`
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('draft', 'summarize', 'creative')),
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
```

### Table: `messages`
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### Table: `templates`
```sql
CREATE TABLE templates (
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

-- Templates are public, no RLS needed
```

## RLS Policies

### profiles
```sql
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### conversations
```sql
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);
```

### messages
```sql
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );
```

## Seed Data: Templates (12 entries)

### Draft Mode (4)
```
1. Professional Email — "Write a professional email about..."
2. Blog Post — "Write a blog post outline and introduction about..."
3. Business Proposal — "Draft a business proposal for..."
4. Cover Letter — "Write a cover letter for a position in..."
```

### Summarize Mode (4)
```
5. Article Summary — "Summarize the following article in 3-5 bullet points..."
6. Meeting Notes — "Extract key decisions and action items from..."
7. Research Paper — "Provide an academic abstract for the following..."
8. TL;DR — "Explain this in one paragraph for a general audience..."
```

### Creative Mode (4)
```
9. Short Story — "Write a short story based on this premise..."
10. Social Media Caption — "Write 5 social media caption options for..."
11. Product Description — "Write a compelling product description for..."
12. Creative Brief — "Write a creative brief for a campaign about..."
```

## Supabase Storage
```sql
-- Bucket: uploads
-- Public read, authenticated write
-- Max file size: 10MB
-- Allowed MIME types: text/plain, application/pdf, application/msword
```

## Auth Configuration
- Provider: Email (magic link)
- Site URL: http://localhost:5173 (dev) + App Runner URL (prod)
- Redirect URLs: /workspace after login

## Setup Steps
1. Create new Supabase project
2. Run all SQL in Supabase SQL Editor (in order: tables → indexes → RLS → policies → seed data)
3. Configure Auth settings (magic link, site URL)
4. Create Storage bucket `uploads`
5. Copy project URL + anon key + service role key to `.env`

---

INSTRUCTIONS:
Generate the complete SQL migration script with all tables, indexes, RLS policies, and seed data. Include all 12 template entries with descriptive system prompts and user prompt templates. Write the setup instructions clearly for manual execution in Supabase SQL Editor.
