<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

## Motion and micro-interactions

- Import CSS tokens and Framer presets from `@/lib/motion` (not `framer-motion` directly).
- Use `@/shared/ui/motion-primitives` (`MotionCard`, `MotionPressable`, `MotionList`, `motionListItemClassName`) for interactive cards and lists.
- Use `@/shared/ui/animate-in` (`FadeIn`, `FadeInStagger`) for in-page section reveals.
- Use `@/shared/ui/page-transition` for routes (`ShellRouteTransition` in `template.tsx`, `PageMotionShell` at feature page roots).
- Set `PageMotionShell` `reveal={false}` when the route segment already has `ShellRouteTransition`.
- Prefer `listItemEnterClass` over inline `animate-in fade-in slide-in-from-bottom-*` strings.
- Respect `prefers-reduced-motion` via `MotionProvider` and `motion-reduce:` utility classes.

## Notification preferences

- Use V2 prefs from `@/lib/notifications/preferences` (`normalizePreferences`, `isChannelEnabled`, `kindToCategory`).
- Settings UI lives at `/settings?tab=notifications` (`NotificationPreferencesPanel` + category matrix).
- In-app feed filters by `categories.*.inApp` and `pauseAll` in `convex/notifications.ts` (read-time, not at create).
- Email gating uses the same V2 model in `brevo.ts`, `alerts/processor.ts`, and collaboration webhook paths.
