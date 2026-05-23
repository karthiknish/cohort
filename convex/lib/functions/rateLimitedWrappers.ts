import { customMutation } from 'convex-helpers/server/customFunctions'
import {
  zCustomMutation,
} from 'convex-helpers/server/zod4'
import { mutation, type MutationCtx } from '../../_generated/server'
import { v } from 'convex/values'
import { Errors } from '../../errors'
import { rateLimiter } from '../../rateLimit'
import { getAuthenticatedContext, getIdentityContext } from './auth'
import { checkIdempotency, withIdempotencyReplay } from './idempotency'
import type { IdempotencyResponse, MutationHandler } from './types'

export const RateLimitPresets = {
  standard: 'standard' as const,
  sensitive: 'sensitive' as const,
  critical: 'critical' as const,
  bulk: 'bulk' as const,
} as const

export type RateLimitPreset = keyof typeof RateLimitPresets

/**
 * Helper to check rate limits using the configured rate limiter.
 * Returns true if allowed, throws rate limit error if exceeded.
 */
async function checkRateLimit(
  ctx: MutationCtx,
  key: string,
  preset: RateLimitPreset = 'standard'
): Promise<void> {
  const status = await rateLimiter.limit(ctx, preset, { key })

  if (!status.ok) {
    throw Errors.rateLimit.tooManyRequests(`Rate limit exceeded. Retry after ${status.retryAfter ?? 60} seconds.`)
  }
}

/**
 * Rate-limited mutation wrappers.
 * These add rate limiting on top of the standard auth wrappers.
 * Rate limiting is done per-user (keyed by user legacyId).
 *
 * Usage:
 * ```ts
 * export const mySensitiveMutation = rateLimitedAuthenticatedMutation({
 *   args: { ... },
 *   rateLimit: 'sensitive', // or 'critical', 'standard', 'bulk'
 *   handler: async (ctx, args) => { ... }
 * })
 * ```
 */

type RateLimitedConfig = {
  rateLimit?: RateLimitPreset
}

const _rateLimitedAuthenticatedMutationBase = customMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args, config: RateLimitedConfig) => {
    const auth = await getAuthenticatedContext(ctx)

    if (config.rateLimit) {
      await checkRateLimit(ctx, auth.legacyId, config.rateLimit)
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

export const rateLimitedAuthenticatedMutation = ((
  opts: Parameters<typeof _rateLimitedAuthenticatedMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _rateLimitedAuthenticatedMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _rateLimitedAuthenticatedMutationBase

const _rateLimitedWorkspaceMutationBase = customMutation(mutation, {
  args: { workspaceId: v.string(), idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args, config: RateLimitedConfig) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }

    if (config.rateLimit) {
      await checkRateLimit(ctx, `${auth.legacyId}:${args.workspaceId}`, config.rateLimit)
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

export const rateLimitedWorkspaceMutation = ((
  opts: Parameters<typeof _rateLimitedWorkspaceMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _rateLimitedWorkspaceMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _rateLimitedWorkspaceMutationBase

const _rateLimitedAdminMutationBase = customMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args, config: RateLimitedConfig) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }

    if (config.rateLimit) {
      await checkRateLimit(ctx, auth.legacyId, config.rateLimit)
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

export const rateLimitedAdminMutation = ((
  opts: Parameters<typeof _rateLimitedAdminMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _rateLimitedAdminMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _rateLimitedAdminMutationBase

/**
 * Zod-based rate-limited mutation wrappers.
 */
const _zRateLimitedAuthenticatedMutationBase = zCustomMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args, config: RateLimitedConfig) => {
    const auth = await getAuthenticatedContext(ctx)

    if (config.rateLimit) {
      await checkRateLimit(ctx, auth.legacyId, config.rateLimit)
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

export const zRateLimitedAuthenticatedMutation = ((
  opts: Parameters<typeof _zRateLimitedAuthenticatedMutationBase>[0] & {
    handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
  },
) =>
  _zRateLimitedAuthenticatedMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _zRateLimitedAuthenticatedMutationBase

const _zRateLimitedIdentityMutationBase = zCustomMutation(mutation, {
  args: { idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args, config: RateLimitedConfig) => {
    const identity = await getIdentityContext(ctx)

    if (config.rateLimit) {
      await checkRateLimit(ctx, identity.legacyId, config.rateLimit)
    }

    const { cachedResponse, commitIdempotency } = await checkIdempotency(ctx, args.idempotencyKey)
    return {
      ctx: { ...ctx, ...identity, now: Date.now(), cachedResponse },
      args,
      onSuccess: commitIdempotency
        ? async ({ result }: { result: unknown }) => {
            await commitIdempotency(result as IdempotencyResponse)
          }
        : undefined,
    }
  },
})

export const zRateLimitedIdentityMutation = ((opts: Parameters<typeof _zRateLimitedIdentityMutationBase>[0] & {
  handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
}) =>
  _zRateLimitedIdentityMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _zRateLimitedIdentityMutationBase

const _zRateLimitedWorkspaceMutationBase = zCustomMutation(mutation, {
  args: { workspaceId: v.string(), idempotencyKey: v.optional(v.string()) },
  input: async (ctx, args, config: RateLimitedConfig) => {
    const auth = await getAuthenticatedContext(ctx)
    if (auth.user.role !== 'admin' && auth.agencyId !== args.workspaceId) {
      throw Errors.auth.workspaceAccessDenied()
    }

    if (config.rateLimit) {
      await checkRateLimit(ctx, `${auth.legacyId}:${args.workspaceId}`, config.rateLimit)
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

export const zRateLimitedWorkspaceMutation = ((opts: Parameters<typeof _zRateLimitedWorkspaceMutationBase>[0] & {
  handler: MutationHandler<{ cachedResponse?: IdempotencyResponse }, unknown, unknown>
}) =>
  _zRateLimitedWorkspaceMutationBase({
    ...opts,
    handler: withIdempotencyReplay(opts.handler),
  })) as unknown as typeof _zRateLimitedWorkspaceMutationBase
