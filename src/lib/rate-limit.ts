import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create a new ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis.
   *
   * @default "@upstash/ratelimit"
   */
  prefix: '@upstash/ratelimit',
})

export async function checkRateLimit(identifier: string) {
  // If Redis env vars are not set, skip rate limiting (dev mode fallback)
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set')
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier)
    return { success, limit, remaining, reset }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // Fail open if rate limiting service is down
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }
}
