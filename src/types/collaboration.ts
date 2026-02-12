export type CollaborationChannelType = 'client' | 'team' | 'project'

export type CollaborationMessageFormat = 'markdown' | 'plaintext'

export type CollaborationMention = {
  slug: string
  name: string
  role?: string | null
}

export type CollaborationAttachment = {
  name: string
  url: string
  storageId?: string
  type?: string | null
  size?: string | null
}

export type CollaborationReaction = {
  emoji: string
  count: number
  userIds: string[]
}

export type CollaborationMessage = {
  id: string
  channelType: CollaborationChannelType
  clientId: string | null
  projectId: string | null
  content: string
  senderId: string | null
  senderName: string
  senderRole?: string | null
  createdAt: string | null
  updatedAt: string | null
  isEdited: boolean
  deletedAt: string | null
  deletedBy: string | null
  isDeleted: boolean
  attachments?: CollaborationAttachment[]
  format?: CollaborationMessageFormat | null
  mentions?: CollaborationMention[]
  reactions?: CollaborationReaction[]
  parentMessageId?: string | null
  threadRootId?: string | null
  threadReplyCount?: number
  threadLastReplyAt?: string | null
  readBy?: string[]
  deliveredTo?: string[]
  isPinned?: boolean
  pinnedAt?: string | null
  pinnedBy?: string | null
  sharedTo?: Array<'slack' | 'teams' | 'whatsapp'>
}

export type DirectConversationStatus = 'active' | 'archived' | 'muted'

export type DirectConversation = {
  id: string
  legacyId: string
  otherParticipantId: string
  otherParticipantName: string
  otherParticipantRole?: string | null
  lastMessageSnippet?: string | null
  lastMessageAtMs?: number | null
  lastMessageSenderId?: string | null
  isRead: boolean
  isArchived: boolean
  isMuted: boolean
  createdAtMs: number
  updatedAtMs: number
}

export type DirectMessageReaction = {
  emoji: string
  count: number
  userIds: string[]
}

export type DirectMessageAttachment = {
  name: string
  url: string
  storageId?: string | null
  type?: string | null
  size?: string | null
}

export type DirectMessage = {
  id: string
  legacyId: string
  senderId: string
  senderName: string
  senderRole?: string | null
  content: string
  edited: boolean
  editedAtMs?: number | null
  deleted: boolean
  deletedAtMs?: number | null
  deletedBy?: string | null
  attachments?: DirectMessageAttachment[] | null
  reactions?: DirectMessageReaction[] | null
  readBy: string[]
  deliveredTo: string[]
  readAtMs?: number | null
  sharedTo?: Array<'slack' | 'teams' | 'whatsapp' | 'email'> | null
  createdAtMs: number
  updatedAtMs?: number | null
}

export type InboxSource = 'direct_message' | 'channel' | 'whatsapp' | 'slack' | 'teams' | 'email'

export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent'

export type InboxItem = {
  id: string
  legacyId: string
  sourceType: InboxSource
  sourceId: string
  sourceName: string
  clientId?: string | null
  projectId?: string | null
  otherParticipantId?: string | null
  otherParticipantName?: string | null
  lastMessageSnippet?: string | null
  lastMessageAtMs?: number | null
  lastMessageSenderId?: string | null
  lastMessageSenderName?: string | null
  unreadCount: number
  isRead: boolean
  lastReadAtMs?: number | null
  pinned: boolean
  pinnedAtMs?: number | null
  archived: boolean
  archivedAtMs?: number | null
  muted: boolean
  mutedAtMs?: number | null
  assignedToId?: string | null
  assignedToName?: string | null
  priority?: InboxPriority | null
  createdAtMs: number
  updatedAtMs: number
}

export type ConversationAssignmentStatus = 'active' | 'completed' | 'escalated' | 'transferred'

export type ConversationAssignment = {
  id: string
  legacyId: string
  resourceType: 'direct_conversation' | 'channel' | 'message'
  resourceId: string
  assignedToId: string
  assignedToName: string
  assignedById?: string | null
  assignedByName?: string | null
  routingReason?: string | null
  routingRuleId?: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: ConversationAssignmentStatus
  escalatedFromId?: string | null
  slaDeadlineMs?: number | null
  slaBreached: boolean
  firstResponseAtMs?: number | null
  resolvedAtMs?: number | null
  createdAtMs: number
  updatedAtMs: number
}

export type MessageAnalytic = {
  id: string
  legacyId: string
  conversationType: 'direct' | 'channel' | 'thread'
  conversationId: string
  messageId: string
  senderId: string
  firstReadAtMs?: number | null
  firstResponseAtMs?: number | null
  responseTimeMs?: number | null
  timeToReadMs?: number | null
  reactionCount: number
  replyCount: number
  shareCount: number
  deliveryAttempts: number
  deliveryStatus: 'pending' | 'delivered' | 'failed'
  deliveredAtMs?: number | null
  channelType?: string | null
  clientId?: string | null
  projectId?: string | null
  createdAtMs: number
  updatedAtMs: number
}

export type PrivacyMaskType = 'pseudonym' | 'relay_number' | 'anonymous'

export type PrivacyMask = {
  id: string
  legacyId: string
  resourceType: 'conversation' | 'channel' | 'user'
  resourceId: string
  maskType: PrivacyMaskType
  displayName: string
  realName?: string | null
  relayIdentifier?: string | null
  visibleToRoles: string[]
  visibleToUserIds: string[]
  createdAtMs: number
  updatedAtMs: number
}
