export type CollaborationChannelType = 'client' | 'team' | 'project'

export type CollaborationAttachment = {
  name: string
  url: string
  type?: string | null
  size?: string | null
}

export type CollaborationMessage = {
  id: string
  channelType: CollaborationChannelType
  clientId: string | null
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
}
