// Simple in-memory rate limiter to replace Upstash
// This is a basic implementation and will reset on server restart

interface RateLimitBucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, RateLimitBucket>()

// Default: 10 requests per 10 seconds
const LIMIT = 10
const WINDOW_MS = 10 * 1000

export async function checkRateLimit(identifier: string) {
  const now = Date.now()
  const bucket = buckets.get(identifier)

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS
    })
    return { 
      success: true, 
      limit: LIMIT, 
      remaining: LIMIT - 1, 
      reset: now + WINDOW_MS 
    }
  }

  if (bucket.count < LIMIT) {
    bucket.count++
    return { 
      success: true, 
      limit: LIMIT, 
      remaining: LIMIT - bucket.count, 
      reset: bucket.resetAt 
    }
  }

  return { 
    success: false, 
    limit: LIMIT, 
    remaining: 0, 
    reset: bucket.resetAt 
  }
}
