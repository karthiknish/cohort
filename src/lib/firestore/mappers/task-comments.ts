import type { TaskComment, TaskCommentAttachment, TaskCommentFormat, TaskCommentMention } from '@/types/task-comments'
import type { StoredAttachment, StoredMention, StoredTaskComment } from '@/types/stored-types'
import { toISO } from '@/lib/utils'

function parseFormat(value: unknown): TaskCommentFormat {
  if (value === 'plaintext' || value === 'markdown') {
    return value
  }
  return 'markdown'
}

function sanitizeAttachment(input: unknown): TaskCommentAttachment | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as StoredAttachment
  const name = typeof data.name === 'string' ? data.name : null
  const url = typeof data.url === 'string' ? data.url : null

  if (!name || !url) {
    return null
  }

  return {
    name,
    url,
    type: typeof data.type === 'string' ? data.type : null,
    size: typeof data.size === 'string' ? data.size : null,
  }
}

function sanitizeMention(input: unknown): TaskCommentMention | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as StoredMention
  const slug = typeof data.slug === 'string' ? data.slug : null
  const name = typeof data.name === 'string' ? data.name : null

  if (!slug || !name) {
    return null
  }

  return {
    slug,
    name,
    role: typeof data.role === 'string' ? data.role : null,
  }
}

export function mapTaskCommentDoc(docId: string, data: StoredTaskComment): TaskComment {
  const isDeleted = Boolean(data.deleted || data.deletedAt)
  const createdAt = toISO(data.createdAt)
  const updatedAt = toISO(data.updatedAt)

  const attachments = Array.isArray(data.attachments)
    ? (data.attachments as unknown[])
        .map(sanitizeAttachment)
        .filter((item): item is TaskCommentAttachment => Boolean(item))
    : undefined

  const mentions = Array.isArray(data.mentions)
    ? (data.mentions as unknown[])
        .map(sanitizeMention)
        .filter((item): item is TaskCommentMention => Boolean(item))
    : undefined

  return {
    id: docId,
    taskId: typeof data.taskId === 'string' ? data.taskId : '',
    content: typeof data.content === 'string' ? data.content : '',
    format: parseFormat(data.format),
    authorId: typeof data.authorId === 'string' ? data.authorId : null,
    authorName: typeof data.authorName === 'string' && data.authorName.trim().length > 0 ? data.authorName : 'Teammate',
    authorRole: typeof data.authorRole === 'string' ? data.authorRole : null,
    createdAt,
    updatedAt,
    isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
    isDeleted,
    deletedAt: toISO(data.deletedAt),
    deletedBy: typeof data.deletedBy === 'string' ? data.deletedBy : null,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
    mentions: mentions && mentions.length > 0 ? mentions : undefined,
    parentCommentId: typeof data.parentCommentId === 'string' ? data.parentCommentId : null,
    threadRootId: typeof data.threadRootId === 'string' ? data.threadRootId : null,
  }
}
