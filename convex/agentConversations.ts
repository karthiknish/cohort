import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

export const upsert = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    userId: v.string(),
    title: v.optional(v.union(v.string(), v.null())),
    startedAt: v.optional(v.union(v.number(), v.null())),
    lastMessageAt: v.optional(v.union(v.number(), v.null())),
    messageCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const now = Date.now()
    const existing = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        userId: args.userId,
        title: args.title ?? existing.title,
        startedAt: args.startedAt ?? existing.startedAt,
        lastMessageAt: args.lastMessageAt ?? existing.lastMessageAt,
        messageCount: typeof args.messageCount === 'number' ? args.messageCount : existing.messageCount,
        updatedAt: now,
      })
      return { ok: true }
    }

    await ctx.db.insert('agentConversations', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      userId: args.userId,
      title: args.title ?? null,
      startedAt: args.startedAt ?? null,
      lastMessageAt: args.lastMessageAt ?? null,
      messageCount: typeof args.messageCount === 'number' ? args.messageCount : 0,
      createdAt: now,
      updatedAt: now,
    })

    return { ok: true }
  },
})

export const list = query({
  args: {
    workspaceId: v.string(),
    userId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit, 1), 50)

    const rows = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_userId_lastMessageAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
      )
      .order('desc')
      .take(limit)

    return {
      conversations: rows.map((row) => ({
        legacyId: row.legacyId,
        title: row.title,
        startedAt: row.startedAt,
        lastMessageAt: row.lastMessageAt,
        messageCount: row.messageCount,
      })),
    }
  },
})

export const get = query({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    return { conversation: row ?? null }
  },
})

export const remove = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!existing) {
      return { ok: true, deletedConversation: false }
    }

    // Delete messages first.
    const messages = await ctx.db
      .query('agentMessages')
      .withIndex('by_workspace_conversation_createdAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', args.legacyId)
      )
      .collect()

    for (const msg of messages) {
      await ctx.db.delete(msg._id)
    }

    await ctx.db.delete(existing._id)
    return { ok: true, deletedConversation: true, deletedMessages: messages.length }
  },
})
