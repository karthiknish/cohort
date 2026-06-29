"""Round 2 react-doctor fixes:
1. Fix rules-of-hooks lint my prior fixes introduced (useEffectEvent called outside useEffect)
2. Add 'use no memo' directive at TanStack useVirtualizer CALL sites
3. Strip 24 useMemo/useCallback wrappers (React Compiler does this for you)
"""

def apply(path, old, new, allow_count=None):
    with open(path, 'r') as f:
        src = f.read()
    if old not in src:
        print(f'  [SKIP] {path}: old not found')
        return False
    cnt = src.count(old)
    if allow_count is not None and cnt != allow_count:
        print(f'  [SKIP] {path}: matches {cnt}, expected {allow_count}')
        return False
    if cnt > 1 and allow_count is None:
        print(f'  [SKIP] {path}: old matches {cnt} times')
        return False
    src = src.replace(old, new, 1)
    with open(path, 'w') as f:
        f.write(src)
    print(f'  [OK]   {path}')
    return True


# === 1. rules-of-hooks fixes: revert useEffectEvent to useEffect for prevProps callback ===

# use-task-comments-panel.tsx: replace useEffectEvent-driven notifyCount with useEffect
# and drop the unused import.
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

# Drop the useEffectEvent import that is no longer used.
apply(
    'src/features/dashboard/tasks/use-task-comments-panel.tsx',
    "import { useCallback, useEffect, useEffectEvent, useMemo, useReducer, useRef } from 'react';",
    "import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';",
)

# use-pull-to-refresh.tsx: replace useEffectEvent-driven syncState with a focused
# useEffect that writes-through on every render via the prior-value check inside
# event handlers (the actual usages).
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


# === 2. incompatible-library: add 'use no memo' inside the components that
# call TanStack useVirtualizer (line numbers in lint refer to call site, not import) ===

# activity-list-sections.tsx: the function body holding useVirtualizer call.
apply(
    'src/features/dashboard/activity/components/activity-list-sections.tsx',
    """export function useActivityListData({ activities, typeFilter, searchQuery, statusFilter, sortBy, }: ActivityListDataProps) {""",
    """export function useActivityListData({ activities, typeFilter, searchQuery, statusFilter, sortBy, }: ActivityListDataProps) {
    // TanStack useVirtualizer uses interior mutability and breaks React Compiler
    // memoization; opt this hook out of compilation per eslint-plugin-react-hooks
    // /incompatible-library validation prompt.
    // eslint-disable-next-line react-compiler/react-compiler -- TanStack virtualizer is on the incompatible allowlist
    'use no memo';""",
)

# notifications-page-hooks.tsx: same treatment on useNotificationsPage.
apply(
    'src/features/dashboard/notifications/notifications-page-hooks.tsx',
    """export function useNotificationsPage() {""",
    """export function useNotificationsPage() {
    // TanStack useVirtualizer uses interior mutability and breaks React Compiler
    // memoization; opt this hook out of compilation per eslint-plugin-react-hooks
    // /incompatible-library validation prompt.
    // eslint-disable-next-line react-compiler/react-compiler -- TanStack virtualizer is on the incompatible allowlist
    'use no memo';""",
)


# === 3. Strip the 24 manual-memoization wrappers ===
#
# The fix per the rule prompt is to delete the wrapper and use the bare
# expression. We unwrap each occurrence individually so the surrounding
# formatting stays intact.

# creative-detail-page-client-controller.tsx: lines 67 & 128 (useCallback)
# Both patterns. Look at the structure of `const xy = useCallback(...)` in
# this file; helpers like `useCallback((...) => {...}, [deps])` get rewritten
# to `const xy = (...) => {...};` (we keep the assignment so other references
# stay valid).
import re

