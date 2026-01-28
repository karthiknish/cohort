import { v } from 'convex/values'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation } from './functions'

const conversationValidator = v.object({
  legacyId: v.string(),
  title: v.union(v.string(), v.null()),
  startedAt: v.union(v.number(), v.null()),
  lastMessageAt: v.union(v.number(), v.null()),
  messageCount: v.number(),
})

export const upsert = workspaceMutation({
  args: {
    legacyId: v.string(),
    userId: v.string(),
    title: v.optional(v.union(v.string(), v.null())),
    startedAt: v.optional(v.union(v.number(), v.null())),
    lastMessageAt: v.optional(v.union(v.number(), v.null())),
    messageCount: v.optional(v.number()),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const now = ctx.now
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
      return { ok: true } as const
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

    return { ok: true } as const
  },
})

export const list = workspaceQuery({
  args: {
    userId: v.string(),
    limit: v.number(),
  },
  returns: v.object({
    conversations: v.array(conversationValidator),
  }),
  handler: async (ctx, args) => {
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

export const get = workspaceQuery({
  args: {
    legacyId: v.string(),
  },
  returns: v.object({
    conversation: v.union(
      v.null(),
      v.object({
        _id: v.id('agentConversations'),
        workspaceId: v.string(),
        legacyId: v.string(),
        userId: v.string(),
        title: v.union(v.string(), v.null()),
        startedAt: v.union(v.number(), v.null()),
        lastMessageAt: v.union(v.number(), v.null()),
        messageCount: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    return { conversation: row ?? null }
  },
})

export const remove = workspaceMutation({
  args: {
    legacyId: v.string(),
  },
  returns: v.object({
    ok: v.literal(true),
    deletedConversation: v.boolean(),
    deletedMessages: v.number(),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Conversation', args.legacyId)
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
    return { ok: true as const, deletedConversation: true, deletedMessages: messages.length }
  },
})
