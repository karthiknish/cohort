import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import {
  sanitizeReaction,
  type StoredMessage,
} from '@/app/api/collaboration/messages/route'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'

const toggleSchema = z.object({
  emoji: z
    .string()
    .trim()
    .min(1, 'Emoji is required')
    .max(4, 'Emoji must be a single character')
    .refine((value) => COLLABORATION_REACTION_SET.has(value), 'Unsupported reaction emoji'),
})

class HttpError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

type RouteContext = { params: Promise<{ messageId: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const uid = auth.uid as string

    const { messageId } = await context.params
    if (!messageId) {
      return NextResponse.json({ error: 'Message id is required' }, { status: 400 })
    }

    const payload = toggleSchema.parse(await request.json().catch(() => ({})))
    const workspace = await resolveWorkspaceContext(auth)

    const messageRef = workspace.collaborationCollection.doc(messageId)

    const result = await workspace.collaborationCollection.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(messageRef)
      if (!snapshot.exists) {
        throw new HttpError('Message not found', 404)
      }

      const data = snapshot.data() as StoredMessage
      const reactions = Array.isArray(data.reactions) ? data.reactions.slice() : []

      const updated: Array<{ emoji: string; count: number; userIds: string[] }> = []
      let reactionFound = false

      reactions.forEach((entry) => {
        const sanitized = sanitizeReaction(entry)
        if (!sanitized) {
          return
        }

        if (sanitized.emoji !== payload.emoji) {
          updated.push({
            emoji: sanitized.emoji,
            count: sanitized.count,
            userIds: sanitized.userIds,
          })
          return
        }

        reactionFound = true
        const existingUsers = Array.from(new Set(sanitized.userIds))
        const hasReacted = existingUsers.includes(uid)
        const nextUsers = hasReacted ? existingUsers.filter((id) => id !== uid) : [...existingUsers, uid]

        if (nextUsers.length === 0) {
          return
        }

        updated.push({
          emoji: sanitized.emoji,
          count: nextUsers.length,
          userIds: nextUsers,
        })
      })

      if (!reactionFound) {
        updated.push({
          emoji: payload.emoji,
          count: 1,
          userIds: [uid],
        })
      }

      transaction.update(messageRef, {
        reactions: updated,
        updatedAt: FieldValue.serverTimestamp(),
      })

      return updated
    })

    const sanitizedReactions = Array.isArray(result)
      ? result
          .map((item) => sanitizeReaction(item))
          .filter((entry): entry is NonNullable<ReturnType<typeof sanitizeReaction>> => Boolean(entry))
      : []

    return NextResponse.json({ reactions: sanitizedReactions })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten().formErrors.join('\n') || 'Invalid payload' }, { status: 400 })
    }

    console.error('[collaboration/messages] reaction toggle failed', error)
    return NextResponse.json({ error: 'Failed to toggle reaction' }, { status: 500 })
  }
}
