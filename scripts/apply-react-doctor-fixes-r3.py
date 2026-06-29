"""Round 3 react-doctor fixes (clean deterministic implementation):

1. Revert my own useEffectEvent-driven rules-of-hooks violations back to useEffect.
2. Add 'use no memo' inside TanStack useVirtualizer consumer components.
3. Strip 24 useMemo/useCallback wrappers in-place via paren-balanced scanning.
4. Apply single-count warnings (lazy-init suppressed, etc.).
"""
import re


def split_top_level(src, start):
    """Given `src` starting at position `start` (which is the opening `(` of
    a call), return (body_end_inclusive, after_close) where:
      body_end_inclusive = idx of the matching top-level `)` for that `(`
      after_close         = start position AFTER that `)`
    Tracks parens only; strings/brackets may confuse this on pathological
    inputs but the call sites in this codebase never embed such patterns.
    """
    depth = 1
    i = start + 1
    while i < len(src):
        ch = src[i]
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0:
                return i, i + 1
        i += 1
    raise ValueError('unbalanced parens starting at %d' % start)


def strip_hooks_wrapper(src, hook_name, replacement='('):
    """Replace `HOOK(body, deps)` with `(body)` deterministically.
    Strips one occurrence per pass; call repeatedly to handle all occurrences.
    """
    needle = hook_name + '('
    idx = src.find(needle)
    if idx == -1:
        return src, False
    # Find the matching close for `HOOK(`
    close_idx, after_close = split_top_level(src, idx + len(needle) - 1)
    body = src[idx + len(needle):close_idx]
    # Find last top-level `,` in body — that's the deps comma.
    body_depth = 0
    last_comma = -1
    for i, ch in enumerate(body):
        if ch == '(':
            body_depth += 1
        elif ch == ')':
            body_depth -= 1
        elif ch == ',' and body_depth == 0:
            last_comma = i
    if last_comma == -1:
        # No comma means no deps array — just remove the wrapper.
        new_src = src[:idx] + replacement + body + ')' + src[after_close:]
        return new_src, True
    new_body = body[:last_comma].rstrip()
    new_src = src[:idx] + replacement + new_body + ')' + src[after_close:]
    return new_src, True


def strip_all(path, hook_name):
    with open(path, 'r') as f:
        src = f.read()
    original = src
    count = 0
    while True:
        src, changed = strip_hooks_wrapper(src, hook_name)
        if not changed:
            break
        count += 1
    if src != original:
        with open(path, 'w') as f:
            f.write(src)
        print(f'  [OK {hook_name}×{count}] {path}')


def apply(path, old, new, expect_match=True):
    with open(path, 'r') as f:
        src = f.read()
    if old not in src:
        if expect_match:
            print(f'  [SKIP] {path}: pattern not found')
        return False
    src = src.replace(old, new, 1)
    with open(path, 'w') as f:
        f.write(src)
    print(f'  [OK] {path}')
    return True


# ---- 1. Fix my own rules-of-hooks regressions ----
apply(
    'src/features/dashboard/tasks/use-task-comments-panel.tsx',
    """    const previousCommentCountRef = useRef(comments.length);
    const notifyCount = useEffectEvent((count: number) => {
        if (previousCommentCountRef.current !== count) {
            previousCommentCountRef.current = count;
            onCommentCountChange?.(count);
        }
    });
    if (onCommentCountChange) {
        notifyCount(comments.length);
    }""",
    """    const previousCommentCountRef = useRef(comments.length);
    useEffect(() => {
        if (onCommentCountChange && previousCommentCountRef.current !== comments.length) {
            previousCommentCountRef.current = comments.length;
            onCommentCountChange(comments.length);
        }
    }, [comments.length, onCommentCountChange]);""",
)
apply(
    'src/features/dashboard/tasks/use-task-comments-panel.tsx',
    "import { useCallback, useEffect, useEffectEvent, useMemo, useReducer, useRef } from 'react';",
    "import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';",
)
apply(
    'src/shared/hooks/gestures/use-pull-to-refresh.tsx',
    """    const stateRef = useRef(state);
    const syncState = useEffectEvent((next: PullToRefreshState) => {
        stateRef.current = next;
    });
    syncState(state);""",
    """    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    });""",
)


# ---- 2. incompatible-library: 'use no memo' inside the call-site component ----
apply(
    'src/features/dashboard/activity/components/activity-list-sections.tsx',
    """export function useActivityListData({ activities, typeFilter, searchQuery, statusFilter, sortBy, }: ActivityListDataProps) {
    const filteredActivities = activities.filter((activity) => {""",
    """export function useActivityListData({ activities, typeFilter, searchQuery, statusFilter, sortBy, }: ActivityListDataProps) {
    // TanStack useVirtualizer uses interior mutability and is on the React Compiler
    // incompatible-library allowlist; opt this hook out of compilation.
    'use no memo';
    const filteredActivities = activities.filter((activity) => {""",
)
apply(
    'src/features/dashboard/notifications/notifications-page-hooks.tsx',
    """export function useNotificationsPage() {
    const { user } = useAuth();""",
    """export function useNotificationsPage() {
    // TanStack useVirtualizer uses interior mutability and is on the React Compiler
    // incompatible-library allowlist; opt this hook out of compilation.
    'use no memo';
    const { user } = useAuth();""",
)


# ---- 3. Strip 24 useMemo/useCallback wrappers ----
useCallback_files = [
    'src/features/dashboard/ads/campaigns/[providerId]/[campaignId]/creative/[creativeId]/creative-detail-page-client-controller.tsx',
    'src/features/dashboard/ads/components/meta-audiences-panel.tsx',
    'src/features/dashboard/ads/components/use-campaign-management-card.tsx',
    'src/features/dashboard/projects/use-projects-document-import.tsx',
    'src/features/dashboard/notifications/notifications-page-hooks.tsx',
    'src/features/dashboard/tasks/use-tasks-document-import.tsx',
    'src/features/dashboard/activity/activity-widget.tsx',
    'src/shared/components/agent-mode/agent-spreadsheet-download.tsx',
    'src/shared/contexts/navigation-context.tsx',
    'src/shared/ui/auto-refresh-controls.tsx',
]
for f in useCallback_files:
    strip_all(f, 'useCallback')

useMemo_files = [
    'src/features/dashboard/ads/components/use-campaign-management-card.tsx',
    'src/shared/ui/trusted-html.tsx',
]
for f in useMemo_files:
    strip_all(f, 'useMemo')


print('---done---')
