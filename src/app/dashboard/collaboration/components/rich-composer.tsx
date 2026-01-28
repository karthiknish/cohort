'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, ComponentType, DragEvent, KeyboardEvent, MouseEvent } from 'react'
import { AtSign, Bold, Code, Italic, List, ListOrdered, Paperclip, Quote, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ClientTeamMember } from '@/types/clients'

import { cn } from '@/lib/utils'
import { buildMentionMarkup } from '../utils/mentions'

const MAX_MENTION_RESULTS = 6
const MENTION_TRIGGER_LOOKBACK = 40
const MENTION_UPDATE_DELAY_MS = 150

export type RichComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
  participants: ClientTeamMember[]
  onFocus?: () => void
  onBlur?: () => void
  onDrop?: (event: DragEvent<HTMLTextAreaElement>) => void
  onDragOver?: (event: DragEvent<HTMLTextAreaElement>) => void
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void
  onAttachClick?: () => void
  hasAttachments?: boolean
}

type FormattingAction = 'bold' | 'italic' | 'blockquote' | 'code' | 'unordered-list' | 'ordered-list'

type MentionState = {
  active: boolean
  startIndex: number
  query: string
}

const DEFAULT_MENTION_STATE: MentionState = {
  active: false,
  startIndex: -1,
  query: '',
}

