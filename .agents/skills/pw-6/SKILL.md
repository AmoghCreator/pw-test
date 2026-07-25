---
name: "pw-6"
description: "Prompt 6: Security hardening + Test coverage boost (20 min budget)"
mode: "agent"
---
# /pw-6 — Security + Testing

**Time budget: 20 min. Split: 8 min security, 12 min testing.**

Read: `MAIN_STRATEGY.md` for priority adjustments.

## SECURITY (8 min)

### Audit checklist:
1. **API key safety:**
   ```bash
   grep -r "AIza" src/        # must find nothing
   grep -r "NEXT_PUBLIC_GEMINI" .  # must find nothing
   ```
   - Confirm `.env.local` in `.gitignore`
   - Confirm `getSecret()` is the only key access

2. **Input validation:**
   - All strings: trimmed + `maxLength` from constants
   - All numbers: `min`/`max` range
   - Missing required fields → 400 (not 500)

3. **Output safety:**
   - No `dangerouslySetInnerHTML`
   - Gemini response ALWAYS through Zod before use
   - Error responses: generic message only (no stack traces)

4. **Headers** (verify in `next.config.ts`):
   ```typescript
   headers: [
     { key: 'X-Content-Type-Options', value: 'nosniff' },
     { key: 'X-Frame-Options', value: 'DENY' },
     { key: 'X-XSS-Protection', value: '1; mode=block' },
     { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
   ]
   ```

5. **Firestore rules:** Client can only read own docs, no writes.

## TESTING (12 min)

### Unit tests to add (`src/lib/validators.test.ts`):
- Valid input → parses OK
- Missing required field → ZodError
- String over maxLength → ZodError
- Invalid enum value → ZodError
- Extra unknown fields → stripped safely

### Additional route tests:
- Unauthenticated (no userId) → 401
- Boundary: input at exact max length → 200

### E2E tests (`tests/app-flow.spec.ts`):
- Fill form → submit → result appears
- Error state displays correctly

### Accessibility test (`tests/a11y.spec.ts`):
- Page loads → zero axe-core violations

## Verification:
```bash
npm run lint
npm test
npm run test:e2e
node scripts/score-check.mjs
```

## Output:
Print score-check results. "Run /pw-7 for accessibility + code quality pass."
