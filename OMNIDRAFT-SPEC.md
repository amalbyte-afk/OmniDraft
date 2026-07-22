# OmniDraft — Complete Project Specification

---

## 1. Product Vision

**OmniDraft** is a unified AI content workspace that eliminates tool-juggling by allowing users to instantly switch between fast professional drafting, actionable document summarization, and creative writing within a single, high-performance interface.

**Tagline**: *From rough idea to polished draft — one workspace.*

---

## 2. Core Features (v1)

| Feature | Description | Priority |
|---------|-------------|----------|
| **3-Mode Wheel** | Draft / Summarize / Creative selector on hero + workspace | Must |
| **Pre-built Templates** | One-click prompts per mode (email, blog, summary, story, etc.) | Must |
| **Chat Interface** | Messenger-style bubbles, user input → AI streaming response | Must |
| **File Upload** | Paste or upload text/PDF for Summarize mode | Must |
| **SSE Streaming** | Token-by-token real-time response rendering | Must |
| **Copy-to-Clipboard** | One-click copy on generated content | Must |
| **Export** | Download as TXT or Markdown | Must |
| **Dark Mode Only** | OLED-optimized dark theme (#000000 / #121212) | Must |
| **Rate Limiting** | 20 req/min per IP (FastAPI + slowapi) | Must |
| **User Accounts** | Supabase Auth (magic link or email) | Must |
| **Conversation History** | Saved sessions per user, persisted in PostgreSQL | Must |
| **Prompt Template DB** | Pre-built prompts stored in DB, manageable | Nice |
| **Admin Dashboard** | Basic usage analytics | Bonus |

---

## 3. User Flow

```
Landing Page (/)
  ├── Hero section: OmniDraft branding + value prop
  ├── 3-Mode Wheel (Draft | Summarize | Creative)
  └── CTA: "Get Started" → sign up / sign in
           │
           ▼
Sign In (/auth)
  └── Supabase Auth (email magic link or Google OAuth)
           │
           ▼
Workspace (/workspace)
  ├── Mode tabs at top (Draft / Summarize / Creative)
  ├── Sidebar: conversation history list
  ├── Chat area: message bubbles (user + AI)
  │     ├── Template picker (pre-built prompts per mode)
  │     ├── File upload (Summarize mode only)
  │     ├── Input box + send button
  │     └── Streaming AI response in real-time
  └── Action bar: Copy / Export / New Chat
           │
           ▼
History (/history)
  └── List of all saved conversations per user
           │
           ▼
Settings (/settings)
  └── Account info, export data, sign out
```

---

## 4. Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React + Vite)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ Landing  │  │ Workspace│  │ History  │  │ Settings       │ │
│  │ Page     │  │ (Chat    │  │ Page     │  │ Page           │ │
│  │ + Wheel  │  │  UI)     │  │          │  │                │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘ │
│                        │                                        │
│              HTTPS (fetch / EventSource)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    FastAPI Backend (Uvicorn)                      │
│                                                                   │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Auth       │  │ Chat/Content │  │ SSE Streaming            │  │
│  │ Middleware │  │ Endpoints    │  │ Endpoint                 │  │
│  └────────────┘  └──────────────┘  └─────────────────────────┘  │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Rate       │  │ File Upload  │  │ Template Management     │  │
│  │ Limiter    │  │ Handler      │  │ Endpoints               │  │
│  └────────────┘  └──────────────┘  └─────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  Supabase Client (PostgreSQL + Auth)                       │   │
│  └───────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
┌────────────────────┐  ┌──────────────────────┐
│  Supabase          │  │  NVIDIA API           │
│  ┌──────────────┐  │  │  (Nemotron Model)     │
│  │ PostgreSQL   │  │  │  SSE Streaming        │
│  │ (Conversations│  │  │  (httpx async)        │
│  │  Users,       │  │  └──────────────────────┘
│  │  Templates)   │  │
│  └──────────────┘  │
│  ┌──────────────┐  │
│  │ Supabase Auth │  │
│  └──────────────┘  │
└────────────────────┘
```

---

## 5. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 + Vite + Tailwind CSS v3 | Grading: modern framework, fast DX |
| **UI Animations** | Framer Motion | For streaming text, wheel animation, page transitions |
| **Backend** | Python FastAPI + Uvicorn | Course requirement |
| **LLM** | NVIDIA API (Nemotron) via httpx | Free tier, SSE support |
| **Streaming** | Server-Sent Events (SSE) | Course requirement |
| **Auth** | Supabase Auth (magic link) | Course-recommended hybrid approach |
| **Database** | Supabase PostgreSQL | Course-recommended |
| **File Storage** | Supabase Storage (S3-compatible) | Course-recommended |
| **Rate Limiting** | slowapi (FastAPI) | Grading bonus |
| **Container** | Docker + Docker Compose | Course requirement |
| **Deployment** | AWS App Runner | Course requirement |
| **CORS** | FastAPI CORSMiddleware with env var origins | Best practice |

---

## 6. Database Schema (PostgreSQL via Supabase)

### Table: `users`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, from Supabase Auth |
| `email` | TEXT | Unique |
| `created_at` | TIMESTAMPTZ | Default now() |
| `total_tokens_used` | INT | Default 0 |

### Table: `conversations`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users.id |
| `mode` | TEXT | 'draft' | 'summarize' | 'creative' |
| `title` | TEXT | Auto-generated from first message |
| `created_at` | TIMESTAMPTZ | Default now() |
| `updated_at` | TIMESTAMPTZ | Default now() |

### Table: `messages`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `conversation_id` | UUID | FK → conversations.id |
| `role` | TEXT | 'user' | 'assistant' |
| `content` | TEXT | Message body |
| `tokens_used` | INT | Optional tracking |
| `created_at` | TIMESTAMPTZ | Default now() |

### Table: `templates`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `mode` | TEXT | 'draft' | 'summarize' | 'creative' |
| `title` | TEXT | "Write a professional email" |
| `prompt_template` | TEXT | The system prompt to send |
| `icon` | TEXT | Icon name reference |
| `sort_order` | INT | Display order |

---

## 7. API Structure

### Auth (via Supabase)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Sign up with email |
| POST | `/auth/login` | Send magic link |
| GET | `/auth/callback` | Handle auth redirect |

### Content
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat` | Send message, get streaming response (SSE) |
| POST | `/api/chat/stream` | SSE streaming endpoint (course requirement) |

### Conversations
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/conversations` | List user's conversations |
| GET | `/api/conversations/{id}` | Get conversation with messages |
| DELETE | `/api/conversations/{id}` | Delete a conversation |

### Templates
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/templates` | List all templates |
| GET | `/api/templates?mode=draft` | Filter by mode |

### Files
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/upload` | Upload file for Summarize mode |

### Export
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/export/{conversation_id}?format=txt` | Export as TXT |
| GET | `/api/export/{conversation_id}?format=md` | Export as Markdown |

---

## 8. UI Component List

| Component | Description |
|-----------|-------------|
| `HeroSection` | Landing hero with tagline + CTA |
| `ModeWheel` | 3-mode interactive selector (Draft / Summarize / Creative) |
| `ChatContainer` | Main chat layout (sidebar + messages + input) |
| `MessageBubble` | Individual message (user or AI) with streaming text |
| `StreamingText` | Token-by-token text reveal with cursor animation |
| `Sidebar` | Conversation history list |
| `ConversationItem` | Single entry in sidebar |
| `InputBar` | Text input + send button + file upload trigger |
| `TemplatePicker` | Grid of prompt template cards per mode |
| `TemplateCard` | Single template with icon + title |
| `FileUploadZone` | Drag-and-drop file upload area |
| `ActionBar` | Copy / Export / New Chat buttons |
| `CopyButton` | Click-to-copy with tooltip feedback |
| `ExportDropdown` | Format selector (TXT / MD) |
| `EmptyState` | Welcome screen when no conversations exist |
| `LoadingSkeleton` | Shimmer skeleton for loading states |
| `Toast` | Success/error notifications |
| `Navbar` | Top nav with logo + user menu |
| `UserMenu` | Avatar + dropdown (settings, sign out) |
| `Footer` | Simple footer with branding |

---

## 9. Design System (Tokens)

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#000000` | Main background |
| `--bg-secondary` | `#121212` | Cards, sidebars |
| `--bg-glass` | `rgba(18, 18, 18, 0.7)` | Glassmorphic overlays |
| `--glass-border` | `rgba(255, 255, 255, 0.08)` | Glass card borders |
| `--glass-blur` | `20px` | Backdrop blur |
| `--primary` | `#7C3AED` | AI purple — buttons, links, accents |
| `--primary-hover` | `#6D28D9` | Hover state |
| `--accent` | `#0891B2` | Cyan — secondary highlights, mode indicators |
| `--text-primary` | `#FFFFFF` | Primary text |
| `--text-secondary` | `#A1A1AA` | Secondary/muted text |
| `--border` | `#27272A` | Subtle borders |
| `--success` | `#22C55E` | Success states |
| `--error` | `#EF4444` | Error states |
| `--warning` | `#F59E0B` | Warning states |

### Typography
| Element | Family | Weight | Size |
|---------|--------|--------|------|
| Headings | Inter | 700 | `clamp(2rem, 5vw, 3.5rem)` |
| Body | Inter | 400 | `16px` |
| Small/Meta | Inter | 400 | `14px` |
| Mono (code) | JetBrains Mono | 400 | `14px` |

### Spacing Scale
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96` (px)

### Border Radius
| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--radius-full` | `9999px` |

### Glassmorphic Card
```css
.glass-card {
  background: rgba(18, 18, 18, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
```

### Animations
| Element | Duration | Easing |
|---------|----------|--------|
| Hover (cards, buttons) | 200ms | ease-out |
| Page transitions | 300ms | ease-in-out |
| Streaming text cursor | 800ms | linear (blink) |
| Mode wheel spin | 400ms | spring (bouncy) |
| Skeleton shimmer | 1.4s | sine-in-out loop |

---

## 10. Folder Structure

```
omnidraft/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # button, input, card, toast, skeleton
│   │   │   ├── layout/       # navbar, sidebar, footer
│   │   │   ├── chat/         # message bubble, streaming text, input bar
│   │   │   ├── wheel/        # mode wheel component
│   │   │   ├── templates/    # template picker + cards
│   │   │   └── export/       # copy button, export dropdown
│   │   ├── pages/
│   │   │   ├── Home.tsx       # Hero + Mode Wheel
│   │   │   ├── Workspace.tsx  # Chat interface
│   │   │   ├── History.tsx    # Saved conversations
│   │   │   └── Settings.tsx   # Account settings
│   │   ├── hooks/            # useStreamingChat, useSupabase, etc.
│   │   ├── lib/              # supabase client, api client
│   │   ├── store/            # Zustand state (conversation, mode)
│   │   ├── styles/           # global CSS, tailwind config
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, lifespan
│   │   ├── config.py          # Settings (pydantic-settings)
│   │   ├── database.py        # Supabase client
│   │   ├── models/            # Pydantic request/response models
│   │   │   ├── chat.py
│   │   │   ├── auth.py
│   │   │   ├── conversation.py
│   │   │   └── export.py
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── chat.py        # POST /api/chat/stream (SSE)
│   │   │   ├── conversations.py
│   │   │   ├── templates.py
│   │   │   ├── upload.py
│   │   │   └── export.py
│   │   ├── services/
│   │   │   ├── llm.py          # NVIDIA API client + streaming
│   │   │   ├── supabase.py     # Database queries
│   │   │   └── ratelimit.py    # Rate limiter setup
│   │   └── middleware/
│   │       └── auth.py         # Supabase JWT verification
│   ├── requirements.txt
│   └── .env.example
│
├── docker/
│   ├── Dockerfile              # Multi-stage production build
│   ├── Dockerfile.backend.dev
│   ├── Dockerfile.frontend.dev
│   ├── entrypoint.sh           # HTTPS auto-provisioning
│   └── nginx.conf              # Reverse proxy (prod)
│
├── docker-compose.dev.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 11. Deployment Strategy (AWS Elastic Beanstalk)

### Pipeline
```
Docker Build → Amazon ECR
           → Elastic Beanstalk (single-instance t3.micro)
           → Nginx (HTTP) + Certbot → Let's Encrypt HTTPS
           → DuckDNS: omni-draft.duckdns.org
```

### Environment Variables (in EB Environment Properties)
| Variable | Source |
|----------|--------|
| `SUPABASE_URL` | Supabase project settings |
| `SUPABASE_SERVICE_KEY` | Supabase (secret) |
| `NVIDIA_API_KEY` | NVIDIA API (secret) |
| `ALLOWED_ORIGINS` | `http://localhost:5173,https://omni-draft.duckdns.org` |
| `DUCK_TOKEN` | DuckDNS API token |
| `RATE_LIMIT` | `20/minute` |

### Production Architecture
```
User → HTTPS → DuckDNS
                ↓ (A record → EC2 IP)
                Docker Container
                ├── Nginx (SSL termination, reverse proxy)
                │   ├── Port 8080 (301 → HTTPS)
                │   └── Port 443 (HTTPS)
                │       ├── /api/* → FastAPI (port 8000)
                │       └── /* → Static files (React build)
                ├── FastAPI → Supabase PostgreSQL
                └── FastAPI → NVIDIA API (external)
```

---

## 12. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| NVIDIA API rate limits | Medium | Retry with backoff, queue mechanism |
| AWS billing overrun | High | Set Budget alerts ($5-$10), pause App Runner when unused |
| SSE connection drops | Medium | Auto-reconnect on frontend, show connection status |
| Large file uploads | Low | Limit to 10MB, chunked processing |
| Prompt injection | High | Server-side system/user prompt separation |
| Token costs (LLM) | Low | Uses free NVIDIA tier; set max_tokens limits |
| Database connection leaks | Medium | Connection pooling via Supabase |

---

## 13. Suggested Improvements (Post-v1)

- **RAG mode**: Upload documents → embed → query with context (pgvector on Supabase)
- **Voice input**: Web Speech API → draft by speaking
- **Team workspaces**: Shared conversations + templates
- **Custom templates**: User-created prompt templates
- **AI agent mode**: Multi-step reasoning (plan → draft → refine)
- **Light mode** (user requested dark-only, but good for accessibility)

---

## 14. Alignment with Grading Rubric

| Criteria | Weight | How OmniDraft Covers It |
|----------|--------|------------------------|
| Technical Implementation & Vibe Coding | 25% | Full-stack React + FastAPI, all features functional |
| Prompt Engineering Quality & Documentation | 20% | 3 modes with tailored system prompts + template library |
| Cloud Deployment & AWS Architecture | 20% | Docker → App Runner, Supabase DB, env vars, HTTPS |
| Application Design & User Experience | 20% | Glassmorphism + Swiss Minimalism, dark mode, streaming UI |
| Report Quality, Reflection & Clarity | 15% | Comprehensive documentation |

---

**APPROVED** — Ready for implementation prompts?

If yes, I'll generate 7 copy-paste-ready prompts in sequence:
1. Frontend (React + Vite + Tailwind)
2. Backend (FastAPI + SSE + NVIDIA)
3. Database & Persistence (Supabase)
4. Docker (Dockerfile + Compose)
5. AWS Deployment (App Runner)
6. Testing & QA
7. Final Polish & Grading Checklist