export function RichComposer({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Share an update…',
  participants,
  onFocus,
  onBlur,
  onDrop,
  onDragOver,
  onPaste,
  onAttachClick,
  hasAttachments = false,
}: RichComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const mentionStateRef = useRef<MentionState>(DEFAULT_MENTION_STATE)
  const [mentionState, setMentionState] = useState<MentionState>(DEFAULT_MENTION_STATE)
  const [highlightedMention, setHighlightedMention] = useState(0)
  const mentionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const uniqueParticipants = useMemo(() => {
    const map = new Map<string, ClientTeamMember>()
    participants.forEach((participant) => {
      const key = participant.name.trim().toLowerCase()
      if (!key) return
      if (!map.has(key)) {
        map.set(key, participant)
      }
    })
    return Array.from(map.values())
  }, [participants])

  const mentionResults = useMemo(() => {
    if (!mentionState.active) {
      return []
    }

    const normalizedQuery = mentionState.query.trim().toLowerCase()
    if (!normalizedQuery) {
      return uniqueParticipants.slice(0, MAX_MENTION_RESULTS)
    }

    return uniqueParticipants
      .filter((participant) => participant.name.toLowerCase().includes(normalizedQuery))
      .slice(0, MAX_MENTION_RESULTS)
  }, [mentionState, uniqueParticipants])

  const resetMentionState = useCallback(() => {
    if (mentionTimeoutRef.current) {
      clearTimeout(mentionTimeoutRef.current)
      mentionTimeoutRef.current = null
    }
    mentionStateRef.current = DEFAULT_MENTION_STATE
    setMentionState(DEFAULT_MENTION_STATE)
    setHighlightedMention(0)
  }, [])

  const applyTextUpdate = useCallback(
    (
      updater: (
        currentValue: string,
        selectionStart: number,
        selectionEnd: number
      ) => {
        nextValue: string
        nextSelectionStart: number
        nextSelectionEnd: number
      }
    ) => {
      const textarea = textareaRef.current
      if (!textarea) {
        return
      }

      const { selectionStart, selectionEnd } = textarea
      const { nextValue, nextSelectionStart, nextSelectionEnd } = updater(value, selectionStart, selectionEnd)

      onChange(nextValue)

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd)
      })
    },
    [onChange, value]
  )

  const handleFormattingAction = useCallback(
    (action: FormattingAction) => {
      applyTextUpdate((current, selectionStart, selectionEnd) => {
        const selectedText = current.slice(selectionStart, selectionEnd)
        const noSelection = selectionStart === selectionEnd

        switch (action) {
          case 'bold': {
            const placeholder = selectedText || 'bold text'
            const wrapped = `**${placeholder}**`
            const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd)
            if (noSelection) {
              const startInside = selectionStart + 2
              const endInside = startInside + placeholder.length
              return {
                nextValue,
                nextSelectionStart: startInside,
                nextSelectionEnd: endInside,
              }
            }
            return {
              nextValue,
              nextSelectionStart: selectionStart,
              nextSelectionEnd: selectionStart + wrapped.length,
            }
          }
          case 'italic': {
            const placeholder = selectedText || 'emphasis'
            const wrapped = `*${placeholder}*`
            const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd)
            if (noSelection) {
              const startInside = selectionStart + 1
              const endInside = startInside + placeholder.length
              return {
                nextValue,
                nextSelectionStart: startInside,
                nextSelectionEnd: endInside,
              }
            }
            return {
              nextValue,
              nextSelectionStart: selectionStart,
              nextSelectionEnd: selectionStart + wrapped.length,
            }
          }
          case 'blockquote': {
            const lines = (selectedText || 'Quoted text').split('\n')
            const prefixed = lines.map((line) => (line ? `> ${line}` : '> ')).join('\n')
            const nextValue = current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd)
            const nextEnd = selectionStart + prefixed.length
            return {
              nextValue,
              nextSelectionStart: selectionStart,
              nextSelectionEnd: nextEnd,
            }
          }
          case 'code': {
            if (selectedText.includes('\n')) {
              const blockPlaceholder = selectedText || 'code block'
              const wrapped = '\n\n```\n' + blockPlaceholder + '\n```\n'
              const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd)
              const anchor = selectionStart + wrapped.indexOf('\n') + 3
              const nextEnd = anchor + blockPlaceholder.length
              return {
                nextValue,
                nextSelectionStart: anchor,
                nextSelectionEnd: nextEnd,
              }
            }
            const inlinePlaceholder = selectedText || 'inline code'
            const wrapped = '`' + inlinePlaceholder + '`'
            const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd)
            if (noSelection) {
              const startInside = selectionStart + 1
              const endInside = startInside + inlinePlaceholder.length
              return {
                nextValue,
                nextSelectionStart: startInside,
                nextSelectionEnd: endInside,
              }
            }
            return {
              nextValue,
              nextSelectionStart: selectionStart,
              nextSelectionEnd: selectionStart + wrapped.length,
            }
          }
          case 'unordered-list': {
            const lines = (selectedText || 'List item').split('\n')
            const prefixed = lines.map((line) => (line ? `- ${line}` : '- ')).join('\n')
            const nextValue = current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd)
            const nextEnd = selectionStart + prefixed.length
            return {
              nextValue,
              nextSelectionStart: selectionStart,
              nextSelectionEnd: nextEnd,
            }
          }
          case 'ordered-list': {
            const lines = (selectedText || 'List item').split('\n')
            const prefixed = lines.map((line, index) => `${index + 1}. ${line || 'Item'}`).join('\n')
            const nextValue = current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd)
            const nextEnd = selectionStart + prefixed.length
            return {
              nextValue,
              nextSelectionStart: selectionStart,
              nextSelectionEnd: nextEnd,
            }
          }
          default:
            return {
              nextValue: current,
              nextSelectionStart: selectionStart,
              nextSelectionEnd: selectionEnd,
            }
        }
      })
    },
    [applyTextUpdate]
  )

  const detectMentionTrigger = useCallback(
    (currentValue: string, caretPosition: number) => {
      if (caretPosition === 0) {
        resetMentionState()
        return
      }

      const start = Math.max(0, caretPosition - MENTION_TRIGGER_LOOKBACK)
      for (let index = caretPosition - 1; index >= start; index -= 1) {
        const char = currentValue[index]
        if (char === '@') {
          const preceding = index > 0 ? currentValue[index - 1]! : ' ' // Safe: we check index > 0
          if (!preceding.match(/[\s([{]/)) {
            break
          }
          const query = currentValue.slice(index + 1, caretPosition)
          if (query.includes(' ') || query.includes('\n')) {
            break
          }
          const nextState: MentionState = {
            active: true,
            startIndex: index,
            query,
          }
          mentionStateRef.current = nextState
          setMentionState(nextState)
          setHighlightedMention(0)
          return
        }

        if (char === '\n' || char === ' ' || char === '\t') {
          break
        }
      }

      if (mentionStateRef.current.active) {
        resetMentionState()
      }
    },
    [resetMentionState]
  )

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = event.target.value
      onChange(nextValue)

      if (mentionTimeoutRef.current) {
        clearTimeout(mentionTimeoutRef.current)
      }

      const caret = event.target.selectionStart ?? nextValue.length
      mentionTimeoutRef.current = setTimeout(() => {
        detectMentionTrigger(nextValue, caret)
      }, MENTION_UPDATE_DELAY_MS)
    },
    [detectMentionTrigger, onChange]
  )

  const insertMention = useCallback(
    (name: string) => {
      const textarea = textareaRef.current
      const state = mentionStateRef.current
      if (!textarea || !state.active) {
        return
      }

      const caretPosition = textarea.selectionStart
      const markup = buildMentionMarkup(name) + ' '
      const nextValue = value.slice(0, state.startIndex) + markup + value.slice(caretPosition)
      const nextCaret = state.startIndex + markup.length

      onChange(nextValue)

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(nextCaret, nextCaret)
      })

      resetMentionState()
    },
    [onChange, resetMentionState, value]
  )

  const handleMentionClick = useCallback((participant: ClientTeamMember) => {
    insertMention(participant.name)
  }, [insertMention])

  const handleMentionMouseDown = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionState.active && mentionResults.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setHighlightedMention((current) => (current + 1) % mentionResults.length)
          return
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          setHighlightedMention((current) => (current - 1 + mentionResults.length) % mentionResults.length)
          return
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault()
          const participant = mentionResults[highlightedMention] ?? mentionResults[0]
          if (participant) {
            insertMention(participant.name)
          }
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          resetMentionState()
          return
        }
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        onSend()
        resetMentionState()
      }
    },
    [highlightedMention, insertMention, mentionResults, mentionState.active, onSend, resetMentionState]
  )

  const handleBlur = useCallback(() => {
    if (mentionTimeoutRef.current) {
      clearTimeout(mentionTimeoutRef.current)
      mentionTimeoutRef.current = null
    }
    resetMentionState()
    setIsDraggingOver(false)
    onBlur?.()
  }, [onBlur, resetMentionState])

  const handleFocus = useCallback(() => {
    onFocus?.()
  }, [onFocus])

  const handleDragEnter = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    if (!disabled && event.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    // Only reset if leaving the textarea entirely (not entering a child element)
    const relatedTarget = event.relatedTarget as Node | null
    const target = event.currentTarget as Node
    if (!relatedTarget || !target.contains(relatedTarget)) {
      setIsDraggingOver(false)
    }
  }, [])

  const handleDragOverInternal = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    if (!disabled && event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy'
      setIsDraggingOver(true)
    } else {
      event.dataTransfer.dropEffect = 'none'
    }
    onDragOver?.(event)
  }, [disabled, onDragOver])

  const handleDropInternal = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
    onDrop?.(event)
  }, [onDrop])

  return (
    <div className="relative flex flex-col">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-muted/40 bg-muted/10 px-2 py-1.5 rounded-t-lg">
        <ComposerButton icon={Bold} label="Bold" onClick={() => handleFormattingAction('bold')} disabled={disabled} />
        <ComposerButton icon={Italic} label="Italic" onClick={() => handleFormattingAction('italic')} disabled={disabled} />
        <ComposerButton icon={Quote} label="Quote" onClick={() => handleFormattingAction('blockquote')} disabled={disabled} />
        <ComposerButton icon={Code} label="Code" onClick={() => handleFormattingAction('code')} disabled={disabled} />
        <ComposerButton
          icon={List}
          label="Bulleted list"
          onClick={() => handleFormattingAction('unordered-list')}
          disabled={disabled}
        />
        <ComposerButton
          icon={ListOrdered}
          label="Numbered list"
          onClick={() => handleFormattingAction('ordered-list')}
          disabled={disabled}
        />
        <ComposerButton
          icon={AtSign}
          label="Mention"
          onClick={() => {
            const textarea = textareaRef.current
            if (!textarea) {
              return
            }
            applyTextUpdate((current, selectionStart, selectionEnd) => {
              const insertionPoint = selectionStart === selectionEnd ? selectionStart : selectionEnd
              const nextValue = current.slice(0, insertionPoint) + '@' + current.slice(insertionPoint)
              const nextCaret = insertionPoint + 1
              return {
                nextValue,
                nextSelectionStart: nextCaret,
                nextSelectionEnd: nextCaret,
              }
            })
          }}
          disabled={disabled}
        />
        <div className="mx-1 h-4 w-px bg-muted/60" />
        {onAttachClick && (
          <Button
            type="button"
            size="sm"
            variant={hasAttachments ? 'secondary' : 'ghost'}
            onClick={onAttachClick}
            disabled={disabled}
            className={cn(
              "h-7 gap-1.5 px-2 text-xs hover:bg-background/50",
              hasAttachments && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <Paperclip className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Attach</span>
          </Button>
        )}
      </div>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          placeholder={placeholder}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onDrop={handleDropInternal}
          onDragOver={handleDragOverInternal}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onPaste={onPaste}
          disabled={disabled}
          maxLength={2000}
          className={cn(
            "min-h-[120px] resize-y border-0 shadow-none focus-visible:ring-0 bg-transparent p-3 rounded-b-lg rounded-t-none",
            isDraggingOver && "bg-primary/5"
          )}
        />
        {isDraggingOver && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10 rounded-b-lg">
            <div className="flex flex-col items-center gap-2 text-primary">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Drop files here to attach</span>
            </div>
          </div>
        )}
      </div>
      {mentionState.active && mentionResults.length > 0 && (
        <div className="absolute bottom-2 left-2 z-20 w-64 rounded-md border border-muted/60 bg-popover p-1 shadow-lg">
          <p className="px-2 py-1 text-xs font-medium uppercase text-muted-foreground">Mention teammate</p>
          <div className="max-h-52 overflow-y-auto">
            {mentionResults.map((participant, index) => {
              const isActive = index === highlightedMention
              return (
                <button
                  key={participant.name}
                  type="button"
                  onMouseDown={handleMentionMouseDown}
                  onClick={() => handleMentionClick(participant)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-sm transition',
                    isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}
                >
                  <span className="truncate">{participant.name}</span>
                  {participant.role ? <span className="text-xs text-muted-foreground">{participant.role}</span> : null}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

type ComposerButtonProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
}

function ComposerButton({ icon: Icon, label, onClick, disabled }: ComposerButtonProps) {
  const handleClick = useCallback(() => {
    if (disabled) {
      return
    }
    onClick()
  }, [disabled, onClick])

  return (
    <Button type="button" size="icon" variant="ghost" onClick={handleClick} disabled={disabled} className="h-7 w-7 hover:bg-background/50">
      <Icon className="h-3.5 w-3.5" />
      <span className="sr-only">{label}</span>
    </Button>
  )
}
