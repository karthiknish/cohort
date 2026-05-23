'use client'

import { ClientFormattedDate } from '@/shared/components/client-formatted-date'
import { notifyFailure } from '@/lib/notifications'
import {
  createElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type DragEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  Archive,
  ArchiveRestore,
  Bell,
  BellOff,
  ArrowLeft,
  Check,
  CheckCheck,
  Hash,
  Info,
  Link2,
  Forward,
  ListTodo,
  Search,
  X,
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
import { chromaticTransitionClass } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'
import type { ClientTeamMember } from '@/types/clients'

import type { PendingAttachment } from '../../hooks/types'
import { CHANNEL_TYPE_COLORS } from '../../utils'
import { MessageAttachments } from '../message-attachments'
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator'
import { PendingAttachmentsList, ReplyIndicator } from '../message-composer'
import { MessageContent } from '../message-content'
import { DeletedMessageInfo, DeletingOverlay, MessageEditForm } from '../message-item-parts'
import { collaborationToUnifiedMessage } from '../message-list-utils'
import { getSharePlatformLabel } from '../unified-message-pane-render-utils'
import type { UnifiedMessage } from '../message-list-types'
import { useMessageListRenderContext } from '../message-list-render-context'
import { MessageReactions } from '../message-reactions'
import { RichComposer } from '../rich-composer'
import { ChannelAvatar } from '../channel-avatar'
import { ChannelInfoDialog } from '../channel-info-dialog'
import { PinMessageButton } from '../pinned-messages'
import type { MessagePaneHeaderInfo } from '../unified-message-pane-types'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type UnifiedMessageActionBarProps = {
  headerType: 'channel' | 'dm'
  message: UnifiedMessage
  currentUserId: string | null
  currentUserRole?: string | null
  activeDeletingMessageId: string | null
  messageUpdatingId: string | null
  sharingTo: string | null
  onReply?: (message: UnifiedMessage) => void
  onStartEdit?: (message: UnifiedMessage) => void
  onRequestDelete?: (messageId: string) => void
  onShare?: (message: UnifiedMessage, platform: 'email') => void
  onCreateTask?: (message: UnifiedMessage) => void
  onForward?: (message: UnifiedMessage) => void
  pinWorkspaceId?: string | null
  pinMessage?: CollaborationMessage
}

export function UnifiedMessageActionBar({
  headerType,
  message,
  currentUserId,
  currentUserRole,
  activeDeletingMessageId,
  messageUpdatingId,
  sharingTo,
  onReply,
  onStartEdit,
  onRequestDelete,
  onShare,
  onCreateTask,
  onForward,
  pinWorkspaceId,
  pinMessage,
}: UnifiedMessageActionBarProps) {
  const canManageMessage = Boolean(
    currentUserId &&
      !message.deleted &&
      (message.senderId === currentUserId || currentUserRole === 'admin'),
  )
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
  const handleCreateTaskClick = useCallback(() => {
    onCreateTask?.(message)
  }, [message, onCreateTask])
  const handleForwardClick = useCallback(() => {
    onForward?.(message)
  }, [message, onForward])

  return (
    <div className="flex items-center gap-1">
      {onCreateTask && !message.deleted ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 transition-transform hover:scale-105"
                disabled={isBusy}
                onClick={handleCreateTaskClick}
              >
                <ListTodo className="size-3" />
                <span className="sr-only">Create task from message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {headerType === 'channel' && onForward && !message.deleted ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 transition-transform hover:scale-105"
                disabled={isBusy}
                onClick={handleForwardClick}
              >
                <Forward className="size-3" />
                <span className="sr-only">Forward message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Forward to channel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {headerType === 'channel' && pinWorkspaceId && pinMessage && !message.deleted ? (
        <PinMessageButton
          message={pinMessage}
          workspaceId={pinWorkspaceId}
          userId={currentUserId}
          variant="icon"
        />
      ) : null}

      {headerType === 'channel' && onReply ? (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 transition-transform hover:scale-105"
                disabled={isBusy}
                onClick={handleReplyClick}
              >
                <Reply className="size-3" />
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
                className="size-6 transition-transform hover:scale-105"
                disabled={isBusy}
                onClick={handleEditClick}
              >
                <Pencil className="size-3" />
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
                className="size-6 text-destructive transition-transform hover:scale-105 hover:text-destructive"
                disabled={isBusy}
                onClick={handleDeleteClick}
              >
                <Trash2 className="size-3" />
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
              className="size-6 transition-transform hover:scale-105"
              disabled={isBusy}
              aria-label={`Share message from ${message.senderName ?? 'sender'}`}
            >
              <Share2 className="size-3" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleShareEmailClick} disabled={sharingTo === `${message.id}-email`}>
              <Mail className="mr-2 size-4" />
              Share via Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}

