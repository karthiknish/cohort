import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Get a single scheduler alert preference by provider ID.
 * No auth required - called from server-side scheduler code.
 */
export const get = query({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('schedulerAlertPreferences')
      .withIndex('by_providerId', (q) => q.eq('providerId', args.providerId))
      .unique()

    if (!row) return null

    return {
      providerId: row.providerId,
      failureThreshold: row.failureThreshold,
    }
  },
})

/**
 * List all scheduler alert preferences.
 * No auth required - called from server-side scheduler code.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('schedulerAlertPreferences').collect()
    
    const result: Record<string, { failureThreshold: number | null }> = {}
    for (const row of rows) {
      result[row.providerId] = { failureThreshold: row.failureThreshold }
    }
    return result
  },
})

/**
 * Upsert a scheduler alert preference.
 * No auth required - called from server-side scheduler code.
 */
export const upsert = mutation({
  args: {
    providerId: v.string(),
    failureThreshold: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    // Validate threshold
    if (args.failureThreshold !== null) {
      if (!Number.isFinite(args.failureThreshold) || args.failureThreshold < 0) {
        throw new Error('failureThreshold must be a non-negative number or null')
      }
    }

    const existing = await ctx.db
      .query('schedulerAlertPreferences')
      .withIndex('by_providerId', (q) => q.eq('providerId', args.providerId))
      .unique()

    const now = Date.now()

    if (existing) {
      await ctx.db.patch(existing._id, {
        failureThreshold: args.failureThreshold,
        updatedAtMs: now,
      })
      return { ok: true, created: false }
    }

    await ctx.db.insert('schedulerAlertPreferences', {
      providerId: args.providerId,
      failureThreshold: args.failureThreshold,
      createdAtMs: now,
      updatedAtMs: now,
    })

    return { ok: true, created: true }
  },
})
