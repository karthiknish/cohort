'use client'

import { Fragment } from 'react'
import { AlertCircle, ArrowDown, Check, Clock, Loader2, RefreshCw, Sparkles, WifiOff } from 'lucide-react'
import { m } from '@/shared/ui/motion'

import { cn } from '@/lib/utils'
import type {
  AgentExecutionStep,
  AgentMessage,
  AgentPendingConfirmation,
} from '@/shared/hooks/use-agent-mode'
import { Button } from '@/shared/ui/button'
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator'
import type { RefObject } from 'react'

import { AgentMessageCard } from './agent-message-card'
import {
  AGENT_MESSAGE_THREAD,
  AGENT_PANEL_SURFACE,
  AgentMessageDayDivider,
  formatMessageDayLabel,
  messageDayKey,
  MOTION_FADE_IN,
  MOTION_FADE_IN_VISIBLE,
  stopPropagation,
} from './agent-mode-panel-message-utils'

const AGENT_TYPING_ICON = <Sparkles className="size-4 text-primary" aria-hidden />

function stepStatusIcon(status: AgentExecutionStep['status']) {
  if (status === 'completed') return <Check className="size-3.5 text-primary" aria-hidden />
  if (status === 'failed') return <AlertCircle className="size-3.5 text-destructive" aria-hidden />
  if (status === 'active') return <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
  return <Clock className="size-3.5 text-muted-foreground" aria-hidden />
}

export function AgentExecutionTimeline({
  steps = [],
  label,
}: {
  steps?: AgentExecutionStep[]
  label: string
}) {
  if (steps.length === 0) {
    return <ChatTypingIndicator label={label} variant="bubble" icon={AGENT_TYPING_ICON} />
  }

  return (
    <div className="flex gap-3" role="status" aria-live="polite" aria-atomic="true">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/15">
        <Sparkles className="size-4 text-primary" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md border border-border/60 bg-card/90 p-3 shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <ol className="mt-2 space-y-2">
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 shrink-0">{stepStatusIcon(step.status)}</span>
              <span className="min-w-0">
                <span
                  className={cn(
                    'font-medium',
                    step.status === 'failed' && 'text-destructive',
                    step.status === 'active' && 'text-foreground',
                    step.status === 'completed' && 'text-foreground',
                    step.status === 'pending' && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
                {step.detail ? <span className="mt-0.5 block text-muted-foreground">{step.detail}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
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
}) {
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
              const timestamp =
                message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp)
              const dayKey = Number.isNaN(timestamp.getTime()) ? null : messageDayKey(timestamp)
              const previousMessage = index > 0 ? messages[index - 1] : null
              const previousTimestamp = previousMessage
                ? previousMessage.timestamp instanceof Date
                  ? previousMessage.timestamp
                  : new Date(previousMessage.timestamp)
                : null
              const previousDayKey =
                previousTimestamp && !Number.isNaN(previousTimestamp.getTime())
                  ? messageDayKey(previousTimestamp)
                  : null
              const showDayDivider = dayKey !== null && dayKey !== previousDayKey

              return (
                <Fragment key={message.clientId}>
                  {showDayDivider ? (
                    <AgentMessageDayDivider label={formatMessageDayLabel(timestamp)} />
                  ) : null}
                  <AgentMessageCard
                    message={message}
                    mentionLabels={mentionLabels}
                    isProcessing={isProcessing}
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
            variant="secondary"
            className="pointer-events-auto h-8 gap-1.5 rounded-full border border-border/60 bg-background/95 px-4 shadow-lg backdrop-blur-sm"
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

export function FailedMessageBanner({
  lastFailedMessage,
  onRetry,
}: {
  lastFailedMessage: string | null
  onRetry: () => void
}) {
  if (!lastFailedMessage) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-between gap-3 border-t border-destructive/20 bg-destructive/[0.07] px-4 py-2.5"
    >
      <div className="flex items-center gap-2 text-sm text-destructive">
        <WifiOff className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">Message failed to send</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="h-8 gap-1.5 rounded-full border-destructive/25 text-destructive hover:bg-destructive/10"
        aria-label="Retry sending failed message"
      >
        <RefreshCw className="size-3.5" aria-hidden />
        Retry
      </Button>
    </div>
  )
}
