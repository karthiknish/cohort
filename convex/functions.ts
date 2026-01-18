import {
  customMutation,
  customQuery,
  customAction,
} from 'convex-helpers/server/customFunctions'
import {
  zCustomQuery,
  zCustomMutation,
  zCustomAction,
} from 'convex-helpers/server/zod4'
import { z } from 'zod/v4'
import {
  mutation,
  query,
  action,
  type QueryCtx,
  type MutationCtx,
  type ActionCtx,
} from './_generated/server'
import { Doc } from './_generated/dataModel'
import { api } from './_generated/api'
import { v } from 'convex/values'
import { Errors } from './errors'
 
/**
 * Helper to wrap a Zod schema in the standard { ok: true, data: T } response format
 * used by our mutation and action wrappers.
 */
export function wrappedResponseZ<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    ok: z.literal(true),
    data: schema,
  })
}

/**
 * Tables that support soft deletion via a `deletedAtMs` field.
 */
const SOFT_DELETE_TABLES = ['tasks', 'taskComments', 'collaborationMessages', 'clients', 'projects']

/**
 * Helper to automatically append a deletedAtMs filter to queries.
 * Treats both `null` and `undefined` (missing field) as "active" (not deleted).
 */
function wrapDatabaseActive(db: QueryCtx['db']): QueryCtx['db'] {
  const proxyQuery = (q: any): any => {
    return new Proxy(q, {
      get(target, prop, receiver) {
        if (['collect', 'first', 'unique', 'paginate', 'take'].includes(prop as string)) {
          return (...args: any[]) => {
            // Filter: deletedAtMs is null OR deletedAtMs is undefined (missing)
            return target.filter((q: any) =>
              q.or(
                q.eq(q.field('deletedAtMs'), null),
                q.eq(q.field('deletedAtMs'), undefined)
              )
            )[prop](...args)
          }
        }
        const value = Reflect.get(target, prop, receiver)
        if (typeof value === 'function') {
          return (...args: any[]) => {
            const result = value.apply(target, args)
            if (result && typeof result === 'object' && 'filter' in result && 'collect' in result) {
              return proxyQuery(result)
            }
            return result
          }
        }
        return value
      },
    })
  }

  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === 'query') {
        return (table: string) => {
          const q = target.query(table as any)
          if (SOFT_DELETE_TABLES.includes(table)) {
            return proxyQuery(q)
          }
          return q
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}

/**
 * Types for the context injected by the authenticated wrappers.
 */
export type AuthenticatedQueryCtx = QueryCtx & {
  user: Doc<'users'>
  legacyId: string
  agencyId: string
}

export type AuthenticatedMutationCtx = MutationCtx & {
  user: Doc<'users'>
  legacyId: string
  agencyId: string
  now: number
  cachedResponse?: any
}

export type AuthenticatedActionCtx = ActionCtx & {
  user: Doc<'users'>
  legacyId: string
  agencyId: string
  now: number
  cachedResponse?: any
}

/**
 * Shared helper to get validated authentication context for queries/mutations.
 */
async function getAuthenticatedContext(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_legacyId', (q) => q.eq('legacyId', identity.subject))
    .unique()

  if (!user) {
    throw Errors.auth.userNotFound()
  }

  if (user.status === 'disabled' || user.status === 'suspended') {
    throw Errors.auth.userDisabled()
  }

  return {
    user,
    legacyId: user.legacyId as string,
    agencyId: (user.agencyId ?? user.legacyId) as string,
  }
}

/**
 * Shared helper to check and update idempotency status.
 */
async function checkIdempotency(
  ctx: MutationCtx,
  key: string | undefined
): Promise<{ cachedResponse?: any; commitIdempotency?: (response: any) => Promise<void> }> {
  if (!key) return {}

  const existing = await ctx.db
    .query('apiIdempotency')
    .withIndex('by_key', (q) => q.eq('key', key))
    .unique()

  if (existing) {
    if (existing.status === 'completed') {
      return { cachedResponse: existing.response }
    }
    // If pending, we let it through but you might want to handle it differently 
    // depending on your concurrency requirements.
  }

  // Record that we started
  const now = Date.now()
  const id = await ctx.db.insert('apiIdempotency', {
    key,
    status: 'pending',
    requestId: null,
    method: null,
    path: null,
    response: null,
    httpStatus: null,
    createdAtMs: now,
    updatedAtMs: now,
  })

  return {
    commitIdempotency: async (response: any) => {
      await ctx.db.patch(id, {
        status: 'completed',
        response,
        updatedAtMs: Date.now(),
      })
    },
  }
}

/**
 * Standard pagination arguments using Convex validators.
 * Uses a generic 'cursor' object to allow for different sort fields.
 */
export const PaginationValidators = {
  limit: v.number(),
  cursor: v.optional(
    v.union(
      v.null(),
      v.object({
        fieldValue: v.union(v.number(), v.string()),
        legacyId: v.string(),
      }),
    ),
  ),
}

/**
 * Helper to apply standardized manual pagination to a Convex query.
 * Support both descending (default) and ascending orders, and custom field names.
 */
export function applyManualPagination(
  q: any,
  cursor: { fieldValue: number | string; legacyId: string } | null | undefined,
  fieldName: string = 'createdAtMs',
  order: 'asc' | 'desc' = 'desc',
) {
  if (!cursor) return q

  if (order === 'desc') {
    return q.filter((row: any) =>
      row.or(
        row.lt(row.field(fieldName), cursor.fieldValue),
        row.and(
          row.eq(row.field(fieldName), cursor.fieldValue),
          row.lt(row.field('legacyId'), cursor.legacyId),
        ),
      ),
    )
  } else {
    return q.filter((row: any) =>
      row.or(
        row.gt(row.field(fieldName), cursor.fieldValue),
        row.and(
          row.eq(row.field(fieldName), cursor.fieldValue),
          row.gt(row.field('legacyId'), cursor.legacyId),
        ),
      ),
    )
  }
}

/**
 * Helper to wrap a result set in a standardized paginated response.
 */
export function getPaginatedResponse<T extends Record<string, any>>(
  items: T[],
  limit: number,
  fieldName: string = 'createdAtMs',
) {
  const hasMore = items.length > limit
  const results = hasMore ? items.slice(0, limit) : items
  const lastItem = results[results.length - 1]

  return {
    items: results,
    nextCursor:
      hasMore && lastItem
        ? { fieldValue: lastItem[fieldName], legacyId: lastItem.legacyId }
        : null,
  }
}

/**
 * Shared helper to get validated authentication context for actions.
 */
async function getAuthenticatedActionContext(ctx: ActionCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw Errors.auth.unauthorized()
  }

  const user = (await ctx.runQuery(api.users.getByLegacyId, {
    legacyId: identity.subject,
  })) as Doc<'users'> | null

  if (!user) {
    throw Errors.auth.userNotFound()
  }

  if (user.status === 'disabled' || user.status === 'suspended') {
    throw Errors.auth.userDisabled()
  }

  return {
    user,
    legacyId: user.legacyId as string,
    agencyId: (user.agencyId ?? user.legacyId) as string,
  }
}

