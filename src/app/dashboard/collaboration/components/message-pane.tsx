'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, RefObject } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Reply,
  Search,
  Send,
  SmilePlus,
  Trash2,
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
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
  groupMessages,
} from '../utils'
import { ImageGallery } from './image-gallery'
import { ImageUrlPreview } from './image-url-preview'
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
    if (text.length <= MAX_PREVIEW_LENGTH) {
      return text
    }
    return `${text.slice(0, MAX_PREVIEW_LENGTH)}…`
  }, [channelMessages, editingMessageId])

  const messageGroups = useMemo(() => {
    if (isSearchActive) return []
    // Filter out replies that are shown in threads (assuming visibleMessages contains all messages including replies if they are flattened, 
    // but usually visibleMessages are top-level messages or we filter them here)
    // Based on existing code: visibleMessages.map((message) => { const isReply = Boolean(message.parentMessageId); if (!isSearchActive && isReply) return null; ... })
    // So visibleMessages might contain replies.
    return groupMessages(visibleMessages.filter((m) => !m.parentMessageId))
  }, [visibleMessages, isSearchActive])

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

  const handleReply = (message: CollaborationMessage) => {
    setReplyingToMessage(message)
    // Ideally focus the composer here, but we might need a ref to the RichComposer or just let the user click
  }

  const handleCancelReply = () => {
    setReplyingToMessage(null)
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

  const handleExecuteDelete = () => {
    if (!confirmingDeleteMessageId || messageDeletingId === confirmingDeleteMessageId) {
      return
    }
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
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <div className="mb-4 rounded-full bg-muted/30 p-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">No channel selected</h3>
        <p className="max-w-sm text-sm">
          Select a channel from the list to view messages, or start a new conversation with your team.
        </p>
      </div>
    )
  }

  const renderMessage = (message: CollaborationMessage, options: { isReply?: boolean; isSearchResult?: boolean; showAvatar?: boolean; showHeader?: boolean } = {}) => {
    const isReply = options.isReply ?? false
    const isSearchResult = options.isSearchResult ?? false
    const showAvatar = options.showAvatar ?? true
    const showHeader = options.showHeader ?? true

    const canManageMessage =
      !message.isDeleted &&
      ((message.senderId && message.senderId === currentUserId) || currentUserRole === 'admin')

    const canReact = !message.isDeleted && currentUserId
    const isDeleting = messageDeletingId === message.id
    const isUpdating = messageUpdatingId === message.id
    const allUrlsFromContent = extractUrlsFromContent(message.content)
    const imageUrlPreviews = allUrlsFromContent.filter((url) => isLikelyImageUrl(url))
    const linkPreviews = allUrlsFromContent.filter((url) => !isLikelyImageUrl(url))
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

    const containerClass = cn(
      'relative',
      isReply
        ? 'flex items-start gap-3 rounded-md border border-muted/40 bg-muted/10 p-3 transition-all hover:border-muted/60'
        : 'group flex items-start gap-3 px-2 py-1.5 hover:bg-muted/30 rounded-md -mx-2 transition-colors',
      isSearchResult && 'ring-1 ring-primary/40 ring-offset-1',
      !showAvatar && !isReply && 'mt-0.5'
    )

    const avatarClass = isReply
      ? 'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/80 text-xs font-medium text-primary-foreground'
      : 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground'

    return (
      <div key={message.id} className={containerClass}>
        {showAvatar ? (
          <span className={avatarClass}>{getInitials(message.senderName)}</span>
        ) : (
          <div className="w-10 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          {showHeader && (
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
            </div>
          )}

          {/* Quick Actions Bar - Appears on hover */}
          {!message.isDeleted && !isReply && (
            <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-muted/60 bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              <TooltipProvider delayDuration={200}>
                {/* Quick Reactions */}
                {canReact && COLLABORATION_REACTIONS.slice(0, 3).map((emoji) => (
                  <Tooltip key={emoji}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-base"
                        disabled={disableReactionActions}
                        onClick={() => onToggleReaction(message.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      React with {emoji}
                    </TooltipContent>
                  </Tooltip>
                ))}

                {/* More Reactions */}
                {canReact && (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={disableReactionActions}
                          >
                            <SmilePlus className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        Add reaction
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="grid w-40 grid-cols-3 gap-1 p-2 text-lg">
                      {COLLABORATION_REACTIONS.map((emoji) => (
                        <DropdownMenuItem
                          key={emoji}
                          className="flex items-center justify-center p-2 text-lg hover:scale-110 transition-transform"
                          disabled={disableReactionActions}
                          onSelect={() => onToggleReaction(message.id, emoji)}
                        >
                          {emoji}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Reply Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleReply(message)}
                      disabled={isUpdating || isDeleting}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Reply in thread
                  </TooltipContent>
                </Tooltip>

                {/* More Actions */}
                {canManageMessage && (
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={isUpdating || isDeleting}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        More actions
                      </TooltipContent>
                    </Tooltip>
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
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TooltipProvider>
            </div>
          )}

          {/* Reply quick actions (for nested replies) */}
          {!message.isDeleted && isReply && canManageMessage && (
            <div className="absolute right-2 top-2 flex items-center gap-0.5">
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
                      handleConfirmDelete(message.id)
                    }}
                    className="text-destructive focus:text-destructive"
                    disabled={isDeleting || isUpdating}
                  >
                    Delete message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

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
              {(() => {
                const imageAttachments = message.attachments.filter(
                  (a) => a.url && isLikelyImageUrl(a.url)
                )
                const fileAttachments = message.attachments.filter(
                  (a) => !a.url || !isLikelyImageUrl(a.url)
                )

                return (
                  <>
                    {/* Image Gallery for all images */}
                    {imageAttachments.length > 0 && (
                      <ImageGallery
                        images={imageAttachments.map((a) => ({
                          url: a.url,
                          name: a.name,
                          size: a.size ?? undefined,
                        }))}
                      />
                    )}

                    {/* File attachments */}
                    {fileAttachments.map((attachment) => {
                      const key = `${attachment.url}-${attachment.name}`
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
                  </>
                )
              })()}
            </div>
          )}

          {/* Image URL Previews */}
          {!message.isDeleted && imageUrlPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageUrlPreviews.map((url) => (
                <ImageUrlPreview key={`${message.id}-img-${url}`} url={url} />
              ))}
            </div>
          )}

          {!message.isDeleted && linkPreviews.length > 0 && (
            <div className="space-y-3">
              {linkPreviews.map((url) => (
                <LinkPreviewCard key={`${message.id}-${url}`} url={url} />
              ))}
            </div>
          )}

          {/* Reactions Display */}
          {!message.isDeleted && editingMessageId !== message.id && reactions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <TooltipProvider delayDuration={300}>
                {reactions.map((reaction) => {
                  const isPendingReaction = reactionPendingEmoji === reaction.emoji
                  const isActive = Boolean(currentUserId && reaction.userIds.includes(currentUserId))
                  return (
                    <Tooltip key={`${message.id}-${reaction.emoji}`}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant={isActive ? 'secondary' : 'outline'}
                          className={cn(
                            "h-7 rounded-full px-2.5 text-xs transition-all hover:scale-105",
                            isActive && "bg-primary/10 border-primary/30 hover:bg-primary/20"
                          )}
                          disabled={disableReactionActions}
                          aria-pressed={isActive}
                          onClick={() => onToggleReaction(message.id, reaction.emoji)}
                        >
                          <span className="flex items-center gap-1.5">
                            {isPendingReaction ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <span className="text-base leading-none">{reaction.emoji}</span>
                            )}
                            <span className="font-medium leading-none tabular-nums">{reaction.count}</span>
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        {isActive ? 'Remove your reaction' : 'Add reaction'}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>
          )}

          {message.isDeleted && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Deleted by {message.deletedBy ?? 'teammate'}</span>
              {message.deletedAt && <span>· {formatRelativeTime(message.deletedAt)}</span>}
            </div>
          )}

          {/* Thread Section */}
          {!isReply && !message.isDeleted && (
            <div className="pt-2">
              {/* Thread Toggle Button */}
              {hasThreadReplies ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "inline-flex items-center gap-2 text-xs text-primary hover:text-primary/90 hover:bg-primary/5 transition-colors",
                      isThreadOpen && "bg-primary/5"
                    )}
                    onClick={() => handleThreadToggle(threadRootId)}
                    disabled={threadLoading && !isThreadOpen && threadReplies.length === 0}
                  >
                    {threadLoading && !isThreadOpen && threadReplies.length === 0 ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isThreadOpen ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {replyCount === 1 ? '1 reply' : `${replyCount} replies`}
                    </span>
                    {lastReplyLabel && (
                      <span className="text-muted-foreground font-normal">
                        · Last reply {lastReplyLabel}
                      </span>
                    )}
                  </Button>
                  {threadError && !isThreadOpen && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[11px] text-destructive hover:text-destructive/90"
                      onClick={() => handleRetryThreadLoad(threadRootId)}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Retry
                    </Button>
                  )}
                </div>
              ) : (
                /* Start Thread Button for messages without replies */
                !message.isDeleted && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleReply(message)}
                  >
                    <Reply className="h-3.5 w-3.5" />
                    <span>Reply</span>
                  </Button>
                )
              )}

              {/* Thread Replies Container */}
              {isThreadOpen && (
                <div className="mt-3 space-y-2 border-l-2 border-primary/20 pl-4 animate-in slide-in-from-top-2 duration-200">
                  {/* Thread Error */}
                  {threadError && (
                    <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      <span>{threadError}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px] text-destructive hover:text-destructive/90"
                        onClick={() => handleRetryThreadLoad(threadRootId)}
                        disabled={threadLoading}
                      >
                        <RefreshCw className={cn("mr-1 h-3 w-3", threadLoading && "animate-spin")} />
                        Retry
                      </Button>
                    </div>
                  )}

                  {/* Loading State */}
                  {threadLoading && threadReplies.length === 0 && (
                    <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Loading replies…</span>
                    </div>
                  )}

                  {/* Thread Replies */}
                  <div className="space-y-2">
                    {threadReplies.map((reply) =>
                      renderMessage(reply, { isReply: true, isSearchResult }),
                    )}
                  </div>

                  {/* Loading More State */}
                  {threadLoading && threadReplies.length > 0 && (
                    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Loading more replies…</span>
                    </div>
                  )}

                  {/* Empty State */}
                  {!threadLoading && threadReplies.length === 0 && !threadError && (
                    <div className="rounded-md border border-dashed border-muted/50 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
                      Be the first to reply in this thread
                    </div>
                  )}

                  {/* Load More Button */}
                  {threadNextCursor && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleLoadMoreThread(threadRootId)}
                      disabled={threadLoading}
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", threadLoading && "animate-spin")} />
                      {threadLoading ? 'Loading…' : 'Load older replies'}
                    </Button>
                  )}

                  {/* Inline Thread Reply Composer */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs text-muted-foreground hover:text-foreground h-9"
                      onClick={() => handleReply(message)}
                    >
                      <Reply className="mr-2 h-3.5 w-3.5" />
                      Reply to thread…
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {!message.isDeleted && isDeleting && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-destructive">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Removing message…</span>
            </div>
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
            {channel.clientId && (
              <Link href={`/dashboard/clients?clientId=${channel.clientId}`}>
                <Badge variant="outline" className="border-dashed hover:bg-muted cursor-pointer">
                  Client Workspace
                </Badge>
              </Link>
            )}
          </div>
          <CardDescription className="mt-1">
            {channelParticipants.map((member) => member.name).join(', ')}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportChannel} disabled={channelMessages.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="border-b border-muted/40 px-4 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={messageSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search messages in this channel…"
            className="pl-9 pr-20"
          />
          {isSearchActive && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {visibleMessages.length} {visibleMessages.length === 1 ? 'result' : 'results'}
            </span>
          )}
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

          {messageGroups.map((group, groupIndex) => (
            <div key={group.id} className="group-block mb-4">
              {group.dateSeparator && (
                <div className="relative my-6 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted/40" />
                  </div>
                  <div className="relative flex justify-center text-xs font-medium uppercase text-muted-foreground">
                    <span className="bg-background px-2">{group.dateSeparator}</span>
                  </div>
                </div>
              )}
              {group.messages.map((message, messageIndex) => {
                const isFirstInGroup = messageIndex === 0
                
                // Show avatar only for the first message in the group
                const showAvatar = isFirstInGroup
                // Show header only for the first message in the group
                const showHeader = isFirstInGroup

                return (
                  <div key={message.id}>
                    {renderMessage(message, { 
                      isReply: false, 
                      isSearchResult: false,
                      showAvatar,
                      showHeader
                    })}
                  </div>
                )
              })}
            </div>
          ))}

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
              {replyingToMessage && (
                <div className="flex items-center justify-between rounded-t-md border-x border-t border-primary/30 bg-primary/5 px-3 py-2.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                      <Reply className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Replying to thread</span>
                      <span className="font-medium text-foreground">{replyingToMessage.senderName}</span>
                    </div>
                    {replyingToMessage.content && (
                      <span className="ml-2 max-w-[200px] truncate text-muted-foreground">
                        "{replyingToMessage.content.slice(0, 50)}{replyingToMessage.content.length > 50 ? '…' : ''}"
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-primary/10" 
                    onClick={handleCancelReply}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              <RichComposer
                value={messageInput}
                onChange={onMessageInputChange}
                onSend={() => {
                  onSendMessage({ parentMessageId: replyingToMessage?.id })
                  setReplyingToMessage(null)
                }}
                disabled={!channel || sending}
                onFocus={onComposerFocus}
                onBlur={onComposerBlur}
                onDrop={handleComposerDrop}
                onDragOver={handleComposerDragOver}
                participants={channelParticipants}
                onAttachClick={() => fileInputRef.current?.click()}
                hasAttachments={pendingAttachments.length > 0}
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                onClick={() => {
                  onSendMessage({ parentMessageId: replyingToMessage?.id })
                  setReplyingToMessage(null)
                }}
                disabled={isSendDisabled}
                className="inline-flex items-center gap-2"
              >
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
