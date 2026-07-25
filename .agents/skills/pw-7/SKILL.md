---
name: "pw-7"
description: "Prompt 7: Accessibility audit + Code quality pass (15 min budget)"
mode: "agent"
---
# /pw-7 — Accessibility + Code Quality

**Time budget: 15 min. Split: 7 min a11y, 8 min quality.**

## ACCESSIBILITY (7 min)

### Run axe-core:
```bash
npx playwright test tests/a11y.spec.ts
```

If violations exist, fix ALL of them. Re-run until 0 violations.

### Manual checklist (verify each):

**Form inputs:**
- [ ] Every `<input>/<select>/<textarea>`: `id` + `<label htmlFor>`
- [ ] Checkbox/radio groups: `<fieldset><legend>`
- [ ] Submit: `aria-busy={isLoading}`

**Results:**
- [ ] `<article>` or `<section aria-label="">`
- [ ] Icons: `aria-hidden="true"`
- [ ] Status badges: icon + text (never color alone)

**States:**
- [ ] Loading: `role="status" aria-live="polite" aria-busy="true"`
- [ ] Error: `role="alert"`

**Structure:**
- [ ] Skip-to-content is FIRST focusable
- [ ] `<main id="main-content">` wraps content
- [ ] Single `<h1>` per page
- [ ] Tab order logical

## CODE QUALITY (8 min)

### Sweep every file in `src/`:

1. **Function length** — any function > 20 lines → extract helper
2. **Type safety** — search for `any` → replace with specific type
3. **Return types** — every function has explicit annotation
4. **Dead code** — remove unused imports, variables, commented blocks
5. **console.log** — delete all (keep `console.error` in catch only)
6. **Constants** — any magic string/number → move to `constants.ts`
7. **Error pattern** — enforce:
   ```typescript
   catch (err) {
     const message = err instanceof Error ? err.message : 'Unknown error';
   }
   ```

### Verification:
```bash
npm run lint    # 0 errors, 0 warnings
npm test        # all pass
npm run build   # exits 0
node scripts/score-check.mjs  # all GREEN
```

## SUBMISSION 2:
If score-check is mostly green, deploy and submit now.
```
🚀 SUBMISSION 2 — Run /pw-5 deploy steps again
⏱️ ~30 min remaining for final polish
⏭️ Run /pw-8 for final README + polish
```
