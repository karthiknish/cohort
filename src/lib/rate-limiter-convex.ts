import { checkRateLimit, RateLimitConfig, RateLimitResult, RateLimitPreset, RATE_LIMITS } from './rate-limiter'
import { ConvexHttpClient } from 'convex/browser'

let convexClient: ConvexHttpClient | null = null

function getConvexUrl(): string | null {
  return process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL ?? null
}

function getClient(): ConvexHttpClient | null {
  if (convexClient) return convexClient
  const url = getConvexUrl()
  if (!url) return null
  convexClient = new ConvexHttpClient(url)
  return convexClient
}

export async function checkConvexRateLimit(
  key: string,
  configOrPreset: RateLimitPreset | RateLimitConfig
): Promise<RateLimitResult> {
  const config = typeof configOrPreset === 'string' ? RATE_LIMITS[configOrPreset] : configOrPreset

  const client = getClient()

  // If Convex isn't configured on the server, fall back to in-memory.
  if (!client) {
    return checkRateLimit(key, config)
  }

  try {
    const name = typeof configOrPreset === 'string' ? configOrPreset : `custom:${config.maxRequests}:${config.windowMs}`

    const result = (await client.mutation('rateLimitApi:limit' as any, {
      name,
      key,
      config:
        typeof configOrPreset === 'string'
          ? undefined
          : {
              kind: 'fixed window',
              rate: config.maxRequests,
              period: config.windowMs,
            },
    })) as { ok: boolean; retryAfterMs: number | null }

    if (result.ok) {
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: 0,
        resetMs: config.windowMs,
        resetAt: Date.now() + config.windowMs,
      }
    }

    const retryAfterMs = typeof result.retryAfterMs === 'number' ? result.retryAfterMs : config.windowMs
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetMs: retryAfterMs,
      resetAt: Date.now() + retryAfterMs,
    }
  } catch (error) {
    console.warn('[rate-limiter] Convex rate limit failed, falling back to in-memory', error)
    return checkRateLimit(key, config)
  }
}