/**
 * Custom query wrapper that ensures the user is authenticated.
 */
/**
 * Custom Query Wrapper
 */
export const authenticatedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedContext(ctx)
    return { ctx: { ...ctx, ...auth }, args: {} }
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

export const authenticatedMutation = customMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    const { cachedResponse, commitIdempotency } = await checkIdempotency(ctx, args.idempotencyKey)
    return {
      ctx: { ...ctx, ...auth, now: Date.now(), cachedResponse },
      args,
      returnValue: async (result: any) => {
        if (commitIdempotency) await commitIdempotency(result)
        return { ok: true, data: result }
      },
    }
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

export const authenticatedAction = customAction(action, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedActionContext(ctx)
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args: {},
      returnValue: async (result: any) => {
        return { ok: true, data: result }
      },
    }
  },
})

export const adminQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    return { ctx: { ...ctx, ...auth }, args: {} }
  },
})

export const adminMutation = customMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    const { cachedResponse, commitIdempotency } = await checkIdempotency(ctx, args.idempotencyKey)
    return {
      ctx: { ...ctx, ...auth, now: Date.now(), cachedResponse },
      args,
      returnValue: async (result: any) => {
        if (commitIdempotency) await commitIdempotency(result)
        return { ok: true, data: result }
      },
    }
  },
})

