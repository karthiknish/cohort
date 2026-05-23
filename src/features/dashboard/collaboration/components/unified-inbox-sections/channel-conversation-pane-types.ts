import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type {
  PendingAttachment,
  ReactionPendingState,
  SendMessageOptions,
  ThreadCursorsState,
  ThreadErrorsState,
  ThreadLoadingState,
  ThreadMessagesState,
} from '../../hooks/types'
import type { Channel } from '../../types'
import type { UnifiedMessage } from '../message-list-types'

import type { ChannelParticipant } from './types'

export type ChannelPaneListState = {
  canLoadMore: boolean
  loading: boolean
  loadingMore: boolean
}

export type ChannelPaneSearchState = {
  active: boolean
  searching: boolean
}

export type ChannelPaneComposerState = {
  sending: boolean
  uploading: boolean
}

export type ChannelConversationPaneProps = {
  listState: ChannelPaneListState
  searchState: ChannelPaneSearchState
  composerState: ChannelPaneComposerState
  channelMessages: CollaborationMessage[]
  channelMessagesForPane: CollaborationMessage[]
  channelParticipants: ChannelParticipant[]
  mentionParticipants: ClientTeamMember[]
  currentUserId: string | null
  currentUserRole: string | null
  deepLinkMessageId: string | null
  deepLinkThreadId: string | null
  messageDeletingId: string | null
  messageInput: string
  messageSearchQuery: string
  messageUpdatingId: string | null
  onAddAttachments: (files: FileList | File[]) => void
  onBackToInbox?: () => void
  onClearDeepLink?: () => void
  onComposerBlur: () => void
  onComposerFocus: () => void
  onDeleteMessage: (channelId: string, messageId: string) => void
  onEditMessage: (channelId: string, messageId: string, content: string) => void
  onLoadMore: (channelId: string) => void
  onLoadMoreThreadReplies: (threadRootId: string) => void
  onLoadThreadReplies: (threadRootId: string) => void
  onMarkThreadAsRead: (threadRootId: string, beforeMs?: number) => Promise<void>
  onMessageInputChange: (value: string) => void
  onMessageSearchChange: (value: string) => void
  onRemoveAttachment: (attachmentId: string) => void
  sharedFiles: CollaborationAttachment[]
  canManageMembers?: boolean
  onManageMembers?: () => void
  workspaceId: string | null
  isAdmin: boolean
  onSendMessage: (options?: SendMessageOptions) => Promise<void>
  onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>
  onCreateTask?: (message: UnifiedMessage) => void
  onForwardMessage?: (message: UnifiedMessage) => void
  onCreatePoll?: (poll: Omit<import('../message-polls').MessagePoll, 'id' | 'createdAt'>) => Promise<void>
  onExportChannel?: () => void
  onOpenChannelMessage?: (messageId: string, options?: { threadId?: string | null }) => void
  onToggleReaction: (channelId: string, messageId: string, emoji: string) => void
  pendingAttachments: PendingAttachment[]
  reactionPendingByMessage: ReactionPendingState
  searchHighlights: string[]
  selectedChannel: Channel
  threadErrorsByRootId: ThreadErrorsState
  threadLoadingByRootId: ThreadLoadingState
  threadMessagesByRootId: ThreadMessagesState
  threadNextCursorByRootId: ThreadCursorsState
  threadUnreadCountsByRootId: Record<string, number>
  typingIndicatorText?: string
  messagesError: string | null
  onRetryMessages: () => void
  channelUnreadCount: number
  onMarkChannelRead: () => Promise<void>
  markChannelReadPending: boolean
}
