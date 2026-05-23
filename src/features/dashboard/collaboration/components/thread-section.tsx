'use client'

import type { ReactNode } from 'react'
import { ChevronRight, LoaderCircle, MessageSquare, RefreshCw, Reply } from 'lucide-react'

import { fadeInDownVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'
import { Button } from '@/shared/ui/button'
import { buttonVariants } from '@/shared/ui/button-variants'
import { EmptyState } from '@/shared/ui/empty-state'
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion'
import { MotionPressable } from '@/shared/ui/motion-primitives'
import type { AsyncViewState } from '@/shared/ui/state-wrapper'

import { formatRelativeTime } from '../utils'

function ThreadPanelReveal({
  open,
  panelId,
  children,
}: {
  open: boolean
  panelId: string
  children: ReactNode
}) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return open ? (
      <div
        id={panelId}
        className="mt-3 space-y-2 border-l-2 border-accent/20 pl-4"
      >
        {children}
      </div>
    ) : null
  }

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <LazyMotion features={domAnimation}>
          <m.div
            key={panelId}
            id={panelId}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeInDownVariants}
            className="mt-3 space-y-2 overflow-hidden border-l-2 border-accent/20 pl-4"
          >
            {children}
          </m.div>
        </LazyMotion>
      ) : null}
    </AnimatePresence>
  )
}

export interface ThreadToggleButtonProps {
  replyCount: number
  unreadCount?: number
  lastReplyLabel: string | null
  isOpen: boolean
  isLoading: boolean
  hasRepliesLoaded: boolean
  onToggle: () => void
}

export function ThreadToggleButton({
  replyCount,
  unreadCount = 0,
  lastReplyLabel,
  isOpen,
  isLoading,
  hasRepliesLoaded,
  onToggle,
}: ThreadToggleButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <MotionPressable
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'inline-flex items-center gap-2 text-xs text-primary transition-colors hover:bg-accent/5 hover:text-primary/90',
        isOpen && 'bg-accent/5',
      )}
      onClick={onToggle}
      disabled={isLoading && !isOpen && !hasRepliesLoaded}
      aria-expanded={isOpen}
    >
      {isLoading && !isOpen && !hasRepliesLoaded ? (
        <LoaderCircle className="size-3.5 animate-spin" />
      ) : (
        <m.span
          animate={prefersReducedMotion ? undefined : { rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.18 }}
          className="inline-flex"
        >
          <ChevronRight className="size-3.5" />
        </m.span>
      )}
      <MessageSquare className="size-3.5" />
      <span className="font-medium">
        {replyCount === 1 ? '1 reply' : `${replyCount} replies`}
      </span>
      {unreadCount > 0 && (
        <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {unreadCount} new
        </span>
      )}
      {lastReplyLabel && (
        <span className="font-normal text-muted-foreground">· Last reply {lastReplyLabel}</span>
      )}
    </MotionPressable>
  )
}

export interface ThreadErrorProps {
  error: string
  isLoading: boolean
  onRetry: () => void
}

export function ThreadError({ error, isLoading, onRetry }: ThreadErrorProps) {
  return (
    <div role="alert" aria-live="assertive" className="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      <span>{error}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-[11px] text-destructive hover:text-destructive/90"
        onClick={onRetry}
        disabled={isLoading}
      >
        <RefreshCw className={cn('mr-1 size-3', isLoading && 'animate-spin')} />
        Retry
      </Button>
    </div>
  )
}

export interface ThreadLoadingProps {
  hasReplies: boolean
}

export function ThreadLoading({ hasReplies }: ThreadLoadingProps) {
  return (
    <div aria-live="polite" aria-busy="true" className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <LoaderCircle className="size-3.5 animate-spin" />
      <span>{hasReplies ? 'Loading more replies…' : 'Loading replies…'}</span>
    </div>
  )
}

export function ThreadEmptyState() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No replies yet"
      description="Be the first to reply in this thread."
      variant="inline"
      className="rounded-md border-dashed bg-muted/10 px-3 py-2 [&_p:last-child]:text-xs"
    />
  )
}

export interface ThreadLoadMoreButtonProps {
  isLoading: boolean
  onLoadMore: () => void
}

export function ThreadLoadMoreButton({ isLoading, onLoadMore }: ThreadLoadMoreButtonProps) {
  return (
    <MotionPressable
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground',
      )}
      onClick={onLoadMore}
      disabled={isLoading}
    >
      <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
      {isLoading ? 'Loading…' : 'Load older replies'}
    </MotionPressable>
  )
}

export interface ThreadReplyButtonProps {
  onReply: () => void
}

