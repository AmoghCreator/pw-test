---
name: "pw-3"
description: "Prompt 3: Frontend UI (30 min budget)"
mode: "agent"
---
# /pw-3 — Frontend UI

**Time budget: 30 min. Largest UI prompt.**

Read: `CLAUDE.md` (accessibility section), `src/lib/types.ts`, `REQUIREMENTS.md`
If exists: `MAIN_STRATEGY.md` (check accessibility/code quality flags)

## Build in this order:

### 1. `src/lib/api.ts` (client fetch wrapper)
- Single function: `generateResult(input): Promise<Output>`
- Handles errors with user-readable messages
- Only place `fetch()` is called in frontend

### 2. `src/components/InputForm.tsx`
- Controlled form
- Every input: `id` + `<label htmlFor>`
- Submit button: `aria-busy={isLoading}`
- Field errors: `role="alert"`
- No business logic — just collects input and calls `api.ts`

### 3. `src/components/ResultDisplay.tsx`
- Shows Gemini output in structured layout
- Uses `<article>`, `<section aria-label="">`, semantic lists
- Loading skeleton with `aria-busy="true"`
- `role="status" aria-live="polite"` for success state

### 4. `src/components/ErrorDisplay.tsx`
- `role="alert"` — announced immediately
- User-friendly message
- Retry button

### 5. `src/app/page.tsx`
- Orchestration ONLY — no fetch, no business logic
- States: form → loading → results | error
- Imports and composes the components above

## ACCESSIBILITY NON-NEGOTIABLES (check EVERY component):
- [ ] Every `<input>/<select>/<textarea>` → `id` + `<label htmlFor>`
- [ ] Error messages → `role="alert"`
- [ ] Loading/success → `role="status" aria-live="polite"`
- [ ] Semantic HTML: `<main>`, `<header>`, `<section>`, `<article>`
- [ ] Skip-to-content link works (already in layout.tsx)
- [ ] Focus rings visible
- [ ] Icon-only buttons have `aria-label`
- [ ] No color-only status indicators

## If MAIN_STRATEGY.md says accessibility is weak:
- Run `npx playwright test tests/a11y.spec.ts` AFTER building each component
- Fix violations immediately, don't batch

## Verification:
```bash
npm run lint
npm run build
```

## Output:
Print: "Frontend done. Run /pw-4 for auth + Firestore wiring."
