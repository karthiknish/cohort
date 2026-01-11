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

export const list = query({
  args: {
    workspaceId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number()),
    cursorCreatedAt: v.optional(v.number()),
    cursorLegacyId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 200)

    const rows = await ctx.db
      .query('financeCosts')
      .withIndex('by_workspaceId', (qIndex) => qIndex.eq('workspaceId', args.workspaceId))
      .order('desc')
      .collect()

    const clientId = args.clientId ?? undefined

    const filtered = rows.filter((row) => {
      if (clientId === undefined) return true
      // Firestore route supports clientId filter with "in [clientId, null]"
      return row.clientId === clientId || row.clientId === null
    })

    filtered.sort((a, b) => {
      if (a.createdAt !== b.createdAt) return b.createdAt - a.createdAt
      return b.legacyId.localeCompare(a.legacyId)
    })

    let startIndex = 0
    if (typeof args.cursorCreatedAt === 'number' && args.cursorLegacyId) {
      startIndex = filtered.findIndex(
        (row) => row.createdAt === args.cursorCreatedAt && row.legacyId === args.cursorLegacyId
      )
      if (startIndex >= 0) startIndex += 1
      else startIndex = 0
    }

    const page = filtered.slice(startIndex, startIndex + limit + 1)
    const next = page.length > limit ? page[limit] : null

    const costs = page.slice(0, limit).map((row) => ({
      legacyId: row.legacyId,
      clientId: row.clientId,
      category: row.category,
      amount: row.amount,
      cadence: row.cadence,
      currency: row.currency,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return {
      costs,
      nextCursor: next ? { createdAt: next.createdAt, legacyId: next.legacyId } : null,
    }
  },
})

export const create = mutation({
  args: {
    workspaceId: v.string(),
    clientId: v.union(v.string(), v.null()),
    category: v.string(),
    amount: v.number(),
    cadence: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = now()
    const legacyId = crypto.randomUUID()

    await ctx.db.insert('financeCosts', {
      workspaceId: args.workspaceId,
      legacyId,
      clientId: args.clientId,
      category: args.category,
      amount: args.amount,
      cadence: args.cadence,
      currency: args.currency,
      createdBy: identity.subject,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    return { ok: true, legacyId }
  },
})

export const upsert = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.optional(v.string()),

    clientId: v.union(v.string(), v.null()),
    category: v.string(),
    amount: v.number(),
    cadence: v.string(),
    currency: v.string(),

    createdBy: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = now()

    if (args.legacyId) {
      const existing = await ctx.db
        .query('financeCosts')
        .withIndex('by_workspaceId_legacyId', (qIndex) =>
          qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId!)
        )
        .unique()

      if (existing) {
        await ctx.db.patch(existing._id, {
          clientId: args.clientId,
          category: args.category,
          amount: args.amount,
          cadence: args.cadence,
          currency: args.currency,
          updatedAt: timestamp,
        })

        return { ok: true }
      }

      await ctx.db.insert('financeCosts', {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        clientId: args.clientId,
        category: args.category,
        amount: args.amount,
        cadence: args.cadence,
        currency: args.currency,
        createdBy: args.createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      return { ok: true }
    }

    const legacyId = crypto.randomUUID()
    await ctx.db.insert('financeCosts', {
      workspaceId: args.workspaceId,
      legacyId,
      clientId: args.clientId,
      category: args.category,
      amount: args.amount,
      cadence: args.cadence,
      currency: args.currency,
      createdBy: args.createdBy,
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
      .query('financeCosts')
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
