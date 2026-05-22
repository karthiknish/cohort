'use client'

import { useMemo } from 'react'
import {
  AgentModePanelContent,
  AgentModePanelShell,
} from './agent-mode-panel-sections'
import type { AgentModePanelProps } from './agent-mode-panel-types'
import { useAgentModePanel } from './use-agent-mode-panel'

export function AgentModePanel(props: AgentModePanelProps) {
  const {
    isOpen,
    panelLayout,
    attachmentAccept,
    fileInputRef,
    composerInputRef,
    headerProps,
    historyPanelProps,
    agentError,
    lastFailedMessage,
    onClearError,
    onDragLeave,
    onDragOver,
    onDrop,
    onFileSelection,
    rateLimitCountdown,
    handleShellOpenChange,
    requestClose,
    dockComposerProps,
    emptyComposerProps,
    isConversationLoading,
    isProcessing,
    mentionLabels,
    messages,
    onRetry,
    onRetryLastUserTurn,
    onRetryUserMessage,
    onConfirmPending,
    onUndoAction,
    processingSteps,
    processingLabel,
    scrollAreaRef,
    onMessagesScroll,
    showJumpToLatest,
    onJumpToLatest,
    showEmptyState,
  } = useAgentModePanel(props)

  const viewState = useMemo(
    () => ({
      conversationLoading: isConversationLoading,
      processing: isProcessing,
      showJumpToLatest,
      showEmptyState,
    }),
    [isConversationLoading, isProcessing, showJumpToLatest, showEmptyState],
  )

  return (
    <AgentModePanelShell
      isOpen={isOpen}
      onOpenChange={handleShellOpenChange}
      onRequestClose={requestClose}
      panelLayout={panelLayout}
      attachmentAccept={attachmentAccept}
      fileInputRef={fileInputRef}
      composerInputRef={composerInputRef}
      headerProps={headerProps}
      historyPanelProps={historyPanelProps}
      agentError={agentError}
      lastFailedMessage={lastFailedMessage}
      onClearError={onClearError}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onFileSelection={onFileSelection}
      rateLimitCountdown={rateLimitCountdown}
    >
      <AgentModePanelContent
        dockComposerProps={dockComposerProps}
        emptyComposerProps={emptyComposerProps}
        viewState={viewState}
        lastFailedMessage={lastFailedMessage}
        mentionLabels={mentionLabels}
        messages={messages}
        onRetry={onRetry}
        onRetryLastUserTurn={onRetryLastUserTurn}
        onRetryUserMessage={onRetryUserMessage}
        onConfirmPending={onConfirmPending}
        onUndoAction={onUndoAction}
        processingSteps={processingSteps ?? []}
        processingLabel={processingLabel}
        scrollAreaRef={scrollAreaRef}
        onMessagesScroll={onMessagesScroll}
        onJumpToLatest={onJumpToLatest}
      />
    </AgentModePanelShell>
  )
}
