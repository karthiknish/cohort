import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMessage,
} from '@/types/collaboration'

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

const MAX_MESSAGES = 200

type StoredMessage = {
  channelType?: unknown
  clientId?: unknown
  senderId?: unknown
  senderName?: unknown
  senderRole?: unknown
  content?: unknown
  createdAt?: unknown
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

  return {
    id: docId,
    channelType,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    senderId: typeof data.senderId === 'string' ? data.senderId : null,
    senderName: typeof data.senderName === 'string' ? data.senderName : 'Unknown teammate',
    senderRole: typeof data.senderRole === 'string' ? data.senderRole : null,
    content: typeof data.content === 'string' ? data.content : '',
    createdAt: toISO(data.createdAt),
    attachments,
  }
}

async function ensureClientOwnership(uid: string, clientId: string) {
  const clientDoc = await adminDb.collection('users').doc(uid).collection('clients').doc(clientId).get()
  if (!clientDoc.exists) {
    throw new AuthenticationError('Client not found or access denied', 403)
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    const uid = auth.uid

    if (!uid) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const channelTypeParam = searchParams.get('channelType') ?? 'team'
    const parseChannel = channelTypeSchema.safeParse(channelTypeParam)

    if (!parseChannel.success) {
      return NextResponse.json({ error: 'Invalid channel type' }, { status: 400 })
    }

    const channelType = parseChannel.data
    const clientId = searchParams.get('clientId') ?? undefined

    if (channelType === 'client') {
      if (!clientId) {
        return NextResponse.json({ error: 'clientId is required for client channels' }, { status: 400 })
      }
      await ensureClientOwnership(uid, clientId)
    }

    let query = adminDb
      .collection('users')
      .doc(uid)
      .collection('collaborationMessages')
      .where('channelType', '==', channelType)

    if (channelType === 'client' && clientId) {
      query = query.where('clientId', '==', clientId)
    }

    const snapshot = await query.orderBy('createdAt', 'asc').limit(MAX_MESSAGES).get()

    const messages = snapshot.docs.map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))

    return NextResponse.json({ messages })
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

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = createMessageSchema.parse(json)

    if (payload.channelType === 'client' && payload.clientId) {
      await ensureClientOwnership(uid, payload.clientId)
    }

    const timestamp = Timestamp.now()

    const docRef = await adminDb
      .collection('users')
      .doc(uid)
      .collection('collaborationMessages')
      .add({
        channelType: payload.channelType,
        clientId: payload.channelType === 'client' ? payload.clientId ?? null : null,
        senderId: uid,
        senderName: payload.senderName,
        senderRole: payload.senderRole ?? null,
        content: payload.content,
        attachments: payload.attachments ?? [],
        createdAt: timestamp,
        updatedAt: timestamp,
      })

    const createdDoc = await docRef.get()
    const message = mapMessageDoc(createdDoc.id, createdDoc.data() as StoredMessage)

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
