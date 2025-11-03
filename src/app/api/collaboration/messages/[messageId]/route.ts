import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import {
  mapMessageDoc,
  mentionSchema,
  messageFormatSchema,
  type StoredMessage,
} from '@/app/api/collaboration/messages/route'

const updateSchema = z.object({
  content: z.string().trim().min(1, 'Message content cannot be empty').max(2000),
  format: messageFormatSchema.optional(),
  mentions: z.array(mentionSchema).max(20).optional(),
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
    if (
      trimmedContent === currentContent.trim() &&
      payload.format === undefined &&
      payload.mentions === undefined
    ) {
      const message = mapMessageDoc(snapshot.id, data as StoredMessage)
      return NextResponse.json({ ok: true, message })
    }

    const updatePayload: Record<string, unknown> = {
      content: trimmedContent,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (payload.format !== undefined) {
      updatePayload.format = payload.format
    }

    if (payload.mentions !== undefined) {
      updatePayload.mentions = payload.mentions
    }

    await messageRef.update(updatePayload)

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
