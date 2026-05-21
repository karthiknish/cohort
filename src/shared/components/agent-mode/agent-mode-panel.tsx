'use client'

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/shared/contexts/auth-context'
import type { AgentContextIds } from '@/lib/agent-context'
import type {
  AgentConversationSummary,
  AgentExecutionStep,
  AgentMessage,
  AgentPendingConfirmation,
  ConnectionStatus,
} from '@/shared/hooks/use-agent-mode'
import { useClientContext } from '@/shared/contexts/client-context'
import { useMentionData } from '@/shared/hooks/use-mention-data'
import {
  AGENT_DASHBOARD_SHORTCUTS,
  buildAgentContextChips,
  filterAgentDashboardShortcuts,
  getAgentSuggestions,
  trackAgentSuggestionClick,
  type AgentSuggestion,
} from '@/lib/agent-context'
import {
  formatAgentMentionMarkup,
  mergeAgentMentions,
  parseAgentMentionsFromText,
  type AgentMentionEntity,
} from '@/lib/agent-mentions'
import { AGENT_ATTACHMENT_ACCEPT, type AgentAttachmentContext } from '@/lib/agent-attachments'
import { notifySuccess } from '@/lib/notifications'
import {
  agentCloseBlockerMessage,
  getAgentCloseBlockers,
  shouldBlockAgentClose,
} from '@/lib/agent-close-guard'
import {
  readAgentPanelLayout,
  writeAgentPanelLayout,
  type AgentPanelLayout,
} from '@/lib/agent-panel-layout'
import { useAgentPanelUrl } from '@/shared/hooks/use-agent-panel-url'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts'
import type { AgentError } from '@/lib/agent-errors'

import { AgentContextBanner } from './agent-context-banner'
import {
  AgentModePanelContent,
  AgentModePanelShell,
  type AgentComposerSectionProps,
} from './agent-mode-panel-sections'
import { type MentionDropdownHandle, type MentionItem } from './mention-dropdown'

