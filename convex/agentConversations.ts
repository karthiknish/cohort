import { v } from 'convex/values'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation } from './functions'

const conversationValidator = v.object({
  legacyId: v.string(),
  title: v.union(v.string(), v.null()),
  startedAt: v.union(v.number(), v.null()),
  lastMessageAt: v.union(v.number(), v.null()),
  messageCount: v.number(),
  pinnedAt: v.union(v.number(), v.null()),
  archivedAt: v.union(v.number(), v.null()),
  previewSnippet: v.union(v.string(), v.null()),
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
      pinnedAt: null,
      archivedAt: null,
      previewSnippet: null,
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
    cursor: v.optional(v.union(v.number(), v.null())),
    search: v.optional(v.union(v.string(), v.null())),
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.object({
    conversations: v.array(conversationValidator),
    nextCursor: v.union(v.number(), v.null()),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit, 1), 50)
    const search = args.search?.trim().toLowerCase() ?? ''
    const includeArchived = args.includeArchived ?? false

    const rows = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_userId_lastMessageAt', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', args.userId)
      )
      .order('desc')
      .take(250)

    const messageMatchIds = new Set<string>()
    if (search) {
      const searchMatches = await Promise.all(
        rows.slice(0, 60).map(async (row) => {
          const messages = await ctx.db
            .query('agentMessages')
            .withIndex('by_workspace_conversation_createdAt', (q) =>
              q.eq('workspaceId', args.workspaceId).eq('conversationLegacyId', row.legacyId),
            )
            .order('desc')
            .take(80)

          return messages.some((message) => message.content.toLowerCase().includes(search))
            ? row.legacyId
            : null
        }),
      )
      for (const legacyId of searchMatches) {
        if (legacyId) messageMatchIds.add(legacyId)
      }
    }

    const filtered = rows.filter((row) => {
      if (!includeArchived && row.archivedAt) return false
      if (!search) return true
      const title = (row.title ?? '').toLowerCase()
      const snippet = (row.previewSnippet ?? '').toLowerCase()
      return (
        title.includes(search) ||
        snippet.includes(search) ||
        row.legacyId.toLowerCase().includes(search) ||
        messageMatchIds.has(row.legacyId)
      )
    })

    const sorted = filtered.toSorted((a, b) => {
      const aPinned = a.pinnedAt ?? 0
      const bPinned = b.pinnedAt ?? 0
      if (aPinned !== bPinned) return bPinned - aPinned
      return (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0)
    })

    let startIndex = 0
    if (typeof args.cursor === 'number') {
      const cursorIndex = sorted.findIndex((row) => (row.lastMessageAt ?? 0) < args.cursor!)
      startIndex = cursorIndex === -1 ? sorted.length : cursorIndex
    }

    const page = sorted.slice(startIndex, startIndex + limit)
    const lastRow = page[page.length - 1]
    const nextCursor = lastRow?.lastMessageAt ?? null
    const hasMore = startIndex + limit < sorted.length

    return {
      conversations: page.map((row) => ({
        legacyId: row.legacyId,
        title: row.title,
        startedAt: row.startedAt,
        lastMessageAt: row.lastMessageAt,
        messageCount: row.messageCount,
        pinnedAt: row.pinnedAt ?? null,
        archivedAt: row.archivedAt ?? null,
        previewSnippet: row.previewSnippet ?? null,
      })),
      nextCursor,
      hasMore,
    }
  },
})

export const setConversationFlags = workspaceMutation({
  args: {
    legacyId: v.string(),
    userId: v.string(),
    pinned: v.optional(v.union(v.boolean(), v.null())),
    archived: v.optional(v.union(v.boolean(), v.null())),
  },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) {
      throw Errors.resource.notFound('Conversation', args.legacyId)
    }

    if (row.userId !== args.userId) {
      throw Errors.auth.forbidden()
    }

    const patch: Record<string, number | null> = { updatedAt: ctx.now }
    if (args.pinned !== undefined) {
      patch.pinnedAt = args.pinned ? ctx.now : null
    }
    if (args.archived !== undefined) {
      patch.archivedAt = args.archived ? ctx.now : null
      if (args.archived) {
        patch.pinnedAt = null
      }
    }

    await ctx.db.patch(row._id, patch)
    return { ok: true as const }
  },
})

export const updatePreviewSnippet = workspaceMutation({
  args: {
    legacyId: v.string(),
    previewSnippet: v.union(v.string(), v.null()),
  },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('agentConversations')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) {
      return { ok: true as const }
    }

    await ctx.db.patch(row._id, {
      previewSnippet: args.previewSnippet?.slice(0, 160) ?? null,
      updatedAt: ctx.now,
    })
    return { ok: true as const }
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

    if (!row) {
      return { conversation: null }
    }

    return {
      conversation: {
        _id: row._id,
        workspaceId: row.workspaceId,
        legacyId: row.legacyId,
        userId: row.userId,
        title: row.title ?? null,
        startedAt: row.startedAt,
        lastMessageAt: row.lastMessageAt,
        messageCount: row.messageCount,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    }
  },
})
