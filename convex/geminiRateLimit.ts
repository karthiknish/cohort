import type { ActionCtx } from './_generated/server'
import { internalMutation } from './_generated/server'
import { internal } from '/_generated/api'
import { v } from 'convex/values'
import { Errors } from './errors'
import { rateLimiter } from './rateLimit'
import {
  buildGeminiRateLimitKey,
  formatGeminiRateLimitMessage,
  GEMINI_RATE_LIMITS,
  type GeminiRateLimitName,
} from '../src/lib/geminiRateLimits'

type GeminiActionRateLimitContext = Pick<ActionCtx, 'runMutation'>

const limitConfigValidator = v.object({
  kind: v.literal('fixed window'),
  rate: v.number(),
  period: v.number(),
  capacity: v.optional(v.number()),
  shards: v.optional(v.number()),
  start: v.optional(v.number()),
})

/** Internal mutation keeps action callers off the large public `api` type (TS2589). */
export const applyGeminiRateLimitInternal = internalMutation({
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

export async function enforceGeminiActionRateLimit(
  ctx: GeminiActionRateLimitContext,
  args: {
    name: GeminiRateLimitName
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

  const config = GEMINI_RATE_LIMITS[args.name]
  const result = (await ctx.runMutation(
    internal.geminiRateLimit.applyGeminiRateLimitInternal,
    {
      name: `gemini.${args.name}`,
      key: buildGeminiRateLimitKey(args),
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
      formatGeminiRateLimitMessage(result.retryAfterMs ?? config.windowMs),
    )
  }
}
