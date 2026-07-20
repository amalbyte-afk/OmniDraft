# Prompt 7: Final Polish & Production Readiness — OmniDraft

## Vibe Profile
**Role**: Creative Director + Technical Reviewer + Production Engineer
**Product**: Final polish pass — UI refinements, animation tuning, accessibility audit, performance optimization, and grading checklist sign-off.

## Product Brief
One final pass across the entire OmniDraft application to ensure it's production-ready, visually stunning, accessible, and fully aligned with the Gen AI & Cloud Computing grading rubric.

## Project Goals
- UI animation refinements (Framer Motion)
- Accessibility audit (WCAG AA compliance)
- Performance optimization
- Empty states + loading states + error states polish
- Final grading checklist verification
- Documentation for the project report (prompts used, architecture decisions, challenges)

## Polish Areas

### 1. UI Animation Refinements
```typescript
// Mode Wheel: Spring animation on mode select
// Duration: 400ms, Stiffness: 200, Damping: 20
<motion.div
  animate={{ rotate: selectedMode * 120 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
/>

// Streaming Text: Blinking cursor
// Opacity pulse 800ms loop
<motion.span
  animate={{ opacity: [1, 0, 1] }}
  transition={{ duration: 0.8, repeat: Infinity }}
/>

// Message Bubble: Slide-in on new message
// y: 20 → 0, opacity: 0 → 1, duration: 300ms
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>

// Page transitions: Fade
// duration: 200ms
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
/>

// Skeleton shimmer: Background position sweep
// duration: 1.4s loop
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

// Copy button feedback: brief scale (1→1.1→1) + tooltip "Copied!"
// duration: 200ms

// Hover effects on template cards
// translateY: -4px, scale: 1.02, boxShadow increase
// duration: 200ms, ease: easeOut
```

### 2. Empty States
```typescript
// No conversations yet
// Display: centered illustration + heading + subtext + CTA
// Icon: Sparkles (Lucide)
// Heading: "Start your first draft"
// Subtext: "Choose a mode and begin writing with AI assistance"
// CTA: "Try Draft Mode" → navigates to /workspace with draft selected

// No messages in conversation
// Display: gentle prompt suggestions
// "Choose a template below or type your own message to get started"

// No search results (future)
// "No conversations match your search. Try different keywords."
```

### 3. Loading States
```typescript
// Initial page load: Full-page skeleton with navbar + sidebar skeleton
// Sidebar loading: 3 skeleton items with shimmer animation
// Message sending: Bubble with animated dots (...)
// File upload: Progress bar (percentage + filename)
// Export: Loading spinner on button while generating
```

### 4. Error States
```typescript
// Network error: Toast "Connection lost. Check your internet connection."
// Rate limited: Toast "Too many requests. Please wait a moment."
// Auth expired: Redirect to sign-in with message "Session expired. Please sign in again."
// LLM error: Error bubble in chat "Sorry, I couldn't generate a response. Please try again."
// File too large: Toast "File exceeds 10MB limit. Please choose a smaller file."
// Upload failed: Toast "Upload failed. Please try again."
// 404 page: Custom OmniDraft 404 with link back to home
```

### 5. Accessibility Audit (WCAG AA)
```
Checklist:
[ ] All images have alt text (or aria-label for icons)
[ ] All form fields have associated labels
[ ] Color contrast: body text 4.5:1 minimum, large text 3:1 minimum
[ ] Focus states visible on all interactive elements (3px ring, primary color)
[ ] Keyboard navigation: Tab through all controls, Enter to activate
[ ] Skip-to-content link at top of page
[ ] ARIA landmarks: main, nav, aside for sidebar
[ ] Reduced motion: @media (prefers-reduced-motion) disables animations
[ ] Screen reader: message content readable, streaming updates announced
[ ] Touch targets: minimum 44x44px for all interactive elements
[ ] Error messages associated with form fields via aria-describedby
[ ] Loading states announced via aria-live="polite"
```

