## UX verification checklist for touched files

### Required checks

- [ ] `bun --bun tsc -p tsconfig.json --noEmit --pretty false`
- [ ] targeted lint for touched files passes
- [ ] `bunx react-doctor@latest . --verbose --diff` shows no new errors for touched files

### Accessibility gates

- [ ] no new keyboard-inaccessible interactive controls
- [ ] no new icon-only actions without accessible names
- [ ] no hidden focus without `focus-visible` replacement
- [ ] dialogs preserve focus trap, escape, and focus restore behavior

### Async-state gates

- [ ] touched list/detail panes expose deterministic `loading | empty | error | ready` states
- [ ] retries and failure messaging are visible and understandable

### Manual route smoke checks

- [ ] `/dashboard/collaboration`
- [ ] `/dashboard/tasks`
- [ ] `/dashboard/meetings`
- [ ] `/dashboard/proposals`
- [ ] `/dashboard/socials`

### When a phase lands

- [ ] React Doctor diff captured
- [ ] keyboard pass completed on changed flows
- [ ] any remaining backend/data blockers documented before continuing
