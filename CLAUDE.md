@AGENTS.md

# Haven Bridge — Recovery & Prevention Companion

## How This Scaffold Works

1. **YOU fill PROBLEM_STATEMENT.md** — your understanding, features, priorities, design decisions
2. **Warmup phase:** Build, submit, record scores in warmup-results.json
3. **Run `node scripts/warmup-analyze.mjs`** → generates MAIN_STRATEGY.md
4. **Main phase:** Follow PLAYBOOK_V2.md with adjusted priorities from your warmup data

**The AI reads this file for rules. YOU drive decisions via PROBLEM_STATEMENT.md.**

## Problem Statement
Multi-modal GenAI-powered recovery and prevention platform for individuals navigating substance use disorders and their caregivers. Uses zero-typing interventions (voice, webcam, emoji taps), personalized emergency scripts, and contextual safety tools via a dual-window architecture: User Sanctuary (calm/crisis modes) + Caregiver Command Center (real-time Firestore sync).

## Evaluation Criteria (PromptWars AI Scoring)

### HIGH IMPACT

#### Code Quality (86/100 in AMD warmup — BIGGEST RISK)
- Clean, readable, well-structured code
- **Functions under 25 lines** (enforce strictly — extract named helpers)
- Single responsibility principle
- **Explicit TypeScript return types everywhere** (no implicit `any`)
- Named constants for ALL magic values → `src/lib/constants.ts`
- **Zero dead code, zero TODOs** (delete before submitting)
- Consistent error handling: `catch (err) { const msg = err instanceof Error ? err.message : 'Unknown'; }`
- No commented-out code blocks
- Imports organized: external → `@/lib` → `@/components` → types → styles
- `npm run lint` must exit 0, **zero warnings**

**Highest risk area:** GenAI integration tends to have complex logic — break into small, testable functions.

#### Problem Statement Alignment (99/100 in AMD warmup)
- **ALL listed features must be fully functional** — no partial implementations
- Track with REQUIREMENTS.md checkboxes
- No extra features beyond what's asked

---

### MEDIUM IMPACT

#### Security (98/100 in AMD warmup)
- `GEMINI_API_KEY` ONLY in `.env.local` / Secret Manager — never in `NEXT_PUBLIC_*`
- Import `server-only` at top of every route handler
- Zod validation on **ALL** user inputs before processing
- No secrets in error logs
- CSP headers in `next.config.ts`
- Firestore rules: client read allowed, write blocked (server-only)

#### Efficiency (100/100 in AMD warmup)
- **Single Gemini call per user action** — request ALL data at once
- Cache result in Firestore — never re-call Gemini for the same request
- No API calls on keystroke — debounce inputs (300ms)
- Lazy-load heavy components with `dynamic()`

---

### LOW IMPACT (tiebreakers — don't leave points on table)

#### Testing (95/100 in AMD warmup)
- Unit tests: Vitest (`src/**/*.test.ts`) — mock Gemini, never call real API
- E2E: Playwright (`tests/`) — happy path + edge cases
- Accessibility: `@axe-core/playwright` — zero WCAG violations
- Coverage target: >80% on core business logic
- `npm test && npm run test:e2e` must pass before submitting

#### Accessibility (96/100 in AMD warmup)
- Every `<input>`, `<select>`, `<textarea>` → `id` + `<label htmlFor>`
- Checkbox/radio groups → `<fieldset><legend>`
- Errors → `role="alert"`, Loading/success → `role="status" aria-live="polite"`
- Status badges → icon + text (NEVER color alone)
- Semantic HTML throughout: `<main>`, `<header>`, `<section>`, `<article>`
- Skip-to-content link as first focusable element
- Focus rings visible, tab order logical

#### Google Services (scored by judge — maximize usage)
- **Minimum 6 services** in production code: Gemini, Firestore, Firebase Auth, Secret Manager, Cloud Logging, BigQuery
- Mention ALL services in README under "Google Cloud Services Used"
- Firebase Analytics on client side (counts as separate service)
- Maps API if problem allows (free bonus points)
- Every service must be **actually used** in the flow, not just imported

---

## Project-Specific Context

