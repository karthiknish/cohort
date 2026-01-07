import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError } from '@/lib/api-errors'

const querySchema = z.object({
  limit: z.string().optional(),
})

function toSafeLimit(raw: string | undefined): number {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 20
  return Math.min(Math.max(Math.floor(parsed), 1), 50)
}

export const GET = createApiHandler(
  {
    querySchema,
    rateLimit: 'standard',
    workspace: 'required',
  },
  async (req, { auth, workspace, query }) => {
    if (!workspace) throw new Error('Workspace context is required')
    if (!auth.uid) throw new Error('Authentication required')

    const limit = toSafeLimit(query.limit)

    try {
      const snapshot = await workspace.agentConversationsCollection
        .where('userId', '==', auth.uid)
        .orderBy('lastMessageAt', 'desc')
        .limit(limit)
        .get()

      const conversations = snapshot.docs.map((doc) => {
        const data = (doc.data() ?? {}) as Record<string, unknown>
        const startedAt = (data.startedAt as any)?.toDate?.() ?? null
        const lastMessageAt = (data.lastMessageAt as any)?.toDate?.() ?? null
        return {
          id: doc.id,
          title: typeof data.title === 'string' ? data.title : null,
          startedAt: startedAt ? startedAt.toISOString() : null,
          lastMessageAt: lastMessageAt ? lastMessageAt.toISOString() : null,
          messageCount: typeof data.messageCount === 'number' ? data.messageCount : null,
        }
      })

      return { conversations }
    } catch (error: any) {
      // Firestore throws FAILED_PRECONDITION when a composite index is required.
      const message = typeof error?.message === 'string' ? error.message : ''
      if (message.toLowerCase().includes('index')) {
        throw new ServiceUnavailableError('Agent chat history index is still being created. Please try again shortly.')
      }

      throw error
    }
  }
)

// NOTE: Details for a single conversation are handled in /api/agent/conversations/[conversationId]
