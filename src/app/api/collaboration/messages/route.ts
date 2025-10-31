import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMessage,
} from '@/types/collaboration'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { notifyCollaborationMessageWhatsApp, recordCollaborationNotification } from '@/lib/notifications'

const channelTypeSchema = z.enum(['client', 'team', 'project'])

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
      .optional(),
    senderName: z.string().trim().min(1).max(120),
    senderRole: z.string().trim().max(120).optional(),
    content: z.string().trim().min(1).max(2000),
    attachments: z.array(attachmentSchema).max(5).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.channelType === 'client' && !value.clientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'clientId is required for client channels',
        path: ['clientId'],
      })
    }
  })

type StoredMessage = {
  channelType?: unknown
  clientId?: unknown
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
}

type StoredAttachment = {
  name?: unknown
  url?: unknown
  type?: unknown
  size?: unknown
}

function toISO(value: unknown): string | null {
  if (!value && value !== 0) return null
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    return (value as Timestamp).toDate().toISOString()
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

function mapMessageDoc(docId: string, data: StoredMessage): CollaborationMessage {
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

  const content = typeof data.content === 'string' ? data.content : ''
  const resolvedContent = isDeleted ? '' : content

  return {
    id: docId,
    channelType,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
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
  }
}

async function ensureClientOwnership(workspace: WorkspaceContext, clientId: string) {
  const clientDoc = await workspace.clientsCollection.doc(clientId).get()
  if (!clientDoc.exists) {
    throw new AuthenticationError('Client not found or access denied', 403)
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)

    const searchParams = request.nextUrl.searchParams
    const channelTypeParam = searchParams.get('channelType') ?? 'team'
    const parseChannel = channelTypeSchema.safeParse(channelTypeParam)
    const pageSizeParam = searchParams.get('pageSize')
    const cursorParam = searchParams.get('cursor')

    if (!parseChannel.success) {
      return NextResponse.json({ error: 'Invalid channel type' }, { status: 400 })
    }

    const channelType = parseChannel.data
    const clientId = searchParams.get('clientId') ?? undefined
    const pageSize = Math.min(Math.max(Number(pageSizeParam) || 100, 1), 200)

    if (channelType === 'client') {
      if (!clientId) {
        return NextResponse.json({ error: 'clientId is required for client channels' }, { status: 400 })
      }
      await ensureClientOwnership(workspace, clientId)
    }

    let query = workspace.collaborationCollection.where('channelType', '==', channelType)

    if (channelType === 'client' && clientId) {
      query = query.where('clientId', '==', clientId)
    }
    query = query.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    if (cursorParam) {
      const [cursorTime, cursorId] = cursorParam.split('|')
      if (cursorTime && cursorId) {
        const cursorDate = new Date(cursorTime)
        if (!Number.isNaN(cursorDate.getTime())) {
          query = query.startAfter(Timestamp.fromDate(cursorDate), cursorId)
        }
      }
    }

    const snapshot = await query.limit(pageSize + 1).get()

    const docs = snapshot.docs
    const messages = docs.slice(0, pageSize).map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))
    const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
    const nextCursor = nextCursorDoc
      ? (() => {
          const rawCreated = toISO(nextCursorDoc.get('createdAt'))
          return rawCreated ? `${rawCreated}|${nextCursorDoc.id}` : null
        })()
      : null

    return NextResponse.json({ messages, nextCursor })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[collaboration/messages] failed to load messages', error)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    const uid = auth.uid

    if (!uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspace = await resolveWorkspaceContext(auth)

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = createMessageSchema.parse(json)

    if (payload.channelType === 'client' && payload.clientId) {
      await ensureClientOwnership(workspace, payload.clientId)
    }

    const timestamp = Timestamp.now()

    const docRef = await workspace.collaborationCollection.add({
      channelType: payload.channelType,
      clientId: payload.channelType === 'client' ? payload.clientId ?? null : null,
      senderId: uid,
      senderName: payload.senderName,
      senderRole: payload.senderRole ?? null,
      content: payload.content,
      attachments: payload.attachments ?? [],
      workspaceId: workspace.workspaceId,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const createdDoc = await docRef.get()
    const message = mapMessageDoc(createdDoc.id, createdDoc.data() as StoredMessage)

    const actorName = typeof auth.claims?.name === 'string'
      ? (auth.claims.name as string)
      : auth.email

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

    return NextResponse.json({ message }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().formErrors.join('\n') || 'Invalid payload' }, { status: 400 })
    }

    console.error('[collaboration/messages] failed to create message', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
