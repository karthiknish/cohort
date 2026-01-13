import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const updateConversationTitle = mutation({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.conversationId))
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Conversation')
    }

    if (existing.userId !== identity.subject) {
      throw Errors.auth.forbidden()
    }

    const now = Date.now()

    await ctx.db.patch(existing._id, {
      title: args.title.trim().slice(0, 60),
      updatedAt: now,
    })

    return { ok: true }
  },
})

export const deleteConversation = mutation({
  args: {
    workspaceId: v.string(),
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) => q.eq('workspaceId', args.workspaceId).eq('legacyId', args.conversationId))
      .unique()

    if (!existing) {
      return { ok: true }
    }

    if (existing.userId !== identity.subject) {
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
    return { ok: true, deletedMessages: messages.length }
  },
})
