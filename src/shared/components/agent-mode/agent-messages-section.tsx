'use client'

import { parseISO, isValid } from 'date-fns'
import { Fragment, type RefObject } from 'react'
import { ArrowDown, Loader2 } from 'lucide-react'
import { m } from '@/shared/ui/motion'

import { useClientNow } from '@/lib/hooks/use-client-relative-time'
import { cn } from '@/lib/utils'
import type {
  AgentExecutionStep,
  AgentMessage,
  AgentPendingConfirmation,
} from '@/shared/hooks/use-agent-mode'
import { Button } from '@/shared/ui/button'

import { AgentMessageCard } from './agent-message-card'
import {
  AGENT_MESSAGE_THREAD,
  AGENT_PANEL_SURFACE,
  formatMessageDayLabel,
  messageDayKey,
  MOTION_FADE_IN,
  MOTION_FADE_IN_VISIBLE,
  stopPropagation,
} from './agent-mode-panel-message-constants'
import { AgentMessageDayDivider } from './agent-mode-panel-message-utils'
import { AgentExecutionTimeline } from './agent-execution-timeline'

function toMessageTimestamp(value: Date | string | number): Date {
  if (value instanceof Date) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseISO(value)
    if (isValid(parsed)) {
      return parsed
    }
  }

  return new Date(value)
}

export function AgentMessagesSection({
  isConversationLoading,
  isProcessing,
  mentionLabels,
  messages,
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
  conversationId,
  workspaceId,
  onStoreSpreadsheetExport,
}: {
  isConversationLoading: boolean
  isProcessing: boolean
  mentionLabels: string[]
  messages: AgentMessage[]
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
  showJumpToLatest: boolean
  onJumpToLatest: () => void
  conversationId: string | null
  workspaceId: string | null
  onStoreSpreadsheetExport?: (
    messageId: string,
    attachment: import('@/lib/agent-attachments').AgentAttachmentContext,
  ) => void
}) {
  const now = useClientNow()

  return (
    <div className={cn('relative flex-1 min-h-0', AGENT_PANEL_SURFACE)}>
      <div
        className={cn('h-full overflow-y-auto px-4 py-5', AGENT_MESSAGE_THREAD)}
        ref={scrollAreaRef}
        onScroll={onMessagesScroll}
        onWheel={stopPropagation}
      >
        {isConversationLoading ? (
          <div className="flex h-full min-h-[240px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">Loading conversation…</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-4 pb-2">
            {messages.map((message, index) => {
              const timestamp = toMessageTimestamp(message.timestamp)
              const dayKey = Number.isNaN(timestamp.getTime()) ? null : messageDayKey(timestamp)
              const previousMessage = index > 0 ? messages[index - 1] : null
              const previousTimestamp = previousMessage
                ? toMessageTimestamp(previousMessage.timestamp)
                : null
              const previousDayKey =
                previousTimestamp && !Number.isNaN(previousTimestamp.getTime())
                  ? messageDayKey(previousTimestamp)
                  : null
              const showDayDivider = dayKey !== null && dayKey !== previousDayKey

              return (
                <Fragment key={message.clientId}>
                  {showDayDivider && now ? (
                    <AgentMessageDayDivider label={formatMessageDayLabel(timestamp, now)} />
                  ) : null}
                  <AgentMessageCard
                    message={message}
                    mentionLabels={mentionLabels}
                    isProcessing={isProcessing}
                    conversationId={conversationId}
                    workspaceId={workspaceId}
                    onStoreSpreadsheetExport={onStoreSpreadsheetExport}
                    onRetryLastUserTurn={onRetryLastUserTurn}
                    onRetryUserMessage={onRetryUserMessage}
                    onConfirmPending={onConfirmPending}
                    onUndoAction={onUndoAction}
                  />
                </Fragment>
              )
            })}

            {isProcessing ? (
              <m.div initial={MOTION_FADE_IN} animate={MOTION_FADE_IN_VISIBLE} className="flex justify-start pt-1">
                <AgentExecutionTimeline steps={processingSteps} label={processingLabel} />
              </m.div>
            ) : null}
          </div>
        )}
      </div>

      {showJumpToLatest ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="pointer-events-auto h-8 gap-1.5 rounded-full border-border/60 bg-background/95 px-4 text-foreground shadow-lg backdrop-blur-sm hover:bg-muted/80"
            onClick={onJumpToLatest}
          >
            <ArrowDown className="size-3.5" aria-hidden />
            Latest messages
          </Button>
        </div>
      ) : null}
    </div>
  )
}
