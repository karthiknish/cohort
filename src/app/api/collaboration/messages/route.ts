import { NextResponse } from 'next/server'
import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { AuthenticationError } from '@/lib/server-auth'
import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMention,
  CollaborationMessage,
  CollaborationMessageFormat,
  CollaborationReaction,
} from '@/types/collaboration'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'
import { type WorkspaceContext } from '@/lib/workspace'
import { notifyCollaborationMessageWhatsApp, recordCollaborationNotification } from '@/lib/notifications'
import { apiSuccess, createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'

export const channelTypeSchema = z.enum(['client', 'team', 'project'])
export const messageFormatSchema = z.enum(['markdown', 'plaintext'])

const messageQuerySchema = z.object({
  pageSize: z.string().optional(),
  after: z.string().optional(),
  cursor: z.string().optional(),
  threadRootId: z.string().optional(),
  channelType: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
})

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z.string().trim().url(),
  type: z.string().trim().max(60).optional(),
  size: z.string().trim().max(40).optional(),
})

export const mentionSchema = z.object({
  slug: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(160),
  role: z
    .string()
    .trim()
    .max(120)
    .nullable()
    .optional(),
})

const createMessageSchema = z
  .object({
    channelType: channelTypeSchema,
    clientId: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional(),
    projectId: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional(),
    // senderName and senderRole are now derived from auth context - ignored if sent
    senderName: z.string().trim().max(120).optional(),
    senderRole: z.string().trim().max(120).optional(),
    content: z.string().trim().min(1).max(2000),
    attachments: z.array(attachmentSchema).max(5).optional(),
    format: messageFormatSchema.optional(),
    mentions: z.array(mentionSchema).max(20).optional(),
    parentMessageId: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.parentMessageId) {
      return
    }

    if (value.channelType === 'client' && !value.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'clientId is required for client channels',
        path: ['clientId'],
      })
    }

    if (value.channelType === 'project') {
      if (!value.projectId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'projectId is required for project channels',
          path: ['projectId'],
        })
      }
    } else if (value.projectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'projectId is only allowed for project channels',
        path: ['projectId'],
      })
    }
  })

export type StoredMessage = {
  channelType?: unknown
  clientId?: unknown
  projectId?: unknown
  senderId?: unknown
  senderName?: unknown
  senderRole?: unknown
  content?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  deletedAt?: unknown
  deletedBy?: unknown
  deleted?: unknown
  attachments?: unknown
  format?: unknown
  mentions?: unknown
  reactions?: unknown
  parentMessageId?: unknown
  threadRootId?: unknown
  isThreadRoot?: unknown
  threadReplyCount?: unknown
  threadLastReplyAt?: unknown
}

type StoredAttachment = {
  name?: unknown
  url?: unknown
  type?: unknown
  size?: unknown
}

type StoredMention = {
  slug?: unknown
  name?: unknown
  role?: unknown
}

type StoredReaction = {
  emoji?: unknown
  count?: unknown
  userIds?: unknown
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

function parseMessageFormat(value: unknown): CollaborationMessageFormat {
  if (value === 'plaintext' || value === 'markdown') {
    return value
  }
  return 'markdown'
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
    ? data.attachments
        .map((item) => sanitizeAttachment(item))
        .filter((item): item is CollaborationAttachment => Boolean(item))
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
      ? data.mentions
          .map((entry) => sanitizeMention(entry))
          .filter((entry): entry is CollaborationMention => Boolean(entry))
      : undefined,
    reactions: Array.isArray(data.reactions)
      ? data.reactions
          .map((entry) => sanitizeReaction(entry))
          .filter((entry): entry is CollaborationReaction => Boolean(entry))
      : undefined,
    parentMessageId,
    threadRootId,
    threadReplyCount,
    threadLastReplyAt,
  }
}

