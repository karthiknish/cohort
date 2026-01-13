import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function now() {
  return Date.now()
}

const lineItemValidator = v.object({
  description: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
})

export const list = query({
  args: {
    workspaceId: v.string(),
    createdBy: v.optional(v.string()),
    vendorId: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200)

    const rows = await ctx.db
      .query('financePurchaseOrders')
      .withIndex('by_workspaceId', (qIndex) => qIndex.eq('workspaceId', args.workspaceId))
      .collect()

    let filtered = rows

    if (args.createdBy) {
      filtered = filtered.filter((row) => row.createdBy === args.createdBy)
    }

    if (args.vendorId) {
      filtered = filtered.filter((row) => row.vendorId === args.vendorId)
    }

    if (args.status) {
      filtered = filtered.filter((row) => row.status === args.status)
    }

    filtered.sort((a, b) => b.createdAt - a.createdAt)

    return {
      purchaseOrders: filtered.slice(0, limit).map((row) => ({
        legacyId: row.legacyId,
        number: row.number,
        status: row.status,
        vendorId: row.vendorId,
        vendorName: row.vendorName,
        currency: row.currency,
        items: row.items,
        totalAmount: row.totalAmount,
        notes: row.notes,
        requestedBy: row.requestedBy,
        submittedAt: row.submittedAt,
        approvedAt: row.approvedAt,
        rejectedAt: row.rejectedAt,
        decidedBy: row.decidedBy,
        decisionNote: row.decisionNote,
        orderedAt: row.orderedAt,
        receivedAt: row.receivedAt,
        createdBy: row.createdBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })),
    }
  },
})

export const getByLegacyId = query({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const row = await ctx.db
      .query('financePurchaseOrders')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) return null

    return {
      legacyId: row.legacyId,
      number: row.number,
      status: row.status,
      vendorId: row.vendorId,
      vendorName: row.vendorName,
      currency: row.currency,
      items: row.items,
      totalAmount: row.totalAmount,
      notes: row.notes,
      requestedBy: row.requestedBy,
      submittedAt: row.submittedAt,
      approvedAt: row.approvedAt,
      rejectedAt: row.rejectedAt,
      decidedBy: row.decidedBy,
      decisionNote: row.decisionNote,
      orderedAt: row.orderedAt,
      receivedAt: row.receivedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  },
})

export const upsert = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.optional(v.string()),

    number: v.union(v.string(), v.null()),
    status: v.string(),
    vendorId: v.union(v.string(), v.null()),
    vendorName: v.union(v.string(), v.null()),
    currency: v.string(),

    items: v.array(lineItemValidator),
    totalAmount: v.number(),

    notes: v.union(v.string(), v.null()),
    requestedBy: v.union(v.string(), v.null()),

    submittedAt: v.union(v.number(), v.null()),
    approvedAt: v.union(v.number(), v.null()),
    rejectedAt: v.union(v.number(), v.null()),
    decidedBy: v.union(v.string(), v.null()),
    decisionNote: v.union(v.string(), v.null()),
    orderedAt: v.union(v.number(), v.null()),
    receivedAt: v.union(v.number(), v.null()),

    createdBy: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = now()

    if (args.legacyId) {
      const existing = await ctx.db
        .query('financePurchaseOrders')
        .withIndex('by_workspaceId_legacyId', (qIndex) =>
          qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId!)
        )
        .unique()

      if (existing) {
        await ctx.db.patch(existing._id, {
          number: args.number,
          status: args.status,
          vendorId: args.vendorId,
          vendorName: args.vendorName,
          currency: args.currency,
          items: args.items,
          totalAmount: args.totalAmount,
          notes: args.notes,
          requestedBy: args.requestedBy,
          submittedAt: args.submittedAt,
          approvedAt: args.approvedAt,
          rejectedAt: args.rejectedAt,
          decidedBy: args.decidedBy,
          decisionNote: args.decisionNote,
          orderedAt: args.orderedAt,
          receivedAt: args.receivedAt,
          updatedAt: timestamp,
        })

        return { ok: true }
      }

      await ctx.db.insert('financePurchaseOrders', {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        number: args.number,
        status: args.status,
        vendorId: args.vendorId,
        vendorName: args.vendorName,
        currency: args.currency,
        items: args.items,
        totalAmount: args.totalAmount,
        notes: args.notes,
        requestedBy: args.requestedBy,
        submittedAt: args.submittedAt,
        approvedAt: args.approvedAt,
        rejectedAt: args.rejectedAt,
        decidedBy: args.decidedBy,
        decisionNote: args.decisionNote,
        orderedAt: args.orderedAt,
        receivedAt: args.receivedAt,
        createdBy: args.createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      return { ok: true }
    }

    const legacyId = crypto.randomUUID()

    await ctx.db.insert('financePurchaseOrders', {
      workspaceId: args.workspaceId,
      legacyId,
      number: args.number,
      status: args.status,
      vendorId: args.vendorId,
      vendorName: args.vendorName,
      currency: args.currency,
      items: args.items,
      totalAmount: args.totalAmount,
      notes: args.notes,
      requestedBy: args.requestedBy,
      submittedAt: args.submittedAt,
      approvedAt: args.approvedAt,
      rejectedAt: args.rejectedAt,
      decidedBy: args.decidedBy,
      decisionNote: args.decisionNote,
      orderedAt: args.orderedAt,
      receivedAt: args.receivedAt,
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
      .query('financePurchaseOrders')
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
