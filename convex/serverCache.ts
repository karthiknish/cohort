import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function nowMs() {
  return Date.now()
}

/**
 * Get a cache entry by its key hash.
 * Returns null if not found or expired.
 */
export const get = query({
  args: {
    keyHash: v.string(),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query('serverCache')
      .withIndex('by_keyHash', (q) => q.eq('keyHash', args.keyHash))
      .unique()

    if (!entry) return null

    // Check if expired
    if (entry.expiresAtMs <= nowMs()) {
      return null
    }

    return { value: entry.value }
  },
})

/**
 * Set a cache entry.
 */
export const set = mutation({
  args: {
    keyHash: v.string(),
    key: v.string(),
    value: v.string(),
    ttlMs: v.number(),
  },
  handler: async (ctx, args) => {
    const timestamp = nowMs()
    const expiresAtMs = timestamp + args.ttlMs

    const existing = await ctx.db
      .query('serverCache')
      .withIndex('by_keyHash', (q) => q.eq('keyHash', args.keyHash))
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        key: args.key,
        value: args.value,
        expiresAtMs,
        updatedAtMs: timestamp,
      })
    } else {
      await ctx.db.insert('serverCache', {
        keyHash: args.keyHash,
        key: args.key,
        value: args.value,
        expiresAtMs,
        createdAtMs: timestamp,
        updatedAtMs: timestamp,
      })
    }

    return { ok: true }
  },
})

/**
 * Invalidate cache entries by pattern.
 * Supports exact key hash, prefix with '*', or '*' for all.
 */
export const invalidate = mutation({
  args: {
    pattern: v.string(),
    keyHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let deleted = 0

    // Delete all
    if (!args.pattern || args.pattern === '*') {
      const entries = await ctx.db.query('serverCache').collect()
      for (const entry of entries) {
        await ctx.db.delete(entry._id)
        deleted++
      }
      return { deleted }
    }

    // Prefix match
    if (args.pattern.endsWith('*')) {
      const prefix = args.pattern.slice(0, -1)
      const entries = await ctx.db
        .query('serverCache')
        .withIndex('by_key')
        .collect()

      for (const entry of entries) {
        if (entry.key.startsWith(prefix)) {
          await ctx.db.delete(entry._id)
          deleted++
        }
      }
      return { deleted }
    }

    // Exact key hash
    if (args.keyHash) {
      const keyHash = args.keyHash
      const entry = await ctx.db
        .query('serverCache')
        .withIndex('by_keyHash', (q) => q.eq('keyHash', keyHash))
        .unique()

      if (entry) {
        await ctx.db.delete(entry._id)
        deleted = 1
      }
    }

    return { deleted }
  },
})

/**
 * Clean up expired cache entries.
 * Called periodically by cron or on-demand.
 */
export const cleanupExpired = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 500, 1000)
    const timestamp = nowMs()

    const expired = await ctx.db
      .query('serverCache')
      .withIndex('by_expiresAtMs', (q) => q.lt('expiresAtMs', timestamp))
      .take(limit)

    let deleted = 0
    for (const entry of expired) {
      await ctx.db.delete(entry._id)
      deleted++
    }

    return { deleted, hasMore: expired.length >= limit }
  },
})
