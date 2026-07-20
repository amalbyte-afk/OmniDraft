# Master Continuation Prompt: OmniDraft — Prompts 3 → 7

## Role
Senior Full-Stack Engineer + DevOps + QA + Creative Director

## Mission
The OmniDraft frontend (React + Vite + Tailwind) and backend (FastAPI + SSE + NVIDIA API) are already built and working. Your job is to read the existing codebase to understand the current state, then implement EVERYTHING from Prompts 3 through 7 below — in order — without skipping anything.

## How to Execute

### Phase 0: Orientation
1. Read the complete project structure: list all files in `frontend/` and `backend/`
2. Read key files to understand the architecture:
   - `frontend/src/App.tsx` — routing, layout
   - `frontend/src/lib/api.ts` — API client structure
   - `frontend/src/store/index.ts` — state management
   - `backend/app/main.py` — FastAPI app, CORS, routers
   - `backend/app/config.py` — environment config
   - `backend/app/routers/chat.py` — SSE streaming endpoint
   - `backend/app/services/llm.py` — NVIDIA API integration
3. Confirm the design system: check `tailwind.config.js` and `globals.css` for the glassmorphism dark-mode tokens
4. Check `frontend/src/pages/Workspace.tsx` — understand the chat UI structure
5. Note the Supabase client setup in `frontend/src/lib/supabase.ts` and `backend/app/database.py`

---

## Prompt 3: Database & Persistence (Supabase)

### Schema (4 tables)

Run these SQL statements in **Supabase SQL Editor**:

```sql
-- 1. PROFILES
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_tokens_used INT NOT NULL DEFAULT 0
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

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

CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON conversations FOR DELETE USING (auth.uid() = user_id);

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

CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
);
CREATE POLICY "Users can create messages in own conversations" ON messages FOR INSERT WITH CHECK (
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
```

### Backend: Database Service
Create/update `backend/app/services/supabase_db.py`:
- `create_conversation(user_id, mode, title)` → insert into conversations, return record
- `get_conversations(user_id)` → select all conversations for user, ordered by updated_at desc
- `get_conversation(conversation_id)` → select conversation + join messages, ordered by created_at asc
- `delete_conversation(conversation_id)` → delete conversation (cascade deletes messages)
- `save_message(conversation_id, role, content, tokens_used=0)` → insert into messages
- `get_templates(mode=None)` → select templates, filter by mode if provided, order by sort_order
- `get_or_create_profile(user_id, email)` → upsert profile
- `update_tokens_used(user_id, tokens)` → increment total_tokens_used

### Backend: Update Chat Router
Update `backend/app/routers/chat.py` to:
- On first user message: create conversation via `create_conversation()` using the selected mode
- On subsequent messages: use existing `conversation_id`
- After each AI token completes: call `save_message()` for both user message and assistant response
- Include `tokens_used` tracking from NVIDIA API response metadata

### Backend: Update Conversation Router
Update `backend/app/routers/conversations.py` (or create it):
- `GET /api/conversations` — calls `get_conversations(user_id)`
- `GET /api/conversations/{id}` — calls `get_conversation(id)`, verify ownership
- `DELETE /api/conversations/{id}` — calls `delete_conversation(id)`, verify ownership

### Backend: Templates Router
Create `backend/app/routers/templates.py`:
- `GET /api/templates` — public endpoint, calls `get_templates()`
- `GET /api/templates?mode=draft` — filter by mode

### Backend: Auth Router
Create `backend/app/routers/auth.py`:
- `POST /api/auth/callback` — receives Supabase auth callback, creates/updates profile
- `GET /api/auth/me` — returns current user profile (requires auth)

### Register all new routers in `main.py`

---

## Prompt 4: Docker

### Create `docker/Dockerfile` (Multi-stage)

```dockerfile
# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend Dependencies
FROM python:3.11-slim AS backend-deps
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Production
FROM python:3.11-slim
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY --from=backend-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY backend/ /app/backend
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template

RUN useradd -m -u 1000 omnidraft && chown -R omnidraft:omnidraft /app /var/log/nginx /var/lib/nginx

EXPOSE 8080
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
USER omnidraft
CMD ["/entrypoint.sh"]
```

