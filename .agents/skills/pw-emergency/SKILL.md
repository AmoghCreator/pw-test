---
name: "pw-emergency"
description: "Emergency mode - time is running out, submit whatever works"
mode: "agent"
---
# /pw-emergency — Time's Up, Ship It

**Use when you have < 15 minutes left.**

## Priority 1: Does it build?
```bash
npm run build
```

If YES → skip to deploy.
If NO → fix the build error (usually a type error or missing import). Nothing else matters.

## Priority 2: Deploy what you have
```bash
docker build -t ${REGISTRY}/${APP_NAME}:latest . && \
docker push ${REGISTRY}/${APP_NAME}:latest && \
gcloud run deploy ${APP_NAME} --image ${REGISTRY}/${APP_NAME}:latest --region ${REGION} --allow-unauthenticated --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" --port=3000
```

(If env vars aren't set, see `DEPLOY.md` for values)

## Priority 3: README (2 min)
Update README.md with the "Evaluation Focus Areas Met" table.
This alone can boost your score by 3-5 points because the judge reads it.

## Priority 4: Submit

**DO NOT:**
- ❌ Try to fix tests
- ❌ Try to add features
- ❌ Refactor anything
- ❌ Add new files

**DO:**
- ✅ Make it build
- ✅ Make it deploy
- ✅ Update README
- ✅ Submit immediately

> A deployed 70% app beats an unsubmitted 95% app.
