'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ClipboardEvent } from 'react'
import { Send } from 'lucide-react'

import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/components/ui/use-toast'
import { MessageList, type UnifiedMessage } from './message-list'
import { MessageSearchBar, NoSearchResultsState } from './message-pane-parts'
import { SwipeableMessage } from './swipeable-message'
import { ThreadSection } from './thread-section'
import {
  getSharePlatformLabel,
  renderDeletedMessageInfo,
  renderMessageAttachmentsContent,
  renderMessageContentBlock,
  renderMessageEditForm,
  SharedPlatformBadges,
  UnifiedComposerSection,
  UnifiedConversationHeader,
  UnifiedMessageActionBar,
  UnifiedThreadReplyCard,
} from './unified-message-pane-sections'

import type { CollaborationMessage } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'
import type { PendingAttachment } from '../hooks/types'

export interface MessagePaneHeaderInfo {
  name: string
  type: 'channel' | 'dm'
  role?: string | null
  isArchived?: boolean
  isMuted?: boolean
  onArchive?: (archived: boolean) => void
  onMute?: (muted: boolean) => void
  participantCount?: number
  messageCount?: number
  onExport?: () => void
}

export interface UnifiedMessagePaneProps {
  header: MessagePaneHeaderInfo | null
  messages: UnifiedMessage[]
  currentUserId: string | null
  currentUserRole?: string | null
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  onRefresh?: () => Promise<void> | void
  messageSearchQuery?: string
  onMessageSearchChange?: (value: string) => void
  messageSearchHighlights?: string[]
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: (content: string) => Promise<void>
  isSending: boolean
  pendingAttachments?: PendingAttachment[]
  uploadingAttachments?: boolean
  onAddAttachments?: (files: FileList | File[]) => void
  onRemoveAttachment?: (attachmentId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>
  reactionPendingByMessage?: Record<string, string | null>
  onReply?: (message: UnifiedMessage) => void
  onDeleteMessage?: (messageId: string) => Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => Promise<void>
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onCreateTask?: (message: UnifiedMessage) => void
  typingIndicator?: string
  onComposerFocus?: () => void
  onComposerBlur?: () => void
  emptyState?: React.ReactNode
  placeholder?: string
  participants?: ClientTeamMember[]
  channelMessages?: CollaborationMessage[]
  deletedInfoByMessage?: Record<string, { deletedBy: string | null; deletedAt: string | null }>
  threadMessagesByRootId?: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId?: Record<string, string | null>
  threadLoadingByRootId?: Record<string, boolean>
  threadErrorsByRootId?: Record<string, string | null>
  threadUnreadCountsByRootId?: Record<string, number>
  onLoadThreadReplies?: (threadRootId: string) => Promise<void> | void
  onLoadMoreThreadReplies?: (threadRootId: string) => Promise<void> | void
  onMarkThreadAsRead?: (threadRootId: string, beforeMs?: number) => Promise<void> | void
  focusMessageId?: string | null
  focusThreadId?: string | null
  messageUpdatingId?: string | null
  messageDeletingId?: string | null
}

export function UnifiedMessagePane({
  header,
  messages,
  currentUserId,
  currentUserRole,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  messageSearchQuery = '',
  onMessageSearchChange,
  messageSearchHighlights = [],
  messageInput,
  onMessageInputChange,
  onSendMessage,
  isSending,
  pendingAttachments = [],
  uploadingAttachments = false,
  onAddAttachments,
  onRemoveAttachment,
  onToggleReaction,
  reactionPendingByMessage = {},
  onReply,
  onDeleteMessage,
  onEditMessage,
  onShareToPlatform,
  typingIndicator,
  onComposerFocus,
  onComposerBlur,
  emptyState,
  placeholder = 'Type a message...',
  participants = [],
  channelMessages,
  deletedInfoByMessage,
  threadMessagesByRootId = {},
  threadNextCursorByRootId = {},
  threadLoadingByRootId = {},
  threadErrorsByRootId = {},
  threadUnreadCountsByRootId = {},
  onLoadThreadReplies,
  onLoadMoreThreadReplies,
  onMarkThreadAsRead,
  focusMessageId = null,
  focusThreadId = null,
  messageUpdatingId = null,
  messageDeletingId = null,
}: UnifiedMessagePaneProps) {
  const [sharingTo, setSharingTo] = useState<string | null>(null)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)
  const [confirmingDeleteMessageId, setConfirmingDeleteMessageId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingPreview, setEditingPreview] = useState('')
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({})
  const [isComposerFocused, setIsComposerFocused] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastAutoOpenedThreadRef = useRef<string | null>(null)
  const lastConversationKeyRef = useRef<string | null>(null)
  const { toast } = useToast()
  const activeDeletingMessageId = deletingMessageId ?? messageDeletingId
  const conversationKey = header ? `${header.type}:${header.name}` : 'none'
  const canSearchMessages = Boolean(onMessageSearchChange)
  const isMessageSearchActive = messageSearchQuery.trim().length > 0

