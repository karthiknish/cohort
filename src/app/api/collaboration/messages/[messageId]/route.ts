import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import type {
  CollaborationAttachment,
  CollaborationChannelType,
  CollaborationMessage,
} from '@/types/collaboration'

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

const updateSchema = z.object({
  content: z.string().trim().min(1, 'Message content cannot be empty').max(2000),
})

type RouteContext = { params: Promise<{ messageId: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const { messageId } = await context.params
    if (!messageId) {
      return NextResponse.json({ error: 'Message id is required' }, { status: 400 })
    }

    const payload = updateSchema.parse(await request.json().catch(() => ({})))
    const workspace = await resolveWorkspaceContext(auth)

    const messageRef = workspace.collaborationCollection.doc(messageId)
    const snapshot = await messageRef.get()
    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const data = snapshot.data() as Record<string, unknown>
    const senderId = typeof data.senderId === 'string' ? data.senderId : null
    const deletedAt = data.deletedAt
    const deleted = data.deleted === true
    const deletedBy = data.deletedBy

    if (deleted || deletedAt || deletedBy) {
      return NextResponse.json({ error: 'Cannot edit a deleted message' }, { status: 409 })
    }

    const isAuthor = senderId === auth.uid
    const isAdmin = auth.claims?.role === 'admin'

    if (!isAuthor && !isAdmin) {
      throw new AuthenticationError('Insufficient permissions to edit this message', 403)
    }

    const trimmedContent = payload.content.trim()
    const currentContent = typeof data.content === 'string' ? data.content : ''
    if (trimmedContent === currentContent.trim()) {
      return NextResponse.json({ ok: true, message: { id: messageId, content: currentContent } })
    }

    await messageRef.update({
      content: trimmedContent,
      updatedAt: FieldValue.serverTimestamp(),
    })

    const updatedSnapshot = await messageRef.get()
    const message = mapMessageDoc(updatedSnapshot.id, updatedSnapshot.data() as StoredMessage)

    return NextResponse.json({ ok: true, message })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().formErrors.join('\n') || 'Invalid payload' }, { status: 400 })
    }

    console.error('[collaboration/messages] patch failed', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const { messageId } = await context.params
    if (!messageId) {
      return NextResponse.json({ error: 'Message id is required' }, { status: 400 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const messageRef = workspace.collaborationCollection.doc(messageId)
    const snapshot = await messageRef.get()

    if (!snapshot.exists) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const data = snapshot.data() as Record<string, unknown>
    const senderId = typeof data.senderId === 'string' ? data.senderId : null
    const isAuthor = senderId === auth.uid
    const isAdmin = auth.claims?.role === 'admin'

    if (!isAuthor && !isAdmin) {
      throw new AuthenticationError('Insufficient permissions to delete this message', 403)
    }

    await messageRef.update({
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
    })
    const updatedSnapshot = await messageRef.get()
    const message = mapMessageDoc(updatedSnapshot.id, updatedSnapshot.data() as StoredMessage)

    return NextResponse.json({ ok: true, message })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[collaboration/messages] delete failed', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
