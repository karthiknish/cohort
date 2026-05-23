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
                <Mail className="size-3" />
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

