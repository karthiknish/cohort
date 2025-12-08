import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore'

import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'
import type {
    CollaborationAttachment,
    CollaborationMention,
    CollaborationMessage,
    CollaborationMessageFormat,
    CollaborationReaction,
} from '@/types/collaboration'

import type { Channel } from '../types'

export function mapRealtimeMessage(doc: QueryDocumentSnapshot<DocumentData>): CollaborationMessage {
    const data = doc.data()
    const channelType = parseChannelType(data?.channelType)

    const attachments = Array.isArray(data?.attachments)
        ? data.attachments
            .map((entry: unknown) => sanitizeAttachment(entry))
            .filter((entry): entry is CollaborationAttachment => Boolean(entry))
        : undefined

    const mentions = Array.isArray(data?.mentions)
        ? data.mentions
            .map((entry: unknown) => sanitizeMention(entry))
            .filter((entry): entry is CollaborationMention => Boolean(entry))
        : undefined

    const reactions = Array.isArray(data?.reactions)
        ? data.reactions
            .map((entry: unknown) => sanitizeReaction(entry))
            .filter((entry): entry is CollaborationReaction => Boolean(entry))
        : []

    const deletedAt = convertToIso(data?.deletedAt)
    const deletedBy = typeof data?.deletedBy === 'string' ? data.deletedBy : null
    const isDeleted = Boolean(deletedAt) || data?.deleted === true
    const updatedAt = convertToIso(data?.updatedAt)
    const createdAt = convertToIso(data?.createdAt)
    const content = typeof data?.content === 'string' ? data.content : ''
    const resolvedContent = isDeleted ? '' : content
    const parentMessageId = typeof data?.parentMessageId === 'string' ? data.parentMessageId : null
    const threadRootId = typeof data?.threadRootId === 'string' ? data.threadRootId : null
    const threadReplyCountRaw = typeof data?.threadReplyCount === 'number' ? data.threadReplyCount : null
    const threadReplyCount = threadReplyCountRaw !== null ? Math.max(0, Math.trunc(threadReplyCountRaw)) : undefined
    const threadLastReplyAt = convertToIso(data?.threadLastReplyAt)

    return {
        id: doc.id,
        channelType,
        clientId: typeof data?.clientId === 'string' ? data.clientId : null,
        projectId: typeof data?.projectId === 'string' ? data.projectId : null,
        content: resolvedContent,
        senderId: typeof data?.senderId === 'string' ? data.senderId : null,
        senderName:
            typeof data?.senderName === 'string' && data.senderName.trim().length > 0 ? data.senderName : 'Teammate',
        senderRole: typeof data?.senderRole === 'string' ? data.senderRole : null,
        createdAt,
        updatedAt,
        isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
        deletedAt,
        deletedBy,
        isDeleted,
        attachments,
        format: parseMessageFormat(data?.format),
        mentions,
        reactions,
        parentMessageId,
        threadRootId,
        threadReplyCount,
        threadLastReplyAt,
    }
}

export function sanitizeAttachment(input: unknown): CollaborationAttachment | null {
    if (!input || typeof input !== 'object') {
        return null
    }

    const data = input as Record<string, unknown>
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

export function sanitizeMention(input: unknown): CollaborationMention | null {
    if (!input || typeof input !== 'object') {
        return null
    }

    const data = input as Record<string, unknown>
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

    const data = input as Record<string, unknown>
    const emoji = typeof data.emoji === 'string' ? data.emoji : null

    if (!emoji || !COLLABORATION_REACTION_SET.has(emoji)) {
        return null
    }

    const userIdsRaw = Array.isArray(data.userIds) ? data.userIds : []
    const validUserIds = Array.from(
        new Set(
            userIdsRaw.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        )
    )

    const countFromUsers = validUserIds.length
    const count = typeof data.count === 'number' && Number.isFinite(data.count) ? Math.max(0, Math.round(data.count)) : countFromUsers

    if (countFromUsers === 0 && count <= 0) {
        return null
    }

    return {
        emoji,
        count: countFromUsers > 0 ? countFromUsers : count,
        userIds: validUserIds,
    }
}

export function convertToIso(value: unknown): string | null {
    if (!value && value !== 0) {
        return null
    }

    if (value instanceof Timestamp) {
        return value.toDate().toISOString()
    }

    if (
        typeof value === 'object' &&
        value !== null &&
        'toDate' in value &&
        typeof (value as { toDate?: () => Date }).toDate === 'function'
    ) {
        return (value as { toDate: () => Date }).toDate().toISOString()
    }

    if (typeof value === 'string') {
        const parsed = new Date(value)
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString()
        }
        return value
    }

    return null
}

export function parseChannelType(value: unknown): Channel['type'] {
    if (value === 'client' || value === 'team' || value === 'project') {
        return value
    }
    return 'team'
}

export function parseMessageFormat(value: unknown): CollaborationMessageFormat {
    if (value === 'markdown' || value === 'plaintext') {
        return value
    }
    return 'markdown'
}
