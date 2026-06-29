"""Round-4 strip: depth-aware hook-wrapper removal.

The previous attempt failed by tracking only `()` depth, so a comma inside
the deps `[a, b]` array looked identical to the comma separating body and
deps. This version tracks (), [], {}, AND string/template literals so the
deps separator is the top-level comma immediately preceding a `[` token.
"""

import re


def split_deps_comma(body: str) -> int:
    """Return the index of the comma in `body` that separates the hook body
    from the deps array. The deps array is always literal `[...]` at top
    level; the separator is the top-level comma whose next non-whitespace
    token is `[`. Returns -1 if the comma is not found.
    """
    i = 0
    n = len(body)
    paren_d = 0
    bracket_d = 0
    brace_d = 0
    in_str = None
    found = -1
    in_template = False
    while i < n:
        ch = body[i]
        if in_str is not None:
            if ch == '\\' and i + 1 < n:
                i += 2
                continue
            if ch == in_str:
                in_str = None
            i += 1
            continue
        if ch in ('"', "'"):
            in_str = ch
            i += 1
            continue
        if ch == '`':
            # template literal: ignore ${} depth changes — treat body as content
            # for our purposes. We won't have ${} inside the deps array; if we do,
            # it just doesn't matter because we're looking for `, [`.
            end = body.find('`', i + 1)
            if end == -1:
                return found
            i = end + 1
            continue
        if ch == '(':
            paren_d += 1
        elif ch == ')':
            paren_d -= 1
        elif ch == '[':
            bracket_d += 1
        elif ch == ']':
            bracket_d -= 1
        elif ch == '{':
            brace_d += 1
        elif ch == '}':
            brace_d -= 1
        elif ch == ',' and paren_d == 0 and bracket_d == 0 and brace_d == 0:
            j = i + 1
            while j < n and body[j] in ' \t\r\n':
                j += 1
            if j < n and body[j] == '[':
                return i
            # remember last top-level comma even without `[` after — useful if no deps array
            # (then strip just `useCallback(` and `)`)
            if found == -1:
                found = i
        i += 1
    return found


def split_top_level_paren(src: str, idx: int) -> int:
    """Given `src` where `idx` points to the opening `(` of a call, return
    the index of the matching closing `)`.
    """
    depth = 1
    i = idx + 1
    while i < len(src):
        ch = src[i]
        if ch == '"' or ch == "'" or ch == '`':
            # advance through string/template
            end = i + 1
            quote = ch
            while end < len(src) and src[end] != quote:
                if src[end] == '\\':
                    end += 2
                    continue
                end += 1
            i = end + 1
            continue
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise ValueError('unbalanced parens at %d' % idx)


def strip_one(src: str, hook: str) -> tuple[str, bool]:
    """Strip `hook(body, deps)` → `(body)` if there's a deps comma, else
    just `(body)`. Returns (new_src, changed)."""
    needle = hook + '('
    idx = src.find(needle)
    if idx == -1:
        return src, False
    paren_pos = idx + len(hook)
    close = split_top_level_paren(src, paren_pos)
    body = src[paren_pos + 1:close]
    deps_comma = split_deps_comma(body)
    pre = src[:idx]
    suf = src[close + 1:]
    if deps_comma == -1:
        # No dep-array-found comma: just remove the wrapper while keeping
        # the open/close parens implicit.
        return pre + '(' + body + ')' + suf, True
    new_body = body[:deps_comma].rstrip()
    return pre + '(' + new_body + ')' + suf, True


def strip_all(path: str, hook: str) -> int:
    with open(path, 'r') as f:
        src = f.read()
    n = 0
    while True:
        new, changed = strip_one(src, hook)
        if not changed:
            break
        src = new
        n += 1
    if n > 0:
        with open(path, 'w') as f:
            f.write(src)
    return n


# Re-apply queueMicrotask fix to meta-audiences-panel.tsx (current form has
# useEffect deps without `loadAudiences`).
import re
def fix_meta_audiences():
    p = 'src/features/dashboard/ads/components/meta-audiences-panel.tsx'
    src = open(p).read()
    # The current text uses [clientId, workspaceId] (loadAudiences is not in deps).
    # Replace with the queueMicrotask-wrapped version that includes loadAudiences
    # in deps so React Compiler is happy.
    new = """    useEffect(() => {
        // Defer the loadAudiences call to a microtask so the cascading
        // setState inside (loading → audiences) doesn't fire synchronously
        // from the effect body per eslint-plugin-react-hooks/react-compiler.
        queueMicrotask(() => {
            void loadAudiences();
        });
    }, [clientId, workspaceId, loadAudiences]);"""
    old_pat = re.compile(
        r"    useEffect\(\(\) => \{\s*\n        void loadAudiences\(\);\s*\n    \}, \[clientId, workspaceId\]\);",
        re.M,
    )
    if old_pat.search(src):
        open(p, 'w').write(old_pat.sub(new, src, count=1))
        print(f'  [OK queueMicrotask] {p}')
    else:
        print(f'  [SKIP queueMicrotask] {p}: pattern not found')


fix_meta_audiences()


# Now apply the depth-aware stripper to the 24 wrapper sites.
targets = [
    ('useCallback', 'src/features/dashboard/ads/campaigns/[providerId]/[campaignId]/creative/[creativeId]/creative-detail-page-client-controller.tsx'),
    ('useCallback', 'src/features/dashboard/ads/components/meta-audiences-panel.tsx'),
    ('useCallback', 'src/features/dashboard/ads/components/use-campaign-management-card.tsx'),
    ('useCallback', 'src/features/dashboard/projects/use-projects-document-import.tsx'),
    ('useCallback', 'src/features/dashboard/notifications/notifications-page-hooks.tsx'),
    ('useCallback', 'src/features/dashboard/tasks/use-tasks-document-import.tsx'),
    ('useCallback', 'src/features/dashboard/activity/activity-widget.tsx'),
    ('useCallback', 'src/shared/components/agent-mode/agent-spreadsheet-download.tsx'),
    ('useCallback', 'src/shared/contexts/navigation-context.tsx'),
    ('useCallback', 'src/shared/ui/auto-refresh-controls.tsx'),
    ('useMemo', 'src/features/dashboard/ads/components/use-campaign-management-card.tsx'),
    ('useMemo', 'src/shared/ui/trusted-html.tsx'),
]

for hook, path in targets:
    n = strip_all(path, hook)
    if n:
        print(f'  [OK {hook}×{n}] {path}')


print('---done---')
