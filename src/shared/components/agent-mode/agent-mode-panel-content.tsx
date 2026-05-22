'use client'

import type { RefObject } from 'react'

import type {
  AgentExecutionStep,
  AgentMessage,
  AgentPendingConfirmation,
} from '@/shared/hooks/use-agent-mode'

import { AgentComposerSection, type AgentComposerSectionProps } from './agent-mode-panel-composer'
import { AgentEmptyState } from './agent-mode-panel-header'
import { AgentMessagesSection, FailedMessageBanner } from './agent-mode-panel-messages'

export type AgentPanelContentViewState = {
  conversationLoading: boolean
  processing: boolean
  showJumpToLatest: boolean
  showEmptyState: boolean
}

export function AgentModePanelContent({
  dockComposerProps,
  emptyComposerProps,
  viewState,
  lastFailedMessage,
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
  onJumpToLatest,
}: {
  dockComposerProps: AgentComposerSectionProps
  emptyComposerProps: AgentComposerSectionProps
  viewState: AgentPanelContentViewState
  lastFailedMessage: string | null
  mentionLabels: string[]
  messages: AgentMessage[]
  onRetry: () => void
  onRetryLastUserTurn?: () => void
  onRetryUserMessage?: (clientId: string, content: string) => void
  onConfirmPending?: (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => void
  onUndoAction?: (
    messageId: string,
    undoHint: NonNullable<AgentMessage['metadata']>['undoHint'],
  ) => void
  processingSteps: AgentExecutionStep[]
  processingLabel: string
  scrollAreaRef: RefObject<HTMLDivElement | null>
  onMessagesScroll: () => void
  onJumpToLatest: () => void
}) {
  const {
    conversationLoading: isConversationLoading,
    processing: isProcessing,
    showJumpToLatest,
    showEmptyState,
  } = viewState

  if (showEmptyState) {
    return (
      <AgentEmptyState>
        <AgentComposerSection {...emptyComposerProps} />
      </AgentEmptyState>
    )
  }

  return (
    <>
      <AgentMessagesSection
        isConversationLoading={isConversationLoading}
        isProcessing={isProcessing}
        mentionLabels={mentionLabels}
        messages={messages}
        onRetryLastUserTurn={onRetryLastUserTurn}
        onRetryUserMessage={onRetryUserMessage}
        onConfirmPending={onConfirmPending}
        onUndoAction={onUndoAction}
        processingSteps={processingSteps}
        processingLabel={processingLabel}
        scrollAreaRef={scrollAreaRef}
        onMessagesScroll={onMessagesScroll}
        showJumpToLatest={showJumpToLatest}
        onJumpToLatest={onJumpToLatest}
      />

      {!isProcessing ? <FailedMessageBanner lastFailedMessage={lastFailedMessage} onRetry={onRetry} /> : null}

      <AgentComposerSection {...dockComposerProps} />
    </>
  )
}
