import { NextRequest } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { mapMessageDoc, type StoredMessage } from '@/lib/firestore/mappers'
import { mentionSchema, messageFormatSchema } from '@/lib/schemas/collaboration-messages'
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '@/lib/api-errors'

const updateSchema = z.object({
  content: z.string().trim().min(1, 'Message content cannot be empty').max(2000),
  format: messageFormatSchema.optional(),
  mentions: z.array(mentionSchema).max(20).optional(),
})

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: updateSchema,
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, body, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const { messageId } = params as { messageId: string }
    if (!messageId) {
      throw new ValidationError('Message id is required')
    }

    const messageRef = workspace.collaborationCollection.doc(messageId)
    const snapshot = await messageRef.get()
    if (!snapshot.exists) {
      throw new NotFoundError('Message not found')
    }

    const data = snapshot.data() as Record<string, unknown>
    const senderId = typeof data.senderId === 'string' ? data.senderId : null
    const deletedAt = data.deletedAt
    const deleted = data.deleted === true
    const deletedBy = data.deletedBy

    if (deleted || deletedAt || deletedBy) {
      throw new ConflictError('Cannot edit a deleted message')
    }

    const isAuthor = senderId === auth.uid
    const isAdmin = auth.claims?.role === 'admin'

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('Insufficient permissions to edit this message')
    }

    const trimmedContent = body.content.trim()
    const currentContent = typeof data.content === 'string' ? data.content : ''
    if (
      trimmedContent === currentContent.trim() &&
      body.format === undefined &&
      body.mentions === undefined
    ) {
      const message = mapMessageDoc(snapshot.id, data as StoredMessage)
      return { ok: true, message }
    }

    const updatePayload: Record<string, unknown> = {
      content: trimmedContent,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (body.format !== undefined) {
      updatePayload.format = body.format
    }

    if (body.mentions !== undefined) {
      updatePayload.mentions = body.mentions
    }

    await messageRef.update(updatePayload)

    const updatedSnapshot = await messageRef.get()
    const message = mapMessageDoc(updatedSnapshot.id, updatedSnapshot.data() as StoredMessage)

    return { ok: true, message }
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const { messageId } = params as { messageId: string }
    if (!messageId) {
      throw new ValidationError('Message id is required')
    }

    const messageRef = workspace.collaborationCollection.doc(messageId)
    const snapshot = await messageRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Message not found')
    }

    const data = snapshot.data() as Record<string, unknown>
    const senderId = typeof data.senderId === 'string' ? data.senderId : null
    const isAuthor = senderId === auth.uid
    const isAdmin = auth.claims?.role === 'admin'

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenError('Insufficient permissions to delete this message')
    }

    await messageRef.update({
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
    })
    const updatedSnapshot = await messageRef.get()
    const message = mapMessageDoc(updatedSnapshot.id, updatedSnapshot.data() as StoredMessage)

    return { ok: true, message }
  }
)