  const channelMessagesById = useMemo(() => {
    const map = new Map<string, CollaborationMessage>()
    for (const message of channelMessages ?? []) {
      if (message?.id) {
        map.set(message.id, message)
      }
    }

    for (const replies of Object.values(threadMessagesByRootId)) {
      for (const reply of replies) {
        if (reply?.id) {
          map.set(reply.id, reply)
        }
      }
    }

    return map
  }, [channelMessages, threadMessagesByRootId])
  const effectiveFocusMessageId = useMemo(() => {
    if (typeof focusMessageId !== 'string') return null
    const normalizedId = focusMessageId.trim()
    if (!normalizedId) return null

    const focusedMessage = channelMessagesById.get(normalizedId)
    if (!focusedMessage?.parentMessageId) {
      return normalizedId
    }

    return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || normalizedId
  }, [channelMessagesById, focusMessageId])
  const effectiveFocusThreadId = useMemo(() => {
    if (typeof focusThreadId === 'string' && focusThreadId.trim().length > 0) {
      return focusThreadId.trim()
    }

    if (typeof focusMessageId !== 'string' || focusMessageId.trim().length === 0) {
      return null
    }

    const focusedMessage = channelMessagesById.get(focusMessageId.trim())
    if (!focusedMessage) return null
    return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || null
  }, [channelMessagesById, focusMessageId, focusThreadId])

  const hasPendingAttachments = pendingAttachments.length > 0

  useEffect(() => {
    if (lastConversationKeyRef.current === conversationKey) {
      return
    }

    lastConversationKeyRef.current = conversationKey

    const frame = window.requestAnimationFrame(() => {
      setEditingMessageId(null)
      setEditingValue('')
      setEditingPreview('')
      setConfirmingDeleteMessageId(null)
      setDeletingMessageId(null)
      setIsComposerFocused(false)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [conversationKey])

  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    await onToggleReaction(messageId, emoji)
  }, [onToggleReaction])

  const handleReply = useCallback((message: UnifiedMessage) => {
    onReply?.(message)
  }, [onReply])

  const handleDelete = useCallback(async (messageId: string) => {
    if (!onDeleteMessage) return
    setDeletingMessageId(messageId)
    await onDeleteMessage(messageId).catch(() => undefined)
    setDeletingMessageId(null)
  }, [onDeleteMessage])

  const handleRequestDelete = useCallback((messageId: string) => {
    setConfirmingDeleteMessageId(messageId)
  }, [])

  const handleCancelDelete = useCallback(() => {
    if (activeDeletingMessageId) {
      return
    }
    setConfirmingDeleteMessageId(null)
  }, [activeDeletingMessageId])

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmingDeleteMessageId) {
      return
    }

