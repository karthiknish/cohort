import { z } from 'zod'
import { FieldValue } from 'firebase-admin/firestore'

import { createApiHandler } from '@/lib/api-handler'
import { ForbiddenError, NotFoundError } from '@/lib/api-errors'

const querySchema = z.object({
  limit: z.string().optional(),
})

const updateTitleSchema = z.object({
  title: z.string().trim().min(1).max(60),
})

function toSafeLimit(raw: string | undefined): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 200
  return Math.min(Math.max(Math.floor(parsed), 1), 500)
}

export const GET = createApiHandler(
  {
    querySchema,
    rateLimit: 'standard',
    workspace: 'required',
  },
  async (req, { auth, workspace, params, query }) => {
    if (!workspace) throw new Error('Workspace context is required')
    if (!auth.uid) throw new Error('Authentication required')

    const { conversationId } = params as { conversationId: string }
    if (!conversationId) throw new NotFoundError('Conversation not found', 'conversation', conversationId)

    const convRef = workspace.agentConversationsCollection.doc(conversationId)
    const convSnap = await convRef.get()

    if (!convSnap.exists) {
      throw new NotFoundError('Conversation not found', 'conversation', conversationId)
    }

    const convData = (convSnap.data() ?? {}) as Record<string, unknown>
    if (convData.userId !== auth.uid) {
      throw new ForbiddenError('You do not have access to this conversation')
    }

    const limit = toSafeLimit(query.limit)

    const messagesSnap = await convRef
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(limit)
      .get()

    const messages = messagesSnap.docs.map((doc) => {
      const data = (doc.data() ?? {}) as Record<string, unknown>
      const createdAt = (data.createdAt as any)?.toDate?.() ?? null
      return {
        id: doc.id,
        type: data.type === 'user' ? 'user' : 'agent',
        content: typeof data.content === 'string' ? data.content : '',
        timestamp: createdAt ? createdAt.toISOString() : null,
        route: typeof data.route === 'string' ? data.route : null,
      }
    })

    return {
      conversation: {
        id: convSnap.id,
        startedAt: (convData.startedAt as any)?.toDate?.()?.toISOString?.() ?? null,
        lastMessageAt: (convData.lastMessageAt as any)?.toDate?.()?.toISOString?.() ?? null,
        messageCount: typeof convData.messageCount === 'number' ? convData.messageCount : null,
      },
      messages,
    }
  }
)

export const PATCH = createApiHandler(
  {
    bodySchema: updateTitleSchema,
    rateLimit: 'standard',
    workspace: 'required',
  },
  async (req, { auth, workspace, params, body }) => {
    if (!workspace) throw new Error('Workspace context is required')
    if (!auth.uid) throw new Error('Authentication required')

    const { conversationId } = params as { conversationId: string }
    if (!conversationId) throw new NotFoundError('Conversation not found', 'conversation', conversationId)

    const convRef = workspace.agentConversationsCollection.doc(conversationId)
    const convSnap = await convRef.get()

    if (!convSnap.exists) {
      throw new NotFoundError('Conversation not found', 'conversation', conversationId)
    }

    const convData = (convSnap.data() ?? {}) as Record<string, unknown>
    if (convData.userId !== auth.uid) {
      throw new ForbiddenError('You do not have access to this conversation')
    }

    await convRef.set(
      {
        title: body.title,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return { ok: true }
  }
)

export const DELETE = createApiHandler(
  {
    rateLimit: 'standard',
    workspace: 'required',
  },
  async (req, { auth, workspace, params }) => {
    if (!workspace) throw new Error('Workspace context is required')
    if (!auth.uid) throw new Error('Authentication required')

    const { conversationId } = params as { conversationId: string }
    if (!conversationId) throw new NotFoundError('Conversation not found', 'conversation', conversationId)

    const convRef = workspace.agentConversationsCollection.doc(conversationId)
    const convSnap = await convRef.get()

    if (!convSnap.exists) {
      throw new NotFoundError('Conversation not found', 'conversation', conversationId)
    }

    const convData = (convSnap.data() ?? {}) as Record<string, unknown>
    if (convData.userId !== auth.uid) {
      throw new ForbiddenError('You do not have access to this conversation')
    }

    // Delete messages in batches (Firestore doesn't auto-delete subcollections)
    const messagesRef = convRef.collection('messages')
    while (true) {
      const batchSnap = await messagesRef.orderBy('__name__').limit(300).get()
      if (batchSnap.empty) break

      const batch = convRef.firestore.batch()
      for (const doc of batchSnap.docs) {
        batch.delete(doc.ref)
      }
      await batch.commit()
    }

    await convRef.delete()

    return { ok: true }
  }
)
