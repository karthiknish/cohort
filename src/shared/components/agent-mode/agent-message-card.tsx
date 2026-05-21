'use client'

import { domAnimation, LazyMotion, m } from '@/shared/ui/motion'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Info,
  LoaderCircle,
  Navigation,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { AgentMessage, AgentPendingConfirmation } from '@/shared/hooks/use-agent-mode'
import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'
import { cn } from '@/lib/utils'
import { buildAgentDataSections, type AgentDataSection } from './agent-message-data'
import { AgentMentionPills, AgentMentionText } from './mention-highlights'
import { AgentMessageAttachmentChips } from './agent-mode-panel-sections'

const AGENT_MESSAGE_INITIAL = { opacity: 0, y: 10 } as const
const AGENT_MESSAGE_ANIMATE = { opacity: 1, y: 0 } as const
const AGENT_MESSAGE_ENHANCED_INITIAL = { opacity: 0, y: 10, scale: 0.98 } as const
const AGENT_MESSAGE_ENHANCED_ANIMATE = { opacity: 1, y: 0, scale: 1 } as const
const AGENT_MESSAGE_TRANSITION = {
  duration: motionDurationSeconds.normal,
  ease: motionEasing.out,
} as const

type PresentationTone = 'success' | 'error' | 'warning' | 'info'

interface AgentMessageCardProps {
  message: AgentMessage
  mentionLabels?: string[]
  onRetryLastUserTurn?: () => void
  onRetryUserMessage?: (clientId: string, content: string) => void
  onConfirmPending?: (pending: AgentPendingConfirmation, decision: 'confirm' | 'cancel' | 'edit') => void
  onUndoAction?: (messageId: string, undoHint: NonNullable<AgentMessage['metadata']>['undoHint']) => void
  isProcessing?: boolean
}

const EMPTY_MENTION_LABELS: string[] = []

function getActionLabel(action?: string, operation?: string): string {
  if (operation === 'summarizeAdsPerformance') {
    return 'Ads Snapshot'
  }

  if (operation === 'generatePerformanceReport') {
    return 'Report'
  }

  if (operation === 'createProject' || operation === 'updateProject') {
    return 'Project Action'
  }

  switch (action) {
    case 'navigate':
      return 'Navigation'
    case 'execute':
      return 'Action Executed'
    case 'clarify':
      return 'Clarification'
    default:
      return 'Response'
  }
}

function getActionIcon(action?: string) {
  switch (action) {
    case 'navigate':
      return <Navigation className="h-4 w-4" />
    case 'execute':
      return <Zap className="h-4 w-4" />
    case 'clarify':
      return <HelpCircle className="h-4 w-4" />
    default:
      return <Sparkles className="h-4 w-4" />
  }
}

function derivePresentationTone(message: AgentMessage): PresentationTone {
  const { status, metadata } = message
  if (status === 'success') return 'success'
  if (status === 'error') return 'error'
  if (status === 'warning') return 'warning'
  if (metadata?.action === 'clarify') return 'warning'
  return 'info'
}

function usesStructuredAgentCard(message: AgentMessage): boolean {
  if (message.type !== 'agent') return false
  const { status, metadata } = message
  const action = metadata?.action
  if (metadata?.requiresConfirmation) return true
  if (status === 'error' || status === 'warning') return true
  if (status === 'success' && action) return true
  if (status === 'info' && action) return true
  return false
}

function getPresentationHeading(tone: PresentationTone, action?: string, operation?: string): string {
  if (tone === 'warning' && action !== 'clarify' && action !== 'execute' && action !== 'navigate') {
    return 'Heads up'
  }

  if (action === 'clarify') {
    return tone === 'warning' ? 'Need a bit more detail' : 'Clarification'
  }

  if (action === 'navigate') {
    if (tone === 'success') return 'Navigation ready'
    if (tone === 'error') return 'Navigation failed'
    return 'Navigation'
  }

  if (operation === 'summarizeAdsPerformance') {
    if (tone === 'success') return 'Snapshot ready'
    if (tone === 'error') return 'Snapshot failed'
    return 'Ads snapshot'
  }

  if (operation === 'generatePerformanceReport') {
    if (tone === 'success') return 'Report ready'
    if (tone === 'error') return 'Report failed'
    return 'Report'
  }

  if (operation === 'createProject') {
    if (tone === 'success') return 'Project created'
    if (tone === 'error') return 'Project action failed'
    return 'Project'
  }

  if (operation === 'updateProject') {
    if (tone === 'success') return 'Project updated'
    if (tone === 'error') return 'Project action failed'
    return 'Project'
  }

  if (action === 'execute') {
    if (tone === 'success') return 'Action complete'
    if (tone === 'error') return 'Action failed'
    return 'Action'
  }

  if (tone === 'error') return 'Something went wrong'
  if (tone === 'info') return 'Reply'
  return 'Update'
}

