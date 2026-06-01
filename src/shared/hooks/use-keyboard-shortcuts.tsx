'use client';
import { useEffect, useEffectEvent, useRef } from 'react';
type KeyCombo = string; // e.g., 'ctrl+k', 'cmd+shift+p', 'escape'
interface KeyboardShortcut {
    combo: KeyCombo | KeyCombo[];
    callback: (event: KeyboardEvent) => void;
    description?: string;
    enabled?: boolean;
    preventDefault?: boolean;
}
interface UseKeyboardShortcutOptions {
    enabled?: boolean;
    targetRef?: React.RefObject<HTMLElement>;
    allowInInput?: boolean;
}
type SequenceState = {
    progress: number;
    lastMatchedAt: number;
};
const SEQUENCE_TIMEOUT_MS = 1200;
// Parse key combo string into parts
function parseCombo(combo: string): {
    modifiers: Set<string>;
    key: string;
} {
    const parts = combo.toLowerCase().split('+').map((p) => p.trim());
    const key = parts.pop() || '';
    const modifiers = new Set(parts);
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    // Normalize modifiers
    if (modifiers.has('mod')) {
        modifiers.delete('mod');
        modifiers.add(isMac ? 'meta' : 'ctrl');
    }
    if (modifiers.has('cmd') || modifiers.has('meta')) {
        modifiers.delete('cmd');
        modifiers.delete('meta');
        modifiers.add('meta');
    }
    return { modifiers, key };
}
// Check if event matches the combo
function matchesCombo(event: KeyboardEvent, combo: string): boolean {
    const { modifiers, key } = parseCombo(combo);
    const eventKey = event.key.toLowerCase();
    const eventModifiers = new Set<string>();
    if (event.ctrlKey)
        eventModifiers.add('ctrl');
    if (event.metaKey)
        eventModifiers.add('meta');
    if (event.shiftKey)
        eventModifiers.add('shift');
    if (event.altKey)
        eventModifiers.add('alt');
    // Check key match
    const keyMatches = eventKey === key ||
        event.code.toLowerCase() === key ||
        event.code.toLowerCase() === `key${key}`;
    // Check modifiers match exactly
    const modifiersMatch = modifiers.size === eventModifiers.size &&
        [...modifiers].every((m) => eventModifiers.has(m));
    return keyMatches && modifiersMatch;
}
function getSequenceSteps(combo: string): string[] {
    return combo
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}
function matchesShortcutCombo(event: KeyboardEvent, combo: string, sequenceStates: Map<string, SequenceState>, stateKey: string): 'none' | 'partial' | 'complete' {
    const steps = getSequenceSteps(combo);
    const firstStep = steps[0];
    if (!firstStep) {
        sequenceStates.delete(stateKey);
        return 'none';
    }
    const state = sequenceStates.get(stateKey);
    const now = Date.now();
    const resetProgress = !state || (now - state.lastMatchedAt) > SEQUENCE_TIMEOUT_MS ? 0 : state.progress;
    const expectedStep = steps[resetProgress] ?? firstStep;
    if (matchesCombo(event, expectedStep)) {
        if (steps.length === 1 || resetProgress === steps.length - 1) {
            sequenceStates.delete(stateKey);
            return 'complete';
        }
        sequenceStates.set(stateKey, {
            progress: resetProgress + 1,
            lastMatchedAt: now,
        });
        return 'partial';
    }
    if (resetProgress > 0 && matchesCombo(event, firstStep)) {
        if (steps.length === 1) {
            sequenceStates.delete(stateKey);
            return 'complete';
        }
        sequenceStates.set(stateKey, {
            progress: 1,
            lastMatchedAt: now,
        });
        return 'partial';
    }
    if (resetProgress > 0) {
        sequenceStates.delete(stateKey);
    }
    return 'none';
}
export function useKeyboardShortcut(shortcut: KeyboardShortcut, options: UseKeyboardShortcutOptions = {}) {
    const { enabled = true, targetRef, allowInInput = false } = options;
    const callbackRef = useRef(shortcut.callback);
    const sequenceStatesRef = useRef(new Map<string, SequenceState>());
    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = shortcut.callback;
    }, [shortcut.callback]);
    const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
        if (!enabled || shortcut.enabled === false)
            return;
        // Skip if user is typing in an input/textarea (unless explicitly targeting)
        const target = event.target as HTMLElement;
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
            target.isContentEditable;
        // Allow escape key even in inputs
        const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo];
        const isEscape = combos.some((c) => c.toLowerCase() === 'escape');
        if (isInput && !isEscape && !allowInInput)
            return;
        for (const [comboIndex, combo] of combos.entries()) {
            const matchState = matchesShortcutCombo(event, combo, sequenceStatesRef.current, `${comboIndex}:${combo}`);
            if (matchState === 'partial') {
                if (shortcut.preventDefault !== false) {
                    event.preventDefault();
                }
                return;
            }
            if (matchState === 'complete') {
                if (shortcut.preventDefault !== false) {
                    event.preventDefault();
                }
                callbackRef.current(event);
                return;
            }
        }
    });
    useEffect(() => {
        const target = targetRef?.current || document;
        const listener = (event: Event) => handleKeyDown(event as KeyboardEvent);
        target.addEventListener('keydown', listener);
        return () => {
            target.removeEventListener('keydown', listener);
        };
    }, [allowInInput, enabled, shortcut.combo, shortcut.enabled, targetRef]);
}
// Hook for multiple shortcuts
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], options: UseKeyboardShortcutOptions = {}) {
    const { enabled = true, targetRef, allowInInput = false } = options;
    const sequenceStatesRef = useRef(new Map<string, SequenceState>());
    const shortcutsRef = useRef(shortcuts);
    shortcutsRef.current = shortcuts;
    const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
        if (!enabled)
            return;
        const target = event.target as HTMLElement;
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
            target.isContentEditable;
        for (const shortcut of shortcutsRef.current) {
            if (shortcut.enabled === false)
                continue;
            const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo];
            const isEscape = combos.some((c) => c.toLowerCase() === 'escape');
            if (isInput && !isEscape && !allowInInput)
                continue;
            for (const [comboIndex, combo] of combos.entries()) {
                const matchState = matchesShortcutCombo(event, combo, sequenceStatesRef.current, `${shortcut.description ?? shortcut.callback.name ?? 'shortcut'}:${comboIndex}:${combo}`);
                if (matchState === 'partial') {
                    if (shortcut.preventDefault !== false) {
                        event.preventDefault();
                    }
                    return;
                }
                if (matchState === 'complete') {
                    if (shortcut.preventDefault !== false) {
                        event.preventDefault();
                    }
                    shortcut.callback(event);
                    return;
                }
            }
        }
    });
    useEffect(() => {
        const target = targetRef?.current || document;
        const listener = (event: Event) => handleKeyDown(event as KeyboardEvent);
        target.addEventListener('keydown', listener);
        return () => {
            target.removeEventListener('keydown', listener);
        };
    }, [allowInInput, enabled, targetRef]);
}
// Component to display keyboard shortcut
export function KeyboardShortcutBadge({ combo, className }: {
    combo: string;
    className?: string;
}) {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const parts = combo.split('+');
    const tokenCounts = new Map<string, number>();
    return (<kbd className={`inline-flex items-center gap-0.5 ${className || ''}`}>
      {parts.map((part) => {
            const p = part.toLowerCase().trim();
            const occurrence = (tokenCounts.get(p) ?? 0) + 1;
            tokenCounts.set(p, occurrence);
            let display = p.toUpperCase();
            if (p === 'mod')
                display = isMac ? '⌘' : 'Ctrl';
            else if (p === 'cmd' || p === 'meta')
                display = isMac ? '⌘' : 'Ctrl';
            else if (p === 'ctrl')
                display = isMac ? '⌃' : 'Ctrl';
            else if (p === 'alt')
                display = isMac ? '⌥' : 'Alt';
            else if (p === 'shift')
                display = isMac ? '⇧' : 'Shift';
            return (<span key={`${p}-${occurrence}`} className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-muted-foreground/30 bg-muted px-1 text-[10px] font-medium text-muted-foreground">
            {display}
          </span>);
        })}
    </kbd>);
}
