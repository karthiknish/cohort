import { v } from 'convex/values'
import { buildAdminUserPage } from '../src/app/admin/lib/admin-user-list'
import { Errors, isAppError } from './errors'
import { applyManualPagination, adminMutation, adminPaginatedQuery, adminQuery } from './functions'

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

function throwAdminUsersError(operation: string, error: unknown, context?: Record<string, unknown>): never {
  console.error(`[adminUsers:${operation}]`, context ?? {}, error)

  if (isAppError(error)) {
    throw error
  }

  throw Errors.base.internal('Admin user operation failed')
}

function parseGlobalUsersCursor(cursor: string | null | undefined) {
  if (!cursor) return null

  try {
    const parsed = JSON.parse(cursor) as { updatedAtMs?: unknown; legacyId?: unknown }
    if (typeof parsed.updatedAtMs !== 'number' || typeof parsed.legacyId !== 'string') {
      return null
    }

    return { fieldValue: parsed.updatedAtMs, legacyId: parsed.legacyId }
  } catch {
    return null
  }
}

function serializeGlobalUsersCursor(cursor: { fieldValue: number | string; legacyId: string } | null) {
  if (!cursor) return null
  return JSON.stringify({ updatedAtMs: cursor.fieldValue, legacyId: cursor.legacyId })
}

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
    try {
      const { numItems, cursor } = args
      const adminWorkspaceId = (ctx.user.agencyId ?? ctx.user.legacyId) as string
      const includeAllWorkspaces = args.includeAllWorkspaces === true
      const targetWorkspaceId = includeAllWorkspaces
        ? null
        : (args.workspaceId ?? adminWorkspaceId)

      if (includeAllWorkspaces) {
        const paginatedQuery = applyManualPagination(
          ctx.db
            .query('users')
            .withIndex('by_updatedAtMs_legacyId', (q) => q)
            .order('desc'),
          parseGlobalUsersCursor(cursor),
          'updatedAtMs',
          'desc',
        )

        const rows = await paginatedQuery.take(numItems + 1)
        const page = rows.slice(0, numItems)
        const lastRow = page.at(-1) ?? null
        const continueCursor = rows.length > numItems && lastRow
          ? serializeGlobalUsersCursor({
              fieldValue: lastRow.updatedAtMs ?? 0,
              legacyId: lastRow.legacyId,
            })
          : null

        return {
          page: page.map((user) => ({
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
          continueCursor: continueCursor ?? '',
          isDone: continueCursor === null,
        }
      }

      const result = buildAdminUserPage({
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
    } catch (error) {
      throwAdminUsersError('listUsers', error, {
        workspaceId: args.workspaceId ?? null,
        includeAllWorkspaces: args.includeAllWorkspaces ?? false,
      })
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
    try {
      const [all, activeUsers, suspendedUsers, disabledUsers] = await Promise.all([
        ctx.db.query('users').withIndex('by_createdAtMs', (q) => q).collect(),
        ctx.db.query('users').withIndex('by_status_updatedAtMs', (q) => q.eq('status', 'active')).collect(),
        ctx.db.query('users').withIndex('by_status_updatedAtMs', (q) => q.eq('status', 'suspended')).collect(),
        ctx.db.query('users').withIndex('by_status_updatedAtMs', (q) => q.eq('status', 'disabled')).collect(),
      ])

      const total = all.length
      const activeTotal = activeUsers.length
      const suspendedTotal = suspendedUsers.length
      const disabledTotal = disabledUsers.length

      return { total, activeTotal, suspendedTotal, disabledTotal }
    } catch (error) {
      throwAdminUsersError('getUserCounts', error)
    }
  },
})

export const setRole = adminMutation({
  args: { userId: v.id('users'), role: v.string() },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    try {
      await ctx.db.patch(args.userId, {
        role: args.role,
        updatedAtMs: ctx.now,
      })
      return { ok: true } as const
    } catch (error) {
      throwAdminUsersError('setRole', error, { userId: args.userId, role: args.role })
    }
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
    try {
      if (args.role === undefined && args.status === undefined) {
        throw Errors.validation.invalidInput('At least one of role or status must be provided')
      }

      const existing = await ctx.db
        .query('users')
        .withIndex('by_legacyId', (q) => q.eq('legacyId', args.legacyId))
        .unique()

      if (!existing) {
        throw Errors.auth.userNotFound()
      }

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
    } catch (error) {
      throwAdminUsersError('updateUserRoleStatus', error, {
        legacyId: args.legacyId,
        hasRole: args.role !== undefined,
        hasStatus: args.status !== undefined,
      })
    }
  },
})