function toneSurfaceClasses(tone: PresentationTone): { shell: string; header: string } {
  switch (tone) {
    case 'success':
      return {
        shell: 'border-accent/25 bg-accent/[0.07]',
        header: 'border-accent/20 bg-accent/10',
      }
    case 'error':
      return {
        shell: 'border-destructive/25 bg-destructive/[0.08]',
        header: 'border-destructive/20 bg-destructive/10',
      }
    case 'warning':
      return {
        shell: 'border-warning/30 bg-warning/[0.09]',
        header: 'border-warning/25 bg-warning/10',
      }
    default:
      return {
        shell: 'border-border/70 bg-muted/25',
        header: 'border-border/60 bg-muted/40',
      }
  }
}

function toneAccentClasses(tone: PresentationTone): { icon: string; title: string; badge: string; mention: string; section: string } {
  switch (tone) {
    case 'success':
      return {
        icon: 'text-primary',
        title: 'text-primary',
        badge: 'bg-background text-primary',
        mention: 'bg-accent/15 text-primary ring-primary/20',
        section: 'border-accent/20',
      }
    case 'error':
      return {
        icon: 'text-destructive',
        title: 'text-destructive',
        badge: 'bg-background text-destructive',
        mention: 'bg-destructive/15 text-destructive ring-destructive/20',
        section: 'border-destructive/20',
      }
    case 'warning':
      return {
        icon: 'text-warning',
        title: 'text-warning',
        badge: 'bg-background text-warning',
        mention: 'bg-warning/15 text-warning ring-warning/25',
        section: 'border-warning/25',
      }
    default:
      return {
        icon: 'text-muted-foreground',
        title: 'text-foreground',
        badge: 'bg-background text-muted-foreground',
        mention: 'bg-muted/80 text-foreground ring-border/40',
        section: 'border-border/60',
      }
  }
}

function StatusGlyph({ tone }: { tone: PresentationTone }) {
  if (tone === 'success') {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
  }
  if (tone === 'error') {
    return <AlertCircle className="h-4 w-4 shrink-0 text-destructive" aria-hidden />
  }
  if (tone === 'warning') {
    return <AlertTriangle className="h-4 w-4 shrink-0 text-warning" aria-hidden />
  }
  return <Info className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
}

function isRetryableData(data: Record<string, unknown> | undefined): boolean {
  return data?.retryable === true
}

function usesStructuredMetricsCard(operation?: string): boolean {
  return operation === 'summarizeAdsPerformance' || operation === 'generatePerformanceReport'
}

function resolveAgentDisplayContent(
  content: string,
  operation: string | undefined,
  dataSections: AgentDataSection[],
  data?: Record<string, unknown>,
): string {
  if (!usesStructuredMetricsCard(operation) || dataSections.length === 0) {
    return content
  }

  const situation = typeof data?.currentSituation === 'string' ? data.currentSituation.trim() : ''
  if (situation.length > 0) return situation

  const firstLine = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0)

  return firstLine ?? content.trim()
}

function routeLinkLabel(operation?: string): string {
  if (operation === 'summarizeAdsPerformance') return 'Open ads dashboard'
  if (operation === 'generatePerformanceReport') return 'Open analytics'
  return 'Go to page'
}

