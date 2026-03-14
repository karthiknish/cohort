'use client'

import { Fragment } from 'react'
import { ChevronDown, ChevronRight, LoaderCircle, MessageSquare, RefreshCw, Reply } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import type { AsyncViewState } from '@/shared/ui/state-wrapper'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'

import { formatRelativeTime } from '../utils'

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
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'inline-flex items-center gap-2 text-xs text-primary transition-colors hover:bg-primary/5 hover:text-primary/90',
        isOpen && 'bg-primary/5'
      )}
      onClick={onToggle}
      disabled={isLoading && !isOpen && !hasRepliesLoaded}
      aria-expanded={isOpen}
    >
      {isLoading && !isOpen && !hasRepliesLoaded ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
      ) : isOpen ? (
        <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" />
      )}
      <MessageSquare className="h-3.5 w-3.5" />
      <span className="font-medium">
        {replyCount === 1 ? '1 reply' : `${replyCount} replies`}
      </span>
      {unreadCount > 0 && (
        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          {unreadCount} new
        </span>
      )}
      {lastReplyLabel && (
        <span className="font-normal text-muted-foreground">· Last reply {lastReplyLabel}</span>
      )}
    </Button>
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
        <RefreshCw className={cn('mr-1 h-3 w-3', isLoading && 'animate-spin')} />
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
      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={onLoadMore}
      disabled={isLoading}
    >
      <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
      {isLoading ? 'Loading…' : 'Load older replies'}
    </Button>
  )
}

export interface ThreadReplyButtonProps {
  onReply: () => void
}

export function ThreadReplyButton({ onReply }: ThreadReplyButtonProps) {
  return (
    <div className="pt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 w-full justify-start text-xs text-muted-foreground hover:text-foreground"
        onClick={onReply}
      >
        <Reply className="mr-2 h-3.5 w-3.5" />
        Reply to thread…
      </Button>
    </div>
  )
}

export interface StartThreadButtonProps {
  onReply: () => void
}

export function StartThreadButton({ onReply }: StartThreadButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="inline-flex items-center gap-2 text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
      onClick={onReply}
    >
      <Reply className="h-3.5 w-3.5" />
      <span>Reply</span>
    </Button>
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
      <RefreshCw className={cn('mr-1 h-3 w-3', isLoading && 'animate-spin')} />
      {isLoading ? 'Retrying…' : 'Retry'}
    </Button>
  )
}

export interface ThreadSectionProps {
  threadRootId: string
  replyCount: number
  unreadCount?: number
  lastReplyIso: string | null
  isOpen: boolean
  isLoading: boolean
  error: string | null
  hasNextCursor: boolean
  replies: CollaborationMessage[]
  onToggle: () => void
  onRetry: () => void
  onLoadMore: () => void
  onReply: () => void
  canReply?: boolean
  renderReply: (reply: CollaborationMessage) => React.ReactNode
}

export function ThreadSection({
  threadRootId,
  replyCount,
  unreadCount = 0,
  lastReplyIso,
  isOpen,
  isLoading,
  error,
  hasNextCursor,
  replies,
  onToggle,
  onRetry,
  onLoadMore,
  onReply,
  canReply = true,
  renderReply,
}: ThreadSectionProps) {
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

      {/* Thread Replies Container */}
      {isOpen && (
        <div id={panelId} className="mt-3 animate-in slide-in-from-top-2 space-y-2 border-l-2 border-primary/20 pl-4 duration-200">
          {threadState === 'error' ? <ThreadError error={error ?? 'Unable to load replies.'} isLoading={isLoading} onRetry={onRetry} /> : null}

          {threadState === 'loading' ? <ThreadLoading hasReplies={false} /> : null}

          {threadState === 'empty' ? <ThreadEmptyState /> : null}

          {threadState === 'ready' ? (
            <>
              {error ? <ThreadError error={error} isLoading={isLoading} onRetry={onRetry} /> : null}
              <div className="space-y-2">{replies.map((reply) => <Fragment key={reply.id}>{renderReply(reply)}</Fragment>)}</div>
            </>
          ) : null}

          {isLoading && replies.length > 0 ? <ThreadLoading hasReplies={true} /> : null}

          {/* Load More Button */}
          {hasNextCursor && (
            <ThreadLoadMoreButton isLoading={isLoading} onLoadMore={onLoadMore} />
          )}

          {/* Inline Thread Reply Composer */}
          {canReply && <ThreadReplyButton onReply={onReply} />}
        </div>
      )}
    </div>
  )
}
