'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, DragEvent, KeyboardEvent, MouseEvent } from 'react'
import type { EmojiClickData } from 'emoji-picker-react'

import type { ClientTeamMember } from '@/types/clients'

import { buildMentionMarkup } from '../utils/mentions'
import {
  RichComposerMentionMenu,
  RichComposerTextareaShell,
  RichComposerToolbar,
} from './rich-composer-sections'

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
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.slice(0, start) + emojiData.emoji + value.slice(end)
    onChange(newValue)

    requestAnimationFrame(() => {
      const newCursor = start + emojiData.emoji.length
      textarea.setSelectionRange(newCursor, newCursor)
      textarea.focus()
    })
  }, [value, onChange])

  const uniqueParticipants = useMemo(() => {
    const map = new Map<string, ClientTeamMember>()
    participants.forEach((participant) => {
      const key = participant.name.trim().toLowerCase()
      if (!key) return
      if (!map.has(key)) {
        map.set(key, participant)
      }
    })
    return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name))
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
      .filter((participant) => {
        const role = participant.role?.toLowerCase() ?? ''
        return participant.name.toLowerCase().includes(normalizedQuery) || role.includes(normalizedQuery)
      })
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
              const wrapped = `\n\n\`\`\`\n${blockPlaceholder}\n\`\`\`\n`
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
            const wrapped = `\`${inlinePlaceholder}\``
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
          const preceding = index > 0 ? (currentValue[index - 1] ?? ' ') : ' '
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
      const markup = `${buildMentionMarkup(name)} `
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
      <RichComposerToolbar
        disabled={disabled}
        emojiPickerOpen={emojiPickerOpen}
        hasAttachments={hasAttachments}
        onAction={handleFormattingAction}
        onAttachClick={onAttachClick}
        onEmojiClick={handleEmojiClick}
        onInsertMention={() => {
          const textarea = textareaRef.current
          if (!textarea) {
            return
          }
          applyTextUpdate((current, selectionStart, selectionEnd) => {
            const insertionPoint = selectionStart === selectionEnd ? selectionStart : selectionEnd
            const nextValue = `${current.slice(0, insertionPoint)}@${current.slice(insertionPoint)}`
            const nextCaret = insertionPoint + 1
            return {
              nextValue,
              nextSelectionStart: nextCaret,
              nextSelectionEnd: nextCaret,
            }
          })
        }}
        onOpenEmojiChange={setEmojiPickerOpen}
        onVoiceTranscript={(transcript) => onChange(value + (value && !value.endsWith(' ') ? ' ' : '') + transcript)}
      />
      <RichComposerTextareaShell
        disabled={disabled}
        isDraggingOver={isDraggingOver}
        onBlur={handleBlur}
        onChange={handleInputChange}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOverInternal}
        onDrop={handleDropInternal}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
        textareaRef={textareaRef}
        value={value}
      />
      {mentionState.active ? (
        <RichComposerMentionMenu
          highlightedMention={highlightedMention}
          mentionQuery={mentionState.query}
          mentionResults={mentionResults}
          onMentionClick={handleMentionClick}
          onMentionMouseDown={handleMentionMouseDown}
        />
      ) : null}
    </div>
  )
}
