'use client'

import { useEffect, useCallback, useRef } from 'react'

type KeyCombo = string // e.g., 'ctrl+k', 'cmd+shift+p', 'escape'

interface KeyboardShortcut {
  combo: KeyCombo | KeyCombo[]
  callback: (event: KeyboardEvent) => void
  description?: string
  enabled?: boolean
  preventDefault?: boolean
}

interface UseKeyboardShortcutOptions {
  enabled?: boolean
  targetRef?: React.RefObject<HTMLElement>
}

// Parse key combo string into parts
function parseCombo(combo: string): { modifiers: Set<string>; key: string } {
  const parts = combo.toLowerCase().split('+').map((p) => p.trim())
  const key = parts.pop() || ''
  const modifiers = new Set(parts)
  
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)

  // Normalize modifiers
  if (modifiers.has('mod')) {
    modifiers.delete('mod')
    modifiers.add(isMac ? 'meta' : 'ctrl')
  }

  if (modifiers.has('cmd') || modifiers.has('meta')) {
    modifiers.delete('cmd')
    modifiers.delete('meta')
    modifiers.add('meta')
  }
  
  return { modifiers, key }
}

// Check if event matches the combo
function matchesCombo(event: KeyboardEvent, combo: string): boolean {
  const { modifiers, key } = parseCombo(combo)
  
  const eventKey = event.key.toLowerCase()
  const eventModifiers = new Set<string>()
  
  if (event.ctrlKey) eventModifiers.add('ctrl')
  if (event.metaKey) eventModifiers.add('meta')
  if (event.shiftKey) eventModifiers.add('shift')
  if (event.altKey) eventModifiers.add('alt')
  
  // Check key match
  const keyMatches = 
    eventKey === key ||
    event.code.toLowerCase() === key ||
    event.code.toLowerCase() === `key${key}`
  
  // Check modifiers match exactly
  const modifiersMatch = 
    modifiers.size === eventModifiers.size &&
    [...modifiers].every((m) => eventModifiers.has(m))
  
  return keyMatches && modifiersMatch
}

export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  options: UseKeyboardShortcutOptions = {}
) {
  const { enabled = true, targetRef } = options
  const callbackRef = useRef(shortcut.callback)
  
  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = shortcut.callback
  }, [shortcut.callback])
  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || shortcut.enabled === false) return
      
      // Skip if user is typing in an input/textarea (unless explicitly targeting)
      const target = event.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                      target.isContentEditable
      
      // Allow escape key even in inputs
      const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo]
      const isEscape = combos.some((c) => c.toLowerCase() === 'escape')
      
      if (isInput && !isEscape) return
      
      for (const combo of combos) {
        if (matchesCombo(event, combo)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          callbackRef.current(event)
          return
        }
      }
    },
    [enabled, shortcut.combo, shortcut.enabled, shortcut.preventDefault]
  )
  
  useEffect(() => {
    const target = targetRef?.current || document
    target.addEventListener('keydown', handleKeyDown as EventListener)
    
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [handleKeyDown, targetRef])
}

// Hook for multiple shortcuts
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutOptions = {}
) {
  const { enabled = true, targetRef } = options
  
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return
      
      const target = event.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                      target.isContentEditable
      
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue
        
        const combos = Array.isArray(shortcut.combo) ? shortcut.combo : [shortcut.combo]
        const isEscape = combos.some((c) => c.toLowerCase() === 'escape')
        
        if (isInput && !isEscape) continue
        
        for (const combo of combos) {
          if (matchesCombo(event, combo)) {
            if (shortcut.preventDefault !== false) {
              event.preventDefault()
            }
            shortcut.callback(event)
            return
          }
        }
      }
    },
    [enabled, shortcuts]
  )
  
  useEffect(() => {
    const target = targetRef?.current || document
    target.addEventListener('keydown', handleKeyDown as EventListener)
    
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [handleKeyDown, targetRef])
}

// Common keyboard shortcuts for the app
export const APP_SHORTCUTS = {
  SEARCH: 'mod+k',
  NEW_ITEM: 'mod+n',
  SAVE: 'mod+s',
  ESCAPE: 'escape',
  HELP: 'shift+?',
  NAVIGATE_BACK: ['mod+[', 'alt+left'],
  NAVIGATE_FORWARD: ['mod+]', 'alt+right'],
} as const

// Format key combo for display
export function formatKeyCombo(combo: string): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  
  return combo
    .split('+')
    .map((part) => {
      const p = part.toLowerCase().trim()
      if (p === 'mod') return isMac ? '⌘' : 'Ctrl'
      if (p === 'cmd' || p === 'meta') return isMac ? '⌘' : 'Ctrl'
      if (p === 'ctrl') return isMac ? '⌃' : 'Ctrl'
      if (p === 'alt') return isMac ? '⌥' : 'Alt'
      if (p === 'shift') return isMac ? '⇧' : 'Shift'
      if (p === 'escape') return 'Esc'
      if (p === 'enter') return '↵'
      if (p === 'backspace') return '⌫'
      if (p === 'delete') return '⌦'
      if (p === 'tab') return '⇥'
      if (p === 'space') return '␣'
      if (p === 'up') return '↑'
      if (p === 'down') return '↓'
      if (p === 'left') return '←'
      if (p === 'right') return '→'
      return p.toUpperCase()
    })
    .join(isMac ? '' : '+')
}

// Component to display keyboard shortcut
export function KeyboardShortcutBadge({ combo, className }: { combo: string; className?: string }) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const parts = combo.split('+')
  
  return (
    <kbd className={`inline-flex items-center gap-0.5 ${className || ''}`}>
      {parts.map((part, i) => {
        const p = part.toLowerCase().trim()
        let display = p.toUpperCase()
        
        if (p === 'mod') display = isMac ? '⌘' : 'Ctrl'
        else if (p === 'cmd' || p === 'meta') display = isMac ? '⌘' : 'Ctrl'
        else if (p === 'ctrl') display = isMac ? '⌃' : 'Ctrl'
        else if (p === 'alt') display = isMac ? '⌥' : 'Alt'
        else if (p === 'shift') display = isMac ? '⇧' : 'Shift'
        
        return (
          <span
            key={i}
            className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-muted-foreground/30 bg-muted px-1 text-[10px] font-medium text-muted-foreground"
          >
            {display}
          </span>
        )
      })}
    </kbd>
  )
}
