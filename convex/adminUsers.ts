import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'

import { requireAdminFromUsersTable } from './authz'

function nowMs() {
  return Date.now()
}

export const listUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdminFromUsersTable(ctx)

    const page = await ctx.db.query('users').order('desc').paginate(args.paginationOpts)

    return page
  },
})

export const getUserCounts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminFromUsersTable(ctx)

    const all = await ctx.db.query('users').collect()
    const total = all.length
    const activeTotal = all.filter((row) => row.status === 'active').length

    return { total, activeTotal }
  },
})

export const updateUserRoleStatus = mutation({
  args: {
    legacyId: v.string(),
    role: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireAdminFromUsersTable(ctx)

    const existing = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw new Error('User not found')
    }

    const patch: Record<string, unknown> = {
      updatedAtMs: nowMs(),
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
