# Firebase legacy setup (archived)

The product stack is **Convex + Better Auth + R2**. Firebase rules and env vars below are kept for reference only (expense/finance legacy paths, historical deployments).

## Historical stack

- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Socket.io (removed from active architecture)

## Firebase setup (reference)

1. Install the Firebase CLI and log in:

```bash
bun add -g firebase-tools
firebase login
```

2. Configure service account credentials:

```bash
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Or set `FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY` with the full JSON payload.

3. Optional analytics:

```bash
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

4. Deploy rules (if still maintaining a Firebase project):

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

## Expense receipt uploads (legacy note)

Older finance flows referenced Firebase Storage paths such as `users/{uid}/expenses/...`. New uploads use Convex R2 via `convex/r2.ts` and scoped file access in `convex/files.ts`.
