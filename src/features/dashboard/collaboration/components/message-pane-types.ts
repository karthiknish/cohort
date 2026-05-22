import type { ChangeEvent, ClipboardEvent, DragEvent, RefObject } from 'react'

import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationMessage } from '@/types/collaboration'

import type { PendingAttachment } from '../hooks'
import type { Channel } from '../types'

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
