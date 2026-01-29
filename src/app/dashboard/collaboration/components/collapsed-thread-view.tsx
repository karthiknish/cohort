'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Users,
  Clock,
  CheckCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'

interface Thread {
  rootMessage: CollaborationMessage
  replies: CollaborationMessage[]
  lastReplyAt?: string | null
}

interface CollapsedThreadViewProps {
  threads: Thread[]
  onThreadClick?: (threadId: string) => void
  onExpand?: (threadId: string) => void
  expandedThreads?: Set<string>
  renderExpandedThread?: (thread: Thread) => React.ReactNode
  className?: string
}

/**
 * Collapsible thread view for conversation threads
 * Shows thread summaries that can be expanded to show full conversation
 */
export function CollapsedThreadView({
  threads,
  onThreadClick,
  onExpand,
  expandedThreads = new Set(),
  renderExpandedThread,
  className,
}: CollapsedThreadViewProps) {
  if (threads.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      {threads.map((thread) => (
        <ThreadCard
          key={thread.rootMessage.id}
          thread={thread}
          isExpanded={expandedThreads.has(thread.rootMessage.id)}
          onClick={() => onThreadClick?.(thread.rootMessage.id)}
          onToggleExpand={() => onExpand?.(thread.rootMessage.id)}
        >
          {expandedThreads.has(thread.rootMessage.id) && renderExpandedThread
            ? renderExpandedThread(thread)
            : null}
        </ThreadCard>
      ))}
    </div>
  )
}

interface ThreadCardProps {
  thread: Thread
  isExpanded: boolean
  onClick: () => void
  onToggleExpand: () => void
  children?: React.ReactNode
}

function ThreadCard({
  thread,
  isExpanded,
  onClick,
  onToggleExpand,
  children,
}: ThreadCardProps) {
  const { rootMessage, replies, lastReplyAt } = thread

  // Get unique participants
  const participants = useMemo(() => {
    const uniqueSenders = new Set([rootMessage.senderName])
    replies.forEach((reply) => uniqueSenders.add(reply.senderName))
    return Array.from(uniqueSenders)
  }, [rootMessage, replies])

  // Get read status
  const unreadCount = replies.filter(
    (r) => !r.readBy || r.readBy.length === 0
  ).length

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden transition-colors',
        'hover:bg-muted/50 cursor-pointer',
        unreadCount > 0 && 'border-primary/50 bg-primary/5'
      )}
      onClick={onClick}
    >
      {/* Thread header - always visible */}
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Expand/collapse button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 mt-0.5"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          {/* Thread icon */}
          <div className="flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Thread content */}
          <div className="min-w-0 flex-1">
            {/* Thread title/snippet */}
            <p className="text-sm font-medium line-clamp-1">
              {rootMessage.content}
            </p>

            {/* Thread metadata */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              {/* Reply count */}
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </span>

              {/* Participants */}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {participants.length} {participants.length === 1 ? 'person' : 'people'}
              </span>

              {/* Last activity */}
              {lastReplyAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(new Date(lastReplyAt))}
                </span>
              )}

              {/* Unread indicator */}
              {unreadCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {/* Participant avatars */}
            <div className="flex -space-x-1 mt-2">
              {participants.slice(0, 4).map((name, i) => (
                <Avatar
                  key={name}
                  className="h-6 w-6 border-2 border-background"
                  style={{ zIndex: participants.length - i }}
                >
                  <AvatarFallback className="text-[10px]">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participants.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                  +{participants.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded thread content */}
      {isExpanded && children && (
        <div className="border-t bg-muted/30" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * Compact thread badge for inline display
 */
export function ThreadBadge({
  replyCount,
  unreadCount,
  lastReplyAt,
  onClick,
  className,
}: {
  replyCount: number
  unreadCount?: number
  lastReplyAt?: string | null
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs',
        'bg-muted hover:bg-muted/70 transition-colors',
        unreadCount && unreadCount > 0 && 'bg-primary/10 text-primary hover:bg-primary/20',
        className
      )}
    >
      <MessageSquare className="h-3 w-3" />
      <span>{replyCount}</span>
      {unreadCount && unreadCount > 0 && (
        <span className="font-medium">({unreadCount} new)</span>
      )}
      {lastReplyAt && (
        <span className="text-muted-foreground">
          {formatRelativeTime(new Date(lastReplyAt))}
        </span>
      )}
    </button>
  )
}

/**
 * Thread preview shown when hovering over thread root
 */
export function ThreadPreview({
  replies,
  participants,
  className,
}: {
  replies: CollaborationMessage[]
  participants?: string[]
  className?: string
}) {
  const recentReplies = replies.slice(-3)

  return (
    <div className={cn('p-3 space-y-2', className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{replies.length} replies</span>
        {participants && (
          <span>{participants.length} participants</span>
        )}
      </div>

      <div className="space-y-2">
        {recentReplies.map((reply) => (
          <div key={reply.id} className="flex items-start gap-2 text-sm">
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarFallback className="text-[9px]">
                {reply.senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs">{reply.senderName}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {reply.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {replies.length > 3 && (
        <p className="text-xs text-muted-foreground text-center">
          +{replies.length - 3} more {replies.length - 3 === 1 ? 'reply' : 'replies'}
        </p>
      )}
    </div>
  )
}

/**
 * Hook to organize messages into threads
 */
export function useThreads(messages: CollaborationMessage[]) {
  return useMemo(() => {
    const threadsMap = new Map<string, Thread>()
    const rootMessages = new Set<string>()

    // First pass: identify thread roots
    messages.forEach((message) => {
      if (!message.threadRootId) {
        rootMessages.add(message.id)
        threadsMap.set(message.id, {
          rootMessage: message,
          replies: [],
        })
      }
    })

    // Second pass: assign replies to threads
    messages.forEach((message) => {
      if (message.threadRootId && threadsMap.has(message.threadRootId)) {
        const thread = threadsMap.get(message.threadRootId)!
        thread.replies.push(message)
        if (!thread.lastReplyAt ||
          (message.createdAt && thread.lastReplyAt && new Date(message.createdAt) > new Date(thread.lastReplyAt))) {
          thread.lastReplyAt = message.createdAt ?? null
        }
      }
    })

    // Convert to array and sort by last activity
    return Array.from(threadsMap.values()).sort((a, b) => {
      const aTime = a.lastReplyAt
        ? new Date(a.lastReplyAt).getTime()
        : new Date(a.rootMessage.createdAt ?? 0).getTime()
      const bTime = b.lastReplyAt
        ? new Date(b.lastReplyAt).getTime()
        : new Date(b.rootMessage.createdAt ?? 0).getTime()
      return bTime - aTime
    })
  }, [messages])
}
