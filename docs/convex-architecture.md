# Convex backend layout

## Current state

- **Schema** is modular under `convex/schema/` (workspace, collaboration, marketing, ops, system).
- **Shared helpers** live in `convex/lib/` and `convex/betterAuth/`.
- **Product functions** live under `convex/domains/<area>/` with thin root shims (`convex/*.ts` re-export) so the public API path is unchanged (`api.tasks.*`, etc.).
- **Entry/config** stays at convex root: `schema.ts`, `http.ts`, `crons.ts`, `convex.config.ts`, `functions.ts`, `errors.ts`, `files.ts`, `r2.ts`.

```
convex/
  schema/              # table definitions
  lib/                 # shared helpers
  betterAuth/
  domains/
    workspace/         # clients, projects, tasks, imports
    collaboration/     # channels, messages, DMs
    marketing/         # ads, analytics, social integrations
    ops/               # proposals, meetings, notifications
    platform/          # admin, auth, agent, migrations
  *.ts                 # root API shims → domains/*
  _generated/
```

## Domains

| Domain | Examples |
|--------|----------|
| `workspace` | `clients`, `projects`, `tasks`, document import |
| `collaboration` | `collaborationChannels`, `collaborationMessages`, `directMessages` |
| `marketing` | `adsCampaigns`, `adsIntegrations`, `socialIntegrations` |
| `ops` | `proposals`, `meetings`, `notifications` |
| `platform` | `auth`, `adminUsers`, `agentActions`, `health` |

Nested folders (e.g. `domains/workspace/tasks/listFilters.ts`) use **relative imports within the folder** (`./tasks/...`). Cross-domain imports go through **root shims** (`../../notificationTargeting`) or explicit paths (`../platform/agentActions/...`).

## Rules

1. New functions go under `convex/domains/<area>/`.
2. Add or keep a root shim: `export * from './domains/<area>/<module>'`.
3. Cross-domain calls use `internal.*` and workspace auth (`zWorkspace*`, `requireWorkspaceAccess`).
4. Imports to convex root (`errors`, `functions`, `lib/`, `_generated`) must use correct `../` depth from the file location.

## Tooling

- Migrate (one-time): `node scripts/migrate-convex-domains.mjs`
- Fix import depths after move: `node scripts/fix-convex-domain-imports.mjs` (only touches `convex/domains/`)
- Typecheck: `bun run convex:typecheck`

## Related

- Auth wrappers: `convex/functions.ts`, `convex/lib/functions/zodWrappers.ts`
- File access: `convex/lib/storageAccess.ts`, `convex/files.ts`