### Create `docker/nginx.conf.template`
```nginx
events { worker_connections 1024; }
http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
  gzip_min_length 1000;
  gzip_vary on;

  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
      proxy_pass http://127.0.0.1:8000;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_buffering off;
      proxy_cache off;
      proxy_read_timeout 86400s;
    }

    location / {
      try_files $uri $uri/ /index.html;
    }

    location /assets/ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
}
```

### Create `docker/entrypoint.sh`
```bash
#!/bin/sh
cd /app/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 &
nginx -g 'daemon off;'
```

### Create `docker-compose.yml`
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend.dev
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    command: npm run dev -- --host 0.0.0.0
    depends_on:
      - backend
```

### Create `docker/Dockerfile.backend.dev`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### Create `docker/Dockerfile.frontend.dev`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Create `.dockerignore`
```
node_modules/
__pycache__/
*.pyc
.env
.git
.gitignore
*.md
.vite/
dist/
```

### Add health check to backend
Add to `backend/app/main.py`:
```python
@app.get("/api/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
```

---

## Prompt 5: AWS Deployment

### IAM Policy for Deployer
Create an IAM user `omnidraft-deployer` with this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["apprunner:*", "ecr:GetAuthorizationToken", "ecr:BatchCheckLayerAvailability", "ecr:CompleteLayerUpload", "ecr:InitiateLayerUpload", "ecr:PutImage", "ecr:UploadLayerPart", "iam:PassRole"],
      "Resource": "*"
    }
  ]
}
```

### Create `aws-deploy.sh`
```bash
#!/bin/bash
set -e

# Configuration — UPDATE THESE
AWS_ACCOUNT_ID="your-account-id"
AWS_REGION="us-east-1"
REPO_NAME="omnidraft"
SERVICE_NAME="omnidraft"

# Authenticate
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Create ECR repo if needed
aws ecr create-repository --repository-name $REPO_NAME --region $AWS_REGION 2>/dev/null || true

# Build and push
docker build -t $REPO_NAME:latest -f docker/Dockerfile .
docker tag $REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REPO_NAME:latest

echo "Image pushed. Now create App Runner service via AWS Console:"
echo "1. Go to AWS App Runner → Create service → Container registry → ECR"
echo "2. Select $REPO_NAME:latest"
echo "3. Port: 8080"
echo "4. CPU: 1 vCPU, Memory: 2 GB"
echo "5. Set environment variables (see .env.example)"
echo "6. Health check path: /api/health"
echo "7. Create and wait for deployment"
```

### Environment variables for App Runner Console
| Variable | Source | Secret? |
|----------|--------|---------|
| `SUPABASE_URL` | Supabase project settings | No |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key | **Yes** |
| `NVIDIA_API_KEY` | NVIDIA API dashboard | **Yes** |
| `ALLOWED_ORIGINS` | `https://your-app.awsapprunner.com` | No |
| `RATE_LIMIT` | `20/minute` | No |
| `MAX_TOKENS` | `4096` | No |
| `LOG_LEVEL` | `INFO` | No |

---

## Prompt 6: Testing & QA

### Create `backend/tests/` folder

**`backend/tests/conftest.py`**:
```python
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

@pytest.fixture
def test_client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")

@pytest.fixture
def auth_headers():
    # Generate a test JWT or mock Supabase auth
    return {"Authorization": "Bearer test-token"}

@pytest.fixture
def sample_conversation():
    return {"id": "test-id", "mode": "draft", "title": "Test"}
```

**`backend/tests/test_chat.py`**:
```python
@pytest.mark.asyncio
async def test_streaming_endpoint_returns_sse(test_client, auth_headers):
    response = await test_client.post("/api/chat/stream", json={
        "mode": "draft",
        "message": "Write a test email"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]

@pytest.mark.asyncio
async def test_invalid_mode_returns_422(test_client, auth_headers):
    response = await test_client.post("/api/chat/stream", json={
        "mode": "invalid",
        "message": "test"
    }, headers=auth_headers)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_empty_message_returns_422(test_client, auth_headers):
    response = await test_client.post("/api/chat/stream", json={
        "mode": "draft",
        "message": ""
    }, headers=auth_headers)
    assert response.status_code == 422
```

**`backend/tests/test_auth.py`**:
```python
@pytest.mark.asyncio
async def test_missing_auth_returns_401(test_client):
    response = await test_client.post("/api/chat/stream", json={
        "mode": "draft",
        "message": "test"
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_health_without_auth(test_client):
    response = await test_client.get("/api/health")
    assert response.status_code == 200
```

**`backend/tests/test_templates.py`**:
```python
@pytest.mark.asyncio
async def test_list_templates_returns_12(test_client):
    response = await test_client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 12

@pytest.mark.asyncio
async def test_filter_templates_by_mode(test_client):
    draft = await test_client.get("/api/templates?mode=draft")
    assert len(draft.json()) == 4
```

**`backend/tests/test_ratelimit.py`**:
```python
@pytest.mark.asyncio
async def test_rate_limit_after_20_requests(test_client):
    for _ in range(20):
        resp = await test_client.get("/api/health")
        assert resp.status_code == 200
    resp = await test_client.get("/api/health")
    assert resp.status_code == 429
```

**`backend/tests/test_conversations.py`**:
```python
@pytest.mark.asyncio
async def test_list_conversations_returns_list(test_client, auth_headers):
    response = await test_client.get("/api/conversations", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### Run tests
```bash
cd backend && pip install pytest pytest-asyncio httpx && pytest tests/ -v
```

---

## Prompt 7: Final Polish

### Empty States
Add to `frontend/src/components/chat/EmptyState.tsx`:
```tsx
export function EmptyState({ mode }: { mode: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-primary mb-2">Start your first {mode}</h2>
      <p className="text-secondary max-w-md mb-8">
        Choose a template below or type your own message to get started.
      </p>
    </div>
  );
}
```

### Loading Skeleton
Add to `frontend/src/components/ui/Skeleton.tsx`:
```tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-shimmer rounded-lg bg-secondary ${className || ''}`} />
  );
}
```
Add the shimmer keyframes to `globals.css`:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  background: linear-gradient(90deg, #121212 25%, #1a1a1a 50%, #121212 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
```

### Reduced Motion
Add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Error State Component
```tsx
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20 text-error">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium hover:underline">
          Retry
        </button>
      )}
    </div>
  );
}
```

### Accessibility Audit — Fix all these in the frontend codebase
- [ ] Add `aria-label` to all icon-only buttons (send, copy, export, delete, settings)
- [ ] Add `role="status"` and `aria-live="polite"` to the streaming text area
- [ ] Add `aria-describedby` linking form inputs to their error messages
- [ ] Ensure `<main>`, `<nav>`, `<aside>` landmarks are correct
- [ ] Add `tabIndex` management for the chat input auto-focus
- [ ] Add `skip-to-content` link as first focusable element
- [ ] Ensure all color combinations meet 4.5:1 contrast ratio
- [ ] Test keyboard navigation: Tab through entire workspace

### Performance — Apply these
- [ ] Add `React.memo` to `MessageBubble`, `TemplateCard`, `ConversationItem`
- [ ] Lazy-load `History` and `Settings` pages with `React.lazy` + `Suspense`
- [ ] Tree-shake Lucide imports (import individual icons, not `lucide-react`)
- [ ] Verify bundle size < 200KB gzipped

---

## Final Verification

After completing ALL of the above, verify:

1. `docker build -t omnidraft:latest -f docker/Dockerfile .` succeeds
2. `docker compose up` runs frontend + backend locally
3. User can sign up → create conversation → send message → see streaming response
4. Templates load correctly per mode
5. File upload works in Summarize mode
6. Copy + Export work
7. Rate limiting blocks after 20 requests
8. `pytest backend/tests/ -v` passes all tests
9. App deploys successfully to AWS App Runner
10. Public HTTPS URL is fully functional

## Done

When all the above is complete, the entire OmniDraft application is production-ready and fully aligned with the Gen AI & Cloud Computing Final Project grading rubric.
