// Collaboration hook types and interfaces

import type { CollaborationAttachment, CollaborationMessage, CollaborationReaction } from '@/types/collaboration'
import type { Channel } from '../types'

export type ChannelSummary = {
  lastMessage: string
  lastTimestamp: string | null
}

export type PendingAttachment = {
  id: string
  file: File
  name: string
  sizeLabel: string
  mimeType: string
}

// Thread state types
export type ThreadMessagesState = Record<string, CollaborationMessage[]>
export type ThreadCursorsState = Record<string, string | null>
export type ThreadLoadingState = Record<string, boolean>
export type ThreadErrorsState = Record<string, string | null>

// Reaction state types
export type ReactionPendingState = Record<string, string | null>

// Messages state types
export type MessagesByChannelState = Record<string, CollaborationMessage[]>
export type CursorsByChannelState = Record<string, string | null>

// Typing participant type
export type TypingParticipant = {
  name: string
  role?: string | null
}

// Attachment validation result
export type AttachmentValidationResult = {
  valid: PendingAttachment[]
  errors: string[]
}

// Send message options
export type SendMessageOptions = {
  parentMessageId?: string
  attachmentPaths?: string[]
  skipAttachmentUpload?: boolean
}

// Hook return type
export interface UseCollaborationDataReturn {
  // Channels
  channels: Channel[]
  filteredChannels: Channel[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  channelSummaries: Map<string, ChannelSummary>
  selectedChannel: Channel | null
  selectChannel: (channelId: string | null) => void

  // Messages
  channelMessages: CollaborationMessage[]
  visibleMessages: CollaborationMessage[]
  isCurrentChannelLoading: boolean
  isBootstrapping: boolean
  messagesError: string | null
  messageSearchQuery: string
  setMessageSearchQuery: (query: string) => void

  // Stats
  totalChannels: number
  totalParticipants: number
  channelParticipants: { name: string; role: string }[]
  sharedFiles: CollaborationAttachment[]

  // Composer
  senderSelection: string
  setSenderSelection: (sender: string) => void
  messageInput: string
  setMessageInput: (value: string) => void
  pendingAttachments: PendingAttachment[]
  handleAddAttachments: (files: FileList | File[]) => void
  handleRemoveAttachment: (attachmentId: string) => void
  uploading: boolean

  // Typing
  typingParticipants: TypingParticipant[]
  handleComposerFocus: () => void
  handleComposerBlur: () => void

  // Message actions
  handleSendMessage: (options?: SendMessageOptions) => Promise<void>
  sending: boolean
  isSendDisabled: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  handleEditMessage: (channelId: string, messageId: string, nextContent: string) => Promise<void>
  handleDeleteMessage: (channelId: string, messageId: string) => Promise<void>
  handleToggleReaction: (channelId: string, messageId: string, emoji: string) => Promise<void>
  messageUpdatingId: string | null
  messageDeletingId: string | null

  // Pagination
  handleLoadMore: (channelId: string) => Promise<void>
  canLoadMore: boolean
  loadingMore: boolean

  // User info
  currentUserId: string | null
  currentUserRole: string | null

  // Threads
  threadMessagesByRootId: ThreadMessagesState
  threadNextCursorByRootId: ThreadCursorsState
  threadLoadingByRootId: ThreadLoadingState
  threadErrorsByRootId: ThreadErrorsState
  loadThreadReplies: (threadRootId: string) => Promise<void>
  loadMoreThreadReplies: (threadRootId: string) => Promise<void>
  clearThreadReplies: (threadRootId?: string) => void

  // Reactions
  reactionPendingByMessage: ReactionPendingState
}
