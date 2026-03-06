'use client'

import { useRef, useState, useCallback, useMemo, useEffect, type ChangeEvent, type ClipboardEvent } from 'react'
import { 
  Send, MoreVertical, Archive, BellOff, Bell, ArchiveRestore, 
  Share2, Mail, LoaderCircle, Hash, Reply, Pencil, Trash2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { RichComposer } from './rich-composer'
import { PendingAttachmentsList } from './message-composer'
import { MessageList, collaborationToUnifiedMessage, type UnifiedMessage } from './message-list'
import { SwipeableMessage } from './swipeable-message'
import { MessageAttachments } from './message-attachments'
import { MessageContent } from './message-content'
import { DeletedMessageInfo, DeletingOverlay, MessageEditForm } from './message-item-parts'
import { MessageReactions } from './message-reactions'
import { ThreadSection } from './thread-section'

import type { CollaborationMessage, CollaborationAttachment } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'
import type { PendingAttachment } from '../hooks/types'

const PLATFORM_CONFIG: Record<'email', { label: string; color: string }> = {
  email: { label: 'Email', color: 'bg-blue-500' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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

  const handleShare = async (message: UnifiedMessage, platform: 'email') => {
    if (!onShareToPlatform) return
    
    setSharingTo(`${message.id}-${platform}`)
    await onShareToPlatform(message, platform)
      .then(() => {
      toast({
        title: 'Message shared',
        description: `Sent to ${PLATFORM_CONFIG[platform]?.label ?? platform}`,
      })
      })
      .catch(() => {
      toast({
        title: 'Share failed',
        description: `Could not send to ${PLATFORM_CONFIG[platform]?.label ?? platform}`,
        variant: 'destructive',
      })
      })
    setSharingTo(null)
  }

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

  const renderMessageExtras = (message: UnifiedMessage) => {
    if (!message.sharedTo || message.sharedTo.length === 0) return null
    
    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="text-[10px] text-muted-foreground">Sent to:</span>
        {message.sharedTo.map((platform) => (
          <TooltipProvider key={platform}>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                  <Mail className="h-3 w-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shared to {PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.label ?? platform}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
  }

  const renderMessageActions = (message: UnifiedMessage) => {
    const canManageMessage = Boolean(currentUserId && message.senderId === currentUserId)
    const isBusy = activeDeletingMessageId === message.id || messageUpdatingId === message.id

    return (
      <div className="flex items-center gap-1">
        {header?.type === 'channel' && onReply && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 transition-transform hover:scale-105"
                  disabled={isBusy}
                  onClick={() => handleReply(message)}
                >
                  <Reply className="h-3 w-3" />
                  <span className="sr-only">Reply in thread</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reply in thread</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {onEditMessage && canManageMessage && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 transition-transform hover:scale-105"
                  disabled={isBusy}
                  onClick={() => handleStartEdit(message)}
                >
                  <Pencil className="h-3 w-3" />
                  <span className="sr-only">Edit message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {onDeleteMessage && canManageMessage && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive transition-transform hover:scale-105 hover:text-destructive"
                  disabled={isBusy}
                  onClick={() => handleRequestDelete(message.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="sr-only">Delete message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete message</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {onShareToPlatform && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 transition-transform hover:scale-105" disabled={isBusy}>
                <Share2 className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem 
                onClick={() => handleShare(message, 'email')}
                disabled={sharingTo === `${message.id}-email`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Share via Email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  const renderMessageContent = useCallback((message: UnifiedMessage) => {
    const originalMessage = channelMessagesById.get(message.id)

    return (
      <MessageContent
        content={originalMessage?.content ?? message.content ?? ''}
        mentions={originalMessage?.mentions ?? message.mentions}
      />
    )
  }, [channelMessagesById])

  const renderMessageAttachments = useCallback((message: UnifiedMessage) => {
    if (!message.attachments || message.attachments.length === 0) return null
    
    const attachments: CollaborationAttachment[] = message.attachments.map(a => ({
      name: a.name ?? 'File',
      url: a.url,
      type: a.mimeType ?? null,
      size: a.size ? String(a.size) : null,
    }))
    
    return <MessageAttachments attachments={attachments} />
  }, [])

  const renderDeletedInfo = useCallback((message: UnifiedMessage) => {
    const info = deletedInfoByMessage?.[message.id] ?? {
      deletedBy: message.deletedBy ?? null,
      deletedAt: message.deletedAt ?? null,
    }

    if (!info.deletedBy && !info.deletedAt) {
      return <p className="text-sm italic text-muted-foreground">Message removed</p>
    }

    return <DeletedMessageInfo deletedBy={info.deletedBy} deletedAt={info.deletedAt} />
  }, [deletedInfoByMessage])

  const renderEditForm = useCallback((message: UnifiedMessage) => {
    if (editingMessageId !== message.id) {
      return null
    }

    return (
      <MessageEditForm
        value={editingValue}
        onChange={setEditingValue}
        onConfirm={handleConfirmEdit}
        onCancel={handleCancelEdit}
        isUpdating={messageUpdatingId === message.id}
        editingPreview={editingPreview}
      />
    )
  }, [editingMessageId, editingPreview, editingValue, handleCancelEdit, handleConfirmEdit, messageUpdatingId])

  const renderThreadReply = useCallback((reply: CollaborationMessage) => {
    const message = collaborationToUnifiedMessage(reply)
    const canManageMessage = Boolean(currentUserId && message.senderId === currentUserId)
    const isEditing = editingMessageId === message.id
    const isDeleting = activeDeletingMessageId === message.id
    const isUpdating = messageUpdatingId === message.id
    const pendingReaction = reactionPendingByMessage[message.id] ?? null

    return (
      <div
        key={reply.id}
        className={cn(
          'group relative rounded-md border border-muted/40 bg-muted/15 px-3 py-2 transition-all duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
          !message.deleted && 'hover:border-primary/20 hover:bg-muted/25'
        )}
      >
        <div className="min-w-0 space-y-2 pr-14">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{reply.senderName}</span>
            {reply.senderRole ? <span>{reply.senderRole}</span> : null}
            {reply.createdAt ? (
              <span>
                {new Date(reply.createdAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            ) : null}
            {message.edited && !message.deleted ? <span>edited</span> : null}
          </div>

          {isEditing ? (
            renderEditForm(message)
          ) : message.deleted ? (
            renderDeletedInfo(message)
          ) : (
            <>
              {renderMessageContent(message)}
              {renderMessageAttachments(message)}
            </>
          )}

          {!isEditing && !message.deleted ? (
            <MessageReactions
              reactions={reply.reactions ?? []}
              currentUserId={currentUserId}
              pendingEmoji={pendingReaction}
              disabled={isDeleting || isUpdating}
              onToggle={(emoji) => handleReaction(message.id, emoji)}
            />
          ) : null}
        </div>

        {!isEditing && !message.deleted && canManageMessage ? (
          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity duration-[var(--motion-duration-fast)] group-hover:opacity-100 motion-reduce:transition-none">
            {onEditMessage ? (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 transition-transform hover:scale-105"
                      disabled={isDeleting || isUpdating}
                      onClick={() => handleStartEdit(message)}
                    >
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Edit reply</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit reply</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}

            {onDeleteMessage ? (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive transition-transform hover:scale-105 hover:text-destructive"
                      disabled={isDeleting || isUpdating}
                      onClick={() => handleRequestDelete(message.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Delete reply</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete reply</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
        ) : null}

        <DeletingOverlay isDeleting={isDeleting} />
      </div>
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
      
      {/* Header */}
      <div className="p-4 border-b border-muted/40 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className={cn(
                header.type === 'channel' ? 'bg-muted' : 'bg-primary/10 text-primary'
              )}>
                {header.type === 'channel' ? (
                  <Hash className="h-4 w-4" />
                ) : (
                  getInitials(header.name)
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{header.name}</h3>
              {header.role && (
                <Badge variant="outline" className="text-xs mt-0.5">
                  {header.role}
                </Badge>
              )}
              {header.participantCount !== undefined && (
                <span className="text-xs text-muted-foreground ml-2">
                  {header.participantCount} members
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {header.isArchived && (
              <Badge variant="secondary" className="text-xs">
                <Archive className="h-3 w-3 mr-1" />
                Archived
              </Badge>
            )}
            {header.isMuted && (
              <Badge variant="secondary" className="text-xs">
                <BellOff className="h-3 w-3 mr-1" />
                Muted
              </Badge>
            )}
            
            {(header.onArchive || header.onMute || header.onExport) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {header.onArchive && (
                    <DropdownMenuItem onClick={() => header.onArchive?.(!header.isArchived)}>
                      {header.isArchived ? (
                        <>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {header.onMute && (
                    <DropdownMenuItem onClick={() => header.onMute?.(!header.isMuted)}>
                      {header.isMuted ? (
                        <>
                          <Bell className="h-4 w-4 mr-2" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <BellOff className="h-4 w-4 mr-2" />
                          Mute
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {header.onExport && (
                    <DropdownMenuItem onClick={header.onExport}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Export messages
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-hidden">
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
          emptyState={emptyState}
          variant={header.type === 'channel' ? 'channel' : 'dm'}
          editingMessageId={editingMessageId}
          focusMessageId={effectiveFocusMessageId}
          focusThreadId={effectiveFocusThreadId}
        />
      </div>

      {/* Composer */}
      <div className="p-4 border-t border-muted/40 shrink-0">
        <PendingAttachmentsList
          attachments={pendingAttachments}
          uploading={uploadingAttachments}
          disabled={isSending}
          onRemove={(attachmentId) => onRemoveAttachment?.(attachmentId)}
        />
        <div
          className={cn(
            'w-full rounded-lg border border-muted/40 bg-background shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20',
            (isComposerFocused || hasPendingAttachments) && 'border-primary/30 shadow-md shadow-primary/5'
          )}
        >
          <RichComposer
            value={messageInput}
            onChange={onMessageInputChange}
            onSend={handleSend}
            disabled={isSending || uploadingAttachments}
            placeholder={placeholder}
            participants={participants}
            onFocus={handleComposerFocusInternal}
            onBlur={handleComposerBlurInternal}
            onDrop={handleComposerDrop}
            onDragOver={handleComposerDragOver}
            onPaste={handleComposerPaste}
            onAttachClick={onAddAttachments ? () => fileInputRef.current?.click() : undefined}
            hasAttachments={hasPendingAttachments}
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleAttachmentInputChange}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="min-h-[1rem] text-xs text-muted-foreground italic transition-opacity duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none">
            {typingIndicator || (isComposerFocused ? 'Press Enter to send. Shift+Enter adds a new line.' : '')}
          </span>
          <div className="flex-1" />
          <Button
            onClick={handleSend}
            disabled={(!messageInput.trim() && !hasPendingAttachments) || isSending || uploadingAttachments}
            size="sm"
            className="transition-all duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
          >
            {isSending || uploadingAttachments ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="ml-2">{uploadingAttachments ? 'Uploading…' : isSending ? 'Sending…' : 'Send'}</span>
          </Button>
        </div>
      </div>

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
