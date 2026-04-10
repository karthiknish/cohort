'use client'
'use no memo'

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
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

type MessagePaneState = {
  editingMessageId: string | null
  editingValue: string
  replyingToMessage: CollaborationMessage | null
  expandedThreadIds: Record<string, boolean>
  confirmingDeleteMessageId: string | null
  taskCreationModalOpen: boolean
  selectedMessageForTask: CollaborationMessage | null
}

type MessagePaneAction =
  | { type: 'start-edit'; message: CollaborationMessage }
  | { type: 'set-editing-value'; value: string }
  | { type: 'clear-edit' }
  | { type: 'set-reply-target'; message: CollaborationMessage | null }
  | { type: 'toggle-thread'; threadRootId: string }
  | { type: 'reset-threads' }
  | { type: 'open-delete-confirmation'; messageId: string }
  | { type: 'close-delete-confirmation' }
  | { type: 'open-task-modal'; message: CollaborationMessage }
  | { type: 'close-task-modal' }

const INITIAL_MESSAGE_PANE_STATE: MessagePaneState = {
  editingMessageId: null,
  editingValue: '',
  replyingToMessage: null,
  expandedThreadIds: {},
  confirmingDeleteMessageId: null,
  taskCreationModalOpen: false,
  selectedMessageForTask: null,
}

function toggleExpandedThreadIds(expandedThreadIds: Record<string, boolean>, threadRootId: string) {
  const next = { ...expandedThreadIds }

  if (next[threadRootId]) {
    delete next[threadRootId]
    return next
  }

  next[threadRootId] = true
  return next
}

function messagePaneReducer(state: MessagePaneState, action: MessagePaneAction): MessagePaneState {
  switch (action.type) {
    case 'start-edit':
      return {
        ...state,
        editingMessageId: action.message.id,
        editingValue: action.message.content ?? '',
      }
    case 'set-editing-value':
      return {
        ...state,
        editingValue: action.value,
      }
    case 'clear-edit':
      return {
        ...state,
        editingMessageId: null,
        editingValue: '',
      }
    case 'set-reply-target':
      return {
        ...state,
        replyingToMessage: action.message,
      }
    case 'toggle-thread':
      return {
        ...state,
        expandedThreadIds: toggleExpandedThreadIds(state.expandedThreadIds, action.threadRootId),
      }
    case 'reset-threads':
      return {
        ...state,
        expandedThreadIds: {},
      }
    case 'open-delete-confirmation':
      return {
        ...state,
        confirmingDeleteMessageId: action.messageId,
        editingMessageId: state.editingMessageId === action.messageId ? null : state.editingMessageId,
        editingValue: state.editingMessageId === action.messageId ? '' : state.editingValue,
      }
    case 'close-delete-confirmation':
      return {
        ...state,
        confirmingDeleteMessageId: null,
      }
    case 'open-task-modal':
      return {
        ...state,
        taskCreationModalOpen: true,
        selectedMessageForTask: action.message,
      }
    case 'close-task-modal':
      return {
        ...state,
        taskCreationModalOpen: false,
        selectedMessageForTask: null,
      }
    default:
      return state
  }
}

export interface CollaborationMessagePaneProps {
  channel: Channel | null
  channelMessages: CollaborationMessage[]
  visibleMessages: CollaborationMessage[]
  channelParticipants: ClientTeamMember[]
  messagesError: string | null
  onRetryMessages?: () => void
  messagesRetrying?: boolean
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
  onRetryMessages,
  messagesRetrying,
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

