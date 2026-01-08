'use client'

import { AgentModeButton } from './agent-mode-button'
import { AgentModePanel } from './agent-mode-panel'
import { useAgentMode } from '@/hooks/use-agent-mode'

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
    clearMessages,
    conversationId,
    history,
    isHistoryLoading,
    fetchHistory,
    loadConversation,
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
        onClear={clearMessages}
        conversationId={conversationId}
        history={history}
        isHistoryLoading={isHistoryLoading}
        onOpenHistory={fetchHistory}
        onSelectConversation={loadConversation}
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