function UserMessageStatus({
  lifecycle,
  onResend,
}: {
  lifecycle?: AgentMessage['lifecycle']
  onResend?: () => void
}) {
  if (lifecycle === 'sending') {
    return (
      <span className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
        <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden />
        Sending…
      </span>
    )
  }

  if (lifecycle === 'failed' && onResend) {
    return (
      <div className="mt-1 flex items-center justify-end gap-2">
        <span className="text-[11px] text-destructive">Failed to send</span>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onResend}>
          <RefreshCw className="mr-1 h-3 w-3" />
          Resend
        </Button>
      </div>
    )
  }

  return null
}

function AgentConfirmationPanel({
  message,
  isProcessing,
  onConfirmPending,
}: {
  message: AgentMessage
  isProcessing?: boolean
  onConfirmPending?: AgentMessageCardProps['onConfirmPending']
}) {
  const pending = message.metadata?.pendingConfirmation
  const confirmation = message.metadata?.confirmation
  if (!message.metadata?.requiresConfirmation || !pending || !confirmation) {
    return null
  }

  return (
    <div className="mt-3 rounded-lg border border-warning/35 bg-warning/5 px-3 py-3 text-xs">
      <p className="font-medium text-foreground">Confirm before running</p>
      <p className="mt-1 leading-relaxed text-muted-foreground">{confirmation.summary}</p>

      {confirmation.affectedRecords && confirmation.affectedRecords.length > 0 ? (
        <ul className="mt-2 space-y-1 text-muted-foreground">
          {confirmation.affectedRecords.map((record) => (
            <li key={record}>• {record}</li>
          ))}
        </ul>
      ) : null}

      {confirmation.fields && Object.keys(confirmation.fields).length > 0 ? (
        <dl className="mt-2 grid gap-1.5 rounded-md border border-border/50 bg-background/70 px-2.5 py-2">
          {Object.entries(confirmation.fields).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="shrink-0 font-medium text-foreground">{key}</dt>
              <dd className="text-muted-foreground">{String(value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {confirmation.missingFields && confirmation.missingFields.length > 0 ? (
        <p className="mt-2 text-warning">
          Still needed: {confirmation.missingFields.join(', ')}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isProcessing}
          onClick={() => onConfirmPending?.(pending, 'confirm')}
        >
          Confirm
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isProcessing}
          onClick={() => onConfirmPending?.(pending, 'edit')}
        >
          Edit
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isProcessing}
          onClick={() => onConfirmPending?.(pending, 'cancel')}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function AgentMessageCard({
  message,
  mentionLabels = EMPTY_MENTION_LABELS,
  onRetryLastUserTurn,
  onRetryUserMessage,
  onConfirmPending,
  onUndoAction,
  isProcessing,
}: AgentMessageCardProps) {
  const { type, content, status, metadata, route, steps } = message

  if (type === 'user') {
    const handleResend = onRetryUserMessage
      ? () => onRetryUserMessage(message.clientId, message.content)
      : undefined

    return (
      <LazyMotion features={domAnimation}>
        <m.div
          initial={AGENT_MESSAGE_INITIAL}
          animate={AGENT_MESSAGE_ANIMATE}
          className="flex flex-col items-end"
        >
          <div
            className={cn(
              'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm text-primary-foreground',
              message.lifecycle === 'failed' ? 'bg-destructive/80' : 'bg-primary',
              message.lifecycle === 'sending' && 'opacity-80',
            )}
          >
            <AgentMentionText
              text={content}
              mentionLabels={mentionLabels}
              mentionClassName="bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/20"
            />
            {message.mentions && message.mentions.length > 0 ? (
              <AgentMentionPills mentions={message.mentions} />
            ) : null}
            {message.attachments && message.attachments.length > 0 ? (
              <AgentMessageAttachmentChips attachments={message.attachments} />
            ) : null}
          </div>
          <UserMessageStatus lifecycle={message.lifecycle} onResend={handleResend} />
        </m.div>
      </LazyMotion>
    )
  }

  const action = metadata?.action
  const operation = metadata?.operation
  const dataSections = buildAgentDataSections(operation, metadata?.data)
  const tone = derivePresentationTone(message)
  const surfaces = toneSurfaceClasses(tone)
  const accents = toneAccentClasses(tone)
  const liveRegion = tone === 'error' || tone === 'warning' ? 'assertive' : 'off'
  const usedContextNames = metadata?.usedContext?.attachmentNames ?? []

  const executeSucceeded = metadata?.action === 'execute' && metadata.success === true
  const showRouteLink = Boolean(route) && (tone === 'success' || executeSucceeded)

  const displayContent = resolveAgentDisplayContent(content, operation, dataSections, metadata?.data)
  const detailUserMessage =
    typeof metadata?.data?.userMessage === 'string' && metadata.data.userMessage.trim().length > 0
      ? metadata.data.userMessage.trim()
      : null
  const showDetailLine =
    !usesStructuredMetricsCard(operation) &&
    Boolean(detailUserMessage && detailUserMessage !== content.trim() && detailUserMessage !== displayContent.trim())

  const showRetryButton =
    Boolean(onRetryLastUserTurn) && isRetryableData(metadata?.data) && metadata?.action === 'execute'

  if (usesStructuredAgentCard(message)) {
    const heading = getPresentationHeading(tone, action, operation)
    const statusLabel =
      tone === 'success'
        ? 'Success'
        : tone === 'error'
          ? 'Error'
          : tone === 'warning'
            ? 'Warning'
            : 'Information'

    return (
      <LazyMotion features={domAnimation}>
        <m.div
          initial={AGENT_MESSAGE_ENHANCED_INITIAL}
          animate={AGENT_MESSAGE_ENHANCED_ANIMATE}
          transition={AGENT_MESSAGE_TRANSITION}
          className="flex justify-start"
        >
          <div
            role="status"
            aria-live={liveRegion}
            className={cn('max-w-[90%] overflow-hidden rounded-xl border shadow-sm', surfaces.shell)}
          >
            <div className={cn('flex items-center gap-2 border-b px-4 py-2.5', surfaces.header)}>
              <StatusGlyph tone={tone} />
              <span className={cn('min-w-0 flex-1 text-sm font-medium', accents.title)}>{heading}</span>
              <span className="sr-only">{statusLabel}</span>
              <Badge variant="secondary" className={cn('ml-auto shrink-0 text-xs', accents.badge)}>
                <span className="inline-flex items-center gap-1">
                  {getActionIcon(action)}
                  <span>{getActionLabel(action, operation)}</span>
                </span>
              </Badge>
            </div>

            <div className="px-4 py-3">
              <p className="text-sm leading-relaxed text-foreground">
                <AgentMentionText
                  text={displayContent}
                  mentionLabels={mentionLabels}
                  mentionClassName={accents.mention}
                />
              </p>
              {usedContextNames.length > 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Used context from: {usedContextNames.join(', ')}
                </p>
              ) : null}

              {showDetailLine ? (
                <p className="mt-2 rounded-lg border border-border/50 bg-background/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {detailUserMessage}
                </p>
              ) : null}

              {steps && steps.length > 0 ? (
                <ol className="mt-3 space-y-1 border-t border-border/50 pt-3">
                  {steps.map((step) => (
                    <li key={step.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full',
                          step.status === 'completed' && 'bg-primary',
                          step.status === 'failed' && 'bg-destructive',
                          step.status === 'active' && 'bg-primary animate-pulse',
                          step.status === 'pending' && 'bg-muted-foreground/40',
                        )}
                      />
                      <span className={step.status === 'failed' ? 'text-destructive' : undefined}>{step.label}</span>
                    </li>
                  ))}
                </ol>
              ) : null}

              <AgentConfirmationPanel
                message={message}
                isProcessing={isProcessing}
                onConfirmPending={onConfirmPending}
              />

              {metadata?.undoHint && onUndoAction ? (
                <div className="mt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => onUndoAction(message.id, metadata.undoHint!)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Undo {metadata.undoHint.label.toLowerCase()}
                  </Button>
                </div>
              ) : null}

              {dataSections.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {dataSections.map((section) => (
                    <div
                      key={section.title}
                      className={cn(
                        'rounded-lg border border-border/60 bg-background/80 px-3 py-2.5',
                        accents.section,
                      )}
                    >
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {section.title}
                      </div>

                      {section.type === 'metrics' ? (
                        section.title === 'Insight' ? (
                          <p className="text-sm leading-relaxed text-foreground">{section.items[0]?.value}</p>
                        ) : (
                          <div
                            className={cn(
                              'grid gap-2',
                              section.title === 'Performance'
                                ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'
                                : 'grid-cols-2 md:grid-cols-3',
                            )}
                          >
                            {section.items.map((item, index) => (
                              <div
                                key={item.label}
                                className={cn(
                                  'rounded-md border border-border/50 bg-background px-2.5 py-2 shadow-sm',
                                  section.title === 'Performance' &&
                                    index < 3 &&
                                    'sm:col-span-1 border-primary/15 bg-primary/[0.03]',
                                )}
                              >
                                <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                                  <span>{item.label}</span>
                                  {item.delta ? (
                                    <span
                                      className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold normal-case',
                                        item.deltaTone === 'positive' && 'bg-accent/10 text-primary',
                                        item.deltaTone === 'negative' && 'bg-destructive/10 text-destructive',
                                        item.deltaTone === 'neutral' && 'bg-muted text-muted-foreground',
                                      )}
                                    >
                                      {item.delta}
                                    </span>
                                  ) : null}
                                </div>
                                <div
                                  className={cn(
                                    'mt-1 font-semibold text-foreground',
                                    section.title === 'Performance' && index < 3 ? 'text-base' : 'text-sm',
                                  )}
                                >
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="space-y-2">
                          {section.items.map((item) =>
                            item.href ? (
                              <Link
                                key={`${item.primary}-${item.secondary ?? ''}`}
                                href={item.href}
                                className="block rounded-md bg-background px-2.5 py-2 shadow-sm transition-colors hover:bg-muted/40"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-sm font-medium text-foreground">{item.primary}</div>
                                    {item.secondary ? (
                                      <div className="mt-0.5 text-xs text-muted-foreground">{item.secondary}</div>
                                    ) : null}
                                  </div>
                                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                {item.delta ? (
                                  <div
                                    className={cn(
                                      'mt-2 inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                      item.deltaTone === 'positive' && 'bg-accent/10 text-primary',
                                      item.deltaTone === 'negative' && 'bg-destructive/10 text-destructive',
                                      item.deltaTone === 'neutral' && 'bg-muted text-muted-foreground',
                                    )}
                                  >
                                    {item.delta}
                                  </div>
                                ) : null}
                              </Link>
                            ) : (
                              <div
                                key={`${item.primary}-${item.secondary ?? ''}`}
                                className="rounded-md bg-background px-2.5 py-2 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-sm font-medium text-foreground">{item.primary}</div>
                                    {item.secondary ? (
                                      <div className="mt-0.5 text-xs text-muted-foreground">{item.secondary}</div>
                                    ) : null}
                                  </div>
                                  {item.delta ? (
                                    <span
                                      className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                        item.deltaTone === 'positive' && 'bg-accent/10 text-primary',
                                        item.deltaTone === 'negative' && 'bg-destructive/10 text-destructive',
                                        item.deltaTone === 'neutral' && 'bg-muted text-muted-foreground',
                                      )}
                                    >
                                      {item.delta}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {showRouteLink ? (
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline" className="gap-2">
                    <Link href={route!}>
                      {routeLinkLabel(operation)}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ) : null}

              {showRetryButton ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" variant="outline" className="gap-2" onClick={onRetryLastUserTurn}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Try again
                  </Button>
                  <span className="text-xs text-muted-foreground">Resends your last request.</span>
                </div>
              ) : null}

              {operation && !usesStructuredMetricsCard(operation) ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  Operation: <code className="rounded bg-muted px-1 py-0.5">{operation}</code>
                </div>
              ) : null}
            </div>
          </div>
        </m.div>
      </LazyMotion>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div initial={AGENT_MESSAGE_INITIAL} animate={AGENT_MESSAGE_ANIMATE} className="flex justify-start">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-secondary px-4 py-2.5 text-sm text-secondary-foreground">
          <AgentMentionText
            text={content}
            mentionLabels={mentionLabels}
            mentionClassName="bg-secondary-foreground/15 text-secondary-foreground ring-secondary-foreground/20"
          />
        </div>
      </m.div>
    </LazyMotion>
  )
}
