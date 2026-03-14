import type { ActionCtx } from './_generated/server'
import { api } from '/_generated/api'
import { Errors } from './errors'
import {
  buildGeminiRateLimitKey,
  formatGeminiRateLimitMessage,
  GEMINI_RATE_LIMITS,
  type GeminiRateLimitName,
} from '../src/lib/geminiRateLimits'

type GeminiActionRateLimitContext = Pick<ActionCtx, 'runMutation'>

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
  const result = await ctx.runMutation(api.rateLimitApi.limit, {
    name: `gemini.${args.name}`,
    key: buildGeminiRateLimitKey(args),
    count: args.count,
    config: {
      kind: 'fixed window',
      rate: config.maxRequests,
      period: config.windowMs,
    },
  })

  if (!result.ok) {
    throw Errors.rateLimit.tooManyRequests(
      formatGeminiRateLimitMessage(result.retryAfterMs ?? config.windowMs),
    )
  }
}