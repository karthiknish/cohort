import { customMutation } from 'convex-helpers/server/customFunctions'
import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { Errors } from '../../errors'
import { getAuthenticatedContext } from './auth'
import { checkIdempotency, withIdempotencyReplay } from './idempotency'
import type { IdempotencyResponse, MutationHandler } from './types'

const _authenticatedMutationBase = customMutation(mutation, {
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

export const authenticatedMutation = ((
  opts: Parameters<typeof _authenticatedMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _authenticatedMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _authenticatedMutationBase
const _adminMutationBase = customMutation(mutation, {
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

export const adminMutation = ((
  opts: Parameters<typeof _adminMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _adminMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _adminMutationBase

const _workspaceMutationBase = customMutation(mutation, {
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

export const workspaceMutation = ((
  opts: Parameters<typeof _workspaceMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _workspaceMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _workspaceMutationBase
