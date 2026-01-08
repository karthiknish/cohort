import { NextRequest } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { sanitizeReaction, type StoredMessage } from '@/lib/firestore/mappers'
import { COLLABORATION_REACTION_SET } from '@/constants/collaboration-reactions'
import { NotFoundError, ValidationError } from '@/lib/api-errors'

const toggleSchema = z.object({
  emoji: z
    .string()
    .trim()
    .min(1, 'Emoji is required')
    .max(4, 'Emoji must be a single character')
    .refine((value) => COLLABORATION_REACTION_SET.has(value), 'Unsupported reaction emoji'),
})

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: toggleSchema,
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, body, params }) => {
    if (!workspace) throw new Error('Workspace context missing')
    const uid = auth.uid as string
    const { messageId } = params as { messageId: string }
    if (!messageId) {
      throw new ValidationError('Message id is required')
    }

    const messageRef = workspace.collaborationCollection.doc(messageId)

    const result = await workspace.collaborationCollection.firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(messageRef)
      if (!snapshot.exists) {
        throw new NotFoundError('Message not found')
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

        if (sanitized.emoji !== body.emoji) {
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
          emoji: body.emoji,
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

    if (result instanceof Response) return result

    const sanitizedReactions = Array.isArray(result)
      ? result
          .map((item) => sanitizeReaction(item))
          .filter((entry): entry is NonNullable<ReturnType<typeof sanitizeReaction>> => Boolean(entry))
      : []

    return { reactions: sanitizedReactions }
  }
)
