import { authenticatedMutation, authenticatedQuery } from './functions'
import { v } from 'convex/values'
import { Errors } from './errors'

const notificationValidator = v.object({
  id: v.id('adminNotifications'),
  type: v.string(),
  title: v.string(),
  message: v.string(),
  userId: v.union(v.string(), v.null()),
  userEmail: v.union(v.string(), v.null()),
  userName: v.union(v.string(), v.null()),
  read: v.boolean(),
  createdAtMs: v.number(),
})

export const list = authenticatedQuery({
  args: {
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    notifications: v.array(notificationValidator),
    unreadCount: v.number(),
  }),
  handler: async (ctx, args) => {
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

export const markRead = authenticatedMutation({
  args: {
    ids: v.optional(v.array(v.id('adminNotifications'))),
    markAllRead: v.optional(v.boolean()),
  },
  returns: v.object({
    ok: v.literal(true),
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    if (args.markAllRead) {
      const unread = await ctx.db
        .query('adminNotifications')
        .withIndex('by_read_createdAtMs', (q) => q.eq('read', false))
        .collect()

      for (const row of unread) {
        await ctx.db.patch(row._id, { read: true, updatedAtMs: ctx.now })
      }

      return { ok: true as const, count: unread.length }
    }

    const ids = args.ids ?? []
    if (ids.length === 0) throw Errors.validation.invalidInput('No notification ids provided')

    for (const id of ids) {
      await ctx.db.patch(id, { read: true, updatedAtMs: ctx.now })
    }

    return { ok: true as const, count: ids.length }
  },
})

export const remove = authenticatedMutation({
  args: {
    ids: v.optional(v.array(v.id('adminNotifications'))),
    deleteAll: v.optional(v.boolean()),
  },
  returns: v.object({
    ok: v.literal(true),
    count: v.number(),
  }),
  handler: async (ctx, args) => {
    if (args.deleteAll) {
      const all = await ctx.db.query('adminNotifications').withIndex('by_createdAtMs', (q) => q).collect()
      for (const row of all) {
        await ctx.db.delete(row._id)
      }
      return { ok: true as const, count: all.length }
    }

    const ids = args.ids ?? []
    if (ids.length === 0) throw Errors.validation.invalidInput('No notification ids provided')

    for (const id of ids) {
      await ctx.db.delete(id)
    }

    return { ok: true as const, count: ids.length }
  },
})
