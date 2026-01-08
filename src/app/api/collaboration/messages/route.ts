import { NextResponse } from 'next/server'
import { FieldPath, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { AuthenticationError } from '@/lib/server-auth'
import type { StoredMessage } from '@/lib/firestore/mappers'
import { type WorkspaceContext } from '@/lib/workspace'
import { notifyCollaborationMessageWhatsApp, recordCollaborationNotification } from '@/lib/notifications'
import { apiSuccess, createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'
import { mapMessageDoc } from '@/lib/firestore/mappers'
import { decodeTimestampIdCursor, encodeTimestampIdCursor, parsePageSize } from '@/lib/pagination'
import { channelTypeSchema, mentionSchema, messageFormatSchema } from '@/lib/schemas/collaboration-messages'

// Re-export StoredMessage for backward compatibility
export type { StoredMessage } from '@/lib/firestore/mappers'

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

const createMessageSchema = z
  .object({
    channelType: channelTypeSchema,
    clientId: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .nullable()
      .optional(),
    projectId: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .nullable()
      .optional(),
    // senderName and senderRole are now derived from auth context - ignored if sent
    senderName: z.string().trim().max(120).nullable().optional(),
    senderRole: z.string().trim().max(120).nullable().optional(),
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

    const hasClientId = typeof value.clientId === 'string' && value.clientId.length > 0
    const hasProjectId = typeof value.projectId === 'string' && value.projectId.length > 0

    if (value.channelType === 'client' && !hasClientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'clientId is required for client channels',
        path: ['clientId'],
      })
    }

    if (value.channelType === 'project') {
      if (!hasProjectId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'projectId is required for project channels',
          path: ['projectId'],
        })
      }
    } else if (hasProjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'projectId is only allowed for project channels',
        path: ['projectId'],
      })
    }
  })


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
    const pageSize = parsePageSize(pageSizeParam, { defaultValue: 100, max: 200 })
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

      const decodedCursor = decodeTimestampIdCursor(afterCursor)
      if (decodedCursor) {
        threadQuery = threadQuery.startAfter(decodedCursor.time, decodedCursor.id)
      }

      const threadSnapshot = await threadQuery.limit(pageSize + 1).get()
      const docs = threadSnapshot.docs
      const messages = docs.slice(0, pageSize).map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))
      const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
      const nextCursor = nextCursorDoc
        ? (() => {
            const rawCreated = toISO(nextCursorDoc.get('createdAt'))
            return rawCreated ? encodeTimestampIdCursor(rawCreated, nextCursorDoc.id) : null
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

    const decodedCursor = decodeTimestampIdCursor(afterCursor)
    if (decodedCursor) {
      messagesQuery = messagesQuery.startAfter(decodedCursor.time, decodedCursor.id)
    }

    const snapshot = await messagesQuery.limit(pageSize + 1).get()

    const docs = snapshot.docs
    const messages = docs.slice(0, pageSize).map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))
    const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
    const nextCursor = nextCursorDoc
      ? (() => {
          const rawCreated = toISO(nextCursorDoc.get('createdAt'))
          return rawCreated ? encodeTimestampIdCursor(rawCreated, nextCursorDoc.id) : null
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
    skipIdempotency: true,
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

    console.log('[collaboration.POST] Message created successfully:', docRef.id)

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

    // Send Brevo email notifications for @mentions
    if (message.mentions && message.mentions.length > 0) {
      try {
        const { notifyMentionEmail } = await import('@/lib/notifications')
        const snippet = message.content.length > 150 ? `${message.content.slice(0, 147)}…` : message.content

        for (const mention of message.mentions) {
          // Try to find user email from the mention slug (which could be a userId)
          const { adminDb } = await import('@/lib/firebase-admin')
          const userDoc = await adminDb.collection('users').doc(mention.slug).get()
          const userData = userDoc.data()
          const userEmail = typeof userData?.email === 'string' ? userData.email : null

          if (userEmail) {
            await notifyMentionEmail({
              recipientEmail: userEmail,
              recipientName: mention.name,
              mentionedBy: actorName ?? 'Someone',
              messageSnippet: snippet,
              channelType: message.channelType,
              clientName: resolvedClientId ? payload.clientId ?? null : null,
            })
          }
        }
      } catch (emailError) {
        console.error('[collaboration/messages] Brevo mention email failed', emailError)
      }
    }

    return NextResponse.json(apiSuccess({ message }), { status: 201 })
  }
)
