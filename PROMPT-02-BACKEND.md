# Prompt 2: Backend — OmniDraft (FastAPI)

## Vibe Profile
**Role**: Senior Backend Engineer + Security Architect
**Product**: FastAPI middleware that securely proxies NVIDIA LLM requests with SSE streaming, manages user auth, rate limiting, and database operations via Supabase.

## Product Brief
Build the FastAPI backend for OmniDraft — the secure middleware layer between the React frontend and NVIDIA API. Handles chat streaming (SSE), user authentication (Supabase JWT), rate limiting, file uploads, conversation CRUD, and export generation.

## Project Goals
- Secure API key management (keys NEVER in frontend code)
- SSE streaming from NVIDIA API to frontend (token-by-token)
- Rate limiting: 20 requests/minute per IP
- Supabase JWT verification middleware
- Conversation CRUD (save/load/delete)
- File upload for Summarize mode
- Export conversations as TXT/MD
- CORS configured via environment variable
- Pydantic models for all request/response schemas

## Tech Stack
- Python 3.11+
- FastAPI + Uvicorn
- httpx (async HTTP client for NVIDIA API)
- pydantic-settings (environment config)
- slowapi (rate limiting)
- supabase-py (database + auth client)
- python-multipart (file uploads)
- python-dotenv (local dev)

## Architecture
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI app, lifespan, CORS, rate limiter
│   ├── config.py          # Settings via pydantic-settings
│   ├── database.py        # Supabase client
│   ├── models/
│   │   ├── __init__.py
│   │   ├── chat.py        # ChatRequest, ChatResponse
│   │   ├── conversation.py # ConversationCreate, ConversationResponse
│   │   └── export.py      # ExportRequest
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py        # Supabase auth helpers
│   │   ├── chat.py        # POST /api/chat/stream (SSE endpoint)
│   │   ├── conversations.py # CRUD conversations + messages
│   │   ├── templates.py   # GET /api/templates
│   │   ├── upload.py      # POST /api/upload
│   │   └── export.py      # GET /api/export/{id}
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm.py         # NVIDIA API client + SSE streaming
│   │   ├── supabase.py    # Database query helpers
│   │   └── ratelimit.py   # Rate limiter setup
│   └── middleware/
│       ├── __init__.py
│       └── auth.py        # JWT verification middleware
├── requirements.txt
├── .env.example
└── runtime.txt            # For AWS App Runner Python version
```

## Constraints
- All secrets via environment variables (never hardcoded)
- CORS: allow only ALLOWED_ORIGINS env var (not wildcard in production)
- Rate limit: 20 requests/minute per IP (HTTP 429 when exceeded)
- File upload max size: 10MB
- Max tokens per response: 4096
- Input sanitization: separate system prompts from user input
- Logging: structured JSON logs (stdout)

## API Endpoints

### Chat
```python
POST /api/chat/stream
Headers: Authorization: Bearer <supabase_jwt>
Body: {
  "conversation_id": "uuid | null",
  "mode": "draft | summarize | creative",
  "message": "string",
  "file_content": "string | null"  // extracted text from uploaded file
}
Response: Server-Sent Events stream (text/event-stream)
  data: {"token": "The"}
  data: {"token": " generated"}
  data: {"token": " text"}
  data: {"done": true}
```

### Conversations
```python
GET    /api/conversations          # List user's conversations (sorted by updated_at desc)
GET    /api/conversations/{id}     # Get conversation with all messages
DELETE /api/conversations/{id}     # Delete conversation + messages
```

### Templates
```python
GET    /api/templates              # List all templates
GET    /api/templates?mode=draft   # Filter by mode
```

### Upload
```python
POST   /api/upload                 # Upload file, return extracted text
```

### Export
```python
GET    /api/export/{id}?format=txt # Export as TXT
GET    /api/export/{id}?format=md  # Export as Markdown
GET    /api/export/{id}?format=pdf # Bonus: export as PDF
```

## Environment Variables (.env)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=service_role_key_here
NVIDIA_API_KEY=nvapi-xxxxxxxxxxxxxxxxxxxxxxxx
NVIDIA_MODEL=z-ai/glm-5.2
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.awsapprunner.com
RATE_LIMIT=20/minute
MAX_TOKENS=4096
LOG_LEVEL=INFO
```

## NVIDIA API Integration (Streaming)
```python
# app/services/llm.py
# Uses httpx.AsyncClient with client.stream("POST", ...)
# Yields chunks as SSE events
# Handles: connection errors, timeout (30s), partial chunks
# System prompts per mode:
#   draft: "You are a professional writing assistant..."
#   summarize: "You are a document summarization expert..."
#   creative: "You are a creative writing partner..."
```

## CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Rate Limiting (slowapi)
```python
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

@router.post("/chat/stream")
@limiter.limit(settings.RATE_LIMIT)
async def chat_stream(request: Request, body: ChatRequest):
    ...
```

## Auth Middleware
```python
# Verify Supabase JWT from Authorization header
# On failure: 401 Unauthorized
# On success: attach user_id to request.state.user_id
# Skip for GET /api/templates (public)
```

## Database Queries (via supabase-py)
```python
# app/services/supabase.py
# Functions:
#   create_conversation(user_id, mode, title) → conversation
#   get_conversations(user_id) → list
#   get_conversation(conversation_id) → conversation + messages
#   delete_conversation(conversation_id)
#   save_message(conversation_id, role, content) → message
#   get_templates(mode=None) → list
```

## Error Handling
```python
# All routers use try/except with structured error responses:
# { "detail": "Human-readable message", "code": "ERROR_CODE" }
# Known errors: rate_limit, auth_failed, llm_error, not_found, validation_error
```

## Logging
```python
# JSON-formatted logs to stdout
# Include: request_id, user_id, mode, response_time_ms, tokens_used
# Log level set by LOG_LEVEL env var
```

## Run Command
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

INSTRUCTIONS:
Build the complete FastAPI backend. Implement every router, service, model, and middleware file listed above. Use `pydantic-settings` for configuration with `.env` file loading. Implement proper SSE streaming from the NVIDIA API. The streaming endpoint must yield tokens as they arrive — do NOT buffer the full response. All endpoints must validate input, handle errors gracefully, and return proper HTTP status codes. Include comprehensive docstrings on all public functions.
