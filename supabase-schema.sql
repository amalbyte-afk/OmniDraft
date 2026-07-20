-- ============================================================
-- OmniDraft: Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_tokens_used INT NOT NULL DEFAULT 0
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. CONVERSATIONS
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

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE USING (auth.uid() = user_id);

-- 3. MESSAGES
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

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
  );
CREATE POLICY "Users can create messages in own conversations"
  ON messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
  );

-- 4. TEMPLATES (public, no RLS)
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

-- SEED DATA: 12 templates
INSERT INTO templates (mode, title, description, system_prompt, user_prompt_template, icon, sort_order) VALUES
('draft', 'Professional Email', 'Write a polished professional email', 'You are a professional email writing assistant. Write clear, concise, and appropriately formal emails.', 'Write a professional email about:', 'mail', 1),
('draft', 'Blog Post', 'Outline and write a blog post', 'You are a blog content strategist and writer. Create engaging, well-structured blog content.', 'Write a blog post outline and introduction about:', 'file-text', 2),
('draft', 'Business Proposal', 'Draft a business proposal', 'You are a business development expert. Write compelling, structured business proposals.', 'Draft a business proposal for:', 'briefcase', 3),
('draft', 'Cover Letter', 'Write a job application cover letter', 'You are a career coach and professional resume writer. Write tailored, impactful cover letters.', 'Write a cover letter for a position in:', 'scroll-text', 4),
('summarize', 'Article Summary', 'Summarize articles in bullet points', 'You are a professional summarizer. Extract the key points and present them as clear bullet points.', 'Summarize the following article in 3-5 bullet points:', 'list', 1),
('summarize', 'Meeting Notes', 'Extract decisions and action items', 'You are a meeting documentation expert. Extract key decisions, action items, and owners.', 'Extract key decisions and action items from:', 'clipboard-list', 2),
('summarize', 'Research Abstract', 'Write an academic abstract', 'You are an academic writing assistant. Write concise, formal abstracts suitable for academic papers.', 'Provide an academic abstract for the following:', 'book-open', 3),
('summarize', 'TL;DR', 'Explain simply for general audience', 'You are a science communicator. Explain complex topics in simple, accessible language.', 'Explain this in one paragraph for a general audience:', 'zap', 4),
('creative', 'Short Story', 'Write a short story from a premise', 'You are a creative fiction writer. Write engaging, well-paced short stories with vivid imagery.', 'Write a short story based on this premise:', 'feather', 1),
('creative', 'Social Caption', 'Write social media caption options', 'You are a social media content strategist. Write engaging, platform-appropriate captions.', 'Write 5 social media caption options for:', 'hash', 2),
('creative', 'Product Description', 'Write a compelling product description', 'You are a copywriter specializing in product marketing. Write persuasive, benefit-focused descriptions.', 'Write a compelling product description for:', 'package', 3),
('creative', 'Creative Brief', 'Write a campaign creative brief', 'You are an advertising creative director. Write structured, inspiring creative briefs.', 'Write a creative brief for a campaign about:', 'lightbulb', 4);
