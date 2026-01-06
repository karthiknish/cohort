import { adminDb } from './firebase-admin'
import { RateLimitConfig, RateLimitResult, checkRateLimit } from './rate-limiter'

interface RateLimitBucket {
  tokens: number
  lastRefill: number
}

/**
 * Check if a request should be rate limited (Distributed via Firestore)
 * Use this for critical paths or when running in multi-instance environments.
 */
export async function checkDistributedRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  // Sanitize key for Firestore doc ID
  const safeKey = key.replace(/\//g, '_')
  const docRef = adminDb.collection('_rateLimits').doc(safeKey)
  
  try {
    return await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef)
      const data = doc.data()
      
      let bucket: RateLimitBucket
      const refillRate = config.maxRequests / config.windowMs
      
      if (!doc.exists || !data) {
        bucket = {
          tokens: config.maxRequests - 1,
          lastRefill: now,
        }
        transaction.set(docRef, {
          ...bucket,
          expiresAt: now + config.windowMs * 5 // TTL for cleanup
        })
        return {
          allowed: true,
          limit: config.maxRequests,
          remaining: bucket.tokens,
          resetMs: config.windowMs,
          resetAt: now + config.windowMs,
        }
      }
      
      bucket = {
        tokens: Number(data.tokens),
        lastRefill: Number(data.lastRefill),
      }
      
      const elapsed = now - bucket.lastRefill
      const tokensToAdd = Math.floor(elapsed * refillRate)
      
      if (tokensToAdd > 0) {
        bucket.tokens = Math.min(config.maxRequests, bucket.tokens + tokensToAdd)
        bucket.lastRefill = now
      }
      
      if (bucket.tokens >= 1) {
        bucket.tokens -= 1
        transaction.update(docRef, {
          ...bucket,
          expiresAt: now + config.windowMs * 5
        })
        return {
          allowed: true,
          limit: config.maxRequests,
          remaining: Math.floor(bucket.tokens),
          resetMs: Math.ceil((1 - (bucket.tokens % 1)) / refillRate) || 0,
          resetAt: now + config.windowMs,
        }
      }
      
      const timeUntilRefill = Math.ceil((1 - bucket.tokens) / refillRate)
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetMs: timeUntilRefill,
        resetAt: now + timeUntilRefill,
      }
    })
  } catch (error) {
    console.error('[rate-limiter] Distributed check failed, falling back to in-memory', error)
    return checkRateLimit(key, config)
  }
}