def strip_useCallback_wrappers(path):
    """Remove useCallback( from the JSX/hook wrappers (without deleting the
    inner body), so the lint reads them as plain const arrows."""
    with open(path, 'r') as f:
        src = f.read()
    # convert `const NAME = useCallback(` → `const NAME = (`
    # then leave the closing `, [deps])` so we must also strip the trailing [...]).
    # Simpler: use a regex that finds `useCallback(` and replaces with `(`,
    # then strips the trailing `, [...])` at the closing paren.
    # Pattern: const NAME = useCallback(<body>, <deps>) → const NAME = (<body>)
    # Use a recursive parser approach because bodies contain nested parens.
    out = []
    i = 0
    while i < len(src):
        idx = src.find('useCallback(', i)
        if idx == -1:
            out.append(src[i:])
            break
        out.append(src[i:idx + len('useCallback') - len('useCallback(')])
        # We just turned the call into a parenthesized expression: `(<body>, <deps>)`.
        # Now we need to find the matching close paren of the original useCallback(...)
        # and remove the trailing `, <deps>` before it.
        depth = 1
        j = idx + len('useCallback(')
        last_comma_depth = -1
        while j < len(src) and depth > 0:
            ch = src[j]
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
                if depth == 0:
                    break
            elif ch == ',' and depth == 1:
                # found top-level comma — last comma depth matches the deps arg
                last_comma_depth = j
            j += 1
        if depth != 0 or last_comma_depth == -1:
            # unmatched, bail
            out.append(src[idx:])
            break
        # emit body up to comma, drop deps and trailing )
        out.append('(')
        out.append(src[idx + len('useCallback('):last_comma_depth])
        out.append(')')
        i = j + 1
    new_src = ''.join(out)
    # also normalize the double parens we just emitted: `(() => { ... })` is fine.
    # But we may have created `((arrowParams) => {body})` followed by stray `]` or
    # dangling whitespace. Clean up trailing `])` and `[,]` and stray spaces.
    # Walk close-paren followed by `]` or `,` → drop.
    new_src = re.sub(r'\(\)\)\]?', lambda m: '()' , new_src)  # noop safety
    if new_src != src:
        # Each useCallback( should be removed exactly once per occurrence.
        # Count sanity check:
        before = src.count('useCallback(')
        after = new_src.count('useCallback(')
        if before != after + 1 and before - after != new_src.count('const XXX = (() '):
            print(f'  [WARN] {path}: useCallback removal before={before} after={after}')
        with open(path, 'w') as f:
            f.write(new_src)
        print(f'  [OK-strip] {path}')

def strip_useMemo_wrappers(path):
    with open(path, 'r') as f:
        src = f.read()
    out = []
    i = 0
    while i < len(src):
        idx = src.find('useMemo(', i)
        if idx == -1:
            out.append(src[i:])
            break
        # get name if `const NAME = useMemo(...)` so we can emit `const NAME = <expr>`.
        look_back = src[max(0, idx - 64):idx]
        m = re.search(r'(const\s+\w+\s*=\s*)$', look_back)
        prefix = look_back + ('' if m is None else '')
        out.append(src[i:idx])
        # if preceded by `const NAME = `, capture name
        depth = 1
        j = idx + len('useMemo(')
        last_comma_depth = -1
        while j < len(src) and depth > 0:
            ch = src[j]
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
                if depth == 0:
                    break
            elif ch == ',' and depth == 1:
                last_comma_depth = j
            j += 1
        if depth != 0 or last_comma_depth == -1:
            out.append(src[idx:])
            break
        # emit `(<body>)` and skip the trailing deps `, [...])`
        if 'const ' in src[max(0, idx - 32):idx]:
            # rewrite as `const NAME = (<body>);`
            out.append('(')
            out.append(src[idx + len('useMemo('):last_comma_depth])
            out.append(')')
        else:
            out.append(src[idx:idx + len('useMemo')])
            out.append('(')
            out.append(src[idx + len('useMemo('):last_comma_depth])
            out.append(')')
        i = j + 1
    new_src = ''.join(out)
    if new_src != src:
        with open(path, 'w') as f:
            f.write(new_src)
        print(f'  [OK-memo] {path}')


for f in [
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
]:
    strip_useCallback_wrappers(f)

# Files with useMemo (per diagnostics above)
for f in [
    'src/features/dashboard/ads/components/use-campaign-management-card.tsx',
    'src/shared/ui/trusted-html.tsx',
]:
    strip_useMemo_wrappers(f)


print('---done---')
