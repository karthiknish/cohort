'use client'

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import type { CollaborationMessage, CollaborationMention } from '@/types/collaboration'
import { useMessageListRenderContext } from './message-list-render-context'
import {
  ChannelMessageCard,
  DirectMessageCard,
  MessageDateSeparator,
  MessageListEmptyState,
  MessageListLoadMoreButton,
  MessageListLoadingState,
} from './message-list-sections'
import type { MessageListRenderers } from './message-list-sections'

export interface UnifiedMessage {
  id: string
  senderId: string | null
  senderName: string
  senderRole?: string | null
  content: string
  createdAtMs: number
  edited?: boolean
  deleted?: boolean
  reactions?: Array<{ emoji: string; count: number; userIds: string[] }>
  attachments?: Array<{ url: string; name?: string; mimeType?: string; size?: number }>
  sharedTo?: string[]
  // Channel-specific fields
  mentions?: CollaborationMention[]
  threadRootId?: string | null
  threadReplyCount?: number
  threadLastReplyAt?: string | null
  isPinned?: boolean
  deletedBy?: string | null
  deletedAt?: string | null
}

/**
 * Convert a CollaborationMessage (channel message) to UnifiedMessage format
 */
export function collaborationToUnifiedMessage(msg: CollaborationMessage): UnifiedMessage {
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderName: msg.senderName,
    senderRole: msg.senderRole,
    content: msg.content ?? '',
    createdAtMs: msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now(),
    edited: msg.isEdited,
    deleted: msg.isDeleted,
    reactions: msg.reactions ?? undefined,
    attachments: msg.attachments?.map(a => ({
      url: a.url,
      name: a.name,
      mimeType: a.type ?? undefined,
      size: a.size ? parseInt(a.size, 10) : undefined,
    })) ?? undefined,
    sharedTo: msg.sharedTo ?? undefined,
    mentions: msg.mentions ?? undefined,
    threadRootId: msg.threadRootId ?? undefined,
    threadReplyCount: msg.threadReplyCount ?? undefined,
    threadLastReplyAt: msg.threadLastReplyAt ?? undefined,
    isPinned: msg.isPinned,
    deletedBy: msg.deletedBy ?? undefined,
    deletedAt: msg.deletedAt ?? undefined,
  }
}

export interface MessageListProps {
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  renderMessageExtras?: (message: UnifiedMessage) => React.ReactNode
  renderMessageActions?: (message: UnifiedMessage) => React.ReactNode
  renderMessageContent?: (message: UnifiedMessage) => React.ReactNode
  renderMessageAttachments?: (message: UnifiedMessage) => React.ReactNode
  renderMessageFooter?: (message: UnifiedMessage) => React.ReactNode
  renderThreadSection?: (message: UnifiedMessage) => React.ReactNode
  renderEditForm?: (message: UnifiedMessage) => React.ReactNode
  renderDeletedInfo?: (message: UnifiedMessage) => React.ReactNode
  renderMessageWrapper?: (message: UnifiedMessage, children: React.ReactNode) => React.ReactNode
  emptyState?: React.ReactNode
  loadingSkeleton?: React.ReactNode
  variant?: 'channel' | 'dm'
  showAvatars?: boolean
  compact?: boolean
  // Channel-specific callbacks
  onEditMessage?: (messageId: string, content: string) => void
  onDeleteMessage?: (messageId: string) => void
  onReply?: (message: UnifiedMessage) => void
  onCreateTask?: (message: UnifiedMessage) => void
  // Pull to refresh
  onRefresh?: () => Promise<void> | void
  // State for editing/deleting
  editingMessageId?: string | null
  deletingMessageId?: string | null
  updatingMessageId?: string | null
  // Deep-link focus support
  focusMessageId?: string | null
  focusThreadId?: string | null
}

const EMPTY_REACTION_PENDING_BY_MESSAGE: Record<string, string | null> = {}

