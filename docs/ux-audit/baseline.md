## UX baseline — 2026-03-11

### React Doctor

- Command: `bunx react-doctor@latest . --verbose --diff`
- Score: `95 / 100`
- Warnings: `82`
- Files affected: `47 / 277 changed source files`

### Highest-signal React Doctor warning buckets

- clustered `useState` usage in large components
- `setState` calls grouped inside single `useEffect`
- oversized components that should be split into focused sections
- inline render helpers that block clean reconciliation
- heavy chart imports that should be deferred or dynamically loaded
- event-like logic currently living in `useEffect`

### Repo scan snapshot

- `transition-all`: `0` matches in `src`
- `outline-none`: `34` matches in `src`
- `dangerouslySetInnerHTML`: `2` matches in `src`
- non-semantic click targets / `[role="button"]`: `18` matches in `src`
- icon-sized `<Button size="icon" ...>` usages: `35` matches in `src`

### Notable hotspots seen in the baseline

- Collaboration: composer, unified message pane, inbox/media/thread surfaces
- Tasks: comments, list/kanban interaction surfaces
- Meetings: in-site room chat and room controls
- Proposals: step content and submitted state panels
- Shared UI: focus affordances, icon-only actions, async state consistency

### Phase 0/1 work already started

- added shared focus-ring utilities in `src/app/globals.css`
- normalized focus treatment in core UI primitives (`button`, `input`, `textarea`, `select`, `dialog`)
- added a typed async view-state contract in `src/components/ui/state-wrapper.tsx`
- added a dev-time accessibility guard for unlabeled icon-only buttons
- fixed first collaboration icon-button label gaps in composer/polls sections

### Next checkpoints

1. finish primitive/shared wrapper sweep
2. move into collaboration surface remediation
3. re-run React Doctor diff after each phase-sized change set
