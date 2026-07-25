<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This codebase uses **Next.js 16 with the App Router**. APIs, file conventions, and module behavior
differ significantly from your training data. Before writing any route handler, component, or config:

1. Check `node_modules/next/dist/docs/` for the current API reference.
2. Respect all deprecation notices — do NOT use Pages Router patterns.
3. Dynamic routes with `output: "standalone"` work. `output: "export"` breaks API routes — do NOT use it.
4. `useSearchParams()` MUST be wrapped in `<Suspense>`. Build will fail otherwise.
5. Server Components are the default. Add `"use client"` only when you need browser APIs or hooks.
6. Route handlers live at `src/app/api/[endpoint]/route.ts` (not `pages/api/`).
7. `server-only` package prevents server modules from being imported client-side — use it on all routes.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:runtime-environment -->
# Runtime Environment — Omarchy (macOS/Linux)

This project runs on an **Omarchy machine** (Claude-powered, macOS/Linux shell).

- Use `bash` commands — NEVER PowerShell or Windows-specific syntax
- Path separators: `/` (forward slash only)
- Use `export VAR=value` not `$env:VAR = "value"`
- `rm -f`, `mkdir -p`, `cat`, `grep` — standard POSIX tools
- Docker Desktop or colima available for container builds
- `gcloud` CLI pre-installed
- Node.js managed via system install (not nvm unless specified)
- No `&&` issues — bash supports multi-command chaining natively
<!-- END:runtime-environment -->

---

# PromptWars Scaffold — Agent Instructions

## Your Mission

You are building a **PromptWars hackathon submission**. Every line of code will be
evaluated by an automated AI judge on 7 criteria. This file tells you exactly how to
win those criteria. Read it completely before writing any code.

## CRITICAL: Read PROBLEM_STATEMENT.md First

Before making ANY architectural or design decisions, read `PROBLEM_STATEMENT.md`.
The human has already decided:
- What features to build (and their priority)
- The UI approach
- How to use Gemini
- What they want and DON'T want

**You do NOT get to override these decisions.** You implement what's specified.
If something is ambiguous, ask — don't assume.

## If MAIN_STRATEGY.md Exists

The human has done a warmup and analyzed the judge. `MAIN_STRATEGY.md` contains:
- Which criteria the judge is strictest on
- Adjusted time allocations
- Specific tactics for weak areas

**Follow MAIN_STRATEGY.md priorities over generic advice in this file.**

---

## The 7 Scoring Criteria — Internalize These

### 1. Code Quality (HIGHEST RISK — aim for 95+)
- **Every function ≤ 25 lines** — no exceptions. Extract named helpers.
- **Explicit TypeScript return types on every function** — `async function foo(): Promise<Bar>`
- **Zero `any` types** — use `unknown` + type guards, or proper interfaces.
- Named constants for ALL magic values (numbers, repeated strings) → `src/lib/constants.ts`
- Single responsibility: one component = one job. No fetch inside render components.
- No `console.log` in production paths (only `console.error` in catch blocks).
- No dead code, no TODOs, no commented-out blocks in submitted code.
- Imports ordered: external packages → `@/lib/*` → `@/components/*` → types → styles.
- `npm run lint` must exit 0 with **zero warnings**.

### 2. Problem Statement Alignment (aim for 100)
- Every feature in REQUIREMENTS.md must be **fully functional** — no stubs, no "coming soon".
- Track coverage in REQUIREMENTS.md with checkboxes. Submit only when 100% checked.
- No extra features beyond what's asked — feature creep hurts quality score.

### 3. Security (aim for 98+)
- `GEMINI_API_KEY` lives ONLY in `.env.local` and is accessed via `getSecret()` in route handlers.
- Import `server-only` at the top of every route handler file.
- All user inputs validated with Zod before ANY processing.
- No API keys in any `NEXT_PUBLIC_*` variable — ever.
- No secrets in `console.error()` logs.
- CSP / security headers configured in `next.config.ts`.
- Firestore rules block all client writes (write-only through API routes).

### 4. Efficiency (aim for 100)
- **One Gemini call per user action** — design your prompt to return ALL data at once.
- Cache results in Firestore: generate once, re-read from DB on subsequent requests.
- No Gemini calls in loops or on every keystroke (debounce inputs).
- Lazy-load heavy components with `dynamic()`.
- Firestore queries have compound indexes on `userId + createdAt`.

### 5. Testing (aim for 95+)
- Unit tests live in `src/**/*.test.ts` — run with Vitest.
- E2E + accessibility tests live in `tests/` — run with Playwright.
- Mock Gemini with `vi.mock('@google/genai', ...)` — never call real API in tests.
- Cover: happy path, missing required fields (400 response), Gemini failure (500 response).
- Accessibility test with `@axe-core/playwright` — **zero WCAG violations allowed**.
- `npm run test` must pass before every submission.

