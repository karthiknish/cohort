'use client'

import { ChevronDown, ChevronRight, Loader2, MessageSquare, RefreshCw, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'
import { formatRelativeTime } from '../utils'

export interface ThreadToggleButtonProps {
  replyCount: number
  lastReplyLabel: string | null
  isOpen: boolean
  isLoading: boolean
  hasRepliesLoaded: boolean
  onToggle: () => void
}

export function ThreadToggleButton({
  replyCount,
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
    >
      {isLoading && !isOpen && !hasRepliesLoaded ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isOpen ? (
        <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" />
      )}
      <MessageSquare className="h-3.5 w-3.5" />
      <span className="font-medium">
        {replyCount === 1 ? '1 reply' : `${replyCount} replies`}
      </span>
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
    <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
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
    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>{hasReplies ? 'Loading more replies…' : 'Loading replies…'}</span>
    </div>
  )
}

export interface ThreadEmptyStateProps {}

export function ThreadEmptyState({}: ThreadEmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-muted/50 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
      Be the first to reply in this thread
    </div>
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
    >
      <RefreshCw className="mr-1 h-3 w-3" />
      Retry
    </Button>
  )
}

export interface ThreadSectionProps {
  threadRootId: string
  replyCount: number
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
  renderReply: (reply: CollaborationMessage) => React.ReactNode
}

export function ThreadSection({
  threadRootId,
  replyCount,
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
  renderReply,
}: ThreadSectionProps) {
  const hasThreadReplies = replyCount > 0
  const lastReplyLabel = lastReplyIso ? formatRelativeTime(lastReplyIso) : null
  const hasRepliesLoaded = replies.length > 0

  return (
    <div className="pt-2">
      {/* Thread Toggle Button */}
      {hasThreadReplies ? (
        <div className="flex flex-wrap items-center gap-2">
          <ThreadToggleButton
            replyCount={replyCount}
            lastReplyLabel={lastReplyLabel}
            isOpen={isOpen}
            isLoading={isLoading}
            hasRepliesLoaded={hasRepliesLoaded}
            onToggle={onToggle}
          />
          {error && !isOpen && <ThreadRetryButton isLoading={isLoading} onRetry={onRetry} />}
        </div>
      ) : (
        <StartThreadButton onReply={onReply} />
      )}

      {/* Thread Replies Container */}
      {isOpen && (
        <div className="mt-3 animate-in slide-in-from-top-2 space-y-2 border-l-2 border-primary/20 pl-4 duration-200">
          {/* Thread Error */}
          {error && <ThreadError error={error} isLoading={isLoading} onRetry={onRetry} />}

          {/* Loading State */}
          {isLoading && replies.length === 0 && <ThreadLoading hasReplies={false} />}

          {/* Thread Replies */}
          <div className="space-y-2">{replies.map((reply) => renderReply(reply))}</div>

          {/* Loading More State */}
          {isLoading && replies.length > 0 && <ThreadLoading hasReplies={true} />}

          {/* Empty State */}
          {!isLoading && replies.length === 0 && !error && <ThreadEmptyState />}

          {/* Load More Button */}
          {hasNextCursor && (
            <ThreadLoadMoreButton isLoading={isLoading} onLoadMore={onLoadMore} />
          )}

          {/* Inline Thread Reply Composer */}
          <ThreadReplyButton onReply={onReply} />
        </div>
      )}
    </div>
  )
}
