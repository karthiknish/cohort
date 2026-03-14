'use client'

import { AgentModeButton } from './agent-mode-button'
import { AgentModePanel } from './agent-mode-panel'
import { useAgentMode } from '@/shared/hooks/use-agent-mode'

/**
 * Agent Mode Container
 * 
 * Renders the floating action button and chat panel for Agent Mode.
 * Add this component to the dashboard layout to enable Agent Mode globally.
 */
export function AgentMode() {
  const {
    isOpen,
    setOpen,
    toggle,
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
    fetchHistory,
    loadConversation,
    isConversationLoading,
    loadingConversationId,
    updateConversationTitle,
    deleteConversation,
    // Error handling
    error,
    clearError,
    lastFailedMessage,
    retryLastMessage,
    connectionStatus,
    rateLimitCountdown,
  } = useAgentMode()

  return (
    <>
      <AgentModeButton onClick={toggle} isOpen={isOpen} />
      <AgentModePanel
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        messages={messages}
        isProcessing={isProcessing}
        onSendMessage={processInput}
        pendingAttachments={pendingAttachments}
        onAddAttachments={addAttachments}
        onRemoveAttachment={removeAttachment}
        isExtractingAttachments={isExtractingAttachments}
        onClear={clearMessages}
        conversationId={conversationId}
        history={history}
        isHistoryLoading={isHistoryLoading}
        onOpenHistory={fetchHistory}
        onSelectConversation={loadConversation}
        isConversationLoading={isConversationLoading}
        loadingConversationId={loadingConversationId}
        onUpdateConversationTitle={updateConversationTitle}
        onDeleteConversation={deleteConversation}
        // Error handling
        error={error}
        onClearError={clearError}
        lastFailedMessage={lastFailedMessage}
        onRetry={retryLastMessage}
        connectionStatus={connectionStatus}
        rateLimitCountdown={rateLimitCountdown}
      />
    </>
  )
}

export { AgentModeButton } from './agent-mode-button'
export { AgentModePanel } from './agent-mode-panel'
