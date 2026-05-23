'use client'

import { createContext, use, useCallback, useMemo, type ReactNode } from 'react'

import type { CollaborationMessage } from '@/types/collaboration'

import type { MessageListRenderers } from './message-list-render-context'
import type { UnifiedMessage } from './message-list-types'

function collaborationMessageToUnified(message: CollaborationMessage): UnifiedMessage {
  return {
    id: message.id,
    senderId: message.senderId ?? null,
    senderName: message.senderName,
    senderRole: message.senderRole,
    content: message.content ?? '',
    createdAtMs: message.createdAt ? Date.parse(message.createdAt) : 0,
    edited: message.isEdited,
    deleted: message.isDeleted,
    reactions: message.reactions,
    attachments: message.attachments?.map((attachment) => ({
      url: attachment.url,
      name: attachment.name,
      mimeType: attachment.type ?? undefined,
      size:
        attachment.size != null && attachment.size !== ''
          ? Number(attachment.size)
          : undefined,
    })),
    sharedTo: message.sharedTo,
    mentions: message.mentions,
    threadRootId: message.threadRootId,
    threadReplyCount: message.threadReplyCount,
    threadLastReplyAt: message.threadLastReplyAt,
    isPinned: message.isPinned,
    deletedBy: message.deletedBy,
    deletedAt: message.deletedAt,
  }
}
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import { LongPressMessage, SwipeableMessage } from './swipeable-message'
import { ThreadSection } from './thread-section'
import {
  renderMessageContentBlock,
} from './unified-message-pane-render-utils'
import { UnifiedThreadReplyCard } from './unified-message-pane-sections'

type UnifiedThreadReplyContextValue = {
  activeDeletingMessageId: string | null
  currentUserId: string | null
  editingMessageId: string | null
  handleReaction: (messageId: string, emoji: string) => Promise<void>
  handleRequestDelete: (messageId: string) => void
  handleStartEdit: (message: UnifiedMessage) => void
  messageUpdatingId: string | null
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  reactionPendingByMessage: Record<string, string | null>
}

const UnifiedThreadReplyContext = createContext<UnifiedThreadReplyContextValue | null>(null)

function UnifiedThreadReplyRenderer({ reply }: { reply: CollaborationMessage }) {
  const context = use(UnifiedThreadReplyContext)
  if (!context) {
    throw new Error('UnifiedThreadReplyRenderer requires UnifiedThreadReplyContext')
  }

  const handleToggleReaction = useCallback(
    (emoji: string) => {
      void context.handleReaction(reply.id, emoji)
    },
    [context, reply.id],
  )
  const handleStartEdit = useCallback(() => {
    context.handleStartEdit(collaborationMessageToUnified(reply))
  }, [context, reply])
  const handleRequestDelete = useCallback(() => {
    context.handleRequestDelete(reply.id)
  }, [context, reply.id])

  return (
    <UnifiedThreadReplyCard
      reply={reply}
      currentUserId={context.currentUserId}
      editingMessageId={context.editingMessageId}
      activeDeletingMessageId={context.activeDeletingMessageId}
      messageUpdatingId={context.messageUpdatingId}
      reactionPendingEmoji={context.reactionPendingByMessage[reply.id] ?? null}
      onToggleReaction={handleToggleReaction}
      onStartEdit={context.onEditMessage ? handleStartEdit : undefined}
      onRequestDelete={context.onDeleteMessage ? handleRequestDelete : undefined}
    />
  )
}

type UseUnifiedMessagePaneRenderersArgs = {
  activeDeletingMessageId: string | null
  channelMessagesById: Map<string, CollaborationMessage>
  currentUserId: string | null
  deletedInfoByMessage?: Record<string, { deletedBy: string | null; deletedAt: string | null }>
  editingMessageId: string | null
  editingPreview: string
  editingValue: string
  expandedThreadIds: Record<string, boolean>
  headerType?: 'channel' | 'dm'
  isMessageSearchActive: boolean
  messageSearchHighlights: string[]
  messageUpdatingId: string | null
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  onReply?: (message: UnifiedMessage) => void
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  reactionPendingByMessage: Record<string, string | null>
  resolveThreadRootId: (message: UnifiedMessage) => string
  setEditingValue: (value: string) => void
  sharingTo: string | null
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  threadUnreadCountsByRootId: Record<string, number>
  handleCancelEdit: () => void
  handleConfirmEdit: () => void
  handleLoadMoreThread: (threadRootId: string) => void
  handleReaction: (messageId: string, emoji: string) => Promise<void>
  handleReply: (message: UnifiedMessage) => void
  handleRequestDelete: (messageId: string) => void
  handleRetryThreadLoad: (threadRootId: string) => void
  handleShare: (message: UnifiedMessage, platform: 'email') => Promise<void>
  handleStartEdit: (message: UnifiedMessage) => void
  handleThreadToggle: (threadRootId: string, beforeMs?: number) => void
}

