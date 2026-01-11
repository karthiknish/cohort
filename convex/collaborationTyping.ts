import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

function nowMs() {
  return Date.now()
}

export const listForChannel = query({
  args: {
    workspaceId: v.string(),
    channelId: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

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

export const setTyping = mutation({
  args: {
    workspaceId: v.string(),
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
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = nowMs()

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
      return { ok: true }
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
      return { ok: true }
    }

    await ctx.db.insert('collaborationTyping', payload)
    return { ok: true }
  },
})
