import type { Id } from '/_generated/dataModel'
import { v } from 'convex/values'

import { Errors, isAppError } from './errors'
import { mutation, query } from './_generated/server'

function nowMs() {
  return Date.now()
}

function throwServerCacheError(operation: string, error: unknown, context?: Record<string, unknown>): never {
  console.error(`[serverCache:${operation}]`, context ?? {}, error)

  if (isAppError(error)) {
    throw error
  }

  throw Errors.base.internal('Server cache operation failed')
}

/**
 * Get a cache entry by its key hash.
 * Returns null if not found or expired.
 * Server-side only - no auth required.
 */
export const get = query({
  args: {
    keyHash: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({ value: v.string() })
  ),
  handler: async (ctx, args) => {
    try {
      const entry = await ctx.db
        .query('serverCache')
        .withIndex('by_keyHash', (q) => q.eq('keyHash', args.keyHash))
        .unique()

      if (!entry) return null
      if (entry.expiresAtMs <= nowMs()) {
        return null
      }

      return { value: entry.value }
    } catch (error) {
      throwServerCacheError('get', error, { keyHash: args.keyHash })
    }
  },
})

/**
 * Set a cache entry.
 * Server-side only - no auth required.
 */
export const set = mutation({
  args: {
    keyHash: v.string(),
    key: v.string(),
    value: v.string(),
    ttlMs: v.number(),
  },
  returns: v.object({
    ok: v.literal(true),
  }),
  handler: async (ctx, args) => {
    try {
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

      return { ok: true } as const
    } catch (error) {
      throwServerCacheError('set', error, { keyHash: args.keyHash, key: args.key })
    }
  },
})

/**
 * Invalidate cache entries by pattern.
 * Supports exact key hash, prefix with '*', or '*' for all.
 * Server-side only - no auth required.
 */
export const invalidate = mutation({
  args: {
    pattern: v.string(),
    keyHash: v.optional(v.string()),
    limit: v.optional(v.number()),
    continuation: v.optional(v.string()),
  },
  returns: v.object({
    deleted: v.number(),
    hasMore: v.boolean(),
    continuation: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    try {
      let deleted = 0
      const limit = Math.min(Math.max(args.limit ?? 250, 1), 1000)

      const deleteEntries = async (entries: Array<{ _id: Id<'serverCache'>; key: string }>) => {
        let nextContinuation: string | null = null

        for (const entry of entries.slice(0, limit)) {
          await ctx.db.delete(entry._id)
          deleted += 1
          nextContinuation = entry.key
        }

        return nextContinuation
      }

      if (!args.pattern || args.pattern === '*') {
        const continuationKey = args.continuation
        const query = continuationKey
          ? ctx.db.query('serverCache').withIndex('by_key', (q) => q.gt('key', continuationKey))
          : ctx.db.query('serverCache').withIndex('by_key', (q) => q)
        const entries = await query.take(limit + 1)
        const continuation = await deleteEntries(entries)

        return {
          deleted,
          hasMore: entries.length > limit,
          continuation: entries.length > limit ? continuation : null,
        }
      }

      if (args.pattern.endsWith('*')) {
        const prefix = args.pattern.slice(0, -1)
        const continuationKey = args.continuation
        const query = continuationKey
          ? ctx.db.query('serverCache').withIndex('by_key', (q) => q.gt('key', continuationKey))
          : ctx.db.query('serverCache').withIndex('by_key', (q) => q.gte('key', prefix))
        const entries = await query.take(limit + 1)
        const matchingEntries = entries.filter((entry) => entry.key.startsWith(prefix))
        const continuation = await deleteEntries(matchingEntries)
        const hasMore = Boolean(
          matchingEntries.length > limit
          || (matchingEntries.length === limit && entries.length > limit && entries[limit]?.key.startsWith(prefix))
        )

        return {
          deleted,
          hasMore,
          continuation: hasMore ? continuation : null,
        }
      }

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

      return { deleted, hasMore: false, continuation: null }
    } catch (error) {
      throwServerCacheError('invalidate', error, {
        pattern: args.pattern,
        keyHash: args.keyHash ?? null,
        continuation: args.continuation ?? null,
      })
    }
  },
})

/**
 * Clean up expired cache entries.
 * Called periodically by cron or on-demand.
 * Server-side only - no auth required.
 */
export const cleanupExpired = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.object({
    deleted: v.number(),
    hasMore: v.boolean(),
  }),
  handler: async (ctx, args) => {
    try {
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
    } catch (error) {
      throwServerCacheError('cleanupExpired', error, { limit: args.limit ?? null })
    }
  },
})
