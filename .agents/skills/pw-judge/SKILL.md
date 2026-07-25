---
name: "pw-judge"
description: "Self-judge your submission before sending - simulates AI judge scoring"
mode: "agent"
---
# /pw-judge — Self-Score Before Submission

**Simulate what the AI judge will see and score.**

## Run automated checks first:
```bash
npm run lint
npm test
npm run build
node scripts/score-check.mjs
```

## Then evaluate like the judge would:

Read the entire codebase and score each criterion 0-100:

### 1. Code Quality (/100)
- Functions ≤ 20 lines?
- Explicit return types everywhere?
- Zero `any` types?
- Named constants (no magic values)?
- Clean error handling pattern?
- No dead code / TODOs / console.log?
- Imports organized?
- ESLint: 0 errors, 0 warnings?

### 2. Problem Alignment (/100)
- Read REQUIREMENTS.md — are ALL features working?
- Any feature stubs or "coming soon"?
- Any features BEYOND what was asked? (penalized)

### 3. Security (/100)
- API key only in .env.local / Secret Manager?
- `server-only` on all route handlers?
- Zod on ALL inputs?
- No secrets in error responses?
- CSP headers present?
- Firestore rules block client writes?

### 4. Efficiency (/100)
- Single Gemini call per user action?
- Results cached in Firestore?
- No API calls in loops or on keystroke?
- Lazy-loaded heavy components?

### 5. Testing (/100)
- Unit tests exist and pass?
- E2E tests exist and pass?
- Accessibility test with zero violations?
- Gemini properly mocked?
- Coverage > 80% on core files?

### 6. Accessibility (/100)
- Zero axe-core violations?
- All inputs labelled?
- role="alert" for errors?
- aria-live for loading/success?
- Skip-to-content link?
- Semantic HTML?
- Keyboard navigable?

### 7. Google Services (/100)
- Count services used (need 8+ for good score)
- Each service actually functional (not just imported)?

## Output format:
```
SELF-SCORE ESTIMATE
═══════════════════
Code Quality:      XX/100  [issues if any]
Problem Alignment: XX/100  [issues if any]
Security:          XX/100  [issues if any]
Efficiency:        XX/100  [issues if any]
Testing:           XX/100  [issues if any]
Accessibility:     XX/100  [issues if any]
Google Services:   XX/100  [count: N services]
────────────────────────
ESTIMATED TOTAL:   XX/100

TOP 3 FIXES (if time allows):
1. [highest impact fix]
2. [second highest]
3. [third]
```

If estimated total > 93: "Ship it. Run /pw-submit."
If estimated total 85-93: "Fix the top issue, then ship."
If estimated total < 85: "CRITICAL — fix top 3 issues before submitting."
