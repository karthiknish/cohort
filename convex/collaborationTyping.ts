import { v } from 'convex/values'
import { Errors } from './errors'
import { workspaceQuery, workspaceMutation } from './functions'

const typingIndicatorValidator = v.object({
  _id: v.id('collaborationTyping'),
  _creationTime: v.number(),
  workspaceId: v.string(),
  channelId: v.string(),
  channelType: v.string(),
  clientId: v.union(v.string(), v.null()),
  projectId: v.union(v.string(), v.null()),
  userId: v.string(),
  name: v.string(),
  role: v.union(v.string(), v.null()),
  updatedAtMs: v.number(),
  expiresAtMs: v.number(),
})

export const listForChannel = workspaceQuery({
  args: {
    channelId: v.string(),
    limit: v.number(),
  },
  returns: v.array(typingIndicatorValidator),
  handler: async (ctx, args) => {
    const timestamp = Date.now()

    const rows = await ctx.db
      .query('collaborationTyping')
      .withIndex('by_workspace_channel_expiresAtMs_userId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('channelId', args.channelId),
      )
      .order('desc')
      .take(Math.max(1, Math.min(args.limit, 50)))

    return rows.filter((row) => row.expiresAtMs > timestamp)
  },
})

export const setTyping = workspaceMutation({
  args: {
    channelId: v.string(),
    channelType: v.string(),
    clientId: v.union(v.string(), v.null()),
    projectId: v.union(v.string(), v.null()),
    userId: v.string(),
    name: v.string(),
    role: v.union(v.string(), v.null()),
    isTyping: v.boolean(),
    ttlMs: v.number(),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    const timestamp = ctx.now

    const existing = await ctx.db
      .query('collaborationTyping')
      .withIndex('by_workspace_channel_userId', (q) =>
        q
          .eq('workspaceId', args.workspaceId)
          .eq('channelId', args.channelId)
          .eq('userId', args.userId),
      )
      .unique()

    if (!args.isTyping) {
      if (existing) {
        await ctx.db.delete(existing._id)
      }
      return { ok: true } as const
    }

    const clampedTtl = Math.max(1_000, Math.min(args.ttlMs, 60_000))

    const payload = {
      workspaceId: args.workspaceId,
      channelId: args.channelId,
      channelType: args.channelType,
      clientId: args.clientId,
      projectId: args.projectId,
      userId: args.userId,
      name: args.name,
      role: args.role,
      updatedAtMs: timestamp,
      expiresAtMs: timestamp + clampedTtl,
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
      return { ok: true } as const
    }

    await ctx.db.insert('collaborationTyping', payload)
    return { ok: true } as const
  },
})
