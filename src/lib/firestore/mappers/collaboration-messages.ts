import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMention,
  CollaborationMessage,
  CollaborationMessageFormat,
  CollaborationReaction,
} from '@/types/collaboration'
import type { StoredAttachment, StoredMention, StoredReaction, StoredMessage } from '@/types/stored-types'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'
import { toISO } from '@/lib/utils'

export type { StoredMessage } from '@/types/stored-types'

function parseMessageFormat(value: unknown): CollaborationMessageFormat {
  if (value === 'plaintext' || value === 'markdown') {
    return value
  }
  return 'markdown'
}

function sanitizeAttachment(input: unknown): CollaborationAttachment | null {
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

function sanitizeMention(input: unknown): CollaborationMention | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as StoredMention
  const slug = typeof data.slug === 'string' ? data.slug.trim() : null
  const name = typeof data.name === 'string' ? data.name.trim() : null

  if (!slug || !name) {
    return null
  }

  return {
    slug,
    name,
    role: typeof data.role === 'string' ? data.role : null,
  }
}

export function sanitizeReaction(input: unknown): CollaborationReaction | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const data = input as StoredReaction
  const emoji = typeof data.emoji === 'string' ? data.emoji : null
  const count = typeof data.count === 'number' ? data.count : Array.isArray(data.userIds) ? data.userIds.length : null
  const userIds = Array.isArray(data.userIds)
    ? data.userIds.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : []

  if (!emoji || !COLLABORATION_REACTION_SET.has(emoji) || count === null) {
    return null
  }

  return {
    emoji,
    count: count >= 0 ? count : 0,
    userIds,
  }
}

export function mapMessageDoc(docId: string, data: StoredMessage): CollaborationMessage {
  const channelType = (typeof data.channelType === 'string' ? data.channelType : 'team') as CollaborationChannelType

  const attachments = Array.isArray(data.attachments)
    ? data.attachments.map((item) => sanitizeAttachment(item)).filter((item): item is CollaborationAttachment => Boolean(item))
    : undefined

  const deletedAt = toISO(data.deletedAt)
  const deletedBy = typeof data.deletedBy === 'string' ? data.deletedBy : null
  const isDeleted = Boolean(deletedAt) || data.deleted === true
  const updatedAt = toISO(data.updatedAt)
  const createdAt = toISO(data.createdAt)
  const threadLastReplyAt = toISO(data.threadLastReplyAt)

  const content = typeof data.content === 'string' ? data.content : ''
  const resolvedContent = isDeleted ? '' : content

  const parentMessageId = typeof data.parentMessageId === 'string' ? data.parentMessageId : null
  const threadRootId = typeof data.threadRootId === 'string' ? data.threadRootId : null
  const threadReplyCountRaw = typeof data.threadReplyCount === 'number' ? data.threadReplyCount : null
  const threadReplyCount = threadReplyCountRaw !== null ? Math.max(0, Math.trunc(threadReplyCountRaw)) : undefined

  return {
    id: docId,
    channelType,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    projectId: typeof data.projectId === 'string' ? data.projectId : null,
    senderId: typeof data.senderId === 'string' ? data.senderId : null,
    senderName: typeof data.senderName === 'string' ? data.senderName : 'Unknown teammate',
    senderRole: typeof data.senderRole === 'string' ? data.senderRole : null,
    content: resolvedContent,
    createdAt,
    updatedAt,
    isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
    deletedAt,
    deletedBy,
    isDeleted,
    attachments,
    format: parseMessageFormat(data.format),
    mentions: Array.isArray(data.mentions)
      ? data.mentions.map((entry) => sanitizeMention(entry)).filter((entry): entry is CollaborationMention => Boolean(entry))
      : undefined,
    reactions: Array.isArray(data.reactions)
      ? data.reactions.map((entry) => sanitizeReaction(entry)).filter((entry): entry is CollaborationReaction => Boolean(entry))
      : undefined,
    parentMessageId,
    threadRootId,
    threadReplyCount,
    threadLastReplyAt,
  }
}
