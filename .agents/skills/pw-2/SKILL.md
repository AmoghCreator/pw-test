---
name: "pw-2"
description: "Prompt 2: Backend API + Gemini integration (25 min budget)"
mode: "agent"
---
# /pw-2 — Backend API + Gemini

**Time budget: 25 min. This is the heaviest prompt.**

Read: `CLAUDE.md`, `src/lib/types.ts`, `src/lib/validators.ts`, `src/lib/constants.ts`
If exists: `MAIN_STRATEGY.md` (check if code quality is a weak area)

## Build:

### 1. `src/app/api/generate/route.ts`

```typescript
import 'server-only';
// Structure:
// 1. Import deps
// 2. POST handler
//    a. Zod validate request body
//    b. getSecret('GEMINI_API_KEY')
//    c. Single Gemini 2.5 Flash call (responseMimeType: "application/json")
//    d. Zod validate Gemini response
//    e. Write to Firestore (cache)
//    f. Log to Cloud Logging
//    g. BigQuery analytics insert
//    h. Return { id, data }
// 3. Error handling: generic message to client, full error to console.error
```

**CRITICAL RULES:**
- ONE Gemini call only — request ALL data at once
- Every function ≤ 20 lines (extract helpers: `callGemini()`, `cacheResult()`, `logEvent()`)
- Explicit return types on every function
- No `any` types
- temperature: 0.2 for consistency

### 2. `src/app/api/generate/route.test.ts`

Mock everything:
```typescript
vi.mock('@google/genai', () => ({ /* mock */ }));
vi.mock('@/lib/secrets', () => ({ getSecret: vi.fn().mockResolvedValue('test-key') }));
```

Tests:
- ✅ Valid request → 200 + correct response shape
- ✅ Missing required field → 400
- ✅ Gemini throws → 500 with generic message
- ✅ Invalid Gemini response (Zod fail) → 500

### 3. Run verification:
```bash
npm run lint
npm test
```

Both must pass before this prompt is done.

## If MAIN_STRATEGY.md says code quality is weak:
- Enforce 15-line function limit (not 20)
- Add JSDoc on exported functions
- Extract every conditional into a named boolean

## Output:
Print: "Backend done. Run /pw-3 for frontend."
