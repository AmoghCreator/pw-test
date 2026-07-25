---
name: "pw-4"
description: "Prompt 4: Firebase Auth + Firestore client + Analytics (15 min budget)"
mode: "agent"
---
# /pw-4 — Auth + Firestore + Analytics

**Time budget: 15 min.**

Read: `src/lib/firebase.ts`, `src/lib/types.ts`, `CLAUDE.md`

## Build:

### 1. Firebase Auth (Google Sign-In)
- Sign-in button with `signInWithPopup`
- Show user avatar + email after auth
- `aria-label` on auth button, `aria-busy` during sign-in
- Pass `userId` to API route

### 2. Firestore Client (History)
- Query user's past results: `where('userId', '==', uid)`, `orderBy('createdAt', 'desc')`, `limit(5)`
- Show as clickable list — reload past result on click
- Handle empty state gracefully

### 3. Firebase Analytics
- `logEvent('generate_start')` on form submit
- `logEvent('generate_complete')` on result received
- `logEvent('history_item_clicked')` on past result load

### 4. Firestore Rules (update `firestore.rules`)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /results/{docId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow write: if false; // server-only writes via API route
    }
  }
}
```

## Verification:
```bash
npm run lint
npm run build
```

## Output:
Print: "Auth + Firestore wired. Run /pw-5 to deploy and get your FIRST SUBMISSION in."
