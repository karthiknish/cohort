# Engineering guardrails

## Security and env

See [security-and-env.md](security-and-env.md) for screen-recording auth bypass, CI placeholders, Better Auth origin requirements, and `TrustedHtml` usage.

## Local / CI commands

| Command | Purpose |
|---------|---------|
| `bun run lint` | Biome (config slice) + Oxlint on `src` and `convex` |
| `bun run typecheck` | App TypeScript (`tsconfig.json`) |
| `bun run convex:typecheck` | Convex TypeScript (hermetic; uses committed `convex/_generated`) |
| `bun run convex:typecheck:codegen` | Regenerate Convex types from deployment, then typecheck |
| `bun run convex:codegen` | Sync `convex/_generated` from linked deployment (local only) |
| `bun run ci:check` | Full static gate (lint + app + convex typecheck) |
| `bun run test` | Vitest unit/integration |
| `bun run ci:build` | Production Next.js build |
| `bun run prepush` | Pre-push hook gate (`ci:check` + `ci:test`) |
| `bun run release:gate` | Pre-release gate (adds `ci:build`) |

Git hooks (Husky), versioning, and tagging: [release.md](release.md).

## Health endpoints

- `GET /api/health` — public liveness (`status`, `timestamp`)
- `GET /api/health/ready` — detailed readiness; admin session or `Authorization: Bearer $HEALTH_CHECK_SECRET`

## Do not commit

Root audit dumps (`lint_output.txt`, `tsc_output.txt`, etc.) are gitignored. Use CI logs, not saved text files.

## E2E

- `bun run test:a11y` — Playwright (agent mode a11y + smoke)
- Set `PLAYWRIGHT_BASE_URL` to run live-app tests against an existing server.
