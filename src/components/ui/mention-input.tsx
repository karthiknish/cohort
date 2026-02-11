'use client'

import React, { useCallback, useMemo, useRef, useState, useEffect, forwardRef } from 'react'
import { X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

export interface MentionableUser {
  id: string
  name: string
  email?: string
  role?: string
  avatar?: string
}

export interface MentionInputProps {
  value: string
  onChange: (value: string, mentions: MentionableUser[]) => void
  users: MentionableUser[]
  placeholder?: string
  disabled?: boolean
  className?: string
  inputClassName?: string
  label?: string
  maxMentions?: number
  allowMultiple?: boolean
  singleSelect?: boolean
}

interface MentionState {
  active: boolean
  startIndex: number
  query: string
}

const DEFAULT_MENTION_STATE: MentionState = {
  active: false,
  startIndex: -1,
  query: '',
}

const MAX_MENTION_RESULTS = 50

export const MentionInput = forwardRef<HTMLInputElement, MentionInputProps>(
  function MentionInput(
    {
      value,
      onChange,
      users,
      placeholder = 'Type @ to mention users...',
      disabled = false,
      className,
      inputClassName,
      label,
      maxMentions = 10,
      allowMultiple = true,
      singleSelect = false,
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [mentionState, setMentionState] = useState<MentionState>(DEFAULT_MENTION_STATE)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const [selectedMentions, setSelectedMentions] = useState<MentionableUser[]>([])

    useEffect(() => {
      const mentionRegex = /@\[([^\]]+)\]/g
      const mentions: MentionableUser[] = []
      let match

      while ((match = mentionRegex.exec(value)) !== null) {
        const name = match[1]
        const user = users.find((u) => u.name === name)
        if (user) {
          mentions.push(user)
        }
      }

      if (JSON.stringify(mentions) !== JSON.stringify(selectedMentions)) {
        setSelectedMentions(mentions)
      }
    }, [value, users, selectedMentions])

    const mentionResults = useMemo(() => {
      if (!mentionState.active) {
        return []
      }

      const normalizedQuery = mentionState.query.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(normalizedQuery) ||
          user.email?.toLowerCase().includes(normalizedQuery)
      )

      if (allowMultiple) {
        const selectedIds = new Set(selectedMentions.map((m) => m.id))
        return filtered.filter((user) => !selectedIds.has(user.id)).slice(0, MAX_MENTION_RESULTS)
      }

      return filtered.slice(0, MAX_MENTION_RESULTS)
    }, [mentionState, users, selectedMentions, allowMultiple])

    const resetMentionState = useCallback(() => {
      setMentionState(DEFAULT_MENTION_STATE)
      setHighlightedIndex(0)
    }, [])

    const detectMentionTrigger = useCallback(
      (currentValue: string, caretPosition: number) => {
        if (caretPosition === 0) {
          resetMentionState()
          return
        }

        const textBeforeCaret = currentValue.slice(0, caretPosition)
        const lastAtIndex = textBeforeCaret.lastIndexOf('@')

        if (lastAtIndex === -1) {
          resetMentionState()
          return
        }

        const textAfterAt = textBeforeCaret.slice(lastAtIndex + 1)
        if (textAfterAt.includes(' ')) {
          resetMentionState()
          return
        }

        const query = textAfterAt
        const nextState: MentionState = {
          active: true,
          startIndex: lastAtIndex,
          query,
        }

        setMentionState(nextState)
        setHighlightedIndex(0)
      },
      [resetMentionState]
    )

    const insertMention = useCallback(
      (user: MentionableUser) => {
        const input = inputRef.current
        if (!input) return

        const currentValue = value
        const selectionStart = input.selectionStart || 0

        const textBeforeCaret = currentValue.slice(0, selectionStart)
        const lastAtIndex = textBeforeCaret.lastIndexOf('@')

        if (lastAtIndex === -1) return

        const mentionText = `@[${user.name}]`
        const newMentions = [...selectedMentions, user]

        const beforeMention = currentValue.slice(0, lastAtIndex).trim()
        const afterMention = currentValue.slice(selectionStart).trim()

        if (allowMultiple) {
          const newValue = beforeMention + (beforeMention ? ' ' : '') + mentionText + ' ' + afterMention
          onChange(newValue.trim() + ' ', newMentions)
        } else {
          const newValue =
            currentValue.slice(0, lastAtIndex) + mentionText + currentValue.slice(selectionStart)
          onChange(newValue, newMentions)
        }

        resetMentionState()

        requestAnimationFrame(() => {
          input.focus()
        })
      },
      [value, selectedMentions, allowMultiple, onChange, resetMentionState]
    )

    const removeMention = useCallback(
      (userToRemove: MentionableUser) => {
        const mentionPattern = new RegExp(`@\\[${userToRemove.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\s*`)
        const newValue = value.replace(mentionPattern, '').trim()
        const newMentions = selectedMentions.filter((m) => m.id !== userToRemove.id)
        onChange(newValue, newMentions)
      },
      [value, selectedMentions, onChange]
    )

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        const caretPosition = event.target.selectionStart || newValue.length

        onChange(newValue, selectedMentions)
        detectMentionTrigger(newValue, caretPosition)
      },
      [onChange, selectedMentions, detectMentionTrigger]
    )

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!mentionState.active || mentionResults.length === 0) {
          if (event.key === 'Enter') {
            event.preventDefault()
          }
          return
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setHighlightedIndex((current) => (current + 1) % mentionResults.length)
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          setHighlightedIndex(
            (current) => (current - 1 + mentionResults.length) % mentionResults.length
          )
        } else if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault()
          const user = mentionResults[highlightedIndex]
          if (user) {
            insertMention(user)
          }
        } else if (event.key === 'Escape') {
          resetMentionState()
        }
      },
      [mentionState, mentionResults, highlightedIndex, insertMention, resetMentionState]
    )

    const handleUserSelect = useCallback(
      (user: MentionableUser) => {
        insertMention(user)
      },
      [insertMention]
    )

    const showDropdown = mentionState.active && mentionResults.length > 0

    return (
      <div className={cn('space-y-2', className)}>
        {label && <label className="text-sm font-medium">{label}</label>}

        {selectedMentions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedMentions.map((mention) => (
              <div
                key={mention.id}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
              >
                <User className="h-3 w-3" />
                <span>{mention.name}</span>
                {!singleSelect && (
                  <button
                    type="button"
                    onClick={() => removeMention(mention)}
                    className="hover:text-destructive transition-colors"
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <Input
            ref={(node) => {
              inputRef.current = node
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                ref.current = node
              }
            }}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn('h-11 rounded-lg', inputClassName)}
          />

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-muted/60 bg-popover shadow-lg">
              <p className="px-3 py-1.5 text-xs font-medium uppercase text-muted-foreground border-b">
                Select user
              </p>
              <div className="max-h-52 overflow-y-auto">
                {mentionResults.map((user, index) => (
                  <button
                    key={user.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleUserSelect(user)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                      index === highlightedIndex
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      {user.role && (
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedMentions.length >= maxMentions && (
          <p className="text-xs text-muted-foreground">
            Maximum {maxMentions} mentions allowed
          </p>
        )}
      </div>
    )
  }
)

export default MentionInput
