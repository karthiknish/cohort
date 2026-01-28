import { v } from 'convex/values'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation } from './functions'

export const upsert = workspaceMutation({
  args: {
    conversationLegacyId: v.string(),
    legacyId: v.string(),

    type: v.union(v.literal('user'), v.literal('agent')),
    content: v.string(),
    createdAt: v.number(),
    userId: v.union(v.string(), v.null()),

    action: v.union(v.string(), v.null()),
    route: v.union(v.string(), v.null()),
    operation: v.union(v.string(), v.null()),
    params: v.union(v.record(v.string(), v.any()), v.null()),
    executeResult: v.union(v.record(v.string(), v.any()), v.null()),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('agentMessages')
      .withIndex('by_workspace_conversation_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId)
          .eq('conversationLegacyId', args.conversationLegacyId)
          .eq('legacyId', args.legacyId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        type: args.type,
        content: args.content,
        createdAt: args.createdAt,
        userId: args.userId,
        action: args.action,
        route: args.route,
        operation: args.operation,
        params: args.params,
        executeResult: args.executeResult,
      })
      return { ok: true } as const
    }

    await ctx.db.insert('agentMessages', {
      workspaceId: args.workspaceId,
      conversationLegacyId: args.conversationLegacyId,
      legacyId: args.legacyId,
      type: args.type,
      content: args.content,
      createdAt: args.createdAt,
      userId: args.userId,
      action: args.action,
      route: args.route,
      operation: args.operation,
      params: args.params,
      executeResult: args.executeResult,
    })

    return { ok: true } as const
  },
})

export const listByConversation = workspaceQuery({
  args: {
    conversationLegacyId: v.string(),
    limit: v.number(),
  },
  returns: v.object({
    messages: v.array(
      v.object({
        legacyId: v.string(),
        type: v.union(v.literal('user'), v.literal('agent')),
        content: v.string(),
        createdAt: v.number(),
        route: v.union(v.string(), v.null()),
        action: v.union(v.string(), v.null()),
        operation: v.union(v.string(), v.null()),
        params: v.union(v.record(v.string(), v.any()), v.null()),
        executeResult: v.union(v.record(v.string(), v.any()), v.null()),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query('agentMessages')
      .withIndex('by_workspace_conversation_createdAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', args.conversationLegacyId)
      )
      .order('asc')
      .take(args.limit)

    return {
      messages: rows.map((row) => ({
        legacyId: row.legacyId,
        type: row.type,
        content: row.content,
        createdAt: row.createdAt,
        route: row.route,
        action: row.action,
        operation: row.operation,
        params: row.params,
        executeResult: row.executeResult,
      })),
    }
  },
})
