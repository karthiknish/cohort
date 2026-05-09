'use client'

import { useCallback, useMemo } from 'react'
import { LoaderCircle, SmilePlus, Reply, MoreHorizontal, Trash2 } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { MessageReadReceipts } from './message-read-receipts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Textarea } from '@/shared/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import type { CollaborationMessage } from '@/types/collaboration'
import { COLLABORATION_REACTIONS } from '@/constants/collaboration-reactions'

import { formatRelativeTime, formatTimestamp, getInitials } from '../utils'

function ReactionEmojiButton({
  disableReactionActions,
  emoji,
  onReaction,
}: {
  disableReactionActions: boolean
  emoji: string
  onReaction: (emoji: string) => void
}) {
  const handleClick = useCallback(() => onReaction(emoji), [emoji, onReaction])

  return (
    <Tooltip key={emoji}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-base"
          disabled={disableReactionActions}
          onClick={handleClick}
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        React with {emoji}
      </TooltipContent>
    </Tooltip>
  )
}

function ReactionEmojiMenuItem({
  disableReactionActions,
  emoji,
  onReaction,
}: {
  disableReactionActions: boolean
  emoji: string
  onReaction: (emoji: string) => void
}) {
  const handleSelect = useCallback(() => onReaction(emoji), [emoji, onReaction])

  return (
    <DropdownMenuItem
      className="flex items-center justify-center p-2 text-lg transition-transform hover:scale-110"
      disabled={disableReactionActions}
      onSelect={handleSelect}
    >
      {emoji}
    </DropdownMenuItem>
  )
}

function MessageActionMenuItem({
  children,
  className,
  disabled,
  onAction,
}: {
  children: React.ReactNode
  className?: string
  disabled: boolean
  onAction: () => void
}) {
  const handleSelect = useCallback(
    (event: Event) => {
      event.preventDefault()
      onAction()
    },
    [onAction]
  )

  return (
    <DropdownMenuItem className={className} disabled={disabled} onSelect={handleSelect}>
      {children}
    </DropdownMenuItem>
  )
}

export interface MessageActionsBarProps {
  message: CollaborationMessage
  canReact: boolean
  canManage: boolean
  isUpdating: boolean
  isDeleting: boolean
  disableReactionActions: boolean
  onReaction: (emoji: string) => void
  onReply: () => void
  onEdit: () => void
  onDelete: () => void
  onCreateTask: () => void
}

