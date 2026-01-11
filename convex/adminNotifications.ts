import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }
}

export const list = query({
  args: {
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)

    const rows = args.unreadOnly
      ? await ctx.db
          .query('adminNotifications')
          .withIndex('by_read_createdAtMs', (q) => q.eq('read', false))
          .collect()
      : await ctx.db.query('adminNotifications').withIndex('by_createdAtMs', (q) => q).collect()

    rows.sort((a, b) => b.createdAtMs - a.createdAtMs)

    const trimmed = rows.slice(0, limit).map((row) => ({
      id: row._id,
      type: row.type,
      title: row.title,
      message: row.message,
      userId: row.userId,
      userEmail: row.userEmail,
      userName: row.userName,
      read: row.read,
      createdAtMs: row.createdAtMs,
    }))

    const unreadCount = (await ctx.db
      .query('adminNotifications')
      .withIndex('by_read_createdAtMs', (q) => q.eq('read', false))
      .collect()).length

    return { notifications: trimmed, unreadCount }
  },
})

export const markRead = mutation({
  args: {
    ids: v.optional(v.array(v.id('adminNotifications'))),
    markAllRead: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    if (args.markAllRead) {
      const unread = await ctx.db
        .query('adminNotifications')
        .withIndex('by_read_createdAtMs', (q) => q.eq('read', false))
        .collect()

      for (const row of unread) {
        await ctx.db.patch(row._id, { read: true, updatedAtMs: Date.now() })
      }

      return { ok: true, count: unread.length }
    }

    const ids = args.ids ?? []
    if (ids.length === 0) throw new Error('No notification ids provided')

    for (const id of ids) {
      await ctx.db.patch(id, { read: true, updatedAtMs: Date.now() })
    }

    return { ok: true, count: ids.length }
  },
})

export const remove = mutation({
  args: {
    ids: v.optional(v.array(v.id('adminNotifications'))),
    deleteAll: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    if (args.deleteAll) {
      const all = await ctx.db.query('adminNotifications').withIndex('by_createdAtMs', (q) => q).collect()
      for (const row of all) {
        await ctx.db.delete(row._id)
      }
      return { ok: true, count: all.length }
    }

    const ids = args.ids ?? []
    if (ids.length === 0) throw new Error('No notification ids provided')

    for (const id of ids) {
      await ctx.db.delete(id)
    }

    return { ok: true, count: ids.length }
  },
})
