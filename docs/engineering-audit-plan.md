# Engineering audit remediation plan

Status as of 2026-05-24.

| Step | Item | Status | Notes |
|------|------|--------|-------|
| 0 | Security fixes (workspace actions, file URLs, health split, milestones, tests) | Done | Prior session |
| 1 | Guardrails | Done | `ci:check` lints `src` + `convex`; hermetic `convex:typecheck`; removed stale `*_output.txt` |
| 2 | README | Done | Convex/Better Auth canonical; Firebase → `docs/archive/firebase-legacy.md` |
| 3 | Migration shims | Done | Removed empty `src/services/proposal-*.ts` stubs |
| 4 | Ignore policy | Done | Stopped ignoring `/scripts/` and integration doc; ignore audit dumps only |
| 5 | Convex structure | Documented | `docs/convex-architecture.md` — incremental domain folders (not bulk move yet) |
| 6 | E2E smoke | Done | `e2e/smoke/critical-paths.spec.ts` + `bun run test:e2e:smoke` |

## Next (not started)

- Bulk Convex root → `convex/domains/*` migration with re-exports
- Expand Biome `includes` beyond config files
- Oxlint on `scripts/` once tracked in git
- `PLAYWRIGHT_E2E_EMAIL` in CI secrets for authenticated smoke
- TypeScript: remove `ignoreDeprecations` when upgrading TS 6.x
- Knip/dead-code pass on `@deprecated` markers

## Commands

```bash
bun run ci:check
bun run test
bun run test:e2e:smoke          # starts dev server unless PLAYWRIGHT_SKIP_WEB_SERVER=1
```
