import { adminMutation, adminQuery } from './functions'
import { v } from 'convex/values'
import { Errors } from './errors'

const userSummaryValidator = v.object({
  _id: v.id('users'),
  legacyId: v.string(),
  email: v.union(v.string(), v.null()),
  name: v.union(v.string(), v.null()),
  role: v.union(v.string(), v.null()),
  status: v.union(v.string(), v.null()),
  createdAtMs: v.union(v.number(), v.null()),
  updatedAtMs: v.union(v.number(), v.null()),
})

export const listUsers = adminQuery({
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
    // usePaginatedQuery may pass additional fields for internal tracking
    id: v.optional(v.number()),
  },
  returns: v.object({
    page: v.array(userSummaryValidator),
    continueCursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db.query('users').order('desc').paginate(args.paginationOpts)

    // Transform to match validator
    return {
      page: result.page.map((user: any) => ({
        _id: user._id,
        legacyId: user.legacyId,
        email: user.email ?? null,
        name: user.name ?? null,
        role: user.role ?? null,
        status: user.status ?? null,
        createdAtMs: user.createdAtMs ?? null,
        updatedAtMs: user.updatedAtMs ?? null,
      })),
      continueCursor: result.continueCursor,
      isDone: result.isDone,
    }
  },
})

export const getUserCounts = adminQuery({
  args: {},
  returns: v.object({
    total: v.number(),
    activeTotal: v.number(),
    suspendedTotal: v.number(),
    disabledTotal: v.number(),
  }),
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
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAtMs: ctx.now,
    })
    return { ok: true } as const
  },
})

export const updateUserRoleStatus = adminMutation({
  args: {
    legacyId: v.string(),
    role: v.optional(v.union(v.string(), v.null())),
    status: v.optional(v.union(v.string(), v.null())),
  },
  returns: v.object({
    legacyId: v.string(),
    role: v.union(v.string(), v.null()),
    status: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_legacyId', (q: any) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.auth.userNotFound()
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
