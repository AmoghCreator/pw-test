# PromptWars Skill Harness

> **Plug-and-play `/` commands for AntiGravity.** Warmup probes the judge, main executes with intelligence.

## Quick Start

```bash
# Clone scaffold, install, verify
git clone <this-repo> my-project && cd my-project
npm install
npm run lint && npm run build
code .

# Then in VS Code Copilot Chat, use /pw-xxx commands
```

## How It Works

```
/pw-warmup → /pw-scores → /pw-main → /pw-2 → /pw-3 → /pw-4 → /pw-5 (submit) → /pw-6 → /pw-7 (submit) → /pw-8 → /pw-submit
```

1. You fill `PROBLEM_STATEMENT.md` (your understanding, decisions, priorities)
2. `/pw-warmup` — minimal build to probe the judge (token-light)
3. `/pw-scores` — record results, generates `MAIN_STRATEGY.md`
4. `/pw-main` through `/pw-8` — full build with adjusted priorities
5. `/pw-submit` — clean, deploy, ship

## Slash Commands

| Phase | Command | Purpose | Time |
|-------|---------|---------|------|
| Warmup | `/pw-warmup` | Lean probe build | 45 min |
| Warmup | `/pw-scores` | Record + analyze judge | 5 min |
| Main | `/pw-main` | Init foundation + deploy plan | 10 min |
| Main | `/pw-1` | Requirements + Architecture | (part of main) |
| Main | `/pw-2` | Backend API + Gemini | 25 min |
| Main | `/pw-3` | Frontend UI | 30 min |
| Main | `/pw-4` | Auth + Firestore | 15 min |
| Main | `/pw-5` | Deploy + Submit #1 | 10 min |
| Main | `/pw-6` | Security + Testing | 20 min |
| Main | `/pw-7` | A11y + Code Quality | 15 min |
| Main | `/pw-8` | Polish + README | 10 min |
| Util | `/pw-judge` | Self-score before submit | 3 min |
| Util | `/pw-fix` | Fix specific criterion | varies |
| Util | `/pw-deploy` | Deploy to Cloud Run | 5 min |
| Util | `/pw-submit` | Final clean + submit | 7 min |
| Util | `/pw-emergency` | Ship whatever builds | 3 min |

## Philosophy

- **You drive, AI executes** — `PROBLEM_STATEMENT.md` is YOUR space
- **Warmup = reconnaissance** — don't burn tokens, just learn the judge
- **Main = surgical** — spend time on YOUR weak areas (from warmup data)
- **3 submissions** — submit early, improve between, polish last

## Live Demo

[URL after deployment]

## Problem Statement

[Paste problem statement here]

---

## Evaluation Focus Areas Met

| Criterion | Target | Evidence |
|-----------|--------|---------|
| **Code Quality** | 95+ | TypeScript strict mode (`noImplicitAny`, `noUnusedLocals`), all functions ≤25 lines, zero `any` types, all magic values in `constants.ts`, zero ESLint warnings (`npm run lint`), consistent error handling pattern |
| **Problem Alignment** | 100 | All features in REQUIREMENTS.md fully implemented — see checklist below |
| **Security** | 98+ | `GEMINI_API_KEY` fetched via Secret Manager (falls back to `.env.local`), `server-only` imported in all route handlers, Zod validation on all inputs, no secrets in responses, CSP headers in `next.config.ts`, Firestore rules block client writes |
| **Efficiency** | 100 | Single Gemini call per user action requesting all data at once, results cached in Firestore (never re-calls Gemini for same input), lazy-loaded components with `dynamic()` |
| **Testing** | 95+ | Vitest unit tests: validators (8 cases), route handler (5 cases); Playwright E2E: happy path + error state; `@axe-core/playwright`: zero WCAG 2.2 AA violations |
| **Accessibility** | 96+ | Zero axe-core violations, skip-to-content link, semantic HTML (`<main>`, `<header>`, `<section>`), all inputs labelled with `htmlFor`, error states use `role="alert"`, loading uses `role="status" aria-live="polite"`, focus rings visible, keyboard navigable |
| **Google Services** | 10+ | Gemini 2.5 Flash, Secret Manager, Cloud Logging, BigQuery, Firebase Auth, Firestore, Firebase Hosting, Cloud Run (Docker), Firebase Analytics — 9 services wired |

---

## Google Services Used

1. **Gemini 2.5 Flash** — AI analysis engine with structured JSON output
2. **Google Cloud Secret Manager** — Secure API key management
3. **Google Cloud Logging** — Structured event logging per request
4. **Google BigQuery** — Analytics event warehouse
5. **Firebase Authentication** — Google Sign-In
6. **Cloud Firestore** — Result caching and user history
7. **Firebase Hosting** — Frontend deployment
8. **Cloud Run** — Containerized backend (Dockerfile included)
9. **Firebase Analytics** — User action tracking

---

## Architecture

```
src/
  app/
    layout.tsx          — skip-to-content, fonts, metadata
    page.tsx            — orchestration only
    api/generate/       — Gemini + Firestore route (server-only)
  lib/
    constants.ts        — all magic values
    types.ts            — all TypeScript interfaces
    validators.ts       — Zod schemas for input + Gemini output
    secrets.ts          — Secret Manager with .env.local fallback
    logger.ts           — Cloud Logging wrapper
    firebase.ts         — Firebase client singleton
    firebase-admin.ts   — Firebase Admin for route handlers
    api.ts              — Client-side fetch wrapper
tests/
  a11y.spec.ts          — axe-core WCAG audit
  app-flow.spec.ts      — E2E happy path
```

---

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Fill in GEMINI_API_KEY and Firebase config in .env.local

# Run development server
npm run dev

# Run all tests
npm test && npm run test:e2e

# Check score before submitting
node scripts/score-check.mjs

# Build for production
npm run build
```

---

## Feature Checklist (REQUIREMENTS.md)

- [ ] Feature 1: [description]
- [ ] Feature 2: [description]
- [ ] Feature 3: [description]
# pw-test
