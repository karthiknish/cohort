## Engineering guardrails

- CI: `bun run ci:check` (lint covers `src` + `convex`; `convex:typecheck` is hermetic).
- Git hooks: Husky runs `lint-staged` on commit, `commitlint` on message, `bun run prepush` before push. Pre-release: `bun run release:gate`. See [docs/release.md](docs/release.md).
- Docs: [docs/engineering-guardrails.md](docs/engineering-guardrails.md), [docs/convex-architecture.md](docs/convex-architecture.md).
- E2E smoke: `bun run test:e2e:smoke` (public routes always; set `PLAYWRIGHT_E2E_EMAIL` for auth flows).

## Motion and micro-interactions

- Import CSS tokens and Framer presets from `@/lib/motion` (not `framer-motion` directly).
- Use `@/shared/ui/motion-primitives` (`MotionCard`, `MotionPressable`, `MotionList`, `motionListItemClassName`) for interactive cards and lists.
- Use `@/shared/ui/animate-in` (`FadeIn`, `FadeInStagger`) for in-page section reveals.
- Use `@/shared/ui/page-transition` for routes (`ShellRouteTransition` in `template.tsx`, `PageMotionShell` at feature page roots).
- Set `PageMotionShell` `reveal={false}` when the route segment already has `ShellRouteTransition`.
- Prefer `listItemEnterClass` over inline `animate-in fade-in slide-in-from-bottom-*` strings.
- Respect `prefers-reduced-motion` via `MotionProvider` and `motion-reduce:` utility classes.

## Errors and warnings

**Convex:** Throw user-facing failures with `Errors.*` from `convex/errors.ts` (`ConvexError` + `code` + `message`). Do not use bare `throw new Error` in production handlers. Use `withErrorHandling` in actions for rate limits, OCC, and read limits.

**Frontend:**
- Transient mutation failures: `reportConvexFailure({ error, context, title?, fallbackMessage? })` from `@/lib/handle-convex-error` (or `notifyFailure` from `@/lib/notifications`).
- Recoverable cautions: `notifyWarning` — not `useToast({ variant: 'warning' })` for new code.
- Persistent query/load failures: inline destructive `Alert` + `useConvexQueryError` from `@/lib/hooks/use-convex-query-error`.
- Parse messages with `asErrorMessage` from `@/lib/convex-errors`; log with `logError` before toasts.
- Brevo/alerts/webhook failures are ops-level (logged / `{ success: false }`); surface `notifyFailure` only when a UI action directly triggers send and the caller handles the result.

**Admin pages:** Use `useAdminActionError` + `AdminActionErrorAlert` for mutation failures; `useConvexQueryError` + `AdminQueryErrorAlert` for load failures. See `src/features/admin/hooks/use-admin-action-error.ts` and `src/features/admin/components/`.

## Notification preferences

- Use V2 prefs from `@/lib/notifications/preferences` (`normalizePreferences`, `isChannelEnabled`, `kindToCategory`).
- Settings UI lives at `/settings?tab=notifications` (`NotificationPreferencesPanel` + category matrix).
- In-app feed filters by `categories.*.inApp` and `pauseAll` in `convex/notifications.ts` (read-time, not at create).
- Email gating uses the same V2 model in `brevo.ts`, `alerts/processor.ts`, and collaboration webhook paths.
