import { v } from 'convex/values'
import { workspaceQuery, workspaceMutation } from './functions'

const paramScalarValidator = v.union(v.null(), v.boolean(), v.number(), v.string())
const paramLayer1Validator = v.union(
  paramScalarValidator,
  v.array(paramScalarValidator),
  v.record(v.string(), paramScalarValidator),
)
const paramLayer2Validator = v.union(
  paramLayer1Validator,
  v.array(paramLayer1Validator),
  v.record(v.string(), paramLayer1Validator),
)
const paramRecordValidator = v.record(v.string(), paramLayer2Validator)

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
    params: v.union(paramRecordValidator, v.null()),
    executeResult: v.union(paramRecordValidator, v.null()),
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

export const searchByUser = workspaceQuery({
  args: {
    userId: v.string(),
    query: v.string(),
    limit: v.number(),
  },
  returns: v.object({
    hits: v.array(
      v.object({
        conversationLegacyId: v.string(),
        messageLegacyId: v.string(),
        excerpt: v.string(),
        createdAt: v.number(),
        type: v.union(v.literal('user'), v.literal('agent')),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const needle = args.query.trim().toLowerCase()
    if (!needle) {
      return { hits: [] }
    }

    const limit = Math.min(Math.max(args.limit, 1), 50)
    const conversations = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_userId_lastMessageAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', args.userId),
      )
      .order('desc')
      .take(80)

    const hits: Array<{
      conversationLegacyId: string
      messageLegacyId: string
      excerpt: string
      createdAt: number
      type: 'user' | 'agent'
    }> = []

    const scanConversation = async (index: number): Promise<void> => {
      if (index >= conversations.length || hits.length >= limit) return

      const conversation = conversations[index]
      if (!conversation) return
      const messages = await ctx.db
        .query('agentMessages')
        .withIndex('by_workspace_conversation_createdAt', (q) =>
          q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', conversation.legacyId),
        )
        .order('desc')
        .take(120)

      for (const message of messages) {
        if (!message.content.toLowerCase().includes(needle)) continue

        const matchIndex = message.content.toLowerCase().indexOf(needle)
        const start = Math.max(0, matchIndex - 40)
        const end = Math.min(message.content.length, matchIndex + needle.length + 60)
        const excerpt = message.content.slice(start, end).trim()

        hits.push({
          conversationLegacyId: conversation.legacyId,
          messageLegacyId: message.legacyId,
          excerpt: excerpt.length > 0 ? excerpt : message.content.slice(0, 120),
          createdAt: message.createdAt,
          type: message.type,
        })

        if (hits.length >= limit) return
      }

      await scanConversation(index + 1)
    }

    await scanConversation(0)

    return { hits }
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
        params: v.union(paramRecordValidator, v.null()),
        executeResult: v.union(paramRecordValidator, v.null()),
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
