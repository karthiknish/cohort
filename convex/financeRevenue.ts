import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw new Error('Unauthorized')
  }
}

function now() {
  return Date.now()
}

/**
 * Get revenue record by legacyId (no auth - server-side use).
 * Used by finance-sync to check existing values before increment.
 */
export const getByLegacyId = query({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    // No auth required - called from server-side code
    const row = await ctx.db
      .query('financeRevenue')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) return null

    return {
      legacyId: row.legacyId,
      clientId: row.clientId,
      period: row.period,
      label: row.label,
      revenue: row.revenue,
      operatingExpenses: row.operatingExpenses,
      currency: row.currency,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  },
})

/**
 * Upsert revenue record (no auth - server-side use).
 * Used by finance-sync to record invoice revenue.
 */
export const upsertServer = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    clientId: v.union(v.string(), v.null()),
    period: v.string(),
    label: v.union(v.string(), v.null()),
    revenue: v.number(),
    operatingExpenses: v.number(),
    currency: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    // No auth required - called from server-side code
    const timestamp = now()

    const existing = await ctx.db
      .query('financeRevenue')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        clientId: args.clientId,
        period: args.period,
        label: args.label,
        revenue: args.revenue,
        operatingExpenses: args.operatingExpenses,
        currency: args.currency,
        updatedAt: timestamp,
      })

      return { ok: true, created: false }
    }

    await ctx.db.insert('financeRevenue', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      clientId: args.clientId,
      period: args.period,
      label: args.label,
      revenue: args.revenue,
      operatingExpenses: args.operatingExpenses,
      currency: args.currency,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return { ok: true, created: true }
  },
})

export const list = query({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 36, 1), 100)

    const rows = await ctx.db
      .query('financeRevenue')
      .withIndex('by_workspaceId', (qIndex) => qIndex.eq('workspaceId', args.workspaceId))
      .collect()

    const clientId = args.clientId ?? undefined

    const filtered = rows.filter((row) => {
      if (clientId === undefined) return true
      return row.clientId === clientId
    })

    filtered.sort((a, b) => {
      if (a.period !== b.period) return a.period.localeCompare(b.period)
      return a.legacyId.localeCompare(b.legacyId)
    })

    const revenue = filtered.slice(0, limit).map((row) => ({
      legacyId: row.legacyId,
      clientId: row.clientId,
      period: row.period,
      label: row.label,
      revenue: row.revenue,
      operatingExpenses: row.operatingExpenses,
      currency: row.currency,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return { revenue }
  },
})

export const upsert = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.optional(v.string()),

    clientId: v.union(v.string(), v.null()),
    period: v.string(),
    label: v.union(v.string(), v.null()),
    revenue: v.number(),
    operatingExpenses: v.number(),
    currency: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = now()

    if (args.legacyId) {
      const existing = await ctx.db
        .query('financeRevenue')
        .withIndex('by_workspaceId_legacyId', (qIndex) =>
          qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId!)
        )
        .unique()

      if (existing) {
        await ctx.db.patch(existing._id, {
          clientId: args.clientId,
          period: args.period,
          label: args.label,
          revenue: args.revenue,
          operatingExpenses: args.operatingExpenses,
          currency: args.currency,
          updatedAt: timestamp,
        })

        return { ok: true }
      }

      await ctx.db.insert('financeRevenue', {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        clientId: args.clientId,
        period: args.period,
        label: args.label,
        revenue: args.revenue,
        operatingExpenses: args.operatingExpenses,
        currency: args.currency,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      return { ok: true }
    }

    const legacyId = crypto.randomUUID()
    await ctx.db.insert('financeRevenue', {
      workspaceId: args.workspaceId,
      legacyId,
      clientId: args.clientId,
      period: args.period,
      label: args.label,
      revenue: args.revenue,
      operatingExpenses: args.operatingExpenses,
      currency: args.currency,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return { ok: true, legacyId }
  },
})

export const remove = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const existing = await ctx.db
      .query('financeRevenue')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    return { ok: true }
  },
})
