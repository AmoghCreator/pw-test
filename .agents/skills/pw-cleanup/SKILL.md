---
name: "pw-cleanup"
description: "Final cleanup - remove all skill harness traces permanently (run AFTER final submission)"
mode: "agent"
---
# /pw-cleanup — Remove All Harness Traces

**Run this ONLY after your final submission is accepted and scored.**
**This is DESTRUCTIVE and IRREVERSIBLE.**

## What this removes:

### Strategy files:
```bash
rm -f PLAYBOOK.md
rm -f PROBLEM_STATEMENT.md
rm -f MAIN_STRATEGY.md
rm -f warmup-results.json
```

### Skill harness:
```bash
rm -rf .github/prompts/
```

### Scripts (keep score-check, remove warmup-analyze):
```bash
rm -f scripts/warmup-analyze.mjs
```

### Clean .gitignore (remove the harness section):
Remove the "Skill harness" block from `.gitignore`:
```
# Skill harness — never submitted to judge
PLAYBOOK.md
PROBLEM_STATEMENT.md
WARMUP_PHASE.md
MAIN_STRATEGY.md
warmup-results.json
.github/prompts/
scripts/warmup-analyze.mjs
```

### Verify nothing remains:
```bash
git status
git log --diff-filter=D --name-only  # check nothing was committed that shouldn't be
```

## After cleanup:
The repo should look like a clean hackathon submission:
- `CLAUDE.md`, `AGENTS.md` — agent instructions (judges like seeing these)
- `REQUIREMENTS.md` — feature checklist
- `README.md` — evaluation focus areas
- `src/`, `tests/`, `scripts/score-check.mjs` — the actual app
- No strategy files, no prompt files, no warmup artifacts

## Commit:
```bash
git add -A
git commit -m "chore: clean submission"
```
