import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { RateLimitConfig, RateLimitResult, checkRateLimit } from './rate-limiter'

let redisClient: Redis | null = null

function getRedis() {
  if (redisClient) return redisClient

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    return redisClient
  }
  return null
}

/**
 * Check if a request should be rate limited (Distributed via Upstash Redis)
 * Use this for critical paths or when running in multi-instance environments.
 */
export async function checkDistributedRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedis()

  // Fallback to local memory limiter if Redis is not configured
  if (!redis) {
    console.warn('[rate-limiter] Upstash Redis not configured, falling back to local memory')
    return checkRateLimit(key, config)
  }

  const now = Date.now()

  try {
    // Create a new Ratelimit instance for this specific config
    // Note: Upstash Ratelimit expects window as a duration string (e.g. "60 s")
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(config.maxRequests, `${Math.ceil(config.windowMs / 1000)} s`),
      analytics: true,
      prefix: 'ratelimit',
    })

    const identifier = key
    const result = await limiter.limit(identifier)

    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetMs: Math.max(0, result.reset - now),
      resetAt: result.reset,
    }
  } catch (error) {
    console.error('[rate-limiter] Distributed check failed, falling back to in-memory', error)
    return checkRateLimit(key, config)
  }
}
