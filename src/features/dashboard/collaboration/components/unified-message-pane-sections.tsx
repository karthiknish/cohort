'use client'

import type { ChangeEvent, ClipboardEvent, DragEvent, ReactNode, RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  Bell,
  BellOff,
  Check,
  Hash,
  Link2,
  LoaderCircle,
  Mail,
  MoreVertical,
  Pencil,
  Plus,
  Reply,
  Send,
  Share2,
  Trash2,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { useToast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'

import type { PendingAttachment } from '../hooks/types'
import { CHANNEL_TYPE_COLORS } from '../utils'
import { MessageAttachments } from './message-attachments'
import { PendingAttachmentsList } from './message-composer'
import { MessageContent } from './message-content'
import { DeletedMessageInfo, DeletingOverlay, MessageEditForm } from './message-item-parts'
import { collaborationToUnifiedMessage, type UnifiedMessage } from './message-list'
import { useMessageListRenderContext } from './message-list-render-context'
import { MessageReactions } from './message-reactions'
import { RichComposer } from './rich-composer'
import type { MessagePaneHeaderInfo } from './unified-message-pane-types'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getSharePlatformLabel(platform: 'email'): string {
  if (platform === 'email') return 'Email'
  return platform
}

export function SharedPlatformBadges({ platforms }: { platforms?: Array<'email'> }) {
  if (!platforms || platforms.length === 0) return null

  return (
    <div className="mt-1 flex items-center gap-1">
      <span className="text-[10px] text-muted-foreground">Sent to:</span>
      {platforms.map((platform) => (
        <TooltipProvider key={platform}>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="h-4 px-1 py-0 text-[10px]">
                <Mail className="h-3 w-3" />
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Shared to {getSharePlatformLabel(platform)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

type UnifiedMessageActionBarProps = {
  headerType: 'channel' | 'dm'
  message: UnifiedMessage
  currentUserId: string | null
  activeDeletingMessageId: string | null
  messageUpdatingId: string | null
  sharingTo: string | null
  onReply?: (message: UnifiedMessage) => void
  onStartEdit?: (message: UnifiedMessage) => void
  onRequestDelete?: (messageId: string) => void
  onShare?: (message: UnifiedMessage, platform: 'email') => void
}

export function UnifiedMessageActionBar({
  headerType,
  message,
  currentUserId,
  activeDeletingMessageId,
  messageUpdatingId,
  sharingTo,
  onReply,
  onStartEdit,
  onRequestDelete,
  onShare,
}: UnifiedMessageActionBarProps) {
  const canManageMessage = Boolean(currentUserId && message.senderId === currentUserId)
  const isBusy = activeDeletingMessageId === message.id || messageUpdatingId === message.id
  const handleReplyClick = useCallback(() => {
    onReply?.(message)
  }, [message, onReply])
  const handleEditClick = useCallback(() => {
    onStartEdit?.(message)
  }, [message, onStartEdit])
  const handleDeleteClick = useCallback(() => {
    onRequestDelete?.(message.id)
  }, [message.id, onRequestDelete])
  const handleShareEmailClick = useCallback(() => {
    onShare?.(message, 'email')
  }, [message, onShare])

  return (
    <div className="flex items-center gap-1">
      {headerType === 'channel' && onReply ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 transition-transform hover:scale-105"
                disabled={isBusy}
                onClick={handleReplyClick}
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
      ) : null}

      {onStartEdit && canManageMessage ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 transition-transform hover:scale-105"
                disabled={isBusy}
                onClick={handleEditClick}
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
      ) : null}

      {onRequestDelete && canManageMessage ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive transition-transform hover:scale-105 hover:text-destructive"
                disabled={isBusy}
                onClick={handleDeleteClick}
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
      ) : null}

      {onShare ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 transition-transform hover:scale-105"
              disabled={isBusy}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleShareEmailClick} disabled={sharingTo === `${message.id}-email`}>
              <Mail className="mr-2 h-4 w-4" />
              Share via Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

type UnifiedThreadReplyCardProps = {
  reply: CollaborationMessage
  currentUserId: string | null
  editingMessageId: string | null
  activeDeletingMessageId: string | null
  messageUpdatingId: string | null
  reactionPendingEmoji: string | null
  onToggleReaction: (messageId: string, emoji: string) => void
  onStartEdit?: (message: UnifiedMessage) => void
  onRequestDelete?: (messageId: string) => void
  renderEditForm?: (message: UnifiedMessage) => ReactNode
  renderDeletedInfo?: (message: UnifiedMessage) => ReactNode
  renderMessageContent?: (message: UnifiedMessage) => ReactNode
  renderMessageAttachments?: (message: UnifiedMessage) => ReactNode
}

export function UnifiedThreadReplyCard({
  reply,
  currentUserId,
  editingMessageId,
  activeDeletingMessageId,
  messageUpdatingId,
  reactionPendingEmoji,
  onToggleReaction,
  onStartEdit,
  onRequestDelete,
  renderEditForm,
  renderDeletedInfo,
  renderMessageContent,
  renderMessageAttachments,
}: UnifiedThreadReplyCardProps) {
  const renderContext = useMessageListRenderContext()
  const message = collaborationToUnifiedMessage(reply)
  const canManageMessage = Boolean(currentUserId && message.senderId === currentUserId)
  const isEditing = editingMessageId === message.id
  const isDeleting = activeDeletingMessageId === message.id
  const isUpdating = messageUpdatingId === message.id
  const effectiveRenderEditForm = renderEditForm ?? renderContext?.renderEditForm
  const effectiveRenderDeletedInfo = renderDeletedInfo ?? renderContext?.renderDeletedInfo
  const effectiveRenderMessageContent = renderMessageContent ?? renderContext?.renderMessageContent
  const effectiveRenderMessageAttachments = renderMessageAttachments ?? renderContext?.renderMessageAttachments

  const handleToggleReaction = useCallback((emoji: string) => {
    onToggleReaction(message.id, emoji)
  }, [message.id, onToggleReaction])
  const handleEditReply = useCallback(() => {
    onStartEdit?.(message)
  }, [message, onStartEdit])
  const handleDeleteReply = useCallback(() => {
    onRequestDelete?.(message.id)
  }, [message.id, onRequestDelete])

  return (
    <div
      key={reply.id}
      className={cn(
        'group relative rounded-md border border-muted/40 bg-muted/15 px-3 py-2 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
        !message.deleted && 'hover:border-primary/20 hover:bg-muted/25',
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
          effectiveRenderEditForm?.(message) ?? null
        ) : message.deleted ? (
          effectiveRenderDeletedInfo?.(message) ?? <p className="text-sm italic text-muted-foreground">Message removed</p>
        ) : (
          <>
            {effectiveRenderMessageContent ? (
              effectiveRenderMessageContent(message)
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
            {effectiveRenderMessageAttachments?.(message)}
          </>
        )}

          {!isEditing && !message.deleted ? (
            <MessageReactions
              reactions={reply.reactions ?? []}
              currentUserId={currentUserId}
              pendingEmoji={reactionPendingEmoji}
              disabled={isDeleting || isUpdating}
              onToggle={handleToggleReaction}
            />
          ) : null}
        </div>

      {!isEditing && !message.deleted && canManageMessage ? (
        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity duration-[var(--motion-duration-fast)] group-hover:opacity-100 motion-reduce:transition-none">
          {onStartEdit ? (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 transition-transform hover:scale-105"
                    disabled={isDeleting || isUpdating}
                    onClick={handleEditReply}
                  >
                    <span className="sr-only">Edit reply</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit reply</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}

          {onRequestDelete ? (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive transition-transform hover:scale-105 hover:text-destructive"
                    disabled={isDeleting || isUpdating}
                    onClick={handleDeleteReply}
                  >
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
}

export function UnifiedConversationHeader({ header }: { header: MessagePaneHeaderInfo }) {
  const { toast } = useToast()
  const [linkCopied, setLinkCopied] = useState(false)
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleArchiveToggle = useCallback(() => {
    header.onArchive?.(!header.isArchived)
  }, [header])
  const handleMuteToggle = useCallback(() => {
    header.onMute?.(!header.isMuted)
  }, [header])

  const handleCopyShareLink = useCallback(() => {
    if (!header.buildShareableUrl) return

    const url = header.buildShareableUrl()
    void navigator.clipboard.writeText(url).then(
      () => {
        if (copyResetTimerRef.current) {
          clearTimeout(copyResetTimerRef.current)
        }
        setLinkCopied(true)
        toast({
          title: 'Link copied',
          description: header.type === 'channel' ? 'Recipients can open this channel from the link.' : 'Page link copied to clipboard.',
        })
        copyResetTimerRef.current = setTimeout(() => {
          setLinkCopied(false)
          copyResetTimerRef.current = null
        }, 2000)
      },
      () => {
        toast({
          title: 'Could not copy',
          description: 'Allow clipboard access or copy the URL from the address bar.',
          variant: 'destructive',
        })
      },
    )
  }, [header, toast])

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current)
      }
    }
  }, [])

  const subtitleParts: string[] = []
  if (header.type === 'channel' && header.participantCount !== undefined) {
    subtitleParts.push(`${header.participantCount} member${header.participantCount === 1 ? '' : 's'}`)
  }
  if (header.type === 'channel' && header.messageCount !== undefined) {
    subtitleParts.push(`${header.messageCount} message${header.messageCount === 1 ? '' : 's'}`)
  }

  return (
    <div className="shrink-0 border-b border-muted/40 bg-background/80 p-4 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Avatar className="mt-0.5 ring-1 ring-border/60">
            <AvatarFallback className={cn(header.type === 'channel' ? 'bg-muted' : 'bg-primary/10 text-primary')}>
              {header.type === 'channel' ? <Hash className="h-4 w-4" /> : getInitials(header.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
                {header.type === 'channel'
                  ? header.name.startsWith('#')
                    ? header.name
                    : `#${header.name}`
                  : header.name}
              </h3>
              {header.type === 'channel' && header.channelKind ? (
                <Badge
                  variant="outline"
                  className={cn('h-5 shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide', CHANNEL_TYPE_COLORS[header.channelKind])}
                >
                  {header.channelKind}
                </Badge>
              ) : null}
              {header.type === 'dm' && header.role ? (
                <Badge variant="outline" className="h-5 shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide">
                  {header.role}
                </Badge>
              ) : null}
            </div>
            {subtitleParts.length > 0 ? (
              <p className="text-xs text-muted-foreground">{subtitleParts.join(' · ')}</p>
            ) : header.type === 'dm' ? (
              <p className="text-xs text-muted-foreground">Direct message</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {header.buildShareableUrl ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={handleCopyShareLink}
                    aria-label="Copy conversation link"
                  >
                    {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{linkCopied ? 'Copied' : 'Copy link'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Copy a link to this {header.type === 'channel' ? 'channel' : 'page'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          {header.primaryActionLabel && header.onPrimaryAction ? (
            <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={header.onPrimaryAction} aria-label={header.primaryActionLabel}>
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{header.primaryActionLabel}</span>
            </Button>
          ) : null}
          {header.isArchived ? (
            <Badge variant="secondary" className="text-xs">
              <Archive className="mr-1 h-3 w-3" />
              Archived
            </Badge>
          ) : null}
          {header.isMuted ? (
            <Badge variant="secondary" className="text-xs">
              <BellOff className="mr-1 h-3 w-3" />
              Muted
            </Badge>
          ) : null}

          {header.onArchive || header.onMute || header.onExport ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Conversation actions">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {header.onArchive ? (
                  <DropdownMenuItem onClick={handleArchiveToggle}>
                    {header.isArchived ? (
                      <>
                        <ArchiveRestore className="mr-2 h-4 w-4" />
                        Unarchive
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </>
                    )}
                  </DropdownMenuItem>
                ) : null}
                {header.onMute ? (
                  <DropdownMenuItem onClick={handleMuteToggle}>
                    {header.isMuted ? (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <BellOff className="mr-2 h-4 w-4" />
                        Mute
                      </>
                    )}
                  </DropdownMenuItem>
                ) : null}
                {header.onExport ? (
                  <DropdownMenuItem onClick={header.onExport}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Export messages
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type UnifiedComposerSectionProps = {
  pendingAttachments: PendingAttachment[]
  uploadingAttachments: boolean
  isSending: boolean
  onRemoveAttachment?: (attachmentId: string) => void
  isComposerFocused: boolean
  hasPendingAttachments: boolean
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSend: () => void
  placeholder: string
  participants: ClientTeamMember[]
  onFocus: () => void
  onBlur: () => void
  onDrop: (event: DragEvent<HTMLTextAreaElement>) => void
  onDragOver: (event: DragEvent<HTMLTextAreaElement>) => void
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void
  onAttachClick?: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
  onAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  typingIndicator?: string
}

export function UnifiedComposerSection({
  pendingAttachments,
  uploadingAttachments,
  isSending,
  onRemoveAttachment,
  isComposerFocused,
  hasPendingAttachments,
  messageInput,
  onMessageInputChange,
  onSend,
  placeholder,
  participants,
  onFocus,
  onBlur,
  onDrop,
  onDragOver,
  onPaste,
  onAttachClick,
  fileInputRef,
  onAttachmentInputChange,
  typingIndicator,
}: UnifiedComposerSectionProps) {
  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    onRemoveAttachment?.(attachmentId)
  }, [onRemoveAttachment])
  const handleSend = useCallback(() => {
    onSend()
  }, [onSend])

  return (
    <div className="shrink-0 border-t border-muted/40 p-4">
      <PendingAttachmentsList
        attachments={pendingAttachments}
        uploading={uploadingAttachments}
        disabled={isSending}
        onRemove={handleRemoveAttachment}
      />
      <div
        className={cn(
          'w-full rounded-lg border border-muted/40 bg-background shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20',
          (isComposerFocused || hasPendingAttachments) && 'border-primary/30 shadow-md shadow-primary/5',
        )}
      >
        <RichComposer
          value={messageInput}
          onChange={onMessageInputChange}
          onSend={onSend}
          disabled={isSending || uploadingAttachments}
          placeholder={placeholder}
          participants={participants}
          onFocus={onFocus}
          onBlur={onBlur}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaste={onPaste}
          onAttachClick={onAttachClick}
          hasAttachments={hasPendingAttachments}
        />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onAttachmentInputChange}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="min-h-[1rem] text-[11px] leading-snug text-muted-foreground/90 transition-opacity duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none">
          {typingIndicator ?? 'Enter to send · Shift+Enter for a new line'}
        </span>
        <div className="flex-1" />
        <Button
          onClick={handleSend}
          disabled={(!messageInput.trim() && !hasPendingAttachments) || isSending || uploadingAttachments}
          size="sm"
          className="transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none"
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
  )
}

export function renderMessageAttachmentsContent(message: UnifiedMessage) {
  if (!message.attachments || message.attachments.length === 0) return null

  const attachments: CollaborationAttachment[] = message.attachments.map((attachment) => ({
    name: attachment.name ?? 'File',
    url: attachment.url,
    type: attachment.mimeType ?? null,
    size: attachment.size ? String(attachment.size) : null,
  }))

  return <MessageAttachments attachments={attachments} />
}

export function renderMessageContentBlock(
  message: UnifiedMessage,
  originalMessage: CollaborationMessage | undefined,
  highlightTerms?: string[],
) {
  return (
    <MessageContent
      content={originalMessage?.content ?? message.content ?? ''}
      mentions={originalMessage?.mentions ?? message.mentions}
      highlightTerms={highlightTerms}
    />
  )
}

export function renderDeletedMessageInfo(
  message: UnifiedMessage,
  deletedInfoByMessage?: Record<string, { deletedBy: string | null; deletedAt: string | null }>,
) {
  const info = deletedInfoByMessage?.[message.id] ?? {
    deletedBy: message.deletedBy ?? null,
    deletedAt: message.deletedAt ?? null,
  }

  if (!info.deletedBy && !info.deletedAt) {
    return <p className="text-sm italic text-muted-foreground">Message removed</p>
  }

  return <DeletedMessageInfo deletedBy={info.deletedBy} deletedAt={info.deletedAt} />
}

export function renderMessageEditForm(
  message: UnifiedMessage,
  editingMessageId: string | null,
  editingValue: string,
  onChange: (value: string) => void,
  onConfirm: () => void,
  onCancel: () => void,
  isUpdating: boolean,
  editingPreview: string,
) {
  if (editingMessageId !== message.id) {
    return null
  }

  return (
    <MessageEditForm
      value={editingValue}
      onChange={onChange}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isUpdating={isUpdating}
      editingPreview={editingPreview}
    />
  )
}
