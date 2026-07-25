---
name: "pw-5"
description: "Prompt 5: Deploy + First Submission (10 min budget)"
mode: "agent"
---
# /pw-5 — Deploy + FIRST SUBMISSION

**Time budget: 10 min. Get something scored NOW.**

## Pre-flight checks:

```bash
npm run lint          # must be 0 errors
npm test             # must pass
npm run build        # must exit 0
node scripts/score-check.mjs  # check for RED items
```

If any RED items in score-check, fix the top 2 most impactful ones (< 5 min).
Do NOT fix everything — submit imperfect and improve.

## Deploy:

Read `DEPLOY.md` for full details. Quick version:

```bash
# Set once (user fills PROJECT_ID before event)
export PROJECT_ID="your-project-id"
export REGION="us-central1"
export APP_NAME="pw-app"
export REGISTRY="us-central1-docker.pkg.dev/${PROJECT_ID}/pw-app"

# Build + Push + Deploy
docker build -t ${REGISTRY}/${APP_NAME}:latest . && \
docker push ${REGISTRY}/${APP_NAME}:latest && \
gcloud run deploy ${APP_NAME} \
  --image ${REGISTRY}/${APP_NAME}:latest \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=3 \
  --port=3000
```

## After deploy:
1. Smoke test the live URL (click through main flow)
2. Verify it works end-to-end
3. **SUBMIT** — don't wait for perfection

## Output:
```
🚀 SUBMISSION 1 SENT
📊 Run /pw-scores if you want to record scores
⏭️ Run /pw-6 for security + testing hardening
⏱️ ~60 min remaining
```

## PHILOSOPHY:
> A submitted 80% solution beats an unsubmitted 95% solution.
> You have 2 more submissions to improve.
