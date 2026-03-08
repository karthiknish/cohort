import { adminMutation, adminQuery, adminPaginatedQuery } from './functions'
import { v } from 'convex/values'
import { Errors } from './errors'
import { buildAdminUserPage } from '../src/app/admin/lib/admin-user-list'

const userSummaryValidator = v.object({
  _id: v.id('users'),
  legacyId: v.string(),
  email: v.union(v.string(), v.null()),
  name: v.union(v.string(), v.null()),
  role: v.union(v.string(), v.null()),
  status: v.union(v.string(), v.null()),
  agencyId: v.union(v.string(), v.null()),
  createdAtMs: v.union(v.number(), v.null()),
  updatedAtMs: v.union(v.number(), v.null()),
})

export const listUsers = adminPaginatedQuery({
  args: {
    workspaceId: v.optional(v.string()),
    includeAllWorkspaces: v.optional(v.boolean()),
  },
  returns: v.object({
    page: v.array(userSummaryValidator),
    continueCursor: v.string(),
    isDone: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const { numItems, cursor } = args
    const adminWorkspaceId = (ctx.user.agencyId ?? ctx.user.legacyId) as string
    const includeAllWorkspaces = args.includeAllWorkspaces === true
    const targetWorkspaceId = includeAllWorkspaces
      ? null
      : (args.workspaceId ?? adminWorkspaceId)

    const result = includeAllWorkspaces
      ? buildAdminUserPage({
          includeAllWorkspaces: true,
          allUsers: await ctx.db.query('users').collect(),
          numItems,
          cursor,
        })
      : buildAdminUserPage({
          owner: targetWorkspaceId
            ? await ctx.db
                .query('users')
                .withIndex('by_legacyId', (q) => q.eq('legacyId', targetWorkspaceId))
                .unique()
            : null,
          members: targetWorkspaceId
            ? await ctx.db
                .query('users')
                .withIndex('by_agencyId', (q) => q.eq('agencyId', targetWorkspaceId))
                .collect()
            : [],
          numItems,
          cursor,
        })

    // Transform to match validator
    return {
      page: result.page.map((user) => ({
        _id: user._id,
        legacyId: user.legacyId,
        email: user.email ?? null,
        name: user.name ?? null,
        role: user.role ?? null,
        status: user.status ?? null,
        agencyId: user.agencyId ?? null,
        createdAtMs: user.createdAtMs ?? null,
        updatedAtMs: user.updatedAtMs ?? null,
      })),
      continueCursor: result.continueCursor ?? '',
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
    const activeTotal = all.filter((row) => row.status === 'active').length
    const suspendedTotal = all.filter((row) => row.status === 'suspended').length
    const disabledTotal = all.filter((row) => row.status === 'disabled').length

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
      .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
      .unique()

    if (!existing) {
      throw Errors.auth.userNotFound()
    }

    // Admin actions are workspace-scoped by default for safer multi-tenant control.
    const adminWorkspaceId = (ctx.user.agencyId ?? ctx.user.legacyId) as string
    const targetWorkspaceId = (existing.agencyId ?? existing.legacyId) as string
    const isSelfUpdate = existing.legacyId === ctx.user.legacyId

    if (!isSelfUpdate && adminWorkspaceId !== targetWorkspaceId) {
      throw Errors.auth.workspaceAccessDenied('Cannot modify users outside your workspace')
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