> **DO NOT fill this manually.** These get populated from PROBLEM_STATEMENT.md by the first prompt.
> Your job is to fill PROBLEM_STATEMENT.md — the AI reads it and populates these.

### Required Features
- Dual-window: `/user` (Sanctuary) + `/caregiver` (Command Center)
- Zero-typing inputs: spacebar voice, webcam snap, emotion orbs, crisis button
- Single Gemini multimodal call → dual-channel JSON (user_facing + caregiver_facing)
- Privacy abstraction: raw speech never shown to caregiver
- Crisis mode: fullscreen breathing circle + grounding text
- Caregiver cards: nudges (LOW/MODERATE) + emergency scripts (HIGH/CRITICAL)
- Real-time Firestore sync between windows

### User Flow
1. User holds Spacebar → records voice / taps emotion orb / captures webcam image
2. Frontend POSTs to `/api/generate` with audio blob + emotion + image + user profile
3. Server validates with Zod, builds multimodal Gemini prompt (single call)
4. Gemini returns dual-channel JSON, server writes to Firestore `sessions` collection
5. User sees grounding text; if `suggested_mode=CRISIS`, UI switches to crisis fullscreen
6. Caregiver window (Firestore onSnapshot) auto-updates with nudge or emergency script card

### Gemini Response Schema
```json
{
  "user_facing": {
    "grounding_text": "string",
    "emotional_state": "string",
    "suggested_mode": "CALM | CRISIS"
  },
  "caregiver_facing": {
    "alert_level": "LOW | MODERATE | HIGH | CRITICAL",
    "privacy_safe_summary": "string",
    "action_script": ["string", "string", "string"],
    "educational_rationale": "string"
  }
}

---

## Warmup Intelligence

> After running `node scripts/warmup-analyze.mjs`, paste key findings here:

### Weak Areas (from warmup)
[FILL after warmup: e.g., "Code Quality 86 — need stricter function length enforcement"]

### Judge Behavior
[FILL after warmup: e.g., "Judge is strict on testing, lenient on Google Services count"]

### Strategy Adjustments
[FILL or reference MAIN_STRATEGY.md]

### Firestore Schema
- **Collection:** `sessions`
- **Key fields:** `userId` (string), `createdAt` (Timestamp), `inputType` (voice/image/emotion/crisis), `userFacing` (object), `caregiverFacing` (object), `alertLevel` (LOW/MODERATE/HIGH/CRITICAL)
- **Index:** compound on `userId + createdAt` (descending) for caregiver feed

---

## Implementation Priority Order

1. **API route** (`/api/generate`) — Zod validation + Gemini call + Firestore write
2. **Core UI** — input form + results display (accessibility from day 1)
3. **Happy path working end-to-end** — stop here and smoke test
4. **Edge cases + error states** — empty inputs, Gemini failure, network error
5. **Test coverage** — mock-based unit tests + Playwright E2E
6. **Code quality pass** — function lengths, constants, types
7. **Final accessibility audit** — axe-core scan must be zero violations
8. **README update** — "Evaluation Focus Areas Met" section

## What NOT To Do

- ❌ Hardcode `GEMINI_API_KEY` anywhere in source
- ❌ Make multiple Gemini calls for a single user action
- ❌ Use `any` types in TypeScript
- ❌ Leave `console.log`, TODOs, or dead code
- ❌ Skip input validation — validate everything
- ❌ Use color alone for status (always add icon + text)
- ❌ Implement features NOT in REQUIREMENTS.md (feature creep = quality hit)
- ❌ Use `output: "export"` — it breaks API routes

## Pre-Submission Checklist

- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm test` → all unit tests pass
- [ ] `npm run test:e2e` → all Playwright tests pass (including a11y)
- [ ] All TypeScript types explicit (no `any`)
- [ ] All functions ≤ 25 lines
- [ ] No TODOs or commented-out code
- [ ] `GEMINI_API_KEY` NOT in any NEXT_PUBLIC_ or frontend file
- [ ] All features in REQUIREMENTS.md checked off (100%)
- [ ] Gemini response cached in Firestore
- [ ] REQUIREMENTS.md "Evaluation Focus Areas Met" section complete
- [ ] `npm run build` → exits 0
- [ ] App runs end-to-end with real API key
