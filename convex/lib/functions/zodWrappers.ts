import {
  zCustomQuery,
  zCustomMutation,
  zCustomAction,
} from 'convex-helpers/server/zod4'
import { query, mutation, action } from '../../_generated/server'
import { v } from 'convex/values'
import { Errors } from '../../errors'
import { getAuthenticatedContext, getAuthenticatedActionContext } from './auth'
import { checkIdempotency, withIdempotencyReplay } from './idempotency'
import type { IdempotencyResponse, MutationHandler } from './types'
import { wrapDatabaseActive } from './softDeleteDb'
import { PaginationValidators } from './pagination'

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

const _zAuthenticatedMutationBase = zCustomMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args) => {
    const [auth, { cachedResponse, commitIdempotency }] = await Promise.all([
      getAuthenticatedContext(ctx),
      checkIdempotency(ctx, args.idempotencyKey),
    ])
    return {
      ctx: { ...ctx, ...auth, now: Date.now(), cachedResponse },
      args,
      onSuccess: commitIdempotency
        ? async ({ result }: { result: unknown }) => {
            await commitIdempotency(result as IdempotencyResponse)
          }
        : undefined,
    }
  },
})

export const zAuthenticatedMutation = ((
  opts: Parameters<typeof _zAuthenticatedMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _zAuthenticatedMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _zAuthenticatedMutationBase

const _zWorkspaceMutationBase = zCustomMutation(mutation, {
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
      onSuccess: commitIdempotency
        ? async ({ result }: { result: unknown }) => {
            await commitIdempotency(result as IdempotencyResponse)
          }
        : undefined,
    }
  },
})

export const zWorkspaceMutation = ((
  opts: Parameters<typeof _zWorkspaceMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _zWorkspaceMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _zWorkspaceMutationBase

export const zAuthenticatedAction = zCustomAction(action, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedActionContext(ctx)
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args: {},
      returnValue: async (result: unknown) => {
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
      returnValue: async (result: unknown) => {
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

const _zAdminMutationBase = zCustomMutation(mutation, {
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
      onSuccess: commitIdempotency
        ? async ({ result }: { result: unknown }) => {
            await commitIdempotency(result as IdempotencyResponse)
          }
        : undefined,
    }
  },
})

export const zAdminMutation = ((
  opts: Parameters<typeof _zAdminMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _zAdminMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _zAdminMutationBase

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
      returnValue: async (result: unknown) => {
        return { ok: true, data: result }
      },
    }
  },
})
