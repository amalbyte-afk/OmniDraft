# Prompt 6: Testing & QA — OmniDraft

## Vibe Profile
**Role**: QA Engineer + Security Reviewer
**Product**: Comprehensive test suite and security review for OmniDraft before production deployment.

## Product Brief
Write unit tests, integration tests, and perform a security audit for the OmniDraft backend. Cover all API endpoints, SSE streaming, rate limiting, auth, database operations, and error handling.

## Project Goals
- Backend unit tests (pytest) for all routers + services
- SSE streaming test (mock NVIDIA API)
- Rate limiter test
- Auth middleware test
- Security review checklist
- Performance benchmarks

## Tech Stack
- pytest (test runner)
- httpx (async test client)
- pytest-asyncio (async tests)
- pytest-cov (coverage report)
- unittest.mock (mocking external APIs)

## Test Structure
```
backend/tests/
├── __init__.py
├── conftest.py              # Fixtures: test client, mock DB, mock NVIDIA
├── test_chat.py             # SSE streaming endpoint tests
├── test_auth.py             # Auth middleware tests
├── test_conversations.py    # CRUD tests
├── test_templates.py        # Template endpoint tests
├── test_upload.py           # File upload tests
├── test_export.py           # Export format tests
├── test_ratelimit.py        # Rate limiter tests
└── test_security.py         # Security-focused tests
```

## conftest.py Fixtures
```python
# test_client: FastAPI test client with TestClient
# mock_nvidia: Mock httpx.AsyncClient for NVIDIA API calls
# auth_headers: Generate valid test Supabase JWT
# sample_user: Create test user in mock DB
# sample_conversation: Create test conversation
```

## Test Cases

### test_chat.py
```python
# Test: streaming endpoint returns SSE events
# Test: streaming renders tokens progressively
# Test: chat with valid conversation_id appends to existing conversation
# Test: chat without conversation_id creates new conversation
# Test: invalid mode returns 422
# Test: empty message returns 422
# Test: message too long (>10000 chars) returns 422
# Test: NVIDIA API error returns 502 with helpful message
# Test: timeout returns 504
```

### test_auth.py
```python
# Test: missing Authorization header returns 401
# Test: invalid JWT returns 401
# Test: expired JWT returns 401
# Test: valid JWT allows access
# Test: public endpoints (templates, health) work without auth
```

### test_conversations.py
```python
# Test: list conversations returns user's conversations only
# Test: get conversation returns all messages
# Test: delete conversation removes messages too
# Test: cannot access another user's conversation (returns 404)
# Test: pagination works (limit/offset)
```

### test_templates.py
```python
# Test: list all templates returns 12
# Test: filter by mode returns only that mode's templates
# Test: inactive templates are excluded
```

### test_upload.py
```python
# Test: valid .txt file upload returns extracted text
# Test: valid .pdf file upload returns extracted text
# Test: file > 10MB returns 413
# Test: invalid file type returns 422
# Test: empty file returns 422
```

### test_export.py
```python
# Test: export as TXT returns correct format
# Test: export as MD returns correct format
# Test: export nonexistent conversation returns 404
```

### test_ratelimit.py
```python
# Test: 20 requests within 1 minute succeed
# Test: 21st request within 1 minute returns 429
# Test: rate limit resets after 1 minute
# Test: different IPs have independent rate limits
```

### test_security.py
```python
# Test: prompt injection attempt in message body
# Test: XSS in message content
# Test: SQL injection attempts (via supabase-py, which parameterizes)
# Test: CORS headers match ALLOWED_ORIGINS
# Test: response headers (X-Frame-Options, X-Content-Type-Options)
# Test: no sensitive data in error responses
```

## Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx pytest-cov

# Run all tests
pytest backend/tests/ -v --cov=app --cov-report=term-missing

# Run specific test file
pytest backend/tests/test_chat.py -v

# Run with coverage report
pytest backend/tests/ -v --cov=app --cov-report=html
```

## Coverage Target
- Minimum 85% code coverage
- 100% coverage on: auth middleware, rate limiter, chat router
- Edge cases covered for every endpoint

## Frontend Smoke Tests (Manual)
```
[ ] App loads on Chrome, Firefox, Safari (latest versions)
[ ] App loads on mobile (iPhone Safari, Android Chrome)
[ ] Sign up with email works (check Supabase for new user)
[ ] Magic link email received and login successful
[ ] Mode wheel spins and selects each mode
[ ] Template picker shows correct templates per mode
[ ] Send message → streaming response appears token-by-token
[ ] New conversation created in sidebar
[ ] Clicking old conversation loads history
[ ] Copy button copies content to clipboard
[ ] Export downloads correct format
[ ] File upload: .txt file extracts and sends content
[ ] File upload: .pdf file extracts and sends content
[ ] Delete conversation removes from list
[ ] Rate limit: 20 messages → 429 on 21st
[ ] Sign out clears session
[ ] Browser console: 0 errors, 0 warnings
```

## Security Review Checklist
- [ ] No API keys in frontend code or browser inspectable sources
- [ ] All secrets via environment variables (injected at runtime)
- [ ] CORS restricted to specific origins (no wildcard in production)
- [ ] Rate limiting applied to all LLM endpoints
- [ ] Input sanitization on user messages (system/user prompt separation)
- [ ] HTTPS enforced (automatic with App Runner)
- [ ] Supabase RLS policies tested (user isolation)
- [ ] File upload size and type restrictions enforced
- [ ] No SQL injection vectors (ORMs handle parameterization)
- [ ] XSS prevention (content-type headers, CSP recommended)
- [ ] Password not stored (Supabase Auth handles this)
- [ ] Session expiry handled (Supabase session management)

## Performance Benchmarks
```python
# Target metrics:
# SSE first token latency: < 500ms (from request to first token in UI)
# SSE token throughput: > 50 tokens/second
# Conversation list response: < 200ms
# File upload + text extraction (10KB): < 1s
# Concurrent users (2 simultaneous streams): no degradation
```

---

INSTRUCTIONS:
Create the complete test suite with all test files and test cases listed above. Use pytest fixtures for clean test isolation. Mock the NVIDIA API calls to avoid real API costs during testing. Include a GitHub Actions CI workflow file that runs tests on every push.
