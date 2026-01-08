import type { CollaborationAttachment, CollaborationMention } from '@/types/collaboration'

export type TaskCommentFormat = 'markdown' | 'plaintext'

export type TaskCommentAttachment = CollaborationAttachment

export type TaskCommentMention = CollaborationMention

export type TaskComment = {
  id: string
  taskId: string
  content: string
  format: TaskCommentFormat
  authorId: string | null
  authorName: string
  authorRole?: string | null
  createdAt: string | null
  updatedAt: string | null
  isEdited: boolean
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: string | null
  attachments?: TaskCommentAttachment[]
  mentions?: TaskCommentMention[]
  parentCommentId?: string | null
  threadRootId?: string | null
}
