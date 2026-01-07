'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, DragEvent, RefObject } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { Channel } from '../types'
import type { PendingAttachment } from '../hooks'
import { TaskCreationModal } from '@/components/tasks/task-creation-modal'
import type { TaskRecord } from '@/types/tasks'
import {
  extractUrlsFromContent,
  formatRelativeTime,
  isLikelyImageUrl,
  groupMessages,
} from '../utils'

// Import split components
import {
  MessagePaneHeader,
  MessageSearchBar,
  EmptyChannelState,
  EmptyMessagesState,
  NoSearchResultsState,
  MessagesErrorState,
  DateSeparator,
} from './message-pane-parts'
import {
  MessageActionsBar,
  ReplyActionsBar,
  MessageEditForm,
  MessageHeader,
  MessageAvatar,
  DeletedMessageInfo,
  DeletingOverlay,
} from './message-item-parts'
import { MessageComposer } from './message-composer'
import { MessageAttachments } from './message-attachments'
import { MessageReactions } from './message-reactions'
import { ThreadSection } from './thread-section'
import { ImageUrlPreview } from './image-url-preview'
import { LinkPreviewCard } from './link-preview-card'
import { MessageContent } from './message-content'

const MAX_PREVIEW_LENGTH = 80

export interface CollaborationMessagePaneProps {
  channel: Channel | null
  channelMessages: CollaborationMessage[]
  visibleMessages: CollaborationMessage[]
  channelParticipants: ClientTeamMember[]
  messagesError: string | null
  isLoading: boolean
  onLoadMore?: () => void
  canLoadMore?: boolean
  loadingMore?: boolean
  senderSelection: string
  onSenderSelectionChange: (value: string) => void
  messageInput: string
  onMessageInputChange: (value: string) => void
  messageSearchQuery: string
  onMessageSearchChange: (value: string) => void
  onSendMessage: (options?: { parentMessageId?: string }) => void
  sending: boolean
  isSendDisabled: boolean
  pendingAttachments: PendingAttachment[]
  onAddAttachments: (files: FileList | File[]) => void
  onRemoveAttachment: (attachmentId: string) => void
  uploading: boolean
  typingParticipants: { name: string; role?: string | null }[]
  onComposerFocus: () => void
  onComposerBlur: () => void
  onEditMessage: (messageId: string, nextContent: string) => void
  onDeleteMessage: (messageId: string) => void
  onToggleReaction: (messageId: string, emoji: string) => void
  messageUpdatingId: string | null
  messageDeletingId: string | null
  messagesEndRef: RefObject<HTMLDivElement | null>
  currentUserId?: string | null
  currentUserRole?: string | null
  threadMessagesByRootId: Record<string, CollaborationMessage[]>
  threadNextCursorByRootId: Record<string, string | null>
  threadLoadingByRootId: Record<string, boolean>
  threadErrorsByRootId: Record<string, string | null>
  onLoadThreadReplies: (threadRootId: string) => Promise<void> | void
  onLoadMoreThreadReplies: (threadRootId: string) => Promise<void> | void
  onClearThreadReplies: (threadRootId?: string) => void
  reactionPendingByMessage: Record<string, string | null>
}

