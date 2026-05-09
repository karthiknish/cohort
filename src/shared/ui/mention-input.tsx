'use client'

import { useCallback, useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type MouseEvent, type SyntheticEvent } from 'react'
import { User, X } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Input } from '@/shared/ui/input'
import { LiveRegion } from '@/shared/ui/live-region'
import { cn } from '@/lib/utils'

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

type MentionInputComponentProps = MentionInputProps & {
  ref?: React.Ref<HTMLInputElement>
}

const DEFAULT_MENTION_STATE: MentionState = {
  active: false,
  startIndex: -1,
  query: '',
}

const MAX_MENTION_RESULTS = 50

export function MentionInput(
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
    ref,
  }: MentionInputComponentProps
) {
    const inputId = useId()
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [mentionState, setMentionState] = useState<MentionState>(DEFAULT_MENTION_STATE)
    const [highlightedIndex, setHighlightedIndex] = useState(0)
    const usersByName = useMemo(() => {
      return new Map(users.map((user) => [user.name, user] as const))
    }, [users])

    const effectiveAllowMultiple = allowMultiple && !singleSelect
    const mentionLimit = Math.max(1, singleSelect ? 1 : maxMentions)

    const resolveMentionsFromValue = useCallback((nextValue: string) => {
      const mentionRegex = /@\[([^\]]+)\]/g
      const mentions: MentionableUser[] = []
      const seenIds = new Set<string>()
      let match = mentionRegex.exec(nextValue)

      while (match !== null) {
        const name = match[1]
        const user = usersByName.get(name)
        if (user && !seenIds.has(user.id)) {
          seenIds.add(user.id)
          mentions.push(user)
        }

        match = mentionRegex.exec(nextValue)
      }

      return mentions
    }, [usersByName])

    const selectedMentions = useMemo(() => {
      return resolveMentionsFromValue(value)
    }, [value, resolveMentionsFromValue])

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

      if (effectiveAllowMultiple) {
        if (selectedMentions.length >= mentionLimit) {
          return []
        }

        const selectedIds = new Set(selectedMentions.map((m) => m.id))
        return filtered.filter((user) => !selectedIds.has(user.id)).slice(0, MAX_MENTION_RESULTS)
      }

      return filtered.slice(0, MAX_MENTION_RESULTS)
    }, [mentionState, users, selectedMentions, effectiveAllowMultiple, mentionLimit])

    const effectiveHighlightedIndex = useMemo(() => {
      if (mentionResults.length === 0) {
        return 0
      }

      return highlightedIndex >= mentionResults.length ? 0 : highlightedIndex
    }, [highlightedIndex, mentionResults.length])

    const resetMentionState = useCallback(() => {
      setMentionState(DEFAULT_MENTION_STATE)
      setHighlightedIndex(0)
    }, [])

    const detectMentionTrigger = useCallback(
      (currentValue: string, caretPosition: number) => {
        if (caretPosition < 0) {
          resetMentionState()
          return
        }

        const textBeforeCaret = currentValue.slice(0, caretPosition)
        const lastAtIndex = textBeforeCaret.lastIndexOf('@')

        if (lastAtIndex === -1) {
          resetMentionState()
          return
        }

        const charBeforeAt = lastAtIndex > 0 ? (textBeforeCaret[lastAtIndex - 1] ?? '') : ''
        const hasValidBoundary =
          lastAtIndex === 0 ||
          /\s/.test(charBeforeAt) ||
          ['(', '[', '{', '"', "'", '`'].includes(charBeforeAt)

        if (!hasValidBoundary) {
          resetMentionState()
          return
        }

        const textAfterAt = textBeforeCaret.slice(lastAtIndex + 1)
        if (/\s|@|\[|\]/.test(textAfterAt)) {
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
        if (!input || disabled) return

        const currentValue = value
        const selectionStart = input.selectionStart ?? currentValue.length
        const mentionStartIndex =
          mentionState.startIndex >= 0
            ? mentionState.startIndex
            : currentValue.slice(0, selectionStart).lastIndexOf('@')

        if (mentionStartIndex === -1) {
          resetMentionState()
          return
        }

        const mentionText = `@[${user.name}]`
        const alreadySelected = selectedMentions.some((mention) => mention.id === user.id)

        if (effectiveAllowMultiple && !alreadySelected && selectedMentions.length >= mentionLimit) {
          resetMentionState()
          return
        }

        if (!effectiveAllowMultiple) {
          const newValue = `${mentionText} `
          onChange(newValue, [user])
          resetMentionState()

          requestAnimationFrame(() => {
            input.focus()
            input.setSelectionRange(newValue.length, newValue.length)
          })
          return
        }

        const beforeMention = currentValue.slice(0, mentionStartIndex)
        const afterMention = currentValue.slice(selectionStart)
        const needsLeadingSpace = beforeMention.length > 0 && !/\s$/.test(beforeMention)
        const needsTrailingSpace =
          afterMention.length === 0 || !/^[\s,.!?;:)\]}]/.test(afterMention)
        const insertion = `${needsLeadingSpace ? ' ' : ''}${mentionText}${needsTrailingSpace ? ' ' : ''}`

        const newValue = `${beforeMention}${insertion}${afterMention}`.replace(/[ \t]{2,}/g, ' ')
        const newMentions = resolveMentionsFromValue(newValue)
        const nextCaretPosition = beforeMention.length + insertion.length

        onChange(newValue, newMentions)

        resetMentionState()

        requestAnimationFrame(() => {
          input.focus()
          input.setSelectionRange(nextCaretPosition, nextCaretPosition)
        })
      },
      [
        value,
        disabled,
        mentionState.startIndex,
        selectedMentions,
        effectiveAllowMultiple,
        mentionLimit,
        onChange,
        resetMentionState,
        resolveMentionsFromValue,
      ]
    )

    const removeMention = useCallback(
      (userToRemove: MentionableUser) => {
        if (disabled) return

        const escapedName = userToRemove.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const mentionPattern = new RegExp(`@\\[${escapedName}\\]\\s*`, 'g')
        const newValue = value.replace(mentionPattern, '').replace(/[ \t]{2,}/g, ' ').trim()
        const newMentions = resolveMentionsFromValue(newValue)
        onChange(newValue, newMentions)
      },
      [disabled, value, resolveMentionsFromValue, onChange]
    )

    const handleInputChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        const caretPosition = event.target.selectionStart || newValue.length
        const newMentions = resolveMentionsFromValue(newValue)

        onChange(newValue, newMentions)
        detectMentionTrigger(newValue, caretPosition)
      },
      [onChange, resolveMentionsFromValue, detectMentionTrigger]
    )

    const handleInputSelect = useCallback(
      (event: SyntheticEvent<HTMLInputElement>) => {
        const caretPosition = event.currentTarget.selectionStart ?? event.currentTarget.value.length
        detectMentionTrigger(event.currentTarget.value, caretPosition)
      },
      [detectMentionTrigger]
    )

    const handleInputBlur = useCallback(() => {
      requestAnimationFrame(() => {
        const activeElement = document.activeElement
        if (!containerRef.current || !activeElement) {
          resetMentionState()
          return
        }

        if (!containerRef.current.contains(activeElement)) {
          resetMentionState()
        }
      })
    }, [resetMentionState])

    const handleInputFocus = useCallback(() => {
      const input = inputRef.current
      if (!input) return

      const caretPosition = input.selectionStart ?? value.length
      detectMentionTrigger(value, caretPosition)
    }, [value, detectMentionTrigger])

    const handleDropdownMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
    }, [])

    const handleUserSelect = useCallback(
      (user: MentionableUser) => {
        insertMention(user)
      },
      [insertMention]
    )

    const handleInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node

        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    const removeMentionHandlers = useMemo(
      () =>
        Object.fromEntries(
          selectedMentions.map((mention) => [mention.id, () => removeMention(mention)])
        ) as Record<string, () => void>,
      [removeMention, selectedMentions]
    )

    const mentionOptionHandlers = useMemo(
      () =>
        Object.fromEntries(
          mentionResults.map((user, index) => [user.id, {
            onClick: () => handleUserSelect(user),
            onMouseEnter: () => setHighlightedIndex(index),
          }])
        ) as Record<
          string,
          {
            onClick: () => void
            onMouseEnter: () => void
          }
        >,
      [handleUserSelect, mentionResults]
    )

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (!mentionState.active) {
          return
        }

        if (event.key === 'ArrowDown' && mentionResults.length > 0) {
          event.preventDefault()
          setHighlightedIndex((current) => (current + 1) % mentionResults.length)
        } else if (event.key === 'ArrowUp' && mentionResults.length > 0) {
          event.preventDefault()
          setHighlightedIndex(
            (current) => (current - 1 + mentionResults.length) % mentionResults.length
          )
        } else if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault()

          if (mentionResults.length > 0) {
            const user = mentionResults[effectiveHighlightedIndex]
            if (user) {
              insertMention(user)
            }
          } else {
            resetMentionState()
          }
        } else if (event.key === 'Escape') {
          event.preventDefault()
          resetMentionState()
        }
      },
      [mentionState, mentionResults, effectiveHighlightedIndex, insertMention, resetMentionState]
    )

    const hasReachedMentionLimit =
      effectiveAllowMultiple && selectedMentions.length >= mentionLimit

    const showDropdown = mentionState.active && !disabled
    const activeDescendantId = showDropdown && mentionResults.length > 0
      ? `${inputId}-option-${mentionResults[effectiveHighlightedIndex]?.id}`
      : undefined
    const mentionStatusId = `${inputId}-mention-status`
    const mentionInstructionsId = `${inputId}-mention-instructions`
    const mentionAnnouncement = useMemo(() => {
      if (!showDropdown) {
        return hasReachedMentionLimit
          ? `Mention limit reached. Maximum ${mentionLimit} mentions allowed.`
          : ''
      }

      if (hasReachedMentionLimit) {
        return 'Mention limit reached. Remove a mention to add another user.'
      }

      if (mentionResults.length === 0) {
        return mentionState.query.length > 0
          ? `No users found for ${mentionState.query}.`
          : 'Start typing to search users to mention.'
      }

      const activeUser = mentionResults[effectiveHighlightedIndex]
      return `${mentionResults.length} mention suggestions available.${activeUser ? ` ${activeUser.name} highlighted.` : ''}`
    }, [effectiveHighlightedIndex, hasReachedMentionLimit, mentionLimit, mentionResults, mentionState.query, showDropdown])

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium">
            {label}
          </label>
        )}

        {selectedMentions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedMentions.map((mention) => (
              <div
                key={mention.id}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-sm text-primary"
              >
                <User className="h-3 w-3" />
                <span>{mention.name}</span>
                <button
                  type="button"
                  onClick={removeMentionHandlers[mention.id]}
                  className="rounded-full p-0.5 text-primary/80 transition-colors hover:text-destructive"
                  disabled={disabled}
                  aria-label={`Remove ${mention.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div ref={containerRef} className="relative">
          <LiveRegion id={mentionStatusId} message={mentionAnnouncement} />
          <p id={mentionInstructionsId} className="sr-only">
            Type the at symbol to open mention suggestions. Use the arrow keys to move through suggestions and press Enter to select.
          </p>
          <Input
            ref={handleInputRef}
            id={inputId}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSelect={handleInputSelect}
            onClick={handleInputSelect}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            aria-autocomplete="list"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? `${inputId}-mentions` : undefined}
            aria-activedescendant={activeDescendantId}
            aria-describedby={`${mentionInstructionsId} ${mentionStatusId}`}
            className={cn('h-11 rounded-lg', inputClassName)}
          />

          {showDropdown && (
            <div
              id={`${inputId}-mentions`}
              role="listbox"
              aria-label="Mention suggestions"
              onMouseDown={handleDropdownMouseDown}
              className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-muted/60 bg-popover shadow-lg"
            >
              <p className="border-b px-3 py-1.5 text-xs font-medium uppercase text-muted-foreground">
                {hasReachedMentionLimit
                  ? `Mention limit reached (${mentionLimit})`
                  : mentionResults.length > 0
                    ? 'Select user'
                    : 'No matches'}
              </p>
              <div className="max-h-52 overflow-y-auto">
                {mentionResults.length > 0
                  ? mentionResults.map((user, index) => (
                      <button
                        key={user.id}
                        id={`${inputId}-option-${user.id}`}
                        type="button"
                        role="option"
                        aria-selected={index === effectiveHighlightedIndex}
                        onMouseEnter={mentionOptionHandlers[user.id]?.onMouseEnter}
                        onClick={mentionOptionHandlers[user.id]?.onClick}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                          index === effectiveHighlightedIndex
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        <Avatar className="h-7 w-7 shrink-0">
                          {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} className="object-cover" /> : null}
                          <AvatarFallback className="bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.role || user.email || 'Team member'}
                          </p>
                        </div>
                      </button>
                    ))
                  : (
                      <p className="px-3 py-2 text-sm text-muted-foreground">
                        {hasReachedMentionLimit
                          ? 'Remove a mention to add another user.'
                          : mentionState.query.length > 0
                            ? `No users found for "${mentionState.query}".`
                            : 'Start typing to search users.'}
                      </p>
                    )}
              </div>
              {mentionResults.length > 0 && (
                <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">
                  Use Up/Down to navigate, Enter to select, Esc to close.
                </p>
              )}
            </div>
          )}
        </div>

        {hasReachedMentionLimit && (
          <p className="text-xs text-muted-foreground">
            Maximum {mentionLimit} mentions allowed
          </p>
        )}
      </div>
    )
}
