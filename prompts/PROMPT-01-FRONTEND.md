# Prompt 1: Frontend — OmniDraft

## Vibe Profile
**Role**: Senior Frontend Engineer + UI/UX Creative Director
**Vibe**: Glassmorphism meets Swiss minimalism in OLED dark mode. Premium, clean, content-first. Apple-level polish with AI-native interactions.
**Constraints**: Dark mode only. No light mode. Mobile-responsive. Keyboard-accessible.

## Product Brief
Build the OmniDraft React frontend — a unified AI content workspace with 3 modes (Draft, Summarize, Creative). Users sign in, pick a mode, and chat with an AI that streams responses token-by-token.

## Project Goals
- Hero landing page with an interactive 3-mode wheel
- Chat workspace with real-time SSE streaming (token-by-token rendering)
- Conversation history sidebar
- Template picker per mode
- File upload for Summarize mode
- Copy-to-clipboard + Export (TXT/MD)
- User auth flow (Supabase magic link)
- Dark mode only, glassmorphism aesthetic

## Tech Stack
- React 18 + TypeScript (strict mode)
- Vite 5
- Tailwind CSS v3
- Framer Motion (animations)
- Zustand (state management)
- Supabase JS Client (auth + database)
- React Router v6 (multi-page)
- Lucide React (icons)

## Architecture
```
/src
├── components/
│   ├── ui/           # Button, Input, Card, Toast, Skeleton
│   ├── layout/       # Navbar, Sidebar, Footer
│   ├── chat/         # MessageBubble, StreamingText, InputBar
│   ├── wheel/        # ModeWheel
│   ├── templates/    # TemplatePicker, TemplateCard
│   └── export/       # CopyButton, ExportDropdown
├── pages/
│   ├── Home.tsx       # Hero + Mode Wheel
│   ├── Workspace.tsx  # Chat interface
│   ├── History.tsx    # Saved conversations
│   └── Settings.tsx   # Account
├── hooks/
│   ├── useStreamingChat.ts
│   ├── useConversations.ts
│   └── useAuth.ts
├── lib/
│   ├── supabase.ts
│   └── api.ts
├── store/
│   └── index.ts       # Zustand store
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
└── App.tsx
```

## Constraints
- No light mode (dark mode only)
- Mobile-first responsive (375px → 1440px)
- WCAG AA contrast minimum (4.5:1)
- All API keys in backend only (frontend never sees NVIDIA key)
- SSE via EventSource or fetch ReadableStream

## UI Direction
- **Background**: `#000000` (deep OLED black)
- **Cards**: Glassmorphic (`rgba(18,18,18,0.7)` + `backdrop-filter: blur(20px)` + `border: 1px solid rgba(255,255,255,0.08)`)
- **Primary**: `#7C3AED` (AI purple)
- **Accent**: `#0891B2` (cyan — mode indicators)
- **Text**: `#FFFFFF` primary, `#A1A1AA` secondary
- **Font**: Inter (headings + body), JetBrains Mono (code/tokens)
- **Radius**: `8px` (sm), `12px` (md), `16px` (lg), `24px` (xl)
- **Spacing**: 4/8/12/16/24/32/48/64/96

## Design Tokens
```css
--bg-primary: #000000;
--bg-secondary: #121212;
--bg-glass: rgba(18, 18, 18, 0.7);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-blur: 20px;
--primary: #7C3AED;
--primary-hover: #6D28D9;
--accent: #0891B2;
--text-primary: #FFFFFF;
--text-secondary: #A1A1AA;
--border: #27272A;
--success: #22C55E;
--error: #EF4444;
--warning: #F59E0B;
```

## Coding Standards
- TypeScript strict mode — no `any` unless absolutely necessary
- Functional components with hooks (no class components)
- Framer Motion `motion.div` for animated elements
- Tailwind CSS with custom config extending the design tokens
- Zustand store: one store with slices (mode, conversation, ui)
- All API calls through `lib/api.ts` wrapper
- Error boundaries around each page
- Accessibility: `aria-label`, `role`, keyboard navigation, focus-visible rings

## Performance Goals
- Lighthouse score > 90 (Performance, Accessibility, Best Practices)
- First Contentful Paint < 1.5s
- Bundle size < 200KB (gzipped)
- Streaming text updates at < 50ms latency per token
- Optimized for mobile 375px + desktop 1440px

## Files to Create

### Configuration
- `package.json`
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.json`
- `index.html`
- `.env.example`

### Core (1/2)
- `src/main.tsx`
- `src/App.tsx`
- `src/styles/globals.css`
- `src/types/index.ts`
- `src/lib/supabase.ts`
- `src/lib/api.ts`
- `src/store/index.ts`

### UI Components
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/Toast.tsx`

### Layout
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/Footer.tsx`

### Chat Components
- `src/components/chat/MessageBubble.tsx`
- `src/components/chat/StreamingText.tsx`
- `src/components/chat/InputBar.tsx`

### Wheel
- `src/components/wheel/ModeWheel.tsx`

### Templates
- `src/components/templates/TemplatePicker.tsx`
- `src/components/templates/TemplateCard.tsx`

### Export
- `src/components/export/CopyButton.tsx`
- `src/components/export/ExportDropdown.tsx`

### File Upload
- `src/components/chat/FileUploadZone.tsx`

### Pages
- `src/pages/Home.tsx`
- `src/pages/Workspace.tsx`
- `src/pages/History.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Auth.tsx`

### Hooks
- `src/hooks/useStreamingChat.ts`
- `src/hooks/useConversations.ts`
- `src/hooks/useAuth.ts`

## Build Command
```bash
npm install && npm run dev
```

---

INSTRUCTIONS:
Build each file listed above. Follow the design tokens exactly. Use Tailwind CSS for all styling — no separate CSS files except `globals.css` for base resets and custom font imports. Implement the full app with all pages, routing, state management, and animations. Make the ModeWheel interactive with Framer Motion spring animations. Ensure the chat streaming renders tokens progressively. The app must look production-quality on both desktop and mobile.
