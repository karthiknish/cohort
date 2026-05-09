'use client'

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import { AnimatePresence, domAnimation, LazyMotion } from '@/shared/ui/motion'

import type { AgentConversationSummary, AgentMessage, ConnectionStatus } from '@/shared/hooks/use-agent-mode'
import { useMentionData } from '@/shared/hooks/use-mention-data'
import { AGENT_ATTACHMENT_ACCEPT, type AgentAttachmentContext } from '@/lib/agent-attachments'
import type { AgentError } from '@/lib/agent-errors'

import {
  AgentModePanelContent,
  AgentModePanelShell,
  type AgentComposerSectionProps,
} from './agent-mode-panel-sections'
import { formatMention, type MentionItem } from './mention-dropdown'

interface AgentModePanelProps {
  isOpen: boolean
  onClose: () => void
  messages: AgentMessage[]
  isProcessing: boolean
  onSendMessage: (text: string) => void
  pendingAttachments: AgentAttachmentContext[]
  onAddAttachments: (files: FileList | File[]) => Promise<void>
  onRemoveAttachment: (attachmentId: string) => void
  isExtractingAttachments: boolean
  onClear: () => void
  conversationId: string | null
  history: AgentConversationSummary[]
  isHistoryLoading: boolean
  isConversationLoading?: boolean
  loadingConversationId?: string | null
  onOpenHistory: () => void
  onSelectConversation: (conversationId: string) => void
  onUpdateConversationTitle: (conversationId: string, title: string) => void
  onDeleteConversation: (conversationId: string) => void
  // Error handling props
  error?: AgentError | null
  onClearError?: () => void
  lastFailedMessage?: string | null
  onRetry?: () => void
  /** Re-send the latest user turn (retryable failed execute actions) */
  onRetryLastUserTurn?: () => void
  connectionStatus?: ConnectionStatus
  rateLimitCountdown?: number | null
}

const QUICK_SUGGESTIONS = [
  'Schedule a meeting',
  'Create project Website Refresh',
  'Update this project status to active',
  'How are my Meta ads doing this week?',
  'Generate weekly report',
  'Show my Tasks',
]

