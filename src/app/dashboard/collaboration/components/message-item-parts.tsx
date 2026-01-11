'use client'

import { LoaderCircle, SmilePlus, Reply, MoreHorizontal, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'
import { COLLABORATION_REACTIONS } from '@/constants/collaboration-reactions'

import { formatRelativeTime, formatTimestamp, getInitials } from '../utils'

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
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-base"
                  disabled={disableReactionActions}
                  onClick={() => onReaction(emoji)}
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
            <DropdownMenuContent
              align="end"
              className="grid w-40 grid-cols-3 gap-1 p-2 text-lg"
            >
              {COLLABORATION_REACTIONS.map((emoji) => (
                <DropdownMenuItem
                  key={emoji}
                  className="flex items-center justify-center p-2 text-lg transition-transform hover:scale-110"
                  disabled={disableReactionActions}
                  onSelect={() => onReaction(emoji)}
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
              onClick={onReply}
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
                  onEdit()
                }}
                disabled={isUpdating || isDeleting}
              >
                Edit message
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onCreateTask()
                }}
                disabled={isUpdating || isDeleting}
              >
                Create task from message
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault()
                  onDelete()
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
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onEdit()
            }}
            disabled={isUpdating || isDeleting}
          >
            Edit message
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault()
              onDelete()
            }}
            className="text-destructive focus:text-destructive"
            disabled={isDeleting || isUpdating}
          >
            Delete message
          </DropdownMenuItem>
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
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
}

export function MessageHeader({
  senderName,
  senderRole,
  createdAt,
  isEdited,
  isDeleted,
}: MessageHeaderProps) {
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
    </div>
  )
}

export interface MessageAvatarProps {
  senderName: string
  isReply?: boolean
}

export function MessageAvatar({ senderName, isReply = false }: MessageAvatarProps) {
  const avatarClass = isReply
    ? 'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary ring-2 ring-background'
    : 'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-2 ring-background'

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