export function UnifiedThreadSectionRenderer({
  activeDeletingMessageId,
  expanded,
  handleLoadMoreThread,
  handleReaction,
  handleReply,
  handleRequestDelete,
  handleRetryThreadLoad,
  handleThreadToggle,
  handleStartEdit,
  headerType,
  message,
  onReply,
  resolveThreadRootId,
  threadErrorsByRootId,
  threadLoadingByRootId,
  threadMessagesByRootId,
  threadNextCursorByRootId,
  threadUnreadCountsByRootId,
  currentUserId,
  editingMessageId,
  messageUpdatingId,
  onDeleteMessage,
  onEditMessage,
  reactionPendingByMessage,
}: {
  activeDeletingMessageId: string | null
  expanded: Record<string, boolean>
  handleLoadMoreThread: (threadRootId: string) => void
  handleReaction: (messageId: string, emoji: string) => Promise<void>
  handleReply: (message: UnifiedMessage) => void
  handleRequestDelete: (messageId: string) => void
  handleRetryThreadLoad: (threadRootId: string) => void
  handleThreadToggle: (threadRootId: string, beforeMs?: number) => void
  handleStartEdit: (message: UnifiedMessage) => void
  headerType?: 'channel' | 'dm'
  message: UnifiedMessage
  onReply?: (message: UnifiedMessage) => void
  resolveThreadRootId: (message: UnifiedMessage) => string
  threadErrorsByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  threadUnreadCountsByRootId: Record<string, number>
  currentUserId: string | null
  editingMessageId: string | null
  messageUpdatingId: string | null
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  reactionPendingByMessage: Record<string, string | null>
}) {
  const threadRootId = resolveThreadRootId(message)
  const threadReplies = threadMessagesByRootId[threadRootId] ?? []
  const threadLoading = threadLoadingByRootId[threadRootId] ?? false
  const threadError = threadErrorsByRootId[threadRootId] ?? null
  const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
  const threadReplyCount = (message as UnifiedMessage & { threadReplyCount?: number }).threadReplyCount
  const replyCount = Math.max(
    typeof threadReplyCount === 'number' ? threadReplyCount : 0,
    threadReplies.length,
  )
  const lastReplyIso =
    message.threadLastReplyAt ??
    (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)
  const unreadCount = Math.max(0, threadUnreadCountsByRootId[threadRootId] ?? 0)
  const beforeMs = lastReplyIso ? Date.parse(lastReplyIso) : NaN

  const handleToggle = useCallback(() => {
    const resolvedBeforeMs = Number.isFinite(beforeMs) ? beforeMs : Date.now()
    handleThreadToggle(threadRootId, resolvedBeforeMs)
  }, [beforeMs, handleThreadToggle, threadRootId])

  const handleRetry = useCallback(() => {
    handleRetryThreadLoad(threadRootId)
  }, [handleRetryThreadLoad, threadRootId])

  const handleLoadMore = useCallback(() => {
    handleLoadMoreThread(threadRootId)
  }, [handleLoadMoreThread, threadRootId])

  const handleReplyClick = useCallback(() => {
    handleReply(message)
  }, [handleReply, message])

  const threadReplyContext = useMemo(
    (): UnifiedThreadReplyContextValue => ({
      activeDeletingMessageId,
      currentUserId,
      editingMessageId,
      handleReaction,
      handleRequestDelete,
      handleStartEdit,
      messageUpdatingId,
      onDeleteMessage,
      onEditMessage,
      reactionPendingByMessage,
    }),
    [
      activeDeletingMessageId,
      currentUserId,
      editingMessageId,
      handleReaction,
      handleRequestDelete,
      handleStartEdit,
      messageUpdatingId,
      onDeleteMessage,
      onEditMessage,
      reactionPendingByMessage,
    ],
  )

  const threadPanel = useMemo(
    () => ({
      isOpen: Boolean(expanded[threadRootId]),
      isLoading: threadLoading,
      hasNextCursor: Boolean(threadNextCursor),
    }),
    [expanded, threadLoading, threadNextCursor, threadRootId],
  )

  if (headerType !== 'channel' || message.deleted) {
    return null
  }

  return (
    <UnifiedThreadReplyContext.Provider value={threadReplyContext}>
    <ThreadSection
      threadRootId={threadRootId}
      replyCount={replyCount}
      unreadCount={unreadCount}
      lastReplyIso={lastReplyIso}
      panel={threadPanel}
      error={threadError}
      replies={threadReplies}
      onToggle={handleToggle}
      onRetry={handleRetry}
      onLoadMore={handleLoadMore}
      onReply={handleReplyClick}
      canReply={Boolean(onReply)}
      ReplyRenderer={UnifiedThreadReplyRenderer}
    />
    </UnifiedThreadReplyContext.Provider>
  )
}

export function SwipeableMessageRenderer({
  children,
  currentUserId,
  handleReply,
  handleRequestDelete,
  message,
  onDeleteMessage,
  onReply,
}: {
  children: ReactNode
  currentUserId: string | null
  handleReply: (message: UnifiedMessage) => void
  handleRequestDelete: (messageId: string) => void
  message: UnifiedMessage
  onDeleteMessage?: (messageId: string) => Promise<void>
  onReply?: (message: UnifiedMessage) => void
}) {
  const enableSwipeGestures = useMediaQuery('(pointer: coarse)')

  const handleMessageReply = useCallback(() => {
    handleReply(message)
  }, [handleReply, message])

  const handleMessageDelete = useCallback(() => {
    handleRequestDelete(message.id)
  }, [handleRequestDelete, message.id])

  if (!enableSwipeGestures) {
    if (!message.deleted && onReply) {
      return (
        <LongPressMessage message={message} onLongPress={handleMessageReply}>
          {children}
        </LongPressMessage>
      )
    }

    return children
  }

  return (
    <SwipeableMessage
      key={message.id}
      message={message}
      currentUserId={currentUserId}
      canDelete={!message.deleted && message.senderId === currentUserId && !!onDeleteMessage}
      onReply={!message.deleted && onReply ? handleMessageReply : undefined}
      onDelete={!message.deleted && onDeleteMessage ? handleMessageDelete : undefined}
    >
      {children}
    </SwipeableMessage>
  )
}