export function ThreadReplyButton({ onReply }: ThreadReplyButtonProps) {
  return (
    <div className="pt-2">
      <MotionPressable
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'h-9 w-full justify-start text-xs text-muted-foreground hover:text-foreground',
        )}
        onClick={onReply}
      >
        <Reply className="mr-2 size-3.5" />
        Reply to thread…
      </MotionPressable>
    </div>
  )
}

export interface StartThreadButtonProps {
  onReply: () => void
}

export function StartThreadButton({ onReply }: StartThreadButtonProps) {
  return (
    <MotionPressable
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        'inline-flex items-center gap-2 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100',
      )}
      onClick={onReply}
    >
      <Reply className="size-3.5" />
      <span>Reply</span>
    </MotionPressable>
  )
}

export interface ThreadRetryButtonProps {
  isLoading: boolean
  onRetry: () => void
}

export function ThreadRetryButton({ isLoading, onRetry }: ThreadRetryButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 px-2 text-[11px] text-destructive hover:text-destructive/90"
      onClick={onRetry}
      disabled={isLoading}
    >
      <RefreshCw className={cn('mr-1 size-3', isLoading && 'animate-spin')} />
      {isLoading ? 'Retrying…' : 'Retry'}
    </Button>
  )
}

export type ThreadPanelState = {
  isOpen: boolean
  isLoading: boolean
  hasNextCursor: boolean
}

export interface ThreadSectionProps {
  threadRootId: string
  replyCount: number
  unreadCount?: number
  lastReplyIso: string | null
  panel: ThreadPanelState
  error: string | null
  replies: CollaborationMessage[]
  onToggle: () => void
  onRetry: () => void
  onLoadMore: () => void
  onReply: () => void
  canReply?: boolean
  ReplyRenderer: React.ComponentType<{ reply: CollaborationMessage }>
}

export function ThreadSection({
  threadRootId,
  replyCount,
  unreadCount = 0,
  lastReplyIso,
  panel,
  error,
  replies,
  onToggle,
  onRetry,
  onLoadMore,
  onReply,
  canReply = true,
  ReplyRenderer,
}: ThreadSectionProps) {
  const { isOpen, isLoading, hasNextCursor } = panel
  const hasThreadReplies = replyCount > 0
  const lastReplyLabel = lastReplyIso ? formatRelativeTime(lastReplyIso) : null
  const hasRepliesLoaded = replies.length > 0
  const panelId = `thread-panel-${threadRootId}`

  let threadState: AsyncViewState = 'ready'
  if (error && replies.length === 0) {
    threadState = 'error'
  } else if (isLoading && replies.length === 0) {
    threadState = 'loading'
  } else if (!isLoading && replies.length === 0) {
    threadState = 'empty'
  }

  return (
    <div className="pt-2" data-thread-root-id={threadRootId}>
      {/* Thread Toggle Button */}
      {hasThreadReplies ? (
        <div className="flex flex-wrap items-center gap-2">
          <ThreadToggleButton
            replyCount={replyCount}
            unreadCount={unreadCount}
            lastReplyLabel={lastReplyLabel}
            isOpen={isOpen}
            isLoading={isLoading}
            hasRepliesLoaded={hasRepliesLoaded}
            onToggle={onToggle}
          />
          {error && !isOpen && <ThreadRetryButton isLoading={isLoading} onRetry={onRetry} />}
        </div>
      ) : (
        canReply ? <StartThreadButton onReply={onReply} /> : null
      )}

      <ThreadPanelReveal open={isOpen} panelId={panelId}>
        {threadState === 'error' ? <ThreadError error={error ?? 'Unable to load replies.'} isLoading={isLoading} onRetry={onRetry} /> : null}

        {threadState === 'loading' ? <ThreadLoading hasReplies={false} /> : null}

        {threadState === 'empty' ? <ThreadEmptyState /> : null}

        {threadState === 'ready' ? (
          <>
            {error ? <ThreadError error={error} isLoading={isLoading} onRetry={onRetry} /> : null}
            <div className="space-y-2">
              {replies.map((reply) => (
                <ReplyRenderer key={reply.id} reply={reply} />
              ))}
            </div>
          </>
        ) : null}

        {isLoading && replies.length > 0 ? <ThreadLoading hasReplies={true} /> : null}

        {hasNextCursor ? (
          <ThreadLoadMoreButton isLoading={isLoading} onLoadMore={onLoadMore} />
        ) : null}

        {canReply ? <ThreadReplyButton onReply={onReply} /> : null}
      </ThreadPanelReveal>
    </div>
  )
}
