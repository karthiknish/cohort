'use client'
'use no memo'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, DragEvent, RefObject } from 'react'

import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { TaskCreationModal } from '@/features/dashboard/tasks/task-creation-modal'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationMessage } from '@/types/collaboration'
import type { TaskRecord } from '@/types/tasks'

import type { PendingAttachment } from '../hooks'
import type { Channel } from '../types'
import {
  groupMessages,
} from '../utils'

import {
  EmptyChannelState,
  MessagePaneHeader,
  MessageSearchBar,
} from './message-pane-parts'
import { MessageComposer } from './message-composer'
import { 
  CollaborationMessageViewport,
  type CollaborationFlattenedMessageItem,
} from './message-pane-sections'

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
  'use no memo'

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

  const flattenedMessages = useMemo(() => {
    if (isSearchActive) return []
    return messageGroups.flatMap((group) => {
      const headerItem = group.dateSeparator
        ? [{ id: `separator-${group.id}`, type: 'separator' as const, label: group.dateSeparator }]
        : []

      const messageItems = group.messages.map((message, index) => ({
        id: message.id,
        type: 'message' as const,
        message,
        isFirstInGroup: index === 0,
      }))

      return [...headerItem, ...messageItems]
    })
  }, [isSearchActive, messageGroups]) as CollaborationFlattenedMessageItem[]

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

  const latestVisibleMessageId = useMemo(() => {
    if (isSearchActive || visibleMessages.length === 0) return null
    return visibleMessages[visibleMessages.length - 1]?.id ?? null
  }, [isSearchActive, visibleMessages])

  // Clear editing state if message is deleted
  useEffect(() => {
    if (!editingMessageId) return undefined
    const stillExists = channelMessages.some((message) => message.id === editingMessageId && !message.isDeleted)
    if (!stillExists) {
      const frame = requestAnimationFrame(() => {
        setEditingMessageId(null)
        setEditingValue('')
      })

      return () => {
        cancelAnimationFrame(frame)
      }
    }

    return undefined
  }, [channelMessages, editingMessageId])

  // Reset thread state when channel changes
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setExpandedThreadIds({})
      onClearThreadReplies()
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [channel?.id, onClearThreadReplies])

  // Scroll to bottom when the latest visible message changes.
  // This covers initial channel loads and newly-arrived messages,
  // while avoiding jumps when older history is prepended.
  useEffect(() => {
    if (isLoading || isSearchActive || !latestVisibleMessageId) {
      return
    }

    const frame = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [channel?.id, isLoading, isSearchActive, latestVisibleMessageId, messagesEndRef])

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

  return (
    <div className="flex min-h-[480px] flex-1 flex-col bg-background/50 lg:h-[640px] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50" />
      </div>
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

      <CollaborationMessageViewport
        canLoadMore={canLoadMore}
        channelMessages={channelMessages}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        editingMessageId={editingMessageId}
        editingPreview={editingPreview}
        editingValue={editingValue}
        expandedThreadIds={expandedThreadIds}
        flattenedMessages={flattenedMessages}
        isLoading={isLoading}
        isSearchActive={isSearchActive}
        loadingMore={loadingMore}
        messageDeletingId={messageDeletingId}
        messageUpdatingId={messageUpdatingId}
        messagesEndRef={messagesEndRef}
        messagesError={messagesError}
        onCancelEdit={handleCancelEdit}
        onConfirmDelete={handleConfirmDelete}
        onConfirmEdit={handleConfirmEdit}
        onCreateTask={handleCreateTaskFromMessage}
        onEditingValueChange={setEditingValue}
        onLoadMore={onLoadMore}
        onLoadMoreThread={handleLoadMoreThread}
        onReply={handleReply}
        onRetryThreadLoad={handleRetryThreadLoad}
        onStartEdit={handleStartEdit}
        onThreadToggle={handleThreadToggle}
        onToggleReaction={onToggleReaction}
        reactionPendingByMessage={reactionPendingByMessage}
        threadErrorsByRootId={threadErrorsByRootId}
        threadLoadingByRootId={threadLoadingByRootId}
        threadMessagesByRootId={threadMessagesByRootId}
        threadNextCursorByRootId={threadNextCursorByRootId}
        visibleMessages={visibleMessages}
      />


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