### 6. Google Services (aim for 10+ services)
These are ALREADY wired up in this scaffold. Use all of them:
| Service | Where | Status |
|---------|-------|--------|
| Gemini 2.5 Flash | `src/app/api/generate/route.ts` | ✅ wired |
| Secret Manager | `src/lib/secrets.ts` | ✅ wired |
| Cloud Logging | `src/lib/logger.ts` | ✅ wired |
| BigQuery | `src/app/api/generate/route.ts` | ✅ wired |
| Firebase Auth | `src/lib/firebase.ts` | ✅ wired |
| Firestore | `src/lib/firebase.ts` | ✅ wired |
| Firebase Hosting | `firebase.json` | ✅ configured |
| Cloud Run (Docker) | `Dockerfile` | ✅ ready |
| Google Maps/Places | Add when problem has location | 📋 add if needed |
| Firebase Analytics | Add `logEvent()` on key actions | 📋 add if needed |
| Vertex AI | Available via `@google-cloud/vertexai` | 📋 add if needed |

### 7. Accessibility (aim for 96+)
Non-negotiable rules for EVERY component:
- Every `<input>`, `<select>`, `<textarea>` has `id` + matching `<label htmlFor="id">`.
- Checkbox/radio groups use `<fieldset><legend>`.
- Error messages: `role="alert"` (immediately announced).
- Loading/success states: `role="status" aria-live="polite"` (announced when updated).
- Status badges show **icon + text** — NEVER color alone.
- Semantic HTML: `<main>`, `<header>`, `<nav>`, `<section aria-label="">`, `<article>`.
- Icon-only buttons: `aria-label="descriptive action"` on the button.
- Decorative icons: `aria-hidden="true"` on the SVG/span.
- Skip-to-content link must be the **first focusable element** in the DOM.
- Focus rings must be visible on all interactive elements (never `outline: none` without replacement).
- Tab order must be logical (top → bottom, left → right, form → submit).

---

## Architecture You Must Follow

```
src/
  app/
    layout.tsx          ← skip-link + font + metadata (NO business logic)
    page.tsx            ← orchestration only — calls lib/api.ts, no fetch()
    globals.css
    api/
      generate/
        route.ts        ← server-only, Zod validation, Gemini call, Firestore write
        route.test.ts   ← unit tests with mocked Gemini
  lib/
    constants.ts        ← ALL magic values (no inline numbers/strings)
    types.ts            ← ALL TypeScript interfaces
    validators.ts       ← ALL Zod schemas
    gemini.ts           ← Gemini client (server-only)
    firebase.ts         ← Firebase client SDK singleton
    logger.ts           ← Cloud Logging wrapper
    secrets.ts          ← Secret Manager with .env.local fallback
    api.ts              ← Client-side fetch wrapper (calls /api/*)
  components/           ← Shared UI components (no data fetching inside)
  features/             ← Domain feature folders (components + hooks)
tests/
  a11y.spec.ts          ← Playwright + axe-core (do NOT delete or modify)
  app-flow.spec.ts      ← E2E happy path
```

---

## Gemini Integration Pattern (copy this exactly)

```typescript
// In route.ts
import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { getSecret } from '@/lib/secrets';

const apiKey = await getSecret('GEMINI_API_KEY');
const ai = new GoogleGenAI({ apiKey });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  config: {
    responseMimeType: 'application/json',
    responseSchema: YOUR_ZOD_SCHEMA_CONVERTED_TO_GEMINI_SCHEMA,
    temperature: 0.2,
  },
});

const parsed = YourZodSchema.parse(JSON.parse(response.text!));
```

## Common Gotchas (learned from past winners)

| Problem | Fix |
|---------|-----|
| `useSearchParams()` build error | Wrap in `<Suspense fallback={<Loading />}>` |
| Firebase port 5000 taken | Use port `5002` in firebase.json emulators |
| Gemini returns markdown-wrapped JSON | Always use `responseMimeType: "application/json"` |
| Re-reads trigger new Gemini calls | Write to Firestore on generate, read from there |
| `cors` import error in Functions | `import cors from 'cors'` not `import * as cors` |
| `create-next-app` rejects non-empty dir | Move files to `/tmp`, scaffold, restore |
| API route 404 in production | Ensure `output: "standalone"` not `"export"` |
| Dynamic route breaks static export | Use `?id=` query params, not `/[id]` |
| Secret Manager fails locally | Falls back to `process.env[name]` — put key in `.env.local` |