function formatDate(ms: number): string {
  const date = new Date(ms)
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

function groupMessagesByDate(messages: UnifiedMessage[]): Map<string, UnifiedMessage[]> {
  const groups = new Map<string, UnifiedMessage[]>()
  const seenIds = new Set<string>()
  
  for (const message of messages) {
    if (seenIds.has(message.id)) continue
    seenIds.add(message.id)
    
    const dateKey = formatDate(message.createdAtMs)
    const existing = groups.get(dateKey) ?? []
    existing.push(message)
    groups.set(dateKey, existing)
  }
  
  return groups
}

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  hasMore,
  onLoadMore,
  onToggleReaction,
  reactionPendingByMessage = EMPTY_REACTION_PENDING_BY_MESSAGE,
  renderMessageExtras,
  renderMessageActions,
  renderMessageContent,
  renderMessageAttachments,
  renderMessageFooter,
  renderThreadSection,
  renderEditForm,
  renderDeletedInfo,
  renderMessageWrapper,
  emptyState,
  loadingSkeleton,
  variant = 'dm',
  showAvatars = true,
  editingMessageId,
  deletingMessageId,
  updatingMessageId,
  focusMessageId,
  focusThreadId,
}: MessageListProps) {
  const renderContext = useMessageListRenderContext()
  const scrollRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prependSnapshotRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(null)
  const loadingOlderRef = useRef(false)
  const lastFocusedMessageRef = useRef<string | null>(null)
  const previousEdgeRef = useRef<{ firstId: string | null; lastId: string | null }>({
    firstId: null,
    lastId: null,
  })
  const shouldStickToBottomRef = useRef(true)
  const hasAutoScrolledInitiallyRef = useRef(false)
  const [localReactionPending, setLocalReactionPending] = useState<string | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)

  const sortedMessages = useMemo(() => 
    [...messages].sort((a, b) => a.createdAtMs - b.createdAtMs),
    [messages]
  )
  
  const groupedMessages = useMemo(() => 
    groupMessagesByDate(sortedMessages),
    [sortedMessages]
  )
  const effectiveRenderMessageExtras = renderMessageExtras ?? renderContext?.renderMessageExtras
  const effectiveRenderMessageActions = renderMessageActions ?? renderContext?.renderMessageActions
  const effectiveRenderMessageContent = renderMessageContent ?? renderContext?.renderMessageContent
  const effectiveRenderMessageAttachments = renderMessageAttachments ?? renderContext?.renderMessageAttachments
  const effectiveRenderMessageFooter = renderMessageFooter ?? renderContext?.renderMessageFooter
  const effectiveRenderThreadSection = renderThreadSection ?? renderContext?.renderThreadSection
  const effectiveRenderEditForm = renderEditForm ?? renderContext?.renderEditForm
  const effectiveRenderDeletedInfo = renderDeletedInfo ?? renderContext?.renderDeletedInfo
  const effectiveRenderMessageWrapper = renderMessageWrapper ?? renderContext?.renderMessageWrapper
  const renderers = useMemo<MessageListRenderers>(
    () => ({
      renderMessageActions: effectiveRenderMessageActions,
      renderMessageAttachments: effectiveRenderMessageAttachments,
      renderMessageContent: effectiveRenderMessageContent,
      renderMessageExtras: effectiveRenderMessageExtras,
      renderMessageFooter: effectiveRenderMessageFooter,
      renderThreadSection: effectiveRenderThreadSection,
      renderEditForm: effectiveRenderEditForm,
      renderDeletedInfo: effectiveRenderDeletedInfo,
    }),
    [
      effectiveRenderDeletedInfo,
      effectiveRenderEditForm,
      effectiveRenderMessageActions,
      effectiveRenderMessageAttachments,
      effectiveRenderMessageContent,
      effectiveRenderMessageExtras,
      effectiveRenderMessageFooter,
      effectiveRenderThreadSection,
    ]
  )

  const requestLoadOlder = useCallback(() => {
    const container = scrollRef.current
    if (!container || !hasMore || isLoading || loadingOlderRef.current) {
      return
    }

    prependSnapshotRef.current = {
      scrollTop: container.scrollTop,
      scrollHeight: container.scrollHeight,
    }
    loadingOlderRef.current = true
    onLoadMore()
  }, [hasMore, isLoading, onLoadMore])

  useEffect(() => {
    // Release load-more guard if a load cycle ends without message changes.
    if (!isLoading && loadingOlderRef.current && prependSnapshotRef.current) {
      loadingOlderRef.current = false
      prependSnapshotRef.current = null
    }
  }, [isLoading])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const firstId = sortedMessages[0]?.id ?? null
    const lastMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null
    const lastId = lastMessage ? lastMessage.id : null
    const previousFirst = previousEdgeRef.current.firstId
    const previousLast = previousEdgeRef.current.lastId

    if (prependSnapshotRef.current) {
      const snapshot = prependSnapshotRef.current
      const delta = container.scrollHeight - snapshot.scrollHeight
      container.scrollTop = snapshot.scrollTop + delta
      prependSnapshotRef.current = null
      loadingOlderRef.current = false
    } else if (!hasAutoScrolledInitiallyRef.current && sortedMessages.length > 0) {
      container.scrollTop = container.scrollHeight
      shouldStickToBottomRef.current = true
      hasAutoScrolledInitiallyRef.current = true
    } else {
      const conversationSwitched =
        previousFirst !== null &&
        previousLast !== null &&
        firstId !== null &&
        lastId !== null &&
        previousFirst !== firstId &&
        previousLast !== lastId

      const appendedAtBottom =
        previousLast !== null &&
        previousFirst === firstId &&
        previousLast !== lastId

      if ((conversationSwitched || appendedAtBottom) && shouldStickToBottomRef.current) {
        container.scrollTop = container.scrollHeight
      }
    }

    previousEdgeRef.current = { firstId, lastId }
  }, [sortedMessages])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const resolvedFocusId =
      (typeof focusMessageId === 'string' && focusMessageId.trim().length > 0
        ? focusMessageId.trim()
        : null) ??
      (typeof focusThreadId === 'string' && focusThreadId.trim().length > 0
        ? sortedMessages.find((message) => {
            const threadRootId =
              typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
                ? message.threadRootId.trim()
                : message.id
            return threadRootId === focusThreadId.trim()
          })?.id ?? null
        : null)

    if (!resolvedFocusId) {
      return
    }

    if (lastFocusedMessageRef.current === resolvedFocusId) {
      return
    }

    const candidates = container.querySelectorAll<HTMLElement>('[data-message-id]')
    let target: HTMLElement | null = null
    for (const node of candidates) {
      if (node.dataset.messageId === resolvedFocusId) {
        target = node
        break
      }
    }

    if (!target) {
      return
    }

    lastFocusedMessageRef.current = resolvedFocusId
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })

    const frame = window.requestAnimationFrame(() => {
      setHighlightedMessageId(resolvedFocusId)
    })

    const timer = window.setTimeout(() => {
      setHighlightedMessageId((current) => (current === resolvedFocusId ? null : current))
    }, 2400)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [focusMessageId, focusThreadId, sortedMessages])

  const scrollToLatest = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    shouldStickToBottomRef.current = true
    setShowJumpToLatest(false)
  }, [])

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const distanceFromBottom = container.scrollHeight - (container.scrollTop + container.clientHeight)
    shouldStickToBottomRef.current = distanceFromBottom < 80
    setShowJumpToLatest(distanceFromBottom > 200 && sortedMessages.length > 0)
    
    if (container.scrollTop < 64) {
      requestLoadOlder()
    }
  }, [requestLoadOlder, sortedMessages.length])

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    const key = `${messageId}-${emoji}`
    if (localReactionPending) return
    setLocalReactionPending(key)
    await onToggleReaction(messageId, emoji).catch(() => undefined)
    setLocalReactionPending(null)
  }, [localReactionPending, onToggleReaction])

  const isChannel = variant === 'channel'

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageListLoadingState loadingSkeleton={loadingSkeleton} />
      </div>
    )
  }

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageListEmptyState emptyState={emptyState} />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className={cn('p-4', isChannel && 'space-y-4')}>
          {hasMore && (
            <MessageListLoadMoreButton disabled={isLoading} isLoading={isLoading} onLoadMore={requestLoadOlder} />
          )}

          <div className={cn('space-y-6', isChannel && 'space-y-1')}>
            {Array.from(groupedMessages.entries()).map(([date, msgs]) => (
              <div key={date}>
                <MessageDateSeparator date={date} />
                
                <div className={cn('space-y-3', isChannel && 'space-y-1')}>
                  {msgs.map((message) => {
                    const isEditing = editingMessageId === message.id
                    const isDeleting = deletingMessageId === message.id
                    const isUpdating = updatingMessageId === message.id
                    
                    if (isChannel) {
                      const content = (
                        <ChannelMessageCard
                          currentUserId={currentUserId}
                          highlighted={message.id === highlightedMessageId}
                          isDeleting={isDeleting}
                          isEditing={isEditing}
                          isUpdating={isUpdating}
                          localReactionPending={localReactionPending}
                          message={message}
                          onReact={handleReaction}
                          reactionPendingByMessage={reactionPendingByMessage}
                          renderers={renderers}
                          showAvatars={showAvatars}
                        />
                      )

                      return (
                        <Fragment key={message.id}>
                          {effectiveRenderMessageWrapper ? effectiveRenderMessageWrapper(message, content) : content}
                        </Fragment>
                      )
                    }

                    const messageContent = (
                      <DirectMessageCard
                        currentUserId={currentUserId}
                        isDeleting={isDeleting}
                        isEditing={isEditing}
                        localReactionPending={localReactionPending}
                        message={message}
                        onReact={handleReaction}
                        reactionPendingByMessage={reactionPendingByMessage}
                        renderers={renderers}
                        showAvatars={showAvatars}
                      />
                    )
                    
                    return (
                      <Fragment key={message.id}>
                        {effectiveRenderMessageWrapper ? effectiveRenderMessageWrapper(message, messageContent) : messageContent}
                      </Fragment>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {showJumpToLatest ? (
        <div className="pointer-events-none absolute bottom-4 right-4 z-10">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto gap-1.5 shadow-md ring-1 ring-border/60"
            onClick={scrollToLatest}
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Latest
          </Button>
        </div>
      ) : null}
    </div>
  )
}
