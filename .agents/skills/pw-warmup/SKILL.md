---
name: "pw-warmup"
description: "Start warmup phase - probe the AI judge with minimal token spend"
mode: "agent"
---
# PromptWars Warmup — Lean Judge Probe

You have **60 minutes** and the goal is NOT to build a perfect app.  
The goal is to **submit something scoreable** to learn how the judge behaves.

## Inputs from user:
- Problem statement: {{input}}
- Their idea/approach: (user will provide)

## Strategy: MINIMAL VIABLE SUBMISSION

Build the **smallest possible working app** that hits all 7 scoring criteria.
Do NOT over-invest. This is a reconnaissance mission.

### What to build (40 min max coding):

1. **Read CLAUDE.md** for scoring rules
2. **Create REQUIREMENTS.md** — list features from the problem statement (checkboxes)
3. **Backend** (`src/app/api/generate/route.ts`):
   - `server-only` import
   - Zod validate input
   - ONE Gemini call with structured JSON output
   - Write to Firestore
   - Log to Cloud Logging
   - Return result
4. **Frontend** (`src/app/page.tsx` + 1-2 components):
   - Simple form → submit → show results
   - Full accessibility (labels, roles, aria-live)
   - Semantic HTML
5. **Tests** (bare minimum):
   - 1 unit test for route (mock Gemini)
   - 1 Playwright test (form → result)
   - 1 axe-core test
6. **README.md** — "Evaluation Focus Areas Met" table (spoon-feed the judge)

### What to SKIP (save tokens for main):
- ❌ No Firebase Auth (just hardcode a userId)
- ❌ No history/dashboard features
- ❌ No fancy UI (basic Tailwind is fine)
- ❌ No BigQuery (nice-to-have, not needed for warmup probe)
- ❌ No multi-component architecture (keep it flat)

### Token budget awareness:
- Use **ONE prompt** for backend + types + validators
- Use **ONE prompt** for frontend
- Use **ONE prompt** for tests
- Total: ~3 prompts max for warmup

### After building:
```bash
npm run lint && npm test && npm run build
node scripts/score-check.mjs
```

Submit. Record scores with `/pw-scores`.

## IMPORTANT: Note what the judge says
The judge's feedback text is GOLD. Every word tells you what it cares about.