async function ensureClientOwnership(workspace: WorkspaceContext, clientId: string) {
  const clientDoc = await workspace.clientsCollection.doc(clientId).get()
  if (!clientDoc.exists) {
    throw new AuthenticationError('Client not found or access denied', 403)
  }
}

async function ensureProjectOwnership(workspace: WorkspaceContext, projectId: string) {
  const projectDoc = await workspace.projectsCollection.doc(projectId).get()
  if (!projectDoc.exists) {
    throw new AuthenticationError('Project not found or access denied', 403)
  }
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: messageQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const {
      pageSize: pageSizeParam,
      after: afterParam,
      cursor: cursorParam,
      threadRootId: threadRootIdRaw,
      channelType: channelTypeParam = 'team',
      clientId: clientIdParam,
      projectId: projectIdParam,
    } = query

    const threadRootId = threadRootIdRaw?.trim()
    const pageSize = Math.min(Math.max(Number(pageSizeParam) || 100, 1), 200)
    const afterCursor = afterParam ?? cursorParam ?? null

    if (threadRootIdRaw !== undefined) {
      if (!threadRootId) {
        throw new ValidationError('threadRootId must be provided')
      }

      let threadQuery = workspace.collaborationCollection
        .where('threadRootId', '==', threadRootId)
        .where('isThreadRoot', '==', false)
        .orderBy('createdAt', 'asc')
        .orderBy(FieldPath.documentId(), 'asc')

      if (afterCursor) {
        const [cursorTime, cursorId] = afterCursor.split('|')
        if (cursorTime && cursorId) {
          const cursorDate = new Date(cursorTime)
          if (!Number.isNaN(cursorDate.getTime())) {
            threadQuery = threadQuery.startAfter(Timestamp.fromDate(cursorDate), cursorId)
          }
        }
      }

      const threadSnapshot = await threadQuery.limit(pageSize + 1).get()
      const docs = threadSnapshot.docs
      const messages = docs.slice(0, pageSize).map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))
      const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
      const nextCursor = nextCursorDoc
        ? (() => {
            const rawCreated = toISO(nextCursorDoc.get('createdAt'))
            return rawCreated ? `${rawCreated}|${nextCursorDoc.id}` : null
          })()
        : null

      return { messages, nextCursor }
    }

    const parseChannel = channelTypeSchema.safeParse(channelTypeParam)

    if (!parseChannel.success) {
      throw new ValidationError('Invalid channel type')
    }

    const channelType = parseChannel.data
    const clientId = clientIdParam
    const projectId = projectIdParam

    if (channelType === 'client') {
      if (!clientId) {
        throw new ValidationError('clientId is required for client channels')
      }
      await ensureClientOwnership(workspace, clientId)
    } else if (channelType === 'project') {
      if (!projectId) {
        throw new ValidationError('projectId is required for project channels')
      }
      await ensureProjectOwnership(workspace, projectId)
    } else if (projectId) {
      throw new ValidationError('projectId is only valid for project channels')
    }

    let messagesQuery = workspace.collaborationCollection.where('channelType', '==', channelType)

    if (channelType === 'client' && clientId) {
      messagesQuery = messagesQuery.where('clientId', '==', clientId)
    }

    if (channelType === 'project' && projectId) {
      messagesQuery = messagesQuery.where('projectId', '==', projectId)
    }
    messagesQuery = messagesQuery.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    if (afterCursor) {
      const [cursorTime, cursorId] = afterCursor.split('|')
      if (cursorTime && cursorId) {
        const cursorDate = new Date(cursorTime)
        if (!Number.isNaN(cursorDate.getTime())) {
          messagesQuery = messagesQuery.startAfter(Timestamp.fromDate(cursorDate), cursorId)
        }
      }
    }

    const snapshot = await messagesQuery.limit(pageSize + 1).get()

    const docs = snapshot.docs
    const messages = docs.slice(0, pageSize).map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))
    const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
    const nextCursor = nextCursorDoc
      ? (() => {
          const rawCreated = toISO(nextCursorDoc.get('createdAt'))
          return rawCreated ? `${rawCreated}|${nextCursorDoc.id}` : null
        })()
      : null

    return { messages, nextCursor }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createMessageSchema,
    rateLimit: { maxRequests: 10, windowMs: 10_000 },
  },
  async (req, { auth, workspace, body: payload }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const uid = auth.uid!

    // Derive senderName and senderRole from auth context to prevent impersonation
    const senderName =
      typeof auth.claims?.name === 'string' && auth.claims.name.trim()
        ? auth.claims.name.trim()
        : auth.email || 'Unknown User'
    const senderRole = typeof auth.claims?.role === 'string' ? auth.claims.role : null

    let resolvedClientId: string | null = null
    let resolvedProjectId: string | null = null

    if (payload.channelType === 'client') {
      if (payload.clientId) {
        await ensureClientOwnership(workspace, payload.clientId)
        resolvedClientId = payload.clientId
      }
    } else if (payload.channelType === 'project' && payload.projectId) {
      await ensureProjectOwnership(workspace, payload.projectId)
      const projectDoc = await workspace.projectsCollection.doc(payload.projectId).get()
      const projectData = projectDoc.data() as Record<string, unknown> | undefined
      resolvedProjectId = projectDoc.id
      if (projectData && typeof projectData.clientId === 'string') {
        resolvedClientId = projectData.clientId
      }
    }

    const timestamp = Timestamp.now()

    const parentMessageId = payload.parentMessageId ?? null
    let threadRootId: string | null = null
    let isThreadRoot = true

    if (parentMessageId) {
      const parentDoc = await workspace.collaborationCollection.doc(parentMessageId).get()
      if (!parentDoc.exists) {
        throw new NotFoundError('Parent message not found')
      }
      const parentData = parentDoc.data() as StoredMessage

      // If the parent is already a reply (has a threadRootId), use that root.
      // Otherwise, the parent itself is the root.
      if (typeof parentData.threadRootId === 'string' && parentData.threadRootId) {
        threadRootId = parentData.threadRootId
      } else {
        threadRootId = parentMessageId
      }
      isThreadRoot = false
    }

    const docRef = await workspace.collaborationCollection.add({
      channelType: payload.channelType,
      clientId: resolvedClientId,
      projectId: resolvedProjectId,
      senderId: uid,
      senderName,
      senderRole,
      content: payload.content,
      attachments: payload.attachments ?? [],
      format: payload.format ?? 'markdown',
      mentions: payload.mentions ?? [],
      reactions: [],
      workspaceId: workspace.workspaceId,
      createdAt: timestamp,
      updatedAt: timestamp,
      parentMessageId,
      threadRootId,
      isThreadRoot,
      threadReplyCount: 0,
      threadLastReplyAt: null,
    })

    if (!isThreadRoot && threadRootId) {
      try {
        await workspace.collaborationCollection.doc(threadRootId).update({
          threadReplyCount: FieldValue.increment(1),
          threadLastReplyAt: timestamp,
        })
      } catch (updateError) {
        console.error('[collaboration/messages] failed to update thread root stats', updateError)
      }
    }

    const createdDoc = await docRef.get()
    const message = mapMessageDoc(createdDoc.id, createdDoc.data() as StoredMessage)

    const actorName = typeof auth.claims?.name === 'string' ? (auth.claims.name as string) : auth.email

    try {
      await notifyCollaborationMessageWhatsApp({ workspaceId: workspace.workspaceId, message, actorName })
    } catch (notificationError) {
      console.error('[collaboration/messages] whatsapp notification failed', notificationError)
    }

    try {
      await recordCollaborationNotification({
        workspaceId: workspace.workspaceId,
        message,
        actorId: uid,
        actorName,
      })
    } catch (notificationError) {
      console.error('[collaboration/messages] workspace notification failed', notificationError)
    }

    return NextResponse.json(apiSuccess({ message }), { status: 201 })
  }
)