export function AgentModePanel({
  isOpen,
  onClose,
  messages,
  isProcessing,
  onSendMessage,
  pendingAttachments,
  onAddAttachments,
  onRemoveAttachment,
  isExtractingAttachments,
  onClear,
  conversationId,
  history,
  isHistoryLoading,
  isConversationLoading = false,
  loadingConversationId = null,
  onOpenHistory,
  onSelectConversation,
  onUpdateConversationTitle,
  onDeleteConversation,
  // Error handling props
  onClearError,
  lastFailedMessage,
  onRetry,
  onRetryLastUserTurn,
  connectionStatus = 'connected',
  rateLimitCountdown,
  error = null,
}: AgentModePanelProps) {
  const [inputValue, setInputValue] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isDraggingFilesRef = useRef(false)
  const latestMessageId = messages.at(-1)?.id ?? null

  // Fetch data for mentions
  const { clients, projects, teams, users, allItems, isLoading: mentionsLoading } = useMentionData()
  const mentionLabels = useMemo(() => allItems.map((item) => item.name), [allItems])

  const handleVoiceTranscript = useCallback((text: string) => {
    if (text.trim()) {
      onSendMessage(text)
      setInputValue('')
    }
  }, [onSendMessage])

  const handleVoiceInterim = useCallback((text: string) => {
    setInputValue(text)
  }, [])

  // Focus input when panel opens
  useEffect(() => {
    if (!isOpen || !inputRef.current) {
      return
    }

    const focusTimeoutId = window.setTimeout(() => inputRef.current?.focus(), 100)

    return () => {
      window.clearTimeout(focusTimeoutId)
    }
  }, [isOpen])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (latestMessageId === null && messages.length === 0) return
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [latestMessageId, messages.length])



  const handleSubmit = useCallback(() => {
    if (inputValue.trim() && !isProcessing && !isExtractingAttachments) {
      onSendMessage(inputValue.trim())
      setInputValue('')
      setShowMentions(false)
    }
  }, [inputValue, isProcessing, isExtractingAttachments, onSendMessage])

  // Detect @ character and extract query
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Check for @ mention trigger
    const cursorPos = e.target.selectionStart ?? value.length
    const textBeforeCursor = value.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      // Check if @ is at start or preceded by space
      const charBefore = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' '
      if (charBefore === ' ' || atIndex === 0) {
        const query = textBeforeCursor.slice(atIndex + 1)
        // Only show dropdown if query doesn't contain space (still typing mention)
        if (!query.includes(' ')) {
          setMentionQuery(query)
          setShowMentions(true)
          return
        }
      }
    }
    setShowMentions(false)
  }, [])

  // Handle mention selection
  const handleMentionSelect = useCallback((item: MentionItem) => {
    // Find the @ position and replace with formatted mention
    const cursorPos = inputRef.current?.selectionStart ?? inputValue.length
    const textBeforeCursor = inputValue.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const beforeMention = inputValue.slice(0, atIndex)
      const afterMention = inputValue.slice(cursorPos)
      const insertedMention = `${formatMention(item)} `
      const newValue = `${beforeMention}${insertedMention}${afterMention}`
      const nextCursorPos = beforeMention.length + insertedMention.length
      setInputValue(newValue)

      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(nextCursorPos, nextCursorPos)
      })
    }

    setShowMentions(false)
  }, [inputValue])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    // Don't handle Enter/Escape if mention dropdown is open (it handles them)
    if (showMentions && ['Enter', 'ArrowUp', 'ArrowDown', 'Tab', 'Escape'].includes(e.key)) {
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      if (showHistory && editingConversationId) {
        setEditingConversationId(null)
        return
      }
      if (showHistory) {
        setShowHistory(false)
        return
      }
      onClose()
    }
  }, [editingConversationId, handleSubmit, onClose, showHistory, showMentions])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onSendMessage(suggestion)
  }, [onSendMessage])

  const handleCloseMentions = useCallback(() => {
    setShowMentions(false)
  }, [])

  const handleOpenFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileSelection = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    await onAddAttachments(files)
    event.target.value = ''
  }, [onAddAttachments])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (event.dataTransfer.types.includes('Files')) {
      isDraggingFilesRef.current = true
    }
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const nextTarget = event.relatedTarget
    if (!nextTarget || !(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      isDraggingFilesRef.current = false
    }
  }, [])

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    isDraggingFilesRef.current = false
    if (event.dataTransfer.files.length === 0) return
    await onAddAttachments(event.dataTransfer.files)
  }, [onAddAttachments])

  const handleRetry = useCallback(() => {
    onClearError?.()
    onRetry?.()
  }, [onClearError, onRetry])

  const handleStartNewChat = useCallback(() => {
    onClear()
    setInputValue('')
    setShowMentions(false)
    setMentionQuery('')
    setShowHistory(false)
    setEditingConversationId(null)
    setEditingTitle('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [onClear])

  const handleToggleHistory = useCallback(() => {
    setShowHistory((prev) => {
      const next = !prev
      if (next) {
        void onOpenHistory()
      }
      return next
    })
  }, [onOpenHistory])

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false)
  }, [])

  const handleStartEditingConversation = useCallback((conversationIdValue: string, title: string) => {
    setEditingConversationId(conversationIdValue)
    setEditingTitle(title)
  }, [])

  const handleStopEditingConversation = useCallback(() => {
    setEditingConversationId(null)
  }, [])

  const handleDocumentEscape = useEffectEvent((e: globalThis.KeyboardEvent) => {
    if (e.key !== 'Escape') return
    if (showMentions) return
    if (showHistory && editingConversationId) {
      e.preventDefault()
      e.stopPropagation()
      setEditingConversationId(null)
      return
    }
    if (showHistory) {
      e.preventDefault()
      e.stopPropagation()
      setShowHistory(false)
      return
    }
    e.preventDefault()
    e.stopPropagation()
    onClose()
  })

  // Escape: close history / stop title edit first; leave @-mention dropdown to its own listener (bubble)
  useEffect(() => {
    if (!isOpen) return
    const onDocumentKeyDown = (e: globalThis.KeyboardEvent) => {
      handleDocumentEscape(e)
    }
    document.addEventListener('keydown', onDocumentKeyDown, true)
    return () => document.removeEventListener('keydown', onDocumentKeyDown, true)
  }, [isOpen])

  const showEmptyState = messages.length === 0 && !isConversationLoading

  // Check if input is disabled (rate limited or processing)
  const isInputDisabled = isProcessing || isExtractingAttachments || (typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0)

  const sharedComposerProps = useMemo<
    Omit<AgentComposerSectionProps, 'layout' | 'disabled' | 'quickSuggestions' | 'onSuggestionClick'>
  >(
    () => ({
      inputValue,
      inputRef,
      mentionLabels,
      showMentions,
      mentionQuery,
      clients,
      projects,
      teams,
      users,
      mentionsLoading,
      pendingAttachments,
      isExtractingAttachments,
      onInputChange: handleInputChange,
      onKeyDown: handleKeyDown,
      onOpenFilePicker: handleOpenFilePicker,
      onCloseMentions: handleCloseMentions,
      onSelectMention: handleMentionSelect,
      onVoiceTranscript: handleVoiceTranscript,
      onVoiceInterim: handleVoiceInterim,
      onRemoveAttachment,
      onSubmit: handleSubmit,
    }),
    [
      clients,
      handleCloseMentions,
      handleInputChange,
      handleKeyDown,
      handleMentionSelect,
      handleOpenFilePicker,
      handleSubmit,
      handleVoiceInterim,
      handleVoiceTranscript,
      inputRef,
      inputValue,
      isExtractingAttachments,
      mentionLabels,
      mentionQuery,
      mentionsLoading,
      onRemoveAttachment,
      pendingAttachments,
      projects,
      showMentions,
      teams,
      users,
    ]
  )

  const emptyComposerProps = useMemo<AgentComposerSectionProps>(() => ({
    ...sharedComposerProps,
    layout: 'centered',
    disabled: isInputDisabled,
    quickSuggestions: QUICK_SUGGESTIONS,
    onSuggestionClick: handleSuggestionClick,
  }), [handleSuggestionClick, isInputDisabled, sharedComposerProps])

  const dockComposerProps = useMemo<AgentComposerSectionProps>(() => ({
    ...sharedComposerProps,
    layout: 'dock',
    disabled: isInputDisabled || isConversationLoading,
  }), [isConversationLoading, isInputDisabled, sharedComposerProps])

  const historyPanelProps = useMemo(() => ({
    showHistory,
    history,
    isHistoryLoading,
    conversationId,
    messagesCount: messages.length,
    isConversationLoading,
    loadingConversationId,
    editingConversationId,
    editingTitle,
    setEditingTitle,
    onSelectConversation,
    onUpdateConversationTitle,
    onDeleteConversation,
    onStartNewChat: handleStartNewChat,
    onClose: handleCloseHistory,
    onStartEditing: handleStartEditingConversation,
    onStopEditing: handleStopEditingConversation,
  }), [
    conversationId,
    editingConversationId,
    editingTitle,
    handleCloseHistory,
    handleStartEditingConversation,
    handleStartNewChat,
    handleStopEditingConversation,
    history,
    isConversationLoading,
    isHistoryLoading,
    loadingConversationId,
    messages.length,
    onDeleteConversation,
    onSelectConversation,
    onUpdateConversationTitle,
    showHistory,
  ])

  const headerProps = useMemo(() => ({
    connectionStatus,
    conversationId,
    messagesCount: messages.length,
    showHistory,
    onClose,
    onStartNewChat: handleStartNewChat,
    onToggleHistory: handleToggleHistory,
  }), [connectionStatus, conversationId, handleStartNewChat, handleToggleHistory, messages.length, onClose, showHistory])

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen && (
          <AgentModePanelShell
            attachmentAccept={AGENT_ATTACHMENT_ACCEPT}
            fileInputRef={fileInputRef}
            headerProps={headerProps}
            historyPanelProps={historyPanelProps}
            agentError={error}
            lastFailedMessage={lastFailedMessage ?? null}
            onClearError={onClearError}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onFileSelection={handleFileSelection}
            rateLimitCountdown={rateLimitCountdown}
          >
            <AgentModePanelContent
              dockComposerProps={dockComposerProps}
              emptyComposerProps={emptyComposerProps}
              isConversationLoading={isConversationLoading}
              isProcessing={isProcessing}
              lastFailedMessage={lastFailedMessage ?? null}
              mentionLabels={mentionLabels}
              messages={messages}
              onRetry={handleRetry}
              onRetryLastUserTurn={onRetryLastUserTurn}
              scrollAreaRef={scrollAreaRef}
              showEmptyState={showEmptyState}
            />
          </AgentModePanelShell>
        )}
      </AnimatePresence>
    </LazyMotion>
  )
}
