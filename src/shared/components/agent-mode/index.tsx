'use client'

import { Suspense, useCallback, useRef, useState } from 'react'

import { AgentModeButton } from './agent-mode-button'
import { AgentModePanel } from './agent-mode-panel'
import {
  readAgentPanelLayout,
  shouldHideAgentFab,
  type AgentPanelLayout,
} from '@/lib/agent-panel-layout'
import { useAgentMode, type AgentMessageMetadata } from '@/shared/hooks/use-agent-mode'

/**
 * Agent Mode Container
 * 
 * Renders the floating action button and chat panel for Agent Mode.
 * Add this component to the dashboard layout to enable Agent Mode globally.
 */
function AgentModeInner() {
  const {
    isOpen,
    setOpen,
    messages,
    isProcessing,
    processInput,
    pendingAttachments,
    addAttachments,
    removeAttachment,
    isExtractingAttachments,
    clearMessages,
    conversationId,
    history,
    isHistoryLoading,
    historyError,
    historyHasMore,
    historySearch,
    setHistorySearch,
    showArchivedHistory,
    setShowArchivedHistory,
    fetchHistory,
    loadMoreHistory,
    setConversationPinned,
    setConversationArchived,
    loadConversation,
    isConversationLoading,
    loadingConversationId,
    updateConversationTitle,
    deleteConversation,
    duplicateConversation,
    exportConversation,
    shareConversation,
    // Error handling
    error,
    clearError,
    lastFailedMessage,
    retryLastMessage,
    retryLastUserTurn,
    editLastUserMessage,
    confirmPendingAction,
    undoAgentAction,
    processingSteps,
    processingLabel,
    isPinnedToBottom,
    scrollToLatest,
    onMessagesScroll,
    scrollContainerRef,
    connectionStatus,
    rateLimitCountdown,
    activeContext,
    maxMessageLength,
  } = useAgentMode()

  const requestCloseRef = useRef<(() => void) | null>(null)
  const [panelLayout, setPanelLayout] = useState<AgentPanelLayout>(() => readAgentPanelLayout())
  const hideFab = shouldHideAgentFab(isOpen, panelLayout)

  const handleClose = useCallback(() => {
    setOpen(false)
    requestAnimationFrame(() => {
      document.getElementById('agent-mode-launcher')?.focus()
    })
  }, [setOpen])

  const handleLauncherClick = useCallback(() => {
    if (isOpen) {
      if (requestCloseRef.current) {
        requestCloseRef.current()
      } else {
        handleClose()
      }
      return
    }
    setOpen(true)
  }, [handleClose, isOpen, setOpen])

  const handleRegisterRequestClose = useCallback((handler: (() => void) | null) => {
    requestCloseRef.current = handler
  }, [])

  const handleSendMessage = useCallback(
    (text: string, options?: Parameters<typeof processInput>[1]) => {
      void processInput(text, options)
    },
    [processInput],
  )

  const handleOpenHistory = useCallback(() => {
    void fetchHistory({ reset: true })
  }, [fetchHistory])

  const handleRetryHistory = useCallback(() => {
    void fetchHistory({ reset: true })
  }, [fetchHistory])

  const handleLoadMoreHistory = useCallback(() => {
    void loadMoreHistory()
  }, [loadMoreHistory])

  const handlePinConversation = useCallback(
    (id: string, pinned: boolean) => {
      void setConversationPinned(id, pinned)
    },
    [setConversationPinned],
  )

  const handleArchiveConversation = useCallback(
    (id: string, archived: boolean) => {
      void setConversationArchived(id, archived)
    },
    [setConversationArchived],
  )

  const handleRetryUserMessage = useCallback(
    (clientId: string, content: string) => {
      void processInput(content, { retryClientId: clientId })
    },
    [processInput],
  )

  const handleUndoAction = useCallback(
    (messageId: string, undoHint: NonNullable<AgentMessageMetadata['undoHint']> | undefined) => {
      if (!undoHint) return
      void undoAgentAction(messageId, undoHint)
    },
    [undoAgentAction],
  )

  return (
    <>
      {!hideFab ? <AgentModeButton onClick={handleLauncherClick} isOpen={isOpen} /> : null}
      <AgentModePanel
        onPanelLayoutChange={setPanelLayout}
        isOpen={isOpen}
        activeContext={activeContext}
        maxMessageLength={maxMessageLength}
        onClose={handleClose}
        onOpenChange={setOpen}
        onRegisterRequestClose={handleRegisterRequestClose}
        messages={messages}
        isProcessing={isProcessing}
        onSendMessage={handleSendMessage}
        pendingAttachments={pendingAttachments}
        onAddAttachments={addAttachments}
        onRemoveAttachment={removeAttachment}
        isExtractingAttachments={isExtractingAttachments}
        onClear={clearMessages}
        conversationId={conversationId}
        history={history}
        isHistoryLoading={isHistoryLoading}
        historyError={historyError}
        historyHasMore={historyHasMore}
        historySearch={historySearch}
        onHistorySearchChange={setHistorySearch}
        showArchivedHistory={showArchivedHistory}
        onShowArchivedHistoryChange={setShowArchivedHistory}
        onOpenHistory={handleOpenHistory}
        onRetryHistory={handleRetryHistory}
        onLoadMoreHistory={handleLoadMoreHistory}
        onPinConversation={handlePinConversation}
        onArchiveConversation={handleArchiveConversation}
        onSelectConversation={loadConversation}
        isConversationLoading={isConversationLoading}
        loadingConversationId={loadingConversationId}
        onUpdateConversationTitle={updateConversationTitle}
        onDeleteConversation={deleteConversation}
        onDuplicateConversation={duplicateConversation}
        onExportConversation={exportConversation}
        onShareConversation={shareConversation}
        // Error handling
        error={error}
        onClearError={clearError}
        lastFailedMessage={lastFailedMessage}
        onRetry={retryLastMessage}
        onRetryLastUserTurn={retryLastUserTurn}
        onRetryUserMessage={handleRetryUserMessage}
        onConfirmPending={confirmPendingAction}
        onUndoAction={handleUndoAction}
        processingSteps={processingSteps}
        processingLabel={processingLabel}
        scrollContainerRef={scrollContainerRef}
        onMessagesScroll={onMessagesScroll}
        isPinnedToBottom={isPinnedToBottom}
        onJumpToLatest={scrollToLatest}
        connectionStatus={connectionStatus}
        rateLimitCountdown={rateLimitCountdown}
      />
    </>
  )
}

export function AgentMode() {
  return (
    <Suspense fallback={null}>
      <AgentModeInner />
    </Suspense>
  )
}

export { AgentModeButton } from './agent-mode-button'
export { AgentModePanel } from './agent-mode-panel'
