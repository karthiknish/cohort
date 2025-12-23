/**
 * Simple in-memory rate limiter using token bucket algorithm.
 * Suitable for single-instance deployments. For distributed systems,
 * consider using Redis-based rate limiting.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

interface RateLimitBucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, RateLimitBucket>()

// Cleanup old buckets every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
const BUCKET_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

let cleanupScheduled = false

function scheduleCleanup() {
  if (cleanupScheduled) return
  cleanupScheduled = true
  
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (now - bucket.lastRefill > BUCKET_EXPIRY_MS) {
        buckets.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)
}

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining tokens
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetMs: number } {
  scheduleCleanup()
  
  const now = Date.now()
  let bucket = buckets.get(key)
  
  if (!bucket) {
    // Create new bucket with full tokens
    bucket = {
      tokens: config.maxRequests - 1, // -1 for current request
      lastRefill: now,
    }
    buckets.set(key, bucket)
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetMs: config.windowMs,
    }
  }
  
  // Calculate token refill based on elapsed time
  const elapsed = now - bucket.lastRefill
  const refillRate = config.maxRequests / config.windowMs
  const tokensToAdd = Math.floor(elapsed * refillRate)
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
  }
  
  // Check if request is allowed
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetMs: Math.ceil((1 - bucket.tokens % 1) / refillRate),
    }
  }
  
  // Rate limited
  const timeUntilRefill = Math.ceil((1 - bucket.tokens) / refillRate)
  return {
    allowed: false,
    remaining: 0,
    resetMs: timeUntilRefill,
  }
}

/**
 * Create a rate limit key from request context
 */
export function createRateLimitKey(
  endpoint: string,
  identifier: string | null
): string {
  // Use endpoint + identifier (IP or user ID)
  return `${endpoint}::${identifier || 'anonymous'}`
}

/**
 * Preset rate limit configurations for different operation types
 */
export const RATE_LIMITS = {
  /** Standard API operations - generous limits */
  standard: {
    maxRequests: 100,
    windowMs: 60_000, // 1 minute
  },
  /** Sensitive operations like login, password reset */
  sensitive: {
    maxRequests: 10,
    windowMs: 60_000, // 1 minute
  },
  /** Very sensitive operations like account deletion */
  critical: {
    maxRequests: 3,
    windowMs: 60_000, // 1 minute
  },
  /** Bulk operations */
  bulk: {
    maxRequests: 20,
    windowMs: 60_000, // 1 minute
  },
} as const

export type RateLimitPreset = keyof typeof RATE_LIMITS
