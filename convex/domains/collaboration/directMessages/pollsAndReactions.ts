import { z } from 'zod/v4'
import { Errors } from '../../../errors'
import { zWorkspaceMutation } from '../../../functions'
import { applyPollVote, encodePollMessage, endPoll, parsePollMessage } from '../../../lib/collaborationPollMessage'
import { assertDirectMessageParticipant, canManageDirectMessage } from './shared'

export const voteOnPoll = zWorkspaceMutation({
  args: {
    messageLegacyId: z.string(),
    optionIds: z.array(z.string()),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query('directMessages')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.messageLegacyId),
      )
      .first()

    if (!message) {
      throw Errors.resource.notFound('Message')
    }

    if (message.deleted) {
      throw Errors.validation.invalidInput('Cannot vote on deleted message')
    }

    await assertDirectMessageParticipant(ctx, args.workspaceId, message.conversationLegacyId)

    const poll = parsePollMessage(message.content)
    if (!poll) {
      throw Errors.validation.invalidInput('Message is not a poll')
    }

    let nextPoll
    try {
      nextPoll = applyPollVote(poll, ctx.user._id, args.optionIds)
    } catch (error: unknown) {
      const pollError = error instanceof Error ? error.message : 'Unable to record vote'
      throw Errors.validation.invalidInput(pollError)
    }

    const now = Date.now()
    await ctx.db.patch(message._id, {
      content: encodePollMessage(nextPoll),
      edited: true,
      editedAtMs: now,
      updatedAtMs: now,
    })

    return { success: true, legacyId: message.legacyId }
  },
})

export const endPollMessage = zWorkspaceMutation({
  args: {
    messageLegacyId: z.string(),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query('directMessages')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.messageLegacyId),
      )
      .first()

    if (!message) {
      throw Errors.resource.notFound('Message')
    }

    await assertDirectMessageParticipant(ctx, args.workspaceId, message.conversationLegacyId)

    const poll = parsePollMessage(message.content)
    if (!poll) {
      throw Errors.validation.invalidInput('Message is not a poll')
    }

    const isCreator = poll.createdBy === ctx.user._id
    const isAdmin = ctx.user.role === 'admin'
    if (!isCreator && !isAdmin) {
      throw Errors.auth.forbidden('Only the poll creator can end this poll')
    }

    const now = Date.now()
    const nextPoll = endPoll(poll, now)
    await ctx.db.patch(message._id, {
      content: encodePollMessage(nextPoll),
      edited: true,
      editedAtMs: now,
      updatedAtMs: now,
    })

    return { success: true, legacyId: message.legacyId }
  },
})

export const toggleReaction = zWorkspaceMutation({
  args: {
    messageLegacyId: z.string(),
    emoji: z.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = ctx.user._id

    const message = await ctx.db
      .query('directMessages')
      .withIndex('by_workspace_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.messageLegacyId)
      )
      .first()

    if (!message) {
      throw Errors.resource.notFound('Message')
    }

    if (message.deleted) {
      throw Errors.validation.invalidInput('Cannot react to deleted message')
    }

    const reactions = Array.isArray(message.reactions)
      ? message.reactions
          .flatMap((reaction) =>
            Boolean(reaction) &&
            typeof reaction.emoji === 'string' &&
            typeof reaction.count === 'number' &&
            Array.isArray(reaction.userIds)
              ? [{ ...reaction, userIds: [...reaction.userIds] }]
              : [],
          )
      : []
    const existingIndex = reactions.findIndex((r) => r.emoji === args.emoji)
    const now = Date.now()

    if (existingIndex >= 0) {
      const reaction = reactions[existingIndex]
      if (!reaction) {
        return { success: true }
      }

      const userIds = Array.isArray(reaction.userIds) ? reaction.userIds : []
      
      if (userIds.includes(currentUserId)) {
        const newUserIds = userIds.filter((id: string) => id !== currentUserId)
        if (newUserIds.length === 0) {
          reactions.splice(existingIndex, 1)
        } else {
          reactions[existingIndex] = { ...reaction, count: newUserIds.length, userIds: newUserIds }
        }
      } else {
        reactions[existingIndex] = { ...reaction, count: reaction.count + 1, userIds: [...userIds, currentUserId] }
      }
    } else {
      reactions.push({ emoji: args.emoji, count: 1, userIds: [currentUserId] })
    }

    await ctx.db.patch(message._id, {
      reactions,
      updatedAtMs: now,
    })

    return { success: true }
  },
})
