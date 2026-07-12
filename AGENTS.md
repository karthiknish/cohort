## Production URL

- Production deployment: `https://cohort-omega-five.vercel.app`
- Test admin credentials for sign-in are stored in `.env.local` as `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` (gitignored). Use these when filling out the proposal form or running E2E flows against prod.

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

## Haptic feedback

- Import from `@/shared/lib/haptics` — never import `web-haptics` directly in app code.
- `HapticsProvider` is mounted in `__root.tsx` (wraps `MotionProvider`). It gates haptics by device support (`WebHaptics.isSupported`), a localStorage preference (`cohorts:haptics-enabled`), and `prefers-reduced-motion` (auto-disables).
- In React components use `useHaptics()` → `{ success, error, warning, selection, tick, buzz, impact, preset, trigger }`. In non-React code (e.g. `notifySuccess`) use the module helpers `hapticSuccess` / `hapticError` / `hapticWarning` / `hapticSelection` / `hapticImpact`.
- Semantic presets: `selection` (tabs/switches/checkboxes/radio), `impact('light'|'medium'|'heavy')` (button/card taps, long-press), `success`/`error`/`warning` (notifications, pull-to-refresh), `tick` (threshold cross). All calls no-op when inactive — safe to call unconditionally.
- Selection components (`Switch`, `Checkbox`, `Toggle`, `TabsTrigger`, `RadioGroupItem`) and `MotionPressable` already fire haptics; do not double-trigger in feature code that wraps them.
- Settings toggle lives at `/settings?tab=profile` (`HapticsPreferencesCard`).

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

## PPTX slide generation

- **Never repeat images across slides.** `prefetchSlideImages` in `src/services/pexels-images.ts` performs cross-topic deduplication via `usedSourceUrls` — every slide must receive a unique photo. When adding new slide layouts or image sources, thread images through the same dedup pool; do not call `getImageForTopic` directly from individual slide functions.
- **Side images are the most visible repetition risk.** Content slides that place an image on the right column (`addContentSlide` layout 0) or as a full-bleed background (layout 1) must use the pre-assigned image from `slideImages[imageIdx]`, not a freshly fetched one.
- **No Cohorts logo on slide footers.** The closing slide footer should show "Prepared for {client}" text only — no brand logo image. The title slide may keep the logo in the top-right corner.
- Slide structure: title → TOC → section dividers + content slides → services/budget/ROI → closing. Image topics are built in `index.ts` in the same order as slides are added.

## PDF deck generation

- Custom PDF is generated with jsPDF in `src/services/pdf/` — mirrors the PPTX deck structure (title → TOC → sections → services/budget/ROI → closing) with the same Cohorts brand theme (colors in `pdf/constants.ts` match `pptx/constants.ts`).
- Landscape 16:9 format (960×540pt). Chart images are fetched from the same QuickChart API as PPTX and embedded as PNGs.
- PDF and PPTX are generated sequentially in `convex/domains/ops/proposalGeneration.ts` (PPTX first, then PDF) and stored as separate R2 artifacts (`deck.pptx` + `deck.pdf`). PDF failure is non-fatal — PPTX is still served and a warning is surfaced to the user.
- `sanitizeDeckProviderWarnings` strips legacy vendor names (e.g. "Gamma" → "Presentation") so the UI never exposes them.

