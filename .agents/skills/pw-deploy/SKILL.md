---
name: "pw-deploy"
description: "Deploy to Cloud Run (standalone deploy command)"
mode: "agent"
---
# /pw-deploy — Deploy to Cloud Run

**Quick deploy without full submission ceremony.**

## Pre-flight:
```bash
npm run build  # must pass
```

## Deploy steps:

See `DEPLOY.md` for full setup. Quick version:

```bash
# Env vars (set once at event start)
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
- Print the live URL
- Remind user to smoke test

## If deploy fails:
- Check Dockerfile builds locally: `docker build -t test .`
- Check `npm run build` succeeds
- Common issues:
  - Missing env vars → set with `--set-env-vars` or Secret Manager
  - Port mismatch → ensure Dockerfile EXPOSE matches `--port`
  - Build OOM → increase `--memory` to 1Gi
