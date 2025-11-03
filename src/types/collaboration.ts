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
}
