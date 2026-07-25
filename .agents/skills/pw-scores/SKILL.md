---
name: "pw-scores"
description: "Record warmup scores and analyze judge behavior"
mode: "agent"
---
# Record Warmup Scores & Analyze

The user will paste their warmup submission scores. Your job:

1. **Update `warmup-results.json`** with the scores they provide
2. **Run `node scripts/warmup-analyze.mjs`** to generate MAIN_STRATEGY.md
3. **Summarize findings** for the user

## Ask the user for:
- Scores for each criterion (codeQuality, problemAlignment, security, efficiency, testing, accessibility, googleServices)
- Total score
- Any judge comments/feedback text (CRITICAL — paste exact words)
- Which submission attempt this was (1, 2, or 3)

## After recording:

Run the analyzer and report:
- 🔴 CRITICAL gaps (score < 90)
- 🟡 Improvement areas (score 90-95)  
- 🟢 Maintain (score > 95)

## Key question to answer:
> "What is THIS judge strict about, and what can we exploit in the main phase?"

If the user has multiple submission scores, record ALL of them — the delta between attempts tells us what changes the judge rewards.

## Output:
- Updated warmup-results.json
- Generated MAIN_STRATEGY.md
- 3-line summary: "Judge is strict on X, lenient on Y, exploit Z"
