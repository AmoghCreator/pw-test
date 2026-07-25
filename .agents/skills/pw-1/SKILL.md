---
name: "pw-1"
description: "Prompt 1: Requirements + Architecture (10 min budget)"
mode: "agent"
---
# /pw-1 — Requirements + Architecture

**Time budget: 10 min. Do NOT exceed.**

> **SKIP THIS** if you already ran `/pw-main` — it covers this step.

Read: `CLAUDE.md`, `REQUIREMENTS.md`, `MAIN_STRATEGY.md` (if exists)

## Deliverables:

### 1. Verify REQUIREMENTS.md
- Every feature has a checkbox
- Priority marked (🔴 must / 🟡 should / 🟢 nice)
- Nothing missing from the problem statement

### 2. Architecture (NO CODE — design only)

Output to the user:

**Firestore Schema:**
```typescript
// Collection: [name]
interface Document {
  // fields with types
}
```

**API Contract:**
```typescript
// POST /api/generate
interface Request { /* ... */ }
interface Response { /* ... */ }
```

**Gemini Response Schema:**
```typescript
// What Gemini returns (structured JSON)
interface GeminiOutput { /* ... */ }
```

**Component Tree:**
```
page.tsx (orchestration only)
├── InputForm.tsx (form + validation)
├── ResultDisplay.tsx (show AI output)
├── LoadingState.tsx (skeleton)
└── ErrorState.tsx (role="alert")
```

### 3. Update type files
- `src/lib/types.ts` — all interfaces from above
- `src/lib/constants.ts` — model name, limits, collection names
- `src/lib/validators.ts` — Zod schemas matching the interfaces

### 4. Confirm with user
Print the architecture summary. Ask: "Look good? Run /pw-2 to build the backend."

## Rules:
- Do NOT write implementation code (route handlers, components)
- Do NOT add features the user didn't ask for
- Keep it simple — resist over-engineering