export const adminAction = customAction(action, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedActionContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args: {},
      returnValue: async (result: any) => {
        return { ok: true, data: result }
      },
    }
  },
})

export const workspaceMutation = customMutation(mutation, {
  args: { workspaceId: v.string(), idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    const { cachedResponse, commitIdempotency } = await checkIdempotency(ctx, args.idempotencyKey)
    return {
      ctx: { ...ctx, ...auth, now: Date.now(), cachedResponse },
      args,
      returnValue: async (result: any) => {
        if (commitIdempotency) await commitIdempotency(result)
        return { ok: true, data: result }
      },
    }
  },
})

/**
 * Zod Wrappers (Flat implementation to avoid type conflicts)
 */
export const zAuthenticatedQuery = zCustomQuery(query, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedContext(ctx)
    return { ctx: { ...ctx, ...auth }, args: {} }
  },
})

export const zWorkspaceQuery = zCustomQuery(query, {
  args: { workspaceId: v.string() },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    return { ctx: { ...ctx, ...auth }, args }
  },
})

export const zWorkspaceQueryActive = zCustomQuery(query, {
  args: { workspaceId: v.string() },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    return { ctx: { ...ctx, ...auth, db: wrapDatabaseActive(ctx.db) }, args }
  },
})

export const zAuthenticatedMutation = zCustomMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    const { cachedResponse, commitIdempotency } = await checkIdempotency(ctx, args.idempotencyKey)
    return {
      ctx: { ...ctx, ...auth, now: Date.now(), cachedResponse },
      args,
      returnValue: async (result: any) => {
        if (commitIdempotency) await commitIdempotency(result)
        return { ok: true, data: result }
      },
    }
  },
})

export const zWorkspaceMutation = zCustomMutation(mutation, {
  args: { workspaceId: v.string(), idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    const { cachedResponse, commitIdempotency } = await checkIdempotency(ctx, args.idempotencyKey)
    return {
      ctx: { ...ctx, ...auth, now: Date.now(), cachedResponse },
      args,
      returnValue: async (result: any) => {
        if (commitIdempotency) await commitIdempotency(result)
        return { ok: true, data: result }
      },
    }
  },
})

export const zAuthenticatedAction = zCustomAction(action, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedActionContext(ctx)
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args: {},
      returnValue: async (result: any) => {
        return { ok: true, data: result }
      },
    }
  },
})

export const zWorkspaceAction = zCustomAction(action, {
  args: { workspaceId: v.string() },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedActionContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args,
      returnValue: async (result: any) => {
        return { ok: true, data: result }
      },
    }
  },
})

export const zWorkspacePaginatedQuery = zCustomQuery(query, {
  args: { workspaceId: v.string(), ...PaginationValidators },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    return { ctx: { ...ctx, ...auth }, args }
  },
})

export const zWorkspacePaginatedQueryActive = zCustomQuery(query, {
  args: { workspaceId: v.string(), ...PaginationValidators },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }
    return { ctx: { ...ctx, ...auth, db: wrapDatabaseActive(ctx.db) }, args }
  },
})

export const zAdminQuery = zCustomQuery(query, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    return { ctx: { ...ctx, ...auth }, args: {} }
  },
})

export const zAdminMutation = zCustomMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    const { cachedResponse, commitIdempotency } = await checkIdempotency(ctx, args.idempotencyKey)
    return {
      ctx: { ...ctx, ...auth, now: Date.now(), cachedResponse },
      args,
      returnValue: async (result: any) => {
        if (commitIdempotency) await commitIdempotency(result)
        return { ok: true, data: result }
      },
    }
  },
})

export const zAdminAction = zCustomAction(action, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedActionContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args: {},
      returnValue: async (result: any) => {
        return { ok: true, data: result }
      },
    }
  },
})
