import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMessage,
  CollaborationMessageFormat,
} from '@/types/collaboration'

import type { PendingAttachment } from './types'

type MapCollaborationMessageRowOptions = {
  fallbackChannelType: CollaborationChannelType
  fallbackClientId?: string | null
  fallbackProjectId?: string | null
  fallbackSenderId?: string | null
  fallbackSenderName?: string
  fallbackSenderRole?: string | null
  fallbackThreadRootId?: string | null
  fallbackCreatedAtIso?: string | null
}

export function toStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const normalized = value.filter((entry): entry is string => typeof entry === 'string')
  return normalized.length > 0 ? normalized : undefined
}

export function toSharedPlatforms(value: unknown): Array<'email'> | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined
  const normalized = value.filter((entry): entry is 'email' => entry === 'email')
  return normalized.length > 0 ? normalized : undefined
}

export function toChannelType(value: unknown, fallback: CollaborationChannelType): CollaborationChannelType {
  if (value === 'client' || value === 'team' || value === 'project') {
    return value
  }

  return fallback
}

export function previewPendingAttachmentToCollaborationAttachment(
  attachment: PendingAttachment,
): CollaborationAttachment {
  return {
    name: attachment.name,
    url: '#',
    type: attachment.mimeType,
    size: attachment.sizeLabel,
  }
}

export function mapCollaborationMessageRow(
  row: unknown,
  {
    fallbackChannelType,
    fallbackClientId = null,
    fallbackProjectId = null,
    fallbackSenderId = null,
    fallbackSenderName = 'Unknown teammate',
    fallbackSenderRole = null,
    fallbackThreadRootId = null,
    fallbackCreatedAtIso = null,
  }: MapCollaborationMessageRowOptions,
): CollaborationMessage | null {
  const item = (row ?? {}) as Record<string, unknown>
  const id = String(item.legacyId ?? '')

  if (!id) {
    return null
  }

  return {
    id,
    channelType: toChannelType(item.channelType, fallbackChannelType),
    clientId: typeof item.clientId === 'string' ? item.clientId : fallbackClientId,
    projectId: typeof item.projectId === 'string' ? item.projectId : fallbackProjectId,
    senderId: typeof item.senderId === 'string' ? item.senderId : fallbackSenderId,
    senderName: typeof item.senderName === 'string' ? item.senderName : fallbackSenderName,
    senderRole: typeof item.senderRole === 'string' ? item.senderRole : fallbackSenderRole,
    content: item.deleted || item.deletedAtMs ? '' : String(item.content ?? ''),
    createdAt:
      typeof item.createdAtMs === 'number'
        ? new Date(item.createdAtMs).toISOString()
        : fallbackCreatedAtIso,
    updatedAt: typeof item.updatedAtMs === 'number' ? new Date(item.updatedAtMs).toISOString() : null,
    isEdited: Boolean(item.updatedAtMs && item.createdAtMs && item.updatedAtMs !== item.createdAtMs),
    deletedAt: typeof item.deletedAtMs === 'number' ? new Date(item.deletedAtMs).toISOString() : null,
    deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
    isDeleted: Boolean(item.deleted || item.deletedAtMs),
    attachments:
      Array.isArray(item.attachments) && item.attachments.length > 0
        ? (item.attachments as CollaborationAttachment[])
        : undefined,
    format: (item.format === 'plaintext' ? 'plaintext' : 'markdown') as CollaborationMessageFormat,
    mentions:
      Array.isArray(item.mentions) && item.mentions.length > 0
        ? (item.mentions as CollaborationMessage['mentions'])
        : undefined,
    reactions:
      Array.isArray(item.reactions) && item.reactions.length > 0
        ? (item.reactions as CollaborationMessage['reactions'])
        : undefined,
    readBy: toStringArray(item.readBy),
    deliveredTo: toStringArray(item.deliveredTo),
    isPinned: Boolean(item.isPinned),
    pinnedAt: typeof item.pinnedAtMs === 'number' ? new Date(item.pinnedAtMs).toISOString() : null,
    pinnedBy: typeof item.pinnedBy === 'string' ? item.pinnedBy : null,
    sharedTo: toSharedPlatforms(item.sharedTo),
    parentMessageId: typeof item.parentMessageId === 'string' ? item.parentMessageId : null,
    threadRootId:
      typeof item.threadRootId === 'string' ? item.threadRootId : fallbackThreadRootId,
    threadReplyCount: typeof item.threadReplyCount === 'number' ? item.threadReplyCount : undefined,
    threadLastReplyAt:
      typeof item.threadLastReplyAtMs === 'number' ? new Date(item.threadLastReplyAtMs).toISOString() : null,
  }
}