export const APP_SHORTCUTS = {
    SEARCH: 'mod+k',
    SHORTCUTS: 'shift+?',
    NEW_ITEM: 'mod+n',
    SAVE: 'mod+s',
    ESCAPE: 'escape',
    HELP: 'shift+?',
    NAVIGATE_BACK: ['mod+[', 'alt+left'],
    NAVIGATE_FORWARD: ['mod+]', 'alt+right'],
} as const;
export function formatKeyCombo(combo: string): string {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    return combo
        .split('+')
        .map((part) => {
        const p = part.toLowerCase().trim();
        if (p === 'mod')
            return isMac ? '⌘' : 'Ctrl';
        if (p === 'cmd' || p === 'meta')
            return isMac ? '⌘' : 'Ctrl';
        if (p === 'ctrl')
            return isMac ? '⌃' : 'Ctrl';
        if (p === 'alt')
            return isMac ? '⌥' : 'Alt';
        if (p === 'shift')
            return isMac ? '⇧' : 'Shift';
        if (p === 'escape')
            return 'Esc';
        if (p === 'enter')
            return '↵';
        if (p === 'backspace')
            return '⌫';
        if (p === 'delete')
            return '⌦';
        if (p === 'tab')
            return '⇥';
        if (p === 'space')
            return '␣';
        if (p === 'up')
            return '↑';
        if (p === 'down')
            return '↓';
        if (p === 'left')
            return '←';
        if (p === 'right')
            return '→';
        return p.toUpperCase();
    })
        .join(isMac ? '' : '+');
}
