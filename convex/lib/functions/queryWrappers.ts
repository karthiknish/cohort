import { customQuery } from 'convex-helpers/server/customFunctions'
import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { Errors } from '../../errors'
import { getAuthenticatedContext } from './auth'
import { wrapDatabaseActive } from './softDeleteDb'

export const authenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedContext(ctx)
    return { ctx: { ...ctx, ...auth }, args: {} }
  },
})

export const optionalAuthenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    return {
      ctx: {
        ...ctx,
        identity,
        legacyId: identity?.subject ?? null,
      },
      args: {},
    }
  },
})

export const workspaceQuery = customQuery(query, {
  args: { workspaceId: v.string() },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    return { ctx: { ...ctx, ...auth }, args }
  },
})
export const workspaceQueryActive = customQuery(query, {
  args: { workspaceId: v.string() },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    return { ctx: { ...ctx, ...auth, db: wrapDatabaseActive(ctx.db) }, args }
  },
})
export const adminQuery = customQuery(query, {
  args: {} as Record<string, never>, // Functions define their own args - base args extended
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    return { ctx: { ...ctx, ...auth }, args }
  },
})

// Admin paginated query wrapper - for use with usePaginatedQuery
export const adminPaginatedQuery = customQuery(query, {
  args: {
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
      id: v.optional(v.number()),
    }),
  },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    const { paginationOpts, ...restArgs } = args
    const { numItems, cursor } = paginationOpts
    return { ctx: { ...ctx, ...auth }, args: { ...restArgs, numItems, cursor } }
  },
})
