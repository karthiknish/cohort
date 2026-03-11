## UX debt manifest

### 1. Accessibility semantics

#### Open findings

- `dangerouslySetInnerHTML` appears in:
  - `src/components/ui/chart.tsx`
  - `src/app/dashboard/collaboration/components/code-block.tsx`
- non-semantic click targets / explicit button roles remain in:
  - proposal step content
  - task list / kanban surfaces
  - activity item cards
  - pinned / collapsed thread / image gallery collaboration surfaces
  - shared image uploader
- icon-only actions still need explicit accessible-name verification across `35` button usages

#### Remediation rule

- prefer native `button` / `a` / `label` over clickable containers
- require icon-only controls to expose `aria-label`, `aria-labelledby`, `title`, or sr-only text
- keep `dangerouslySetInnerHTML` behind explicit trusted/sanitized boundaries only

### 2. Focus + keyboard

#### Open findings

- `outline-none` patterns still appear in `34` locations
- focus styles are still inconsistent across older dashboard/task/collaboration components
- dialog and popover escape/focus-return behavior still needs a full route audit

#### Remediation rule

- no hidden focus without a `focus-visible` replacement
- use shared focus-ring utilities for core primitives
- keyboard traversal must remain visible and deterministic in every main pane

### 3. Loading / empty / error feedback

#### Open findings

- collaboration historical chat / threads / pinned / media still need stronger deterministic states
- task comments and task creation reconciliation still need consistency work
- meetings/socials/proposals still have partial state-feedback gaps

#### Remediation rule

- every async surface should resolve to one of: `loading | empty | error | ready`
- loading states should be announced politely; error states should be announced assertively

### 4. Complexity + performance churn

#### Open findings from React Doctor

- large component hotspots in collaboration, proposals, tasks, auth, meetings, admin
- clustered local state in message/task/proposal surfaces
- heavy chart imports still block some routes

#### Remediation rule

- split high-churn sections into focused subcomponents
- prefer reducer-based local state when multiple related setters move together
- defer heavy charts and event-like effects where possible

### 5. Priority execution order

1. shared UI primitives and global interaction rules
2. collaboration
3. tasks
4. meetings + proposals + socials
5. final performance / consistency sweep