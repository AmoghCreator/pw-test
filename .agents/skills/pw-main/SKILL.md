---
name: "pw-main"
description: "Start main phase - problem + strategy + deployment plan"
mode: "agent"
---
# PromptWars Main Phase — START

**Total time: 150 min (~2.5 hrs). Clock starts NOW.**

## Inputs from user:
- Problem statement: {{input}}
- User's thinking/approach: (user will provide)

## Step 1: Read intelligence (2 min)

Read these files in order:
1. `MAIN_STRATEGY.md` (if exists — warmup intelligence)
2. `warmup-results.json` (if has scores)
3. `CLAUDE.md` (scoring rules)
4. `AGENTS.md` (implementation rules)

## Step 2: Problem Analysis (3 min)

From the problem statement, extract:
- **Core features** (what MUST work)
- **Implied features** (what the judge expects but isn't explicit)
- **Gemini usage** (what AI should generate)
- **User flow** (input → processing → output)

## Step 3: Deployment Plan (generated immediately)

Output a deployment timeline:

```
DEPLOYMENT PLAN (3 submissions, 150 min)
═══════════════════════════════════════
Submission 1 @ 90 min:  Core working (backend + frontend + basic tests)
Submission 2 @ 125 min: Full features + security + testing hardened
Submission 3 @ 145 min: Polish + accessibility + README optimized

DEPLOY COMMANDS (see DEPLOY.md for full setup):
  docker build -t ${REGISTRY}/${APP_NAME}:latest .
  docker push ${REGISTRY}/${APP_NAME}:latest
  gcloud run deploy ${APP_NAME} --image ${REGISTRY}/${APP_NAME}:latest --region ${REGION} --allow-unauthenticated --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" --port=3000
```

## Step 4: Generate foundation files (5 min)

Create/update:
1. `REQUIREMENTS.md` — feature checklist from problem + user's priorities
2. Update `CLAUDE.md` — fill project name, problem statement, features
3. `src/lib/types.ts` — ALL TypeScript interfaces
4. `src/lib/constants.ts` — ALL magic values, model config
5. `src/lib/validators.ts` — Zod schemas for request + Gemini response

## Step 5: Report to user

Print:
```
✅ Main phase initialized
📋 Features: [count] identified ([count] critical, [count] should-have)
⏱️ Time budget:
   /pw-1  Requirements + Arch    → 10 min (done ✓)
   /pw-2  Backend API            → 25 min  ← START HERE
   /pw-3  Frontend UI            → 30 min
   /pw-4  Auth + Firestore       → 15 min
   /pw-5  Deploy + Submit #1     → 10 min  [SUBMISSION 1 @ 90 min]
   /pw-6  Security + Testing     → 15 min
   /pw-7  A11y + Code Quality    → 15 min  [SUBMISSION 2 @ 125 min]
   /pw-8  Final Polish + README  → 10 min
   /pw-submit                    → 7 min   [SUBMISSION 3 @ 145 min]
   Buffer                        → 5 min

🎯 Weak areas from warmup: [list from MAIN_STRATEGY.md]
🚀 Run /pw-2 next
```

## CRITICAL RULES:
- Do NOT start building features yet — just the foundation
- The user's idea/approach OVERRIDES any default architecture
- If no warmup data exists, assume all criteria equally weighted
- Time is the enemy — every file you create must be necessary
- This scaffold runs on Omarchy (macOS/Linux) — use bash commands, not PowerShell
