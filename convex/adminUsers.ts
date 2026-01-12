import { adminMutation, adminQuery } from './functions'
import { v } from 'convex/values'

export const listUsers = adminQuery({
  args: { paginationOpts: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.query('users').order('desc').paginate(args.paginationOpts)
  },
})

export const getUserCounts = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('users').collect()
    const total = all.length
    const activeTotal = all.filter((row: any) => row.status === 'active').length
    const suspendedTotal = all.filter((row: any) => row.status === 'suspended').length
    const disabledTotal = all.filter((row: any) => row.status === 'disabled').length

    return { total, activeTotal, suspendedTotal, disabledTotal }
  },
})

export const setRole = adminMutation({
  args: { userId: v.id('users'), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAtMs: ctx.now,
    })
  },
})

export const updateUserRoleStatus = adminMutation({
  args: {
    legacyId: v.string(),
    role: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q: any) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw new Error('User not found')
    }

    const patch: Record<string, unknown> = {
      updatedAtMs: ctx.now,
    }

    if (args.role !== undefined) {
      patch.role = args.role
    }

    if (args.status !== undefined) {
      patch.status = args.status
    }

    await ctx.db.patch(existing._id, patch)

    const updated = await ctx.db.get(existing._id)

    return {
      legacyId: updated?.legacyId ?? args.legacyId,
      role: updated?.role ?? null,
      status: updated?.status ?? null,
    }
  },
})