    await handleDelete(confirmingDeleteMessageId)
    setConfirmingDeleteMessageId(null)
  }, [confirmingDeleteMessageId, handleDelete])

  const handleStartEdit = useCallback((message: UnifiedMessage) => {
    if (!onEditMessage || message.deleted) {
      return
    }

    setEditingMessageId(message.id)
    setEditingValue(message.content ?? '')
    setEditingPreview((message.content ?? '').trim().slice(0, 120))
  }, [onEditMessage])

  const handleCancelEdit = useCallback(() => {
    if (messageUpdatingId) {
      return
    }

    setEditingMessageId(null)
    setEditingValue('')
    setEditingPreview('')
  }, [messageUpdatingId])

  const handleConfirmEdit = useCallback(async () => {
    if (!onEditMessage || !editingMessageId) {
      return
    }

    const trimmedValue = editingValue.trim()
    if (!trimmedValue) {
      toast({
        title: 'Message required',
        description: 'Enter a message before saving your changes.',
        variant: 'destructive',
      })
      return
    }

    await onEditMessage(editingMessageId, trimmedValue)
    setEditingMessageId(null)
    setEditingValue('')
    setEditingPreview('')
  }, [editingMessageId, editingValue, onEditMessage, toast])

  const handleShare = useCallback(async (message: UnifiedMessage, platform: 'email') => {
    if (!onShareToPlatform) return

    setSharingTo(`${message.id}-${platform}`)
    await onShareToPlatform(message, platform)
      .then(() => {
        toast({
          title: 'Message shared',
          description: `Sent to ${getSharePlatformLabel(platform)}`,
        })
      })
      .catch(() => {
        toast({
          title: 'Share failed',
          description: `Could not send to ${getSharePlatformLabel(platform)}`,
          variant: 'destructive',
        })
      })

    setSharingTo(null)
  }, [onShareToPlatform, toast])

  const handleSend = async () => {
    const content = messageInput.trim()
    if ((!content && !hasPendingAttachments) || isSending || uploadingAttachments) return
    await onSendMessage(content)
  }

  const handleComposerFocusInternal = useCallback(() => {
    setIsComposerFocused(true)
    onComposerFocus?.()
  }, [onComposerFocus])

  const handleComposerBlurInternal = useCallback(() => {
    setIsComposerFocused(false)
    onComposerBlur?.()
  }, [onComposerBlur])

  const handleAttachmentInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!onAddAttachments) return
      const files = event.target.files
      if (files && files.length > 0) {
        onAddAttachments(files)
      }
      event.target.value = ''
    },
    [onAddAttachments]
  )

  const handleComposerDragOver = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (!onAddAttachments) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },
    [onAddAttachments]
  )

  const handleComposerDrop = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      if (!onAddAttachments) return
      event.preventDefault()
      const files = event.dataTransfer.files
      if (files && files.length > 0) {
        onAddAttachments(files)
      }
    },
    [onAddAttachments]
  )

  const handleComposerPaste = useCallback(
    (event: ClipboardEvent<HTMLTextAreaElement>) => {
      if (!onAddAttachments) return
      const files = event.clipboardData?.files
      if (files && files.length > 0) {
        event.preventDefault()
        onAddAttachments(files)
      }
    },
    [onAddAttachments]
  )

  const resolveThreadRootId = useCallback((message: UnifiedMessage) => {
    const original = channelMessagesById.get(message.id)
    if (original?.threadRootId && original.threadRootId.trim().length > 0) {
      return original.threadRootId.trim()
    }
    if (message.threadRootId && message.threadRootId.trim().length > 0) {
      return message.threadRootId.trim()
    }
    return message.id
  }, [channelMessagesById])

  const handleThreadToggle = useCallback((threadRootId: string, beforeMs?: number) => {
    const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
    if (!normalizedId) return

    const isCurrentlyOpen = Boolean(expandedThreadIds[normalizedId])

    setExpandedThreadIds((prev) => {
      const next = { ...prev }
      if (isCurrentlyOpen) {
        delete next[normalizedId]
      } else {
        next[normalizedId] = true
      }
      return next
    })

    if (!isCurrentlyOpen) {
      const hasRepliesLoaded = (threadMessagesByRootId[normalizedId]?.length ?? 0) > 0
      const hasError = Boolean(threadErrorsByRootId[normalizedId])
      const isLoadingReplies = Boolean(threadLoadingByRootId[normalizedId])

      if ((!hasRepliesLoaded || hasError) && !isLoadingReplies) {
        void onLoadThreadReplies?.(normalizedId)
      }

      void onMarkThreadAsRead?.(normalizedId, beforeMs)
    }
  }, [expandedThreadIds, onLoadThreadReplies, onMarkThreadAsRead, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId])

  const handleRetryThreadLoad = useCallback((threadRootId: string) => {
    const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
    if (!normalizedId) return
    void onLoadThreadReplies?.(normalizedId)
  }, [onLoadThreadReplies])

  const handleLoadMoreThread = useCallback((threadRootId: string) => {
    const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : ''
    if (!normalizedId) return
    void onLoadMoreThreadReplies?.(normalizedId)
  }, [onLoadMoreThreadReplies])

  useEffect(() => {
    if (!effectiveFocusThreadId) {
      lastAutoOpenedThreadRef.current = null
      return
    }

    if (lastAutoOpenedThreadRef.current === effectiveFocusThreadId) {
      return
    }

    lastAutoOpenedThreadRef.current = effectiveFocusThreadId

    const frame = window.requestAnimationFrame(() => {
      setExpandedThreadIds((prev) => {
        if (prev[effectiveFocusThreadId]) return prev
        return {
          ...prev,
          [effectiveFocusThreadId]: true,
        }
      })
    })

    const hasRepliesLoaded = (threadMessagesByRootId[effectiveFocusThreadId]?.length ?? 0) > 0
    const isLoadingReplies = Boolean(threadLoadingByRootId[effectiveFocusThreadId])
    if (!hasRepliesLoaded && !isLoadingReplies) {
      void onLoadThreadReplies?.(effectiveFocusThreadId)
    }

    void onMarkThreadAsRead?.(effectiveFocusThreadId)

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [effectiveFocusThreadId, onLoadThreadReplies, onMarkThreadAsRead, threadLoadingByRootId, threadMessagesByRootId])

  const renderMessageExtras = useCallback(
    (message: UnifiedMessage) => <SharedPlatformBadges platforms={message.sharedTo as Array<'email'> | undefined} />,
    [],
  )

  const renderMessageActions = useCallback(
    (message: UnifiedMessage) => (
      <UnifiedMessageActionBar
        headerType={header?.type ?? 'dm'}
        message={message}
        currentUserId={currentUserId}
        activeDeletingMessageId={activeDeletingMessageId}
        messageUpdatingId={messageUpdatingId}
        sharingTo={sharingTo}
        onReply={onReply ? handleReply : undefined}
        onStartEdit={onEditMessage ? handleStartEdit : undefined}
        onRequestDelete={onDeleteMessage ? handleRequestDelete : undefined}
        onShare={onShareToPlatform ? handleShare : undefined}
      />
    ),
    [activeDeletingMessageId, currentUserId, handleReply, handleRequestDelete, handleShare, handleStartEdit, header?.type, messageUpdatingId, onDeleteMessage, onEditMessage, onReply, onShareToPlatform, sharingTo],
  )

  const renderMessageContent = useCallback((message: UnifiedMessage) => {
    const originalMessage = channelMessagesById.get(message.id)

    return renderMessageContentBlock(
      message,
      originalMessage,
      isMessageSearchActive ? messageSearchHighlights : undefined,
    )
  }, [channelMessagesById, isMessageSearchActive, messageSearchHighlights])

  const renderMessageAttachments = useCallback((message: UnifiedMessage) => {
    return renderMessageAttachmentsContent(message)
  }, [])

  const renderDeletedInfo = useCallback((message: UnifiedMessage) => {
    return renderDeletedMessageInfo(message, deletedInfoByMessage)
  }, [deletedInfoByMessage])

  const renderEditForm = useCallback((message: UnifiedMessage) => {
    return renderMessageEditForm(
      message,
      editingMessageId,
      editingValue,
      setEditingValue,
      handleConfirmEdit,
      handleCancelEdit,
      messageUpdatingId === message.id,
      editingPreview,
    )
  }, [editingMessageId, editingPreview, editingValue, handleCancelEdit, handleConfirmEdit, messageUpdatingId])

  const renderThreadReply = useCallback((reply: CollaborationMessage) => {
    return (
      <UnifiedThreadReplyCard
        reply={reply}
        currentUserId={currentUserId}
        editingMessageId={editingMessageId}
        activeDeletingMessageId={activeDeletingMessageId}
        messageUpdatingId={messageUpdatingId}
        reactionPendingEmoji={reactionPendingByMessage[reply.id] ?? null}
        onToggleReaction={(messageId, emoji) => {
          void handleReaction(messageId, emoji)
        }}
        onStartEdit={onEditMessage ? handleStartEdit : undefined}
        onRequestDelete={onDeleteMessage ? handleRequestDelete : undefined}
        renderEditForm={renderEditForm}
        renderDeletedInfo={renderDeletedInfo}
        renderMessageContent={renderMessageContent}
        renderMessageAttachments={renderMessageAttachments}
      />
    )
  }, [activeDeletingMessageId, currentUserId, editingMessageId, handleReaction, handleRequestDelete, handleStartEdit, messageUpdatingId, onDeleteMessage, onEditMessage, reactionPendingByMessage, renderDeletedInfo, renderEditForm, renderMessageAttachments, renderMessageContent])

  const renderThreadSection = useCallback((message: UnifiedMessage) => {
    if (header?.type !== 'channel' || message.deleted) {
      return null
    }

    const original = channelMessagesById.get(message.id)
    const threadRootId = resolveThreadRootId(message)
    const threadReplies = threadMessagesByRootId[threadRootId] ?? []
    const threadLoading = threadLoadingByRootId[threadRootId] ?? false
    const threadError = threadErrorsByRootId[threadRootId] ?? null
    const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
    const replyCount = Math.max(
      typeof original?.threadReplyCount === 'number'
        ? original.threadReplyCount
        : (typeof message.threadReplyCount === 'number' ? message.threadReplyCount : 0),
      threadReplies.length,
    )
    const lastReplyIso =
      original?.threadLastReplyAt ??
      message.threadLastReplyAt ??
      (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)
    const unreadCount = Math.max(0, threadUnreadCountsByRootId[threadRootId] ?? 0)
    const beforeMs = lastReplyIso ? Date.parse(lastReplyIso) : NaN

    return (
      <ThreadSection
        threadRootId={threadRootId}
        replyCount={replyCount}
        unreadCount={unreadCount}
        lastReplyIso={lastReplyIso}
        isOpen={Boolean(expandedThreadIds[threadRootId])}
        isLoading={threadLoading}
        error={threadError}
        hasNextCursor={Boolean(threadNextCursor)}
        replies={threadReplies}
        onToggle={() =>
          handleThreadToggle(threadRootId, Number.isFinite(beforeMs) ? beforeMs : undefined)
        }
        onRetry={() => handleRetryThreadLoad(threadRootId)}
        onLoadMore={() => handleLoadMoreThread(threadRootId)}
        onReply={() => handleReply(message)}
        canReply={Boolean(onReply)}
        renderReply={renderThreadReply}
      />
    )
  }, [
    channelMessagesById,
    expandedThreadIds,
    handleLoadMoreThread,
    handleReply,
    handleRetryThreadLoad,
    handleThreadToggle,
    header?.type,
    onReply,
    resolveThreadRootId,
    renderThreadReply,
    threadErrorsByRootId,
    threadLoadingByRootId,
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadUnreadCountsByRootId,
  ])

  const renderMessageWrapper = (message: UnifiedMessage, children: React.ReactNode) => (
    <SwipeableMessage
      key={message.id}
      message={message}
      currentUserId={currentUserId}
      canDelete={!message.deleted && message.senderId === currentUserId && !!onDeleteMessage}
      onReply={!message.deleted && onReply ? () => handleReply(message) : undefined}
      onDelete={!message.deleted && onDeleteMessage ? () => handleRequestDelete(message.id) : undefined}
    >
      {children}
    </SwipeableMessage>
  )

  if (!header) {
    return (
      <div className="flex-1 flex items-center justify-center border-muted/40 h-full bg-background/50">
        <div className="text-center p-8">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Send className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Select a conversation</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[480px] flex-1 flex-col bg-background/50 lg:h-[640px] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" />
      </div>
      <UnifiedConversationHeader header={header} />

      {canSearchMessages && onMessageSearchChange ? (
        <MessageSearchBar
          value={messageSearchQuery}
          onChange={(event: ChangeEvent<HTMLInputElement>) => onMessageSearchChange(event.target.value)}
          resultCount={messages.length}
          isActive={isMessageSearchActive}
          placeholder={header.type === 'dm' ? 'Search messages in this conversation…' : 'Search messages in this channel…'}
        />
      ) : null}

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex flex-1 min-h-0 overflow-hidden">
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          isLoading={isLoading || isLoadingMore}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onRefresh={onRefresh}
          onToggleReaction={handleReaction}
          reactionPendingByMessage={reactionPendingByMessage}
          onReply={onReply}
          onDeleteMessage={onDeleteMessage}
          deletingMessageId={deletingMessageId ?? messageDeletingId}
          updatingMessageId={messageUpdatingId}
          renderMessageExtras={renderMessageExtras}
          renderMessageActions={renderMessageActions}
          renderMessageContent={renderMessageContent}
          renderMessageAttachments={renderMessageAttachments}
          renderEditForm={renderEditForm}
          renderDeletedInfo={renderDeletedInfo}
          renderThreadSection={header.type === 'channel' ? renderThreadSection : undefined}
          renderMessageWrapper={renderMessageWrapper}
          emptyState={isMessageSearchActive ? <NoSearchResultsState /> : emptyState}
          variant={header.type === 'channel' ? 'channel' : 'dm'}
          editingMessageId={editingMessageId}
          focusMessageId={effectiveFocusMessageId}
          focusThreadId={effectiveFocusThreadId}
        />
      </div>

      <UnifiedComposerSection
        pendingAttachments={pendingAttachments}
        uploadingAttachments={uploadingAttachments}
        isSending={isSending}
        onRemoveAttachment={onRemoveAttachment}
        isComposerFocused={isComposerFocused}
        hasPendingAttachments={hasPendingAttachments}
        messageInput={messageInput}
        onMessageInputChange={onMessageInputChange}
        onSend={handleSend}
        placeholder={placeholder}
        participants={participants}
        onFocus={handleComposerFocusInternal}
        onBlur={handleComposerBlurInternal}
        onDrop={handleComposerDrop}
        onDragOver={handleComposerDragOver}
        onPaste={handleComposerPaste}
        onAttachClick={onAddAttachments ? () => fileInputRef.current?.click() : undefined}
        fileInputRef={fileInputRef}
        onAttachmentInputChange={handleAttachmentInputChange}
        typingIndicator={typingIndicator}
      />

      <ConfirmDialog
        open={Boolean(confirmingDeleteMessageId)}
        onOpenChange={(open) => {
          if (!open) {
            handleCancelDelete()
          }
        }}
        title="Delete message"
        description="This removes the message content for everyone in the conversation and keeps a deleted placeholder in the timeline."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isLoading={activeDeletingMessageId === confirmingDeleteMessageId}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
