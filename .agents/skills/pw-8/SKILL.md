---
name: "pw-8"
description: "Prompt 8: Final polish + README optimization (10 min budget)"
mode: "agent"
---
# /pw-8 — Final Polish + README

**Time budget: 10 min. Last coding prompt before final submission.**

## README.md — Spoon-feed the AI Judge

The judge is an LLM that reads your README. Make it OBVIOUS you hit every criterion.

### Update README.md with:

```markdown
# [App Name] — PromptWars Submission

> One-line description of what the app does

## Evaluation Focus Areas Met

| Criterion | Target | Evidence |
|-----------|--------|---------|
| **Code Quality** | 95+ | TypeScript strict, all functions ≤20 lines, zero `any`, named constants, zero ESLint warnings |
| **Problem Alignment** | 100 | All features in REQUIREMENTS.md implemented — see checklist |
| **Security** | 98+ | API key via Secret Manager, `server-only` on routes, Zod on all inputs, CSP headers |
| **Efficiency** | 100 | Single Gemini call per action, Firestore cache, no redundant calls |
| **Testing** | 95+ | Vitest unit + Playwright E2E + axe-core a11y — all passing |
| **Accessibility** | 97+ | WCAG 2.2 AA, zero axe violations, semantic HTML, ARIA, keyboard nav |
| **Google Services** | 10+ | [list all services used] |

## Google Services Used
1. Gemini 2.5 Flash — [what it does in your app]
2. Cloud Secret Manager — API key management
3. Cloud Logging — structured request logging
4. BigQuery — analytics events
5. Firebase Auth — Google Sign-In
6. Cloud Firestore — result caching + history
7. Firebase Hosting — frontend deployment
8. Cloud Run — containerized backend
9. Firebase Analytics — user event tracking
[add more if used]

## Architecture
[brief diagram or description]

## How to Run
npm install && npm run dev

## How to Test
npm test && npm run test:e2e
```

## Final touches:
1. Verify REQUIREMENTS.md — every checkbox checked
2. Remove any leftover `[FILL]` placeholders in CLAUDE.md
3. Confirm `.gitignore` hides strategy files (they're already configured):
   - `PLAYBOOK.md`, `PROBLEM_STATEMENT.md`, `MAIN_STRATEGY.md`
   - `warmup-results.json`, `.github/prompts/`
   - Run `git status` — none of these should appear
4. Keep in repo: `CLAUDE.md`, `AGENTS.md`, `REQUIREMENTS.md`, `README.md`

> After your FINAL submission is scored, run `/pw-cleanup` to permanently remove harness traces.

## Verification:
```bash
npm run lint && npm test && npm run build
node scripts/score-check.mjs
```

## Output:
"Ready for final submission. Run /pw-judge for self-score, then /pw-submit."
