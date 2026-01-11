# Convex backend (migration in progress)

This project is being migrated from Firebase (Auth/Firestore/Storage) to Convex.

## Configure

Add these to `.env.local`:

- `NEXT_PUBLIC_CONVEX_URL=https://grand-sparrow-698.convex.cloud`
- `NEXT_PUBLIC_CONVEX_HTTP_URL=https://grand-sparrow-698.convex.site`
- `CONVEX_DEPLOYMENT=grand-sparrow-698`

## Dev

- Start Convex: `npm run convex:dev`
- Start Next.js: `npm run dev`

## Migration approach

- Start with **new tables** in [schema.ts](schema.ts).
- Migrate one feature slice at a time (e.g. Finance → Expense Categories), keeping the rest on Firebase until the slice is complete.
- Once a slice is migrated, remove the old Firestore reads/writes and delete its rules/indexes.