### 6. Performance Optimization
```typescript
// React optimizations:
// - React.memo on MessageBubble, TemplateCard, ConversationItem
// - useCallback for event handlers in chat input
// - useMemo for filtered/sorted conversation lists
// - Lazy load History and Settings pages (React.lazy + Suspense)

// Bundle optimization:
// - Tree-shake Lucide icons (import individual icons, not the whole library)
// - Code-split by route: Home, Workspace, History, Settings
// - Compress all SVG assets

// Image optimization:
// - Serve all images as WebP with AVIF fallback
// - Lazy load below-fold images
// - Preload critical hero image (rel="preload")

// Runtime:
// - Debounce file text extraction (300ms)
// - Throttle scroll events in sidebar (100ms)
// - Virtualize conversation list if > 50 items (react-window)
```

### 7. Reduced Motion Support
```typescript
// In tailwind.config.js or globals.css:
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// Framer Motion: respect prefers-reduced-motion
import { useReducedMotion } from "framer-motion";
const prefersReducedMotion = useReducedMotion();
const transition = prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 200 };
```

### 8. Final Grading Checklist

#### Technical Implementation (25%)
- [ ] React + Vite frontend with all pages functional
- [ ] FastAPI backend with all endpoints working
- [ ] LLM integration (NVIDIA Nemotron) returning live responses
- [ ] SSE streaming — tokens render progressively in UI
- [ ] Dockerfile builds and runs successfully
- [ ] Deployed to AWS App Runner with public HTTPS URL
- [ ] Environment variables used for all secrets (no hardcoded keys)
- [ ] Rate limiting implemented (slowapi)
- [ ] File upload functionality works

#### Prompt Engineering & Documentation (20%)
- [ ] System prompts documented per mode (Draft/Summarize/Creative)
- [ ] RGC framework prompts used during development
- [ ] Vibe profiles defined for each component
- [ ] Sample prompts provided in project report
- [ ] Prompt chaining strategy documented

#### Cloud Deployment & AWS Architecture (20%)
- [ ] AWS App Runner live URL submitted
- [ ] Docker container deployed
- [ ] Environment variables configured in App Runner
- [ ] CORS configured for production URL
- [ ] AWS Budget alerts configured ($5)
- [ ] HTTPS working automatically
- [ ] Production architecture diagram documented

#### Application Design & User Experience (20%)
- [ ] Glassmorphism + Swiss minimalism design system consistent
- [ ] Dark mode only, OLED-optimized (#000000 background)
- [ ] Mode wheel interactive with animation
- [ ] Chat bubbles with streaming text cursor
- [ ] Mobile-responsive (375px tested)
- [ ] Loading skeletons for all async operations
- [ ] Empty states for all data views
- [ ] Error states for all failure modes
- [ ] Copy-to-clipboard with feedback
- [ ] Export as TXT/MD

#### Report Quality (15%)
- [ ] Application concept described
- [ ] Tech stack documented
- [ ] Prompting strategy with sample prompts
- [ ] Phase-by-phase development summary
- [ ] Architecture diagram included
- [ ] Challenges and resolutions documented
- [ ] Key learnings and reflection

### 9. Prompt History for Report

Document these prompts used during development:

```
1. Frontend Setup:
"Build a React + Vite + Tailwind frontend for OmniDraft, a glassmorphism dark mode AI content workspace..."

2. Backend Setup:
"Create a FastAPI backend with SSE streaming from NVIDIA API, Supabase auth, and rate limiting..."

3. Database Schema:
"Generate PostgreSQL migration for Supabase with tables: profiles, conversations, messages, templates..."

4. Docker Configuration:
"Write a multi-stage Dockerfile with Nginx serving React build and proxying /api/ to FastAPI..."

5. AWS Deployment:
"Deploy the containerized OmniDraft app to AWS App Runner with proper env vars and health checks..."

6. Frontend Polish:
"Add Framer Motion animations to the mode wheel, message bubbles, streaming text, and page transitions..."

7. Accessibility Pass:
"Audit the OmniDraft frontend for WCAG AA compliance and fix all issues found..."
```

---

INSTRUCTIONS:
Apply all final polish items listed above. Focus on the user-facing experience — animations that feel premium, micro-interactions that delight, empty states that guide, and error states that inform. Ensure the app passes the final grading checklist. The grader should open the App Runner URL and immediately think "this is a production-quality application."
