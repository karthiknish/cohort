import type { ActionCtx } from '../../_generated/server'
import { internalMutation } from '../../_generated/server'
import { internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors } from '../../errors'
import { rateLimiter } from './rateLimit'
import {
  buildDeepSeekRateLimitKey,
  formatDeepSeekRateLimitMessage,
  DEEPSEEK_RATE_LIMITS,
  type DeepSeekRateLimitName,
} from '../../../src/lib/deepseekRateLimits'

type DeepSeekActionRateLimitContext = Pick<ActionCtx, 'runMutation'>

const limitConfigValidator = v.object({
  kind: v.literal('fixed window'),
  rate: v.number(),
  period: v.number(),
  capacity: v.optional(v.number()),
  shards: v.optional(v.number()),
  start: v.optional(v.number()),
})

/** Internal mutation keeps action callers off the large public `api` type (TS2589). */
export const applyDeepSeekRateLimitInternal = internalMutation({
  args: {
    name: v.string(),
    key: v.string(),
    count: v.optional(v.number()),
    config: limitConfigValidator,
  },
  returns: v.object({
    ok: v.boolean(),
    retryAfterMs: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const status = await rateLimiter.limit(ctx, args.name, {
      key: args.key,
      count: args.count,
      config: args.config,
    })

    return {
      ok: status.ok,
      retryAfterMs: status.retryAfter ?? null,
    }
  },
})

export async function enforceDeepSeekActionRateLimit(
  ctx: DeepSeekActionRateLimitContext,
  args: {
    name: DeepSeekRateLimitName
    userId?: string | null
    workspaceId?: string | null
    resourceId?: string | null
    scope?: string | null
    count?: number
  },
): Promise<void> {
  if (typeof args.count === 'number' && args.count <= 0) {
    return
  }

  const config = DEEPSEEK_RATE_LIMITS[args.name]
  const result = (await ctx.runMutation(
    internal.deepseekRateLimit.applyDeepSeekRateLimitInternal,
    {
      name: `deepseek.${args.name}`,
      key: buildDeepSeekRateLimitKey(args),
      count: args.count,
      config: {
        kind: 'fixed window' as const,
        rate: config.maxRequests,
        period: config.windowMs,
      },
    },
  )) as { ok: boolean; retryAfterMs: number | null }

  if (!result.ok) {
    throw Errors.rateLimit.tooManyRequests(
      formatDeepSeekRateLimitMessage(result.retryAfterMs ?? config.windowMs),
    )
  }
}
