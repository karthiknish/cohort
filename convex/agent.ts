import { v } from 'convex/values'
import { Errors } from './errors'
import { authenticatedMutation } from './functions'

export const updateConversationTitle = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
    title: v.string(),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.conversationId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Conversation', args.conversationId)
    }

    if (existing.userId !== ctx.legacyId) {
      throw Errors.auth.forbidden()
    }

    await ctx.db.patch(existing._id, {
      title: args.title.trim().slice(0, 60),
      updatedAt: ctx.now,
    })

    return { ok: true } as const
  },
})

export const deleteConversation = authenticatedMutation({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
  },
  returns: v.object({
    ok: v.literal(true),
    deletedMessages: v.number(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.conversationId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Conversation', args.conversationId)
    }

    if (existing.userId !== ctx.legacyId) {
      throw Errors.auth.forbidden()
    }

    // Delete messages first.
    const messages = await ctx.db
      .query('agentMessages')
      .withIndex('by_workspace_conversation_createdAt', (q) => q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', args.conversationId))
      .collect()

    for (const msg of messages) {
      await ctx.db.delete(msg._id)
    }

    await ctx.db.delete(existing._id)
    return { ok: true as const, deletedMessages: messages.length }
  },
})
