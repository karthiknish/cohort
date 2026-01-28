import { v } from 'convex/values'
import { mutation, internalMutation } from './_generated/server'

/**
 * API Idempotency - prevents duplicate request processing
 * 
 * Flow:
 * 1. checkAndClaim - Atomically check if key exists, claim if new
 * 2. complete - Mark as completed with response data
 * 3. release - Delete pending record on error
 */

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check if an idempotency key exists and claim it if new.
 * Returns: { type: 'new' } | { type: 'pending' } | { type: 'completed', response, status }
 */
export const checkAndClaim = mutation({
  args: {
    key: v.string(),
    requestId: v.string(),
    method: v.string(),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up existing record
    const existing = await ctx.db
      .query('apiIdempotency')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique()

    if (existing) {
      if (existing.status === 'pending') {
        // Check if it's stale (older than 5 minutes) - auto-release stale locks
        const staleThreshold = Date.now() - 5 * 60 * 1000
        if (existing.createdAtMs < staleThreshold) {
          // Stale pending request - delete and allow new
          await ctx.db.delete(existing._id)
        } else {
          return { type: 'pending' as const }
        }
      } else if (existing.status === 'completed') {
        return {
          type: 'completed' as const,
          response: existing.response,
          httpStatus: existing.httpStatus,
        }
      }
    }

    // Claim the key
    await ctx.db.insert('apiIdempotency', {
      key: args.key,
      status: 'pending',
      requestId: args.requestId,
      method: args.method,
      path: args.path,
      response: null,
      httpStatus: null,
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    })

    return { type: 'new' as const }
  },
})

/**
 * Mark an idempotency record as completed with the response.
 * Response can be any JSON-serializable value (for caching API responses).
 */
export const complete = mutation({
  args: {
    key: v.string(),
    response: v.union(
      v.null(),
      v.boolean(),
      v.number(),
      v.string(),
      v.array(v.any()), // Arrays of any JSON-serializable values
      v.record(v.string(), v.any()) // Objects with string keys
    ),
    httpStatus: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('apiIdempotency')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique()

    if (!existing) {
      // Record was already cleaned up, create a completed one
      await ctx.db.insert('apiIdempotency', {
        key: args.key,
        status: 'completed',
        requestId: null,
        method: null,
        path: null,
        response: args.response,
        httpStatus: args.httpStatus,
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      })
      return { ok: true }
    }

    await ctx.db.patch(existing._id, {
      status: 'completed',
      response: args.response,
      httpStatus: args.httpStatus,
      updatedAtMs: Date.now(),
    })

    return { ok: true }
  },
})

/**
 * Release/delete an idempotency record (on error or cleanup).
 */
export const release = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('apiIdempotency')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    return { ok: true }
  },
})

/**
 * Cleanup old idempotency records (called by scheduled job).
 */
export const cleanupOldRecords = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - IDEMPOTENCY_TTL_MS

    // Get old records in batches
    const oldRecords = await ctx.db
      .query('apiIdempotency')
      .filter((q) => q.lt(q.field('createdAtMs'), cutoff))
      .take(500)

    let deleted = 0
    for (const record of oldRecords) {
      await ctx.db.delete(record._id)
      deleted++
    }

    return { deleted }
  },
})
