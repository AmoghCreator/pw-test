---
name: "pw-fix"
description: "Fix specific score issues between submissions"
mode: "agent"
---
# /pw-fix — Targeted Score Fix

**Use between submissions to fix specific weak areas.**

The user will tell you:
1. Which criterion scored low (or paste judge feedback)
2. What the score was

## Your job:

1. Read `MAIN_STRATEGY.md` and `CLAUDE.md` for context
2. Run `node scripts/score-check.mjs` to see current state
3. Focus ONLY on the weak criterion — do not touch anything else
4. Fix the minimum needed to improve that specific score
5. Re-run verification after fixes

## Fix playbooks by criterion:

### Code Quality (low):
- `grep -r ": any" src/` → replace with specific types
- Check every function length → extract helpers if > 20 lines
- `grep -r "console.log" src/` → delete all
- `grep -r "TODO\|FIXME" src/` → delete or implement
- Organize imports in every file
- Add explicit return types

### Problem Alignment (low):
- Open REQUIREMENTS.md → which feature is unchecked?
- Implement the missing feature(s)
- Do NOT add features not in the list

### Security (low):
- `grep -rn "NEXT_PUBLIC_GEMINI\|AIza" .`
- Verify `server-only` in route handlers
- Check Zod validation exists on all inputs
- Verify error responses don't leak internals
- Check security headers in next.config.ts

### Efficiency (low):
- Count Gemini calls → consolidate to ONE per user action
- Verify Firestore cache-before-call pattern
- Check for fetch in loops

### Testing (low):
- Add missing test cases (check coverage)
- Ensure Gemini is mocked (never real API in tests)
- Add axe-core test if missing
- `npm test -- --coverage` → fix files below 80%

### Accessibility (low):
- Run `npx playwright test tests/a11y.spec.ts`
- Fix all violations
- Check: labels, roles, aria-live, semantic HTML, skip-link

### Google Services (low):
- Count what's actually used (not just imported)
- Add missing ones from scaffold:
  - Firebase Analytics (`logEvent`)
  - BigQuery insert
  - Cloud Logging structured events
  - Secret Manager for API key

## After fixes:
```bash
npm run lint && npm test && npm run build
node scripts/score-check.mjs
```

Print: "Fixed [criterion]. Score-check shows [status]. Ready to re-submit?"