export function MessageActionsBar({
  message,
  canReact,
  canManage,
  isUpdating,
  isDeleting,
  disableReactionActions,
  onReaction,
  onReply,
  onEdit,
  onDelete,
  onCreateTask,
}: MessageActionsBarProps) {
  if (message.isDeleted) return null

  return (
    <div className="absolute -top-3 right-2 z-10 flex items-center gap-0.5 rounded-md border border-muted/60 bg-background p-0.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
      <TooltipProvider delayDuration={200}>
        {/* Quick Reactions */}
        {canReact &&
          COLLABORATION_REACTIONS.slice(0, 3).map((emoji) => (
            <ReactionEmojiButton
              key={emoji}
              disableReactionActions={disableReactionActions}
              emoji={emoji}
              onReaction={onReaction}
            />
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
                    aria-label="Add reaction"
                  >
                    <SmilePlus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Add reaction
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              align="end"
              className="grid w-40 grid-cols-3 gap-1 p-2 text-lg"
            >
              {COLLABORATION_REACTIONS.map((emoji) => (
                <ReactionEmojiMenuItem
                  key={emoji}
                  disableReactionActions={disableReactionActions}
                  emoji={emoji}
                  onReaction={onReaction}
                />
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
              onClick={onReply}
              disabled={isUpdating || isDeleting}
              aria-label="Reply in thread"
            >
              <Reply className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Reply in thread
          </TooltipContent>
        </Tooltip>

        {/* More Actions */}
        {canManage && (
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
                    aria-label="More actions"
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
              <MessageActionMenuItem disabled={isUpdating || isDeleting} onAction={onEdit}>
                Edit message
              </MessageActionMenuItem>
              <MessageActionMenuItem disabled={isUpdating || isDeleting} onAction={onCreateTask}>
                Create task from message
              </MessageActionMenuItem>
              <MessageActionMenuItem
                className="text-destructive focus:text-destructive"
                disabled={isDeleting || isUpdating}
                onAction={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete message
              </MessageActionMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TooltipProvider>
    </div>
  )
}

export interface ReplyActionsBarProps {
  message: CollaborationMessage
  canManage: boolean
  isUpdating: boolean
  isDeleting: boolean
  onEdit: () => void
  onDelete: () => void
}

export function ReplyActionsBar({
  message,
  canManage,
  isUpdating,
  isDeleting,
  onEdit,
  onDelete,
}: ReplyActionsBarProps) {
  if (message.isDeleted || !canManage) return null

  return (
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
          <MessageActionMenuItem disabled={isUpdating || isDeleting} onAction={onEdit}>
            Edit message
          </MessageActionMenuItem>
          <MessageActionMenuItem
            className="text-destructive focus:text-destructive"
            disabled={isDeleting || isUpdating}
            onAction={onDelete}
          >
            Delete message
          </MessageActionMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export interface MessageEditFormProps {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  isUpdating: boolean
  editingPreview: string
}

export function MessageEditForm({
  value,
  onChange,
  onConfirm,
  onCancel,
  isUpdating,
  editingPreview,
}: MessageEditFormProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value),
    [onChange]
  )

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={handleChange}
        disabled={isUpdating}
        maxLength={2000}
        className="min-h-[88px]"
      />
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Editing message</span>
        {editingPreview && <span className="truncate">&quot;{editingPreview}&quot;</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          disabled={isUpdating || value.trim().length === 0}
        >
          {isUpdating ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save changes
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export interface MessageHeaderProps {
  senderName: string
  senderRole?: string | null
  createdAt?: string | null
  isEdited?: boolean
  isDeleted?: boolean
  messageId?: string
  currentUserId?: string | null
  readBy?: string[]
  channelMemberCount?: number
  readByNames?: string[]
}

export function MessageHeader({
  senderName,
  senderRole,
  createdAt,
  isEdited,
  isDeleted,
  messageId,
  currentUserId,
  readBy,
  channelMemberCount,
  readByNames,
}: MessageHeaderProps) {
  const readReceiptMessage = useMemo(
    () => ({
      id: messageId ?? '',
      channelType: 'team' as const,
      clientId: null,
      projectId: null,
      content: '',
      senderId: currentUserId ?? null,
      senderName,
      senderRole: senderRole ?? null,
      createdAt: createdAt ?? null,
      updatedAt: null,
      isEdited: Boolean(isEdited),
      deletedAt: null,
      deletedBy: null,
      readBy,
      deliveredTo: [],
      isDeleted: isDeleted ?? false,
    }),
    [
      createdAt,
      currentUserId,
      isDeleted,
      isEdited,
      messageId,
      readBy,
      senderName,
      senderRole,
    ]
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-semibold text-foreground">{senderName}</p>
      {senderRole && (
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
          {senderRole}
        </Badge>
      )}
      <span className="text-xs text-muted-foreground">
        {formatTimestamp(createdAt ?? null)}
        {isEdited && !isDeleted ? ' · edited' : ''}
      </span>
      {messageId && currentUserId && (
        <MessageReadReceipts
          message={readReceiptMessage}
          currentUserId={currentUserId}
          channelMemberCount={channelMemberCount}
          readByNames={readByNames}
        />
      )}
    </div>
  )
}

export interface MessageAvatarProps {
  senderName: string
  isReply?: boolean
}

export function MessageAvatar({ senderName, isReply = false }: MessageAvatarProps) {
  const avatarClass = isReply
    ? 'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-[10px] font-medium text-primary ring-2 ring-background'
    : 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-primary ring-2 ring-background'

  return <span className={avatarClass}>{getInitials(senderName)}</span>
}

export interface DeletedMessageInfoProps {
  deletedBy?: string | null
  deletedAt?: string | null
}

export function DeletedMessageInfo({ deletedBy, deletedAt }: DeletedMessageInfoProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>Deleted by {deletedBy ?? 'teammate'}</span>
      {deletedAt && <span>· {formatRelativeTime(deletedAt)}</span>}
    </div>
  )
}

export interface DeletingOverlayProps {
  isDeleting: boolean
}

export function DeletingOverlay({ isDeleting }: DeletingOverlayProps) {
  if (!isDeleting) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs text-destructive">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>Removing message…</span>
      </div>
    </div>
  )
}
