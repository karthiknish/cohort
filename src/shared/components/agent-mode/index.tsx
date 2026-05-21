'use client'

import { Suspense, useCallback, useRef, useState } from 'react'

import { AgentModeButton } from './agent-mode-button'
import { AgentModePanel } from './agent-mode-panel'
import {
  readAgentPanelLayout,
  shouldHideAgentFab,
  type AgentPanelLayout,
} from '@/lib/agent-panel-layout'
import { useAgentMode } from '@/shared/hooks/use-agent-mode'

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
      requestCloseRef.current?.() ?? handleClose()
      return
    }
    setOpen(true)
  }, [handleClose, isOpen, setOpen])

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
        onRegisterRequestClose={(handler) => {
          requestCloseRef.current = handler
        }}
        messages={messages}
        isProcessing={isProcessing}
        onSendMessage={(text, options) => {
          void processInput(text, options)
        }}
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
        onOpenHistory={() => {
          void fetchHistory({ reset: true })
        }}
        onRetryHistory={() => {
          void fetchHistory({ reset: true })
        }}
        onLoadMoreHistory={() => {
          void loadMoreHistory()
        }}
        onPinConversation={(id, pinned) => {
          void setConversationPinned(id, pinned)
        }}
        onArchiveConversation={(id, archived) => {
          void setConversationArchived(id, archived)
        }}
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
        onRetryUserMessage={(clientId, content) => {
          void processInput(content, { retryClientId: clientId })
        }}
        onConfirmPending={confirmPendingAction}
        onUndoAction={(messageId, undoHint) => {
          if (!undoHint) return
          void undoAgentAction(messageId, undoHint)
        }}
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