export function CollaborationMessagePane({
  channel,
  channelMessages,
  visibleMessages,
  channelParticipants,
  messagesError,
  isLoading,
  onLoadMore,
  canLoadMore = false,
  loadingMore = false,
  senderSelection,
  onSenderSelectionChange,
  messageInput,
  onMessageInputChange,
  messageSearchQuery,
  onMessageSearchChange,
  onSendMessage,
  sending,
  isSendDisabled,
  pendingAttachments,
  onAddAttachments,
  onRemoveAttachment,
  uploading,
  typingParticipants,
  onComposerFocus,
  onComposerBlur,
  onEditMessage,
  onDeleteMessage,
  onToggleReaction,
  messageUpdatingId,
  messageDeletingId,
  messagesEndRef,
  currentUserId,
  currentUserRole,
  threadMessagesByRootId,
  threadNextCursorByRootId,
  threadLoadingByRootId,
  threadErrorsByRootId,
  onLoadThreadReplies,
  onLoadMoreThreadReplies,
  onClearThreadReplies,
  reactionPendingByMessage,
}: CollaborationMessagePaneProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [replyingToMessage, setReplyingToMessage] = useState<CollaborationMessage | null>(null)
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({})
  const [confirmingDeleteMessageId, setConfirmingDeleteMessageId] = useState<string | null>(null)
  const [taskCreationModalOpen, setTaskCreationModalOpen] = useState(false)
  const [selectedMessageForTask, setSelectedMessageForTask] = useState<CollaborationMessage | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isSearchActive = messageSearchQuery.trim().length > 0

  const editingPreview = useMemo(() => {
    if (!editingMessageId) return ''
    const target = channelMessages.find((message) => message.id === editingMessageId)
    if (!target) return ''
    const text = target.content ?? ''
    return text.length <= MAX_PREVIEW_LENGTH ? text : `${text.slice(0, MAX_PREVIEW_LENGTH)}…`
  }, [channelMessages, editingMessageId])

  const messageGroups = useMemo(() => {
    if (isSearchActive) return []
    return groupMessages(visibleMessages.filter((m) => !m.parentMessageId))
  }, [visibleMessages, isSearchActive])

  const typingIndicator = useMemo(() => {
    if (!typingParticipants || typingParticipants.length === 0) return ''
    if (typingParticipants.length === 1) {
      return `${typingParticipants[0]?.name ?? 'Someone'} is typing…`
    }
    if (typingParticipants.length === 2) {
      const [first, second] = typingParticipants
      return `${first?.name ?? 'Someone'} and ${second?.name ?? 'someone else'} are typing…`
    }
    const [first, second, ...rest] = typingParticipants
    return `${first?.name ?? 'Someone'}, ${second?.name ?? 'someone else'}, and ${rest.length} others are typing…`
  }, [typingParticipants])

  // Clear editing state if message is deleted
  useEffect(() => {
    if (!editingMessageId) return
    const stillExists = channelMessages.some((message) => message.id === editingMessageId && !message.isDeleted)
    if (!stillExists) {
      setEditingMessageId(null)
      setEditingValue('')
    }
  }, [channelMessages, editingMessageId])

  // Reset thread state when channel changes
  useEffect(() => {
    setExpandedThreadIds({})
    onClearThreadReplies()
  }, [channel?.id, onClearThreadReplies])

  // Handlers
  const handleStartEdit = (message: CollaborationMessage) => {
    if (message.isDeleted || messageUpdatingId === message.id || messageDeletingId === message.id) return
    setEditingMessageId(message.id)
    setEditingValue(message.content ?? '')
  }

  const handleReply = (message: CollaborationMessage) => {
    setReplyingToMessage(message)
  }

  const handleCancelReply = () => {
    setReplyingToMessage(null)
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingValue('')
  }

  const handleConfirmEdit = () => {
    if (!editingMessageId || messageUpdatingId === editingMessageId) return
    const trimmed = editingValue.trim()
    if (!trimmed) return
    onEditMessage(editingMessageId, trimmed)
    setEditingMessageId(null)
    setEditingValue('')
  }

  const handleConfirmDelete = (messageId: string) => {
    if (messageDeletingId === messageId) return
    if (editingMessageId === messageId) handleCancelEdit()
    setConfirmingDeleteMessageId(messageId)
  }

  const handleExecuteDelete = () => {
    if (!confirmingDeleteMessageId || messageDeletingId === confirmingDeleteMessageId) return
    onDeleteMessage(confirmingDeleteMessageId)
    setConfirmingDeleteMessageId(null)
  }

  const handleCancelDelete = () => {
    setConfirmingDeleteMessageId(null)
  }

  const handleCreateTaskFromMessage = (message: CollaborationMessage) => {
    setSelectedMessageForTask(message)
    setTaskCreationModalOpen(true)
  }

  const handleTaskCreated = (task: TaskRecord) => {
    console.log('Task created from message:', task)
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onMessageSearchChange(event.target.value)
  }

  const handleAttachmentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    onAddAttachments(files)
    event.target.value = ''
  }

  const handleComposerDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    if (!channel || sending) return
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onAddAttachments(event.dataTransfer.files)
      event.dataTransfer.clearData()
    }
  }

  const handleComposerDragOver = (event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    if (!channel || sending) {
      event.dataTransfer.dropEffect = 'none'
      return
    }
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleComposerPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!channel || sending) return
    const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) return
    event.preventDefault()
    onAddAttachments(files)
  }

  const handleThreadToggle = (threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) return

    const isCurrentlyOpen = Boolean(expandedThreadIds[normalizedId])

    // Update expansion state
    setExpandedThreadIds((prev) => {
      const next = { ...prev }
      if (isCurrentlyOpen) {
        delete next[normalizedId]
      } else {
        next[normalizedId] = true
      }
      return next
    })

    // Side-effect: Load replies if opening and not loaded/loading
    if (!isCurrentlyOpen) {
      const existingReplies = threadMessagesByRootId[normalizedId]
      const hasRepliesLoaded = Array.isArray(existingReplies) && existingReplies.length > 0
      const hasError = Boolean(threadErrorsByRootId[normalizedId])
      const isLoadingReplies = threadLoadingByRootId[normalizedId] ?? false

      if ((!hasRepliesLoaded || hasError) && !isLoadingReplies) {
        void onLoadThreadReplies(normalizedId)
      }
    }
  }

  const handleRetryThreadLoad = (threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) return
    void onLoadThreadReplies(normalizedId)
  }

  const handleLoadMoreThread = (threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) return
    void onLoadMoreThreadReplies(normalizedId)
  }

  const handleExportChannel = () => {
    if (!channel || channelMessages.length === 0) return

    const headers = ['Date', 'Sender', 'Role', 'Content', 'Attachments', 'Reactions', 'Thread Replies']
    const rows = channelMessages.map((msg) => {
      const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''
      const sender = msg.senderName
      const role = msg.senderRole || ''
      const content = (msg.content || '').replace(/"/g, '""')
      const attachments = (msg.attachments || []).map((a) => a.url).join('; ')
      const reactions = (msg.reactions || []).map((r) => `${r.emoji}(${r.count})`).join(' ')
      const replies = msg.threadReplyCount || 0

      return [
        `"${date}"`,
        `"${sender}"`,
        `"${role}"`,
        `"${content}"`,
        `"${attachments}"`,
        `"${reactions}"`,
        `"${replies}"`,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${channel.name.replace(/[^a-z0-9]/gi, '_')}_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSendWithReply = () => {
    onSendMessage({ parentMessageId: replyingToMessage?.id })
    setReplyingToMessage(null)
  }

  // Early return for no channel
  if (!channel) {
    return <EmptyChannelState />
  }

  // Render a single message
  const renderMessage = (
    message: CollaborationMessage,
    options: { isReply?: boolean; isSearchResult?: boolean; showAvatar?: boolean; showHeader?: boolean } = {}
  ) => {
    const { isReply = false, isSearchResult = false, showAvatar = true, showHeader = true } = options

    const canManageMessage =
      !message.isDeleted &&
      ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')
    const canReact = !message.isDeleted && !!currentUserId
    const isDeleting = messageDeletingId === message.id
    const isUpdating = messageUpdatingId === message.id
    const reactionPendingEmoji = reactionPendingByMessage[message.id] ?? null
    const disableReactionActions =
      message.isDeleted || !currentUserId || Boolean(reactionPendingEmoji) || isDeleting || isUpdating

    // URL previews
    const allUrlsFromContent = extractUrlsFromContent(message.content)
    const imageUrlPreviews = allUrlsFromContent.filter((url) => isLikelyImageUrl(url))
    const linkPreviews = allUrlsFromContent.filter((url) => !isLikelyImageUrl(url))

    // Thread data
    const threadRootId =
      typeof message.threadRootId === 'string' && message.threadRootId.trim().length > 0
        ? message.threadRootId.trim()
        : message.id
    const threadReplies = threadMessagesByRootId[threadRootId] ?? []
    const threadLoading = threadLoadingByRootId[threadRootId] ?? false
    const threadError = threadErrorsByRootId[threadRootId] ?? null
    const threadNextCursor = threadNextCursorByRootId[threadRootId] ?? null
    const replyCount = Math.max(
      typeof message.threadReplyCount === 'number' ? message.threadReplyCount : 0,
      threadReplies.length
    )
    const isThreadOpen = Boolean(expandedThreadIds[threadRootId])
    const lastReplyIso =
      message.threadLastReplyAt ??
      (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)

    const containerClass = cn(
      'relative group flex items-start gap-3 px-4 py-2 transition-colors hover:bg-muted/30',
      isReply
        ? 'ml-12 mt-2 rounded-md border border-muted/40 bg-muted/10 p-3 hover:border-muted/60'
        : '-mx-4',
      isSearchResult && 'bg-primary/5 ring-1 ring-primary/20',
      !showAvatar && !isReply && 'mt-0 py-1'
    )

    return (
      <div key={message.id} className={containerClass}>
        {showAvatar ? (
          <MessageAvatar senderName={message.senderName} isReply={isReply} />
        ) : (
          <div className="w-10 flex-shrink-0" />
        )}

        <div className="min-w-0 flex-1 space-y-1">
          {showHeader && (
            <MessageHeader
              senderName={message.senderName}
              senderRole={message.senderRole}
              createdAt={message.createdAt}
              isEdited={message.isEdited}
              isDeleted={message.isDeleted}
            />
          )}

          {/* Quick Actions Bar - Main messages */}
          {!isReply && (
            <MessageActionsBar
              message={message}
              canReact={canReact}
              canManage={canManageMessage}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              disableReactionActions={disableReactionActions}
              onReaction={(emoji) => onToggleReaction(message.id, emoji)}
              onReply={() => handleReply(message)}
              onEdit={() => handleStartEdit(message)}
              onDelete={() => handleConfirmDelete(message.id)}
              onCreateTask={() => handleCreateTaskFromMessage(message)}
            />
          )}

          {/* Quick Actions Bar - Replies */}
          {isReply && (
            <ReplyActionsBar
              message={message}
              canManage={canManageMessage}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              onEdit={() => handleStartEdit(message)}
              onDelete={() => handleConfirmDelete(message.id)}
            />
          )}

          {/* Message Content or Edit Form */}
          {editingMessageId === message.id ? (
            <MessageEditForm
              value={editingValue}
              onChange={setEditingValue}
              onConfirm={handleConfirmEdit}
              onCancel={handleCancelEdit}
              isUpdating={isUpdating}
              editingPreview={editingPreview}
            />
          ) : message.isDeleted ? (
            <p className="text-sm italic text-muted-foreground">Message removed</p>
          ) : (
            <MessageContent content={message.content ?? ''} mentions={message.mentions} />
          )}

          {/* Attachments */}
          {!message.isDeleted && Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <MessageAttachments attachments={message.attachments} />
          )}

          {/* Image URL Previews */}
          {!message.isDeleted && imageUrlPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrlPreviews.map((url) => (
                <ImageUrlPreview key={`${message.id}-img-${url}`} url={url} />
              ))}
            </div>
          )}

          {/* Link Previews */}
          {!message.isDeleted && linkPreviews.length > 0 && (
            <div className="space-y-3">
              {linkPreviews.map((url) => (
                <LinkPreviewCard key={`${message.id}-${url}`} url={url} />
              ))}
            </div>
          )}

          {/* Reactions */}
          {!message.isDeleted && editingMessageId !== message.id && (
            <MessageReactions
              reactions={message.reactions ?? []}
              currentUserId={currentUserId}
              pendingEmoji={reactionPendingEmoji}
              disabled={disableReactionActions}
              onToggle={(emoji) => onToggleReaction(message.id, emoji)}
            />
          )}

          {/* Deleted Message Info */}
          {message.isDeleted && (
            <DeletedMessageInfo deletedBy={message.deletedBy} deletedAt={message.deletedAt} />
          )}

          {/* Thread Section (only for top-level messages) */}
          {!isReply && !message.isDeleted && (
            <ThreadSection
              threadRootId={threadRootId}
              replyCount={replyCount}
              lastReplyIso={lastReplyIso}
              isOpen={isThreadOpen}
              isLoading={threadLoading}
              error={threadError}
              hasNextCursor={!!threadNextCursor}
              replies={threadReplies}
              onToggle={() => handleThreadToggle(threadRootId)}
              onRetry={() => handleRetryThreadLoad(threadRootId)}
              onLoadMore={() => handleLoadMoreThread(threadRootId)}
              onReply={() => handleReply(message)}
              renderReply={(reply) =>
                renderMessage(reply, { isReply: true, isSearchResult })
              }
            />
          )}
        </div>

        {/* Deleting Overlay */}
        {!message.isDeleted && <DeletingOverlay isDeleting={isDeleting} />}
      </div>
    )
  }

  return (
    <div className="flex min-h-[480px] flex-1 flex-col bg-background/50 lg:h-[640px]">
      <MessagePaneHeader
        channel={channel}
        channelParticipants={channelParticipants}
        messageCount={channelMessages.length}
        onExport={handleExportChannel}
      />

      <MessageSearchBar
        value={messageSearchQuery}
        onChange={handleSearchChange}
        resultCount={visibleMessages.length}
        isActive={isSearchActive}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {isLoading && (
            <div className="flex justify-center py-6 text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
            </div>
          )}

          {!isLoading && channelMessages.length === 0 && !messagesError && !isSearchActive && (
            <EmptyMessagesState />
          )}

          {!isLoading && isSearchActive && visibleMessages.length === 0 && !messagesError && (
            <NoSearchResultsState />
          )}

          {messagesError && <MessagesErrorState error={messagesError} />}

          {!isLoading && !messagesError && !isSearchActive && canLoadMore && onLoadMore && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 text-xs"
              >
                <RefreshCw className={loadingMore ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                {loadingMore ? 'Loading older messages…' : 'Load older messages'}
              </Button>
            </div>
          )}

          {messageGroups.map((group) => (
            <div key={group.id} className="group-block mb-4">
              {group.dateSeparator && <DateSeparator label={group.dateSeparator} />}
              {group.messages.map((message, messageIndex) => {
                const isFirstInGroup = messageIndex === 0
                return (
                  <div key={message.id}>
                    {renderMessage(message, {
                      isReply: false,
                      isSearchResult: false,
                      showAvatar: isFirstInGroup,
                      showHeader: isFirstInGroup,
                    })}
                  </div>
                )
              })}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageComposer
        channel={channel}
        messageInput={messageInput}
        onMessageInputChange={onMessageInputChange}
        onSend={handleSendWithReply}
        sending={sending}
        isSendDisabled={isSendDisabled}
        pendingAttachments={pendingAttachments}
        uploading={uploading}
        onAddAttachments={onAddAttachments}
        onRemoveAttachment={onRemoveAttachment}
        channelParticipants={channelParticipants}
        senderSelection={senderSelection}
        onSenderSelectionChange={onSenderSelectionChange}
        replyingToMessage={replyingToMessage}
        onCancelReply={handleCancelReply}
        onComposerFocus={onComposerFocus}
        onComposerBlur={onComposerBlur}
        typingIndicator={typingIndicator}
        fileInputRef={fileInputRef}
        onAttachmentInputChange={handleAttachmentInputChange}
        onComposerDrop={handleComposerDrop}
        onComposerDragOver={handleComposerDragOver}
        onComposerPaste={handleComposerPaste}
      />

      {/* Task Creation Modal */}
      <TaskCreationModal
        isOpen={taskCreationModalOpen}
        onClose={() => setTaskCreationModalOpen(false)}
        initialData={{
          title: selectedMessageForTask ? `Task from: ${selectedMessageForTask.content?.slice(0, 50)}...` : '',
          description: selectedMessageForTask?.content || '',
          projectId: channel?.id || '',
          projectName: channel?.name || '',
        }}
        onTaskCreated={handleTaskCreated}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmingDeleteMessageId)}
        onOpenChange={(open) => !open && handleCancelDelete()}
        title="Delete message"
        description="Are you sure you want to delete this message? This action cannot be undone. The message will be marked as deleted and hidden from all participants."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleExecuteDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
