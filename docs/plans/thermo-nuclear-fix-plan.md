# Thermo-nuclear fix plan

Tracking file for the [thermo-nuclear code quality review](.) on the working tree (2026-05-23). Goal: every module under ~1k lines, clear boundaries, and green typecheck/Convex deploy.

## Status legend

- [x] Done
- [~] Partial
- [ ] Pending

## Completed

| Item | Was | Now |
|------|-----|-----|
| [x] `src/lib/slugify.ts` + archive scheduling | duplicated slugify | shared lib + `artifactArchiveSchedule` |
| [x] `use-ads-connections.ts` | ~1022 | composer + hooks (~197) |
| [x] `meta-ads/creatives/` | ~1274 | `creatives/*` modules |
| [x] `convex/workforce/` | ~1246 | `workforce/*` + barrel |
| [x] `message-pane-sections/` | ~1130 | bundle + viewport modules |
| [x] `unified-inbox-sections/` | ~1045 | pane + DM utils modules |
| [x] `agent-message-data/` | 1015 | `types`, `helpers`, `charts`, `sections` |
| [x] `unified-message-pane-sections/` | 907 | 5 components (max ~393 lines) |
| [x] `convex/adsCreatives` | 937 | `adsCreativesActions/*` + barrel `adsCreatives.ts` |
| [~] `audience-control-section-controller.ts` | 950 | ~868; `audience-control-aggregate.ts` + `audience-control-location-markers.ts` |
| [x] `campaign-insights-page-sections.tsx` | 913 | types + state + hook + sections (max ~407) |
| [x] `cohorts-spreadsheet-charts.ts` | 912 | `chart-specs` (610) + `chart-render` (317) |

## In progress / remaining

| Priority | File | Lines | Action |
|----------|------|-------|--------|
| P1 | `audience-control-section-controller.ts` | ~868 | Extract persist + draft handler hooks |
| P1 | `use-create-creative-dialog.ts` | 818 | Split state / submit / media hooks |
| P1 | `use-in-site-meeting-room-controller.ts` | 867 | Split media, presence, transcript hooks |
| P3 | `unified-inbox-sections/*` | — | Optional shared import barrel for panes |

## Verification

```bash
bun run typecheck
bunx convex dev --once
bun test src/shared/components/agent-mode/agent-message-data.test.ts
bun test src/features/dashboard/collaboration/components/message-pane-sections.test.tsx
bun test src/features/dashboard/collaboration/components/unified-inbox-sections.test.tsx
```

## Convex note

Do **not** use `convex/adsCreatives/` as a folder name alongside `convex/adsCreatives.ts` — Convex merges them and duplicate exports fail deploy. Implementation lives in `convex/adsCreativesActions/`; the public API stays `api.adsCreatives.*`.