  const [paneState, dispatch] = useReducer(messagePaneReducer, INITIAL_MESSAGE_PANE_STATE)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    editingMessageId,
    editingValue,
    replyingToMessage,
    expandedThreadIds,
    confirmingDeleteMessageId,
    taskCreationModalOpen,
    selectedMessageForTask,
  } = paneState

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
        dispatch({ type: 'clear-edit' })
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
      dispatch({ type: 'reset-threads' })
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
  const handleStartEdit = useCallback((message: CollaborationMessage) => {
    if (message.isDeleted || messageUpdatingId === message.id || messageDeletingId === message.id) return
    dispatch({ type: 'start-edit', message })
  }, [messageUpdatingId, messageDeletingId])

  const handleReply = useCallback((message: CollaborationMessage) => {
    dispatch({ type: 'set-reply-target', message })
  }, [])

  const handleCancelReply = useCallback(() => {
    dispatch({ type: 'set-reply-target', message: null })
  }, [])

  const handleCancelEdit = useCallback(() => {
    dispatch({ type: 'clear-edit' })
  }, [])

  const handleConfirmEdit = useCallback(() => {
    if (!editingMessageId || messageUpdatingId === editingMessageId) return
    const trimmed = editingValue.trim()
    if (!trimmed) return
    onEditMessage(editingMessageId, trimmed)
    dispatch({ type: 'clear-edit' })
  }, [editingMessageId, messageUpdatingId, editingValue, onEditMessage])

  const handleConfirmDelete = useCallback((messageId: string) => {
    if (messageDeletingId === messageId) return
    dispatch({ type: 'open-delete-confirmation', messageId })
  }, [messageDeletingId])

  const handleExecuteDelete = useCallback(() => {
    if (!confirmingDeleteMessageId || messageDeletingId === confirmingDeleteMessageId) return
    onDeleteMessage(confirmingDeleteMessageId)
    dispatch({ type: 'close-delete-confirmation' })
  }, [confirmingDeleteMessageId, messageDeletingId, onDeleteMessage])

  const handleCancelDelete = useCallback(() => {
    dispatch({ type: 'close-delete-confirmation' })
  }, [])

  const handleCreateTaskFromMessage = useCallback((message: CollaborationMessage) => {
    dispatch({ type: 'open-task-modal', message })
  }, [])

  const handleTaskCreated = useCallback((task: TaskRecord) => {
    console.log('Task created from message:', task)
  }, [])

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    onMessageSearchChange(event.target.value)
  }, [onMessageSearchChange])

  const handleAttachmentInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    onAddAttachments(files)
    event.target.value = ''
  }, [onAddAttachments])

  const handleComposerDrop = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    if (!channel || sending) return
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onAddAttachments(event.dataTransfer.files)
      event.dataTransfer.clearData()
    }
  }, [channel, sending, onAddAttachments])

  const handleComposerDragOver = useCallback((event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    if (!channel || sending) {
      event.dataTransfer.dropEffect = 'none'
      return
    }
    event.dataTransfer.dropEffect = 'copy'
  }, [channel, sending])

  const handleComposerPaste = useCallback((event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (!channel || sending) return
    const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'))
    if (files.length === 0) return
    event.preventDefault()
    onAddAttachments(files)
  }, [channel, sending, onAddAttachments])

  const handleThreadToggle = useCallback((threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) return

    const isCurrentlyOpen = Boolean(expandedThreadIds[normalizedId])

    dispatch({ type: 'toggle-thread', threadRootId: normalizedId })

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
  }, [expandedThreadIds, threadMessagesByRootId, threadErrorsByRootId, threadLoadingByRootId, onLoadThreadReplies])

  const handleRetryThreadLoad = useCallback((threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) return
    void onLoadThreadReplies(normalizedId)
  }, [onLoadThreadReplies])

  const handleLoadMoreThread = useCallback((threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) return
    void onLoadMoreThreadReplies(normalizedId)
  }, [onLoadMoreThreadReplies])

  const handleExportChannel = useCallback(() => {
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
  }, [channel, channelMessages])

  const handleSendWithReply = useCallback(() => {
    onSendMessage({ parentMessageId: replyingToMessage?.id })
    dispatch({ type: 'set-reply-target', message: null })
  }, [onSendMessage, replyingToMessage?.id])

  const handleCloseTaskModal = useCallback(() => {
    dispatch({ type: 'close-task-modal' })
  }, [])

  const handleEditingValueChange = useCallback((value: string) => {
    dispatch({ type: 'set-editing-value', value })
  }, [])

  const taskCreationInitialData = useMemo(() => ({
    title: selectedMessageForTask ? `Task from: ${selectedMessageForTask.content?.slice(0, 50)}...` : '',
    description: selectedMessageForTask?.content || '',
    projectId: channel?.id || '',
    projectName: channel?.name || '',
  }), [selectedMessageForTask, channel?.id, channel?.name])

  const handleConfirmDialogOpenChange = useCallback((open: boolean) => {
    if (!open) handleCancelDelete()
  }, [handleCancelDelete])

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
        onRetryMessages={onRetryMessages}
        messagesRetrying={messagesRetrying}
        onCancelEdit={handleCancelEdit}
        onConfirmDelete={handleConfirmDelete}
        onConfirmEdit={handleConfirmEdit}
        onCreateTask={handleCreateTaskFromMessage}
        onEditingValueChange={handleEditingValueChange}
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
        onClose={handleCloseTaskModal}
        initialData={taskCreationInitialData}
        onTaskCreated={handleTaskCreated}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmingDeleteMessageId)}
        onOpenChange={handleConfirmDialogOpenChange}
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