interface AgentModePanelProps {
  isOpen: boolean
  activeContext: AgentContextIds
  maxMessageLength: number
  onClose: () => void
  onOpenChange?: (open: boolean) => void
  onRegisterRequestClose?: (handler: (() => void) | null) => void
  onPanelLayoutChange?: (layout: AgentPanelLayout) => void
  messages: AgentMessage[]
  isProcessing: boolean
  onSendMessage: (text: string, options?: { mentions?: AgentMentionEntity[] }) => void
  pendingAttachments: AgentAttachmentContext[]
  onAddAttachments: (files: FileList | File[]) => Promise<void>
  onRemoveAttachment: (attachmentId: string) => void
  isExtractingAttachments: boolean
  onClear: () => void
  conversationId: string | null
  history: AgentConversationSummary[]
  isHistoryLoading: boolean
  historyError?: string | null
  historyHasMore?: boolean
  historySearch?: string
  onHistorySearchChange?: (value: string) => void
  showArchivedHistory?: boolean
  onShowArchivedHistoryChange?: (value: boolean) => void
  onLoadMoreHistory?: () => void
  onRetryHistory?: () => void
  onPinConversation?: (conversationId: string, pinned: boolean) => void
  onArchiveConversation?: (conversationId: string, archived: boolean) => void
  isConversationLoading?: boolean
  loadingConversationId?: string | null
  onOpenHistory: () => void
  onSelectConversation: (conversationId: string) => void
  onUpdateConversationTitle: (conversationId: string, title: string) => void
  onDeleteConversation: (conversationId: string) => void
  onDuplicateConversation?: (conversationId: string) => Promise<string | null>
  onExportConversation?: (
    conversationId: string,
    format?: 'json' | 'markdown',
  ) => Promise<{ content: string; title: string } | null>
  onShareConversation?: (conversationId: string) => Promise<{ markdown: string; deepLink: string } | null>
  // Error handling props
  error?: AgentError | null
  onClearError?: () => void
  lastFailedMessage?: string | null
  onRetry?: () => void
  /** Re-send the latest user turn (retryable failed execute actions) */
  onRetryLastUserTurn?: () => void
  onRetryUserMessage?: (clientId: string, content: string) => void
  onConfirmPending?: (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => void
  onUndoAction?: (
    messageId: string,
    undoHint: NonNullable<AgentMessage['metadata']>['undoHint'],
  ) => void
  processingSteps?: AgentExecutionStep[]
  processingLabel?: string
  scrollContainerRef?: RefObject<HTMLDivElement | null>
  onMessagesScroll?: () => void
  isPinnedToBottom?: boolean
  onJumpToLatest?: () => void
  connectionStatus?: ConnectionStatus
  rateLimitCountdown?: number | null
}

export function AgentModePanel({
  isOpen,
  activeContext,
  maxMessageLength,
  onClose,
  onOpenChange,
  onRegisterRequestClose,
  onPanelLayoutChange,
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
  onDuplicateConversation,
  onExportConversation,
  onShareConversation,
  // Error handling props
  onClearError,
  lastFailedMessage,
  onRetry,
  onRetryLastUserTurn,
  onRetryUserMessage,
  onConfirmPending,
  onUndoAction,
  processingSteps = [],
  processingLabel = 'Thinking…',
  scrollContainerRef: scrollContainerRefProp,
  onMessagesScroll,
  isPinnedToBottom = true,
  onJumpToLatest,
  connectionStatus = 'connected',
  rateLimitCountdown,
  error = null,
  historyError = null,
  historyHasMore = false,
  historySearch = '',
  onHistorySearchChange,
  showArchivedHistory = false,
  onShowArchivedHistoryChange,
  onLoadMoreHistory,
  onRetryHistory,
  onPinConversation,
  onArchiveConversation,
}: AgentModePanelProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const [panelLayout, setPanelLayout] = useState<AgentPanelLayout>(() =>
    typeof window === 'undefined' ? 'docked' : readAgentPanelLayout(),
  )
  const [inputValue, setInputValue] = useState('')
  const [composerMentions, setComposerMentions] = useState<AgentMentionEntity[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const mentionDropdownRef = useRef<MentionDropdownHandle>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const localScrollRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = scrollContainerRefProp ?? localScrollRef
  const isDraggingFilesRef = useRef(false)

  // Fetch data for mentions
  const { clients, projects, teams, users, allItems, isLoading: mentionsLoading } = useMentionData()
  const mentionLabels = useMemo(() => allItems.map((item) => item.name), [allItems])

  const quickSuggestions = useMemo(
    () => getAgentSuggestions(pathname, { role: user?.role }),
    [pathname, user?.role],
  )
  const dashboardShortcuts = useMemo(
    () => filterAgentDashboardShortcuts(AGENT_DASHBOARD_SHORTCUTS, user?.role),
    [user?.role],
  )
  const contextChips = useMemo(
    () =>
      buildAgentContextChips({
        pathname,
        ids: {
          ...activeContext,
          activeClientId: activeContext.activeClientId ?? selectedClientId ?? undefined,
        },
        selectedClientName: selectedClient?.name ?? null,
      }),
    [activeContext, pathname, selectedClient?.name, selectedClientId],
  )

  const handleDashboardShortcut = useCallback(
    (prompt: string) => {
      onSendMessage(prompt)
    },
    [onSendMessage],
  )

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

  const handleRetryUserMessage = useCallback(
    (clientId: string, content: string) => {
      onRetryUserMessage?.(clientId, content)
    },
    [onRetryUserMessage],
  )

  const handleSubmit = useCallback(() => {
    if (inputValue.trim() && !isProcessing && !isExtractingAttachments) {
      const mentions = mergeAgentMentions(parseAgentMentionsFromText(inputValue), composerMentions)
      onSendMessage(inputValue.trim(), { mentions })
      setInputValue('')
      setComposerMentions([])
      setShowMentions(false)
    }
  }, [composerMentions, inputValue, isProcessing, isExtractingAttachments, onSendMessage])

  // Detect @ character and extract query
  const handleInputChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
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
    setComposerMentions((prev) => mergeAgentMentions(parseAgentMentionsFromText(value), prev))
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
      const entity: AgentMentionEntity = {
        id: item.id,
        name: item.name,
        type: item.type,
        subtitle: item.subtitle,
      }
      const insertedMention = `${formatAgentMentionMarkup(entity)} `
      const newValue = `${beforeMention}${insertedMention}${afterMention}`
      const nextCursorPos = beforeMention.length + insertedMention.length
      setInputValue(newValue)
      setComposerMentions((prev) => mergeAgentMentions([entity], prev))

      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.setSelectionRange(nextCursorPos, nextCursorPos)
      })
    }

    setShowMentions(false)
  }, [inputValue])

  const handleSetPanelLayout = useCallback((layout: AgentPanelLayout) => {
    setPanelLayout(layout)
    writeAgentPanelLayout(layout)
  }, [])

  const closeGuardState = useMemo(
    () => ({
      composerText: inputValue,
      pendingAttachments,
      isProcessing,
      isExtractingAttachments,
      messages,
    }),
    [inputValue, isExtractingAttachments, isProcessing, messages, pendingAttachments],
  )

  const requestClose = useCallback(() => {
    if (shouldBlockAgentClose(closeGuardState)) {
      const confirmed = window.confirm(agentCloseBlockerMessage(getAgentCloseBlockers(closeGuardState)))
      if (!confirmed) return
    }
    onClose()
  }, [closeGuardState, onClose])

  useEffect(() => {
    onRegisterRequestClose?.(requestClose)
    return () => onRegisterRequestClose?.(null)
  }, [onRegisterRequestClose, requestClose])

  useEffect(() => {
    onPanelLayoutChange?.(panelLayout)
  }, [onPanelLayoutChange, panelLayout])

  const { openHistoryView, closeHistoryView } = useAgentPanelUrl({
    isOpen,
    setOpen: (open) => {
      if (open) onOpenChange?.(true)
      else requestClose()
    },
    showHistory,
    setShowHistory,
    conversationId,
    onLoadConversation: (id) => {
      void onSelectConversation(id)
    },
  })

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && mentionDropdownRef.current?.handleKeyDown(e)) {
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
        closeHistoryView()
        return
      }
      requestClose()
    }
  }, [closeHistoryView, editingConversationId, handleSubmit, requestClose, showHistory, showMentions])

  const handleSuggestionClick = useCallback((suggestion: AgentSuggestion) => {
    trackAgentSuggestionClick({
      suggestionId: suggestion.id,
      prompt: suggestion.prompt,
      pathname,
      operation: suggestion.operation,
    })
    onSendMessage(suggestion.prompt)
  }, [onSendMessage, pathname])

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
    closeHistoryView()
    setEditingConversationId(null)
    setEditingTitle('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [closeHistoryView, onClear])

  const handleToggleHistory = useCallback(() => {
    if (showHistory) {
      closeHistoryView()
      return
    }
    void onOpenHistory()
    openHistoryView()
  }, [closeHistoryView, onOpenHistory, openHistoryView, showHistory])

  const handleCloseHistory = useCallback(() => {
    closeHistoryView()
  }, [closeHistoryView])

  const handleDuplicateConversation = useCallback(
    async (targetConversationId: string) => {
      const newId = await onDuplicateConversation?.(targetConversationId)
      if (newId) {
        notifySuccess({ message: 'Chat duplicated' })
        await onSelectConversation(newId)
      }
    },
    [onDuplicateConversation, onSelectConversation],
  )

  const handleExportConversation = useCallback(
    async (targetConversationId: string) => {
      const exported = await onExportConversation?.(targetConversationId, 'markdown')
      if (!exported) return

      const blob = new Blob([exported.content], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${exported.title.replace(/[^\w.-]+/g, '-').slice(0, 48) || 'agent-chat'}.md`
      anchor.click()
      URL.revokeObjectURL(url)
      notifySuccess({ message: 'Chat exported' })
    },
    [onExportConversation],
  )

  const handleShareConversation = useCallback(
    async (targetConversationId: string) => {
      const shared = await onShareConversation?.(targetConversationId)
      if (!shared) return

      const payload = `${shared.markdown}\n\nOpen in Cohort: ${shared.deepLink}`
      try {
        await navigator.clipboard.writeText(payload)
        notifySuccess({ message: 'Share link copied to clipboard' })
      } catch {
        notifySuccess({ message: 'Share text ready — copy from export if clipboard is blocked' })
      }
    },
    [onShareConversation],
  )

  const handleStartNewChatShortcut = useEffectEvent(() => {
    if (!isOpen) return
    handleStartNewChat()
  })

  const handleToggleHistoryShortcut = useEffectEvent(() => {
    if (!isOpen) return
    handleToggleHistory()
  })

  const handleAttachShortcut = useEffectEvent(() => {
    if (!isOpen || isProcessing) return
    handleOpenFilePicker()
  })

  const handleFocusComposerShortcut = useEffectEvent(() => {
    if (!isOpen) return
    inputRef.current?.focus()
  })

  useKeyboardShortcut({ combo: 'mod+shift+n', callback: handleStartNewChatShortcut, enabled: isOpen })
  useKeyboardShortcut({ combo: 'mod+shift+h', callback: handleToggleHistoryShortcut, enabled: isOpen })
  useKeyboardShortcut({ combo: 'mod+shift+u', callback: handleAttachShortcut, enabled: isOpen })
  useKeyboardShortcut({ combo: 'mod+shift+l', callback: handleFocusComposerShortcut, enabled: isOpen })

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
      closeHistoryView()
      return
    }
    e.preventDefault()
    e.stopPropagation()
    requestClose()
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
  const hasExtractingAttachments = pendingAttachments.some(
    (attachment) => attachment.extractionStatus === 'extracting',
  )
  const isInputDisabled =
    isProcessing ||
    isExtractingAttachments ||
    hasExtractingAttachments ||
    (typeof rateLimitCountdown === 'number' && rateLimitCountdown > 0)

  const sharedComposerProps = useMemo<
    Omit<AgentComposerSectionProps, 'layout' | 'disabled' | 'quickSuggestions' | 'onSuggestionClick'>
  >(
    () => ({
      inputValue,
      inputRef,
      mentionLabels,
      maxMessageLength,
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
      mentionDropdownRef,
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
      maxMessageLength,
    ]
  )

  const emptyComposerProps = useMemo<AgentComposerSectionProps>(() => ({
    ...sharedComposerProps,
    layout: 'centered',
    disabled: isInputDisabled,
    quickSuggestions,
    onSuggestionClick: handleSuggestionClick,
  }), [handleSuggestionClick, isInputDisabled, quickSuggestions, sharedComposerProps])

  const contextBanner = useMemo(
    () => (
      <AgentContextBanner
        chips={contextChips}
        shortcuts={dashboardShortcuts}
        disabled={isInputDisabled}
        onShortcutPrompt={handleDashboardShortcut}
      />
    ),
    [contextChips, dashboardShortcuts, handleDashboardShortcut, isInputDisabled],
  )

  const dockComposerProps = useMemo<AgentComposerSectionProps>(() => ({
    ...sharedComposerProps,
    layout: 'dock',
    disabled: isInputDisabled || isConversationLoading,
  }), [isConversationLoading, isInputDisabled, sharedComposerProps])

  useEffect(() => {
    if (!showHistory || !onRetryHistory) return
    const timeoutId = window.setTimeout(() => {
      onRetryHistory()
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [historySearch, onRetryHistory, showArchivedHistory, showHistory])

  const historyPanelProps = useMemo(() => ({
    showHistory,
    history,
    isHistoryLoading,
    historyError: historyError ?? null,
    historyHasMore: historyHasMore ?? false,
    historySearch: historySearch ?? '',
    onHistorySearchChange: onHistorySearchChange ?? (() => {}),
    showArchivedHistory: showArchivedHistory ?? false,
    onShowArchivedHistoryChange: onShowArchivedHistoryChange ?? (() => {}),
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
    onRetryHistory: onRetryHistory ?? (() => {}),
    onLoadMoreHistory: onLoadMoreHistory ?? (() => {}),
    onPinConversation: onPinConversation ?? (() => {}),
    onArchiveConversation: onArchiveConversation ?? (() => {}),
    onDuplicateConversation: handleDuplicateConversation,
    onExportConversation: handleExportConversation,
    onShareConversation: handleShareConversation,
  }), [
    conversationId,
    editingConversationId,
    editingTitle,
    handleCloseHistory,
    handleDuplicateConversation,
    handleExportConversation,
    handleShareConversation,
    handleStartEditingConversation,
    handleStartNewChat,
    handleStopEditingConversation,
    history,
    historyError,
    historyHasMore,
    historySearch,
    isConversationLoading,
    isHistoryLoading,
    onArchiveConversation,
    onHistorySearchChange,
    onLoadMoreHistory,
    onPinConversation,
    onRetryHistory,
    onShowArchivedHistoryChange,
    showArchivedHistory,
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
    panelLayout,
    onClose: requestClose,
    onStartNewChat: handleStartNewChat,
    onToggleHistory: handleToggleHistory,
    onSetPanelLayout: handleSetPanelLayout,
  }), [
    connectionStatus,
    conversationId,
    handleSetPanelLayout,
    handleStartNewChat,
    handleToggleHistory,
    messages.length,
    panelLayout,
    requestClose,
    showHistory,
  ])

  const handleShellOpenChange = useCallback(
    (open: boolean) => {
      if (open) onOpenChange?.(true)
    },
    [onOpenChange],
  )

  useKeyboardShortcut({
    combo: 'mod+shift+a',
    callback: () => {
      if (isOpen) requestClose()
      else onOpenChange?.(true)
    },
  })

  return (
    <AgentModePanelShell
      isOpen={isOpen}
      onOpenChange={handleShellOpenChange}
      onRequestClose={requestClose}
      panelLayout={panelLayout}
      attachmentAccept={AGENT_ATTACHMENT_ACCEPT}
      contextBanner={contextBanner}
      fileInputRef={fileInputRef}
      composerInputRef={inputRef}
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
        onRetryUserMessage={handleRetryUserMessage}
        onConfirmPending={onConfirmPending}
        onUndoAction={onUndoAction}
        processingSteps={processingSteps}
        processingLabel={processingLabel}
        scrollAreaRef={scrollAreaRef}
        onMessagesScroll={onMessagesScroll ?? (() => {})}
        showJumpToLatest={!isPinnedToBottom && messages.length > 0}
        onJumpToLatest={onJumpToLatest ?? (() => {})}
        showEmptyState={showEmptyState}
      />
    </AgentModePanelShell>
  )
}
