'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, RefObject } from 'react'
import {
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  SmilePlus,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage, CollaborationReaction } from '@/types/collaboration'
import { COLLABORATION_REACTIONS } from '@/constants/collaboration-reactions'

import type { Channel } from '../types'
import type { PendingAttachment } from '../hooks/use-collaboration-data'
import { TaskCreationModal } from '@/components/tasks/task-creation-modal'
import type { TaskRecord } from '@/types/tasks'
import {
  CHANNEL_TYPE_COLORS,
  extractUrlsFromContent,
  formatRelativeTime,
  formatTimestamp,
  getInitials,
  isLikelyImageUrl,
} from '../utils'
import { LinkPreviewCard } from './link-preview-card'
import { MessageContent } from './message-content'
import { RichComposer } from './rich-composer'

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
  onSendMessage: () => void
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
  const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({})
  const [confirmingDeleteMessageId, setConfirmingDeleteMessageId] = useState<string | null>(null)
  const [taskCreationModalOpen, setTaskCreationModalOpen] = useState(false)
  const [selectedMessageForTask, setSelectedMessageForTask] = useState<CollaborationMessage | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const editingPreview = useMemo(() => {
    if (!editingMessageId) return ''
    const target = channelMessages.find((message) => message.id === editingMessageId)
    if (!target) return ''
    const text = target.content ?? ''
    if (text.length <= MAX_PREVIEW_LENGTH) {
      return text
    }
    return `${text.slice(0, MAX_PREVIEW_LENGTH)}…`
  }, [channelMessages, editingMessageId])

  useEffect(() => {
    if (!editingMessageId) {
      return
    }

    const stillExists = channelMessages.some((message) => message.id === editingMessageId && !message.isDeleted)
    if (!stillExists) {
      setEditingMessageId(null)
      setEditingValue('')
    }
  }, [channelMessages, editingMessageId])

  useEffect(() => {
    setExpandedThreadIds({})
    onClearThreadReplies()
  }, [channel?.id, onClearThreadReplies])

  const handleStartEdit = (message: CollaborationMessage) => {
    if (message.isDeleted || messageUpdatingId === message.id || messageDeletingId === message.id) {
      return
    }
    setEditingMessageId(message.id)
    setEditingValue(message.content ?? '')
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingValue('')
  }

  const handleConfirmEdit = () => {
    if (!editingMessageId || messageUpdatingId === editingMessageId) {
      return
    }
    const trimmed = editingValue.trim()
    if (!trimmed) {
      return
    }
    onEditMessage(editingMessageId, trimmed)
    setEditingMessageId(null)
    setEditingValue('')
  }

  const handleConfirmDelete = (messageId: string) => {
    if (messageDeletingId === messageId) {
      return
    }
    if (editingMessageId === messageId) {
      handleCancelEdit()
    }
    setConfirmingDeleteMessageId(messageId)
  }

  const handleCreateTaskFromMessage = (message: CollaborationMessage) => {
    setSelectedMessageForTask(message)
    setTaskCreationModalOpen(true)
  }

  const handleTaskCreated = (task: TaskRecord) => {
    console.log('Task created from message:', task)
    // TODO: You could add a success notification or update UI
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onMessageSearchChange(event.target.value)
  }

  const handleAttachmentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }
    onAddAttachments(files)
    event.target.value = ''
  }

  const handleComposerDrop = (event: DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    if (!channel || sending) {
      return
    }
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

  const handleThreadToggle = (threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) {
      return
    }

    setExpandedThreadIds((prev) => {
      const isOpen = Boolean(prev[normalizedId])
      const next = { ...prev }

      if (isOpen) {
        delete next[normalizedId]
        return next
      }

      next[normalizedId] = true

      const existingReplies = threadMessagesByRootId[normalizedId]
      const hasRepliesLoaded = Array.isArray(existingReplies) && existingReplies.length > 0
      const hasError = Boolean(threadErrorsByRootId[normalizedId])
      const isLoadingReplies = threadLoadingByRootId[normalizedId] ?? false

      if ((!hasRepliesLoaded || hasError) && !isLoadingReplies) {
        void onLoadThreadReplies(normalizedId)
      }

      return next
    })
  }

  const handleRetryThreadLoad = (threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) {
      return
    }
    void onLoadThreadReplies(normalizedId)
  }

  const handleLoadMoreThread = (threadRootId: string) => {
    const normalizedId = threadRootId.trim()
    if (!normalizedId) {
      return
    }
    void onLoadMoreThreadReplies(normalizedId)
  }

  const typingIndicator = useMemo(() => {
    if (!typingParticipants || typingParticipants.length === 0) {
      return ''
    }

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

  if (!channel) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Add a client to start a shared collaboration workspace.
      </div>
    )
  }

  const isSearchActive = messageSearchQuery.trim().length > 0

  const renderMessage = (message: CollaborationMessage, options: { isReply?: boolean; isSearchResult?: boolean } = {}) => {
    const isReply = options.isReply ?? false
    const isSearchResult = options.isSearchResult ?? false

    const canManageMessage =
      !message.isDeleted &&
      ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')

    const isDeleting = messageDeletingId === message.id
    const isUpdating = messageUpdatingId === message.id
    const linkPreviews = extractUrlsFromContent(message.content).filter((url) => !isLikelyImageUrl(url))
    const reactionPendingEmoji = reactionPendingByMessage[message.id] ?? null
    const reactions = Array.isArray(message.reactions) ? message.reactions : []
    const disableReactionActions =
      message.isDeleted || !currentUserId || Boolean(reactionPendingEmoji) || isDeleting || isUpdating
    const showReactionSpinner = Boolean(reactionPendingEmoji)

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
      threadReplies.length,
    )
    const isThreadOpen = Boolean(expandedThreadIds[threadRootId])
    const hasThreadReplies = replyCount > 0
    const lastReplyIso =
      message.threadLastReplyAt ?? (threadReplies.length > 0 ? threadReplies[threadReplies.length - 1]?.createdAt ?? null : null)
    const lastReplyLabel = lastReplyIso ? formatRelativeTime(lastReplyIso) : null

    const containerClass = [
      isReply
        ? 'ml-12 flex items-start gap-3 rounded-md border border-muted/40 bg-muted/10 p-3'
        : 'flex items-start gap-3',
      isSearchResult ? 'ring-1 ring-primary/40 ring-offset-1' : '',
    ]
      .filter(Boolean)
      .join(' ')

    const avatarClass = isReply
      ? 'flex h-9 w-9 items-center justify-center rounded-full bg-primary/80 text-xs font-medium text-primary-foreground'
      : 'flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground'

    return (
      <div key={message.id} className={containerClass}>
        <span className={avatarClass}>{getInitials(message.senderName)}</span>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{message.senderName}</p>
            {message.senderRole && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                {message.senderRole}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(message.createdAt)}
              {message.isEdited && !message.isDeleted ? ' · edited' : ''}
            </span>
            {canManageMessage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-muted-foreground"
                    disabled={isUpdating || isDeleting}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Message actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-sm">
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      handleStartEdit(message)
                    }}
                    disabled={isUpdating || isDeleting}
                  >
                    Edit message
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      handleCreateTaskFromMessage(message)
                    }}
                    disabled={isUpdating || isDeleting}
                  >
                    Create task from message
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      handleConfirmDelete(message.id)
                    }}
                    className="text-destructive focus:text-destructive"
                    disabled={isDeleting || isUpdating}
                  >
                    Delete message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {editingMessageId === message.id ? (
            <div className="space-y-2">
              <Textarea
                value={editingValue}
                onChange={(event) => setEditingValue(event.target.value)}
                disabled={isUpdating}
                maxLength={2000}
                className="min-h-[88px]"
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Editing message</span>
                {editingPreview && <span className="truncate">“{editingPreview}”</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" size="sm" onClick={handleConfirmEdit} disabled={isUpdating || editingValue.trim().length === 0}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save changes
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={handleCancelEdit} disabled={isUpdating}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : message.isDeleted ? (
            <p className="text-sm italic text-muted-foreground">Message removed</p>
          ) : (
            <MessageContent content={message.content ?? ''} mentions={message.mentions} />
          )}

          {Array.isArray(message.attachments) && message.attachments.length > 0 && !message.isDeleted && (
            <div className="space-y-3">
              {message.attachments.map((attachment) => {
                const key = `${attachment.url}-${attachment.name}`
                const isImageAttachment = Boolean(attachment.url && isLikelyImageUrl(attachment.url))

                if (isImageAttachment) {
                  return (
                    <figure key={key} className="max-w-xl overflow-hidden rounded-md border border-muted/60 bg-muted/10">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-h-96 w-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                      <figcaption className="flex items-center justify-between gap-3 border-t border-muted/40 p-3 text-xs text-muted-foreground">
                        <div className="flex flex-1 items-center gap-2 truncate">
                          <ImageIcon className="h-4 w-4" />
                          <span className="truncate">{attachment.name}</span>
                          {attachment.size ? <span className="whitespace-nowrap">{attachment.size}</span> : null}
                        </div>
                        <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-1 h-3.5 w-3.5" />
                            Download
                          </a>
                        </Button>
                      </figcaption>
                    </figure>
                  )
                }

                return (
                  <Card key={key} className="border-muted/60 bg-muted/20">
                    <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{attachment.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {attachment.size && <span>{attachment.size}</span>}
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download {attachment.name}</span>
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {!message.isDeleted && linkPreviews.length > 0 && (
            <div className="space-y-3">
              {linkPreviews.map((url) => (
                <LinkPreviewCard key={`${message.id}-${url}`} url={url} />
              ))}
            </div>
          )}

          {!message.isDeleted && editingMessageId !== message.id && (
            <div className="flex flex-wrap items-center gap-2">
              {reactions.map((reaction) => {
                const isPendingReaction = reactionPendingEmoji === reaction.emoji
                const isActive = Boolean(currentUserId && reaction.userIds.includes(currentUserId))
                return (
                  <Button
                    key={`${message.id}-${reaction.emoji}`}
                    type="button"
                    size="sm"
                    variant={isActive ? 'secondary' : 'outline'}
                    className="h-7 rounded-full px-3 text-xs"
                    disabled={disableReactionActions}
                    aria-pressed={isActive}
                    onClick={() => onToggleReaction(message.id, reaction.emoji)}
                  >
                    <span className="flex items-center gap-1">
                      {isPendingReaction ? <Loader2 className="h-3 w-3 animate-spin" /> : <span className="text-sm leading-none">{reaction.emoji}</span>}
                      <span className="leading-none">{reaction.count}</span>
                    </span>
                  </Button>
                )
              })}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="inline-flex h-7 items-center gap-1 rounded-full px-3 text-xs"
                    disabled={disableReactionActions}
                  >
                    {showReactionSpinner ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SmilePlus className="h-4 w-4" />}
                    React
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="grid w-40 grid-cols-3 gap-1 p-2 text-lg">
                  {COLLABORATION_REACTIONS.map((emoji) => (
                    <DropdownMenuItem
                      key={emoji}
                      className="flex items-center justify-center p-2"
                      disabled={disableReactionActions}
                      onSelect={(event) => {
                        if (disableReactionActions) {
                          event.preventDefault()
                          return
                        }
                        onToggleReaction(message.id, emoji)
                      }}
                    >
                      {emoji}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {message.isDeleted && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Deleted by {message.deletedBy ?? 'teammate'}</span>
              {message.deletedAt && <span>· {formatRelativeTime(message.deletedAt)}</span>}
            </div>
          )}

          {!isReply && hasThreadReplies && (
            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="inline-flex items-center gap-2 text-xs"
                  onClick={() => handleThreadToggle(threadRootId)}
                  disabled={threadLoading && !isThreadOpen && threadReplies.length === 0}
                >
                  {threadLoading && !isThreadOpen && threadReplies.length === 0 ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5" />
                  )}
                  {isThreadOpen ? 'Hide thread' : `View thread · ${replyCount === 1 ? '1 reply' : `${replyCount} replies`}`}
                  {lastReplyLabel && <span className="text-[11px] text-muted-foreground">· Last reply {lastReplyLabel}</span>}
                </Button>
                {threadError && !isThreadOpen && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-destructive"
                    onClick={() => handleRetryThreadLoad(threadRootId)}
                  >
                    Retry
                  </Button>
                )}
              </div>

              {isThreadOpen && (
                <div className="mt-3 space-y-3 border-l border-muted/40 pl-4">
                  {threadError && (
                    <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      <span>{threadError}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-destructive"
                        onClick={() => handleRetryThreadLoad(threadRootId)}
                        disabled={threadLoading}
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {threadLoading && threadReplies.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading replies…
                    </div>
                  )}

                  {threadReplies.map((reply) =>
                    renderMessage(reply, { isReply: true, isSearchResult }),
                  )}

                  {threadLoading && threadReplies.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Updating replies…
                    </div>
                  )}

                  {!threadLoading && threadReplies.length === 0 && !threadError && (
                    <div className="rounded-md border border-dashed border-muted/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                      Replies will appear here once your team responds.
                    </div>
                  )}

                  {threadNextCursor && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="inline-flex items-center gap-2 text-xs"
                      onClick={() => handleLoadMoreThread(threadRootId)}
                      disabled={threadLoading}
                    >
                      <RefreshCw className={threadLoading ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                      {threadLoading ? 'Loading replies…' : 'Load older replies'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {!message.isDeleted && isDeleting && (
          <div className="mt-2 text-xs text-destructive">
            <Loader2 className="mr-1 inline h-3 w-3 animate-spin align-middle" /> Removing message…
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex min-h-[480px] flex-1 flex-col lg:h-[640px]">
      <div className="flex items-start justify-between gap-3 border-b border-muted/40 p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg font-semibold text-foreground">{channel.name}</CardTitle>
            <Badge variant="outline" className={CHANNEL_TYPE_COLORS[channel.type]}>
              {channel.type}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            {channelParticipants.map((member) => member.name).join(', ')}
          </CardDescription>
        </div>
      </div>
      <div className="border-b border-muted/40 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={messageSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search messages in this channel…"
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {isLoading && (
            <div className="flex justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {!isLoading && channelMessages.length === 0 && !messagesError && !isSearchActive && (
            <div className="rounded-md border border-dashed border-muted/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              Start the conversation by posting the first update for this workspace.
            </div>
          )}

          {!isLoading && isSearchActive && visibleMessages.length === 0 && !messagesError && (
            <div className="rounded-md border border-dashed border-muted/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
              No messages match your search.
            </div>
          )}

          {messagesError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {messagesError}
            </div>
          )}

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

          {visibleMessages.map((message) => {
            const isReply = Boolean(message.parentMessageId)
            if (!isSearchActive && isReply) {
              return null
            }
            return renderMessage(message, { isReply, isSearchResult: isSearchActive })
          })}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-muted/40 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={senderSelection}
              onValueChange={onSenderSelectionChange}
              disabled={channelParticipants.length === 0 || sending}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Choose teammate" />
              </SelectTrigger>
              <SelectContent>
                {channelParticipants.map((participant) => (
                  <SelectItem key={participant.name} value={participant.name}>
                    {participant.name}
                    {participant.role ? ` • ${participant.role}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {pendingAttachments.length > 0 && (
            <div className="space-y-2 rounded-md border border-dashed border-muted/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Attachments ready to upload</span>
                {uploading && (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {pendingAttachments.map((attachment) => {
                  const isImageType = attachment.mimeType.startsWith('image/')
                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-muted/50 bg-background p-2 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {isImageType ? <ImageIcon className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                        <span className="truncate" title={attachment.name}>
                          {attachment.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{attachment.sizeLabel}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveAttachment(attachment.id)}
                        disabled={sending}
                        className="h-7 w-7"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove {attachment.name}</span>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="w-full">
              <RichComposer
                value={messageInput}
                onChange={onMessageInputChange}
                onSend={onSendMessage}
                disabled={!channel || sending}
                onFocus={onComposerFocus}
                onBlur={onComposerBlur}
                onDrop={handleComposerDrop}
                onDragOver={handleComposerDragOver}
                participants={channelParticipants}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!channel || sending}
                className="inline-flex items-center gap-2"
              >
                <Paperclip className="h-4 w-4" />
                Attach
              </Button>
              <Button onClick={onSendMessage} disabled={isSendDisabled} className="inline-flex items-center gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAttachmentInputChange}
          />

          {typingIndicator && <div className="text-xs text-muted-foreground">{typingIndicator}</div>}
        </div>
      </div>

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
    </div>
  )
}
