---
name: "pw-submit"
description: "Final submission prep - clean, verify, deploy, submit"
mode: "agent"
---
# /pw-submit — Final Submission

**This is your LAST action. Make it count.**

## Step 1: Verify .gitignore hides strategy files

These are already in `.gitignore` and won't be in the repo:
- `PLAYBOOK.md`, `PROBLEM_STATEMENT.md`, `MAIN_STRATEGY.md`
- `warmup-results.json`, `.github/prompts/`

Verify with:
```bash
git status
```
None of the strategy files should appear. If any do, they were committed earlier — run:
```bash
git rm --cached PLAYBOOK.md PROBLEM_STATEMENT.md MAIN_STRATEGY.md warmup-results.json
git rm --cached -r .github/prompts/
```

Keep in repo: `CLAUDE.md`, `AGENTS.md`, `REQUIREMENTS.md`, `README.md`

## Step 2: Final verification
```bash
npm run lint          # 0 errors, 0 warnings
npm test             # all pass
npm run build        # exits 0
```

ALL THREE MUST PASS. If any fails, fix it NOW.

## Step 3: Deploy
```bash
docker build -t ${REGISTRY}/${APP_NAME}:latest . && \
docker push ${REGISTRY}/${APP_NAME}:latest && \
gcloud run deploy ${APP_NAME} \
  --image ${REGISTRY}/${APP_NAME}:latest \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port=3000
```

## Step 4: Smoke test live URL
- Load the page
- Complete the main user flow
- Verify results appear
- Check console for errors

## Step 5: Submit the repo URL

## Output:
```
✅ FINAL SUBMISSION COMPLETE
🔗 Live URL: [deployed URL]
📊 Self-score estimate: XX/100
🎯 Strongest: [criterion]
⚠️ Weakest: [criterion]

Good luck! 🏆
```
