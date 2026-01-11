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

const attachmentValidator = v.object({
  name: v.string(),
  url: v.string(),
  type: v.string(),
  size: v.string(),
})

export const list = query({
  args: {
    workspaceId: v.string(),
    employeeId: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200)

    const rows = await ctx.db
      .query('financeExpenses')
      .withIndex('by_workspaceId', (qIndex) => qIndex.eq('workspaceId', args.workspaceId))
      .collect()

    let filtered = rows

    if (args.employeeId) {
      filtered = filtered.filter((row) => row.employeeId === args.employeeId)
    }

    if (args.status) {
      filtered = filtered.filter((row) => row.status === args.status)
    }

    filtered.sort((a, b) => b.createdAt - a.createdAt)

    return {
      expenses: filtered.slice(0, limit).map((row) => ({
        legacyId: row.legacyId,
        description: row.description,
        amount: row.amount,
        currency: row.currency,
        costType: row.costType,
        status: row.status,
        incurredAt: row.incurredAt,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        vendorId: row.vendorId,
        vendorName: row.vendorName,
        employeeId: row.employeeId,
        submittedAt: row.submittedAt,
        approvedAt: row.approvedAt,
        rejectedAt: row.rejectedAt,
        decidedBy: row.decidedBy,
        decisionNote: row.decisionNote,
        attachments: row.attachments,
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
      .query('financeExpenses')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!row) return null

    return {
      legacyId: row.legacyId,
      description: row.description,
      amount: row.amount,
      currency: row.currency,
      costType: row.costType,
      status: row.status,
      incurredAt: row.incurredAt,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      vendorId: row.vendorId,
      vendorName: row.vendorName,
      employeeId: row.employeeId,
      submittedAt: row.submittedAt,
      approvedAt: row.approvedAt,
      rejectedAt: row.rejectedAt,
      decidedBy: row.decidedBy,
      decisionNote: row.decisionNote,
      attachments: row.attachments,
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

    description: v.string(),
    amount: v.number(),
    currency: v.string(),
    costType: v.string(),
    incurredAt: v.union(v.string(), v.null()),
    categoryId: v.union(v.string(), v.null()),
    categoryName: v.union(v.string(), v.null()),
    vendorId: v.union(v.string(), v.null()),
    vendorName: v.union(v.string(), v.null()),

    status: v.string(),
    employeeId: v.union(v.string(), v.null()),

    submittedAt: v.union(v.number(), v.null()),
    approvedAt: v.union(v.number(), v.null()),
    rejectedAt: v.union(v.number(), v.null()),
    decidedBy: v.union(v.string(), v.null()),
    decisionNote: v.union(v.string(), v.null()),

    attachments: v.array(attachmentValidator),

    createdBy: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = now()

    if (args.legacyId) {
      const existing = await ctx.db
        .query('financeExpenses')
        .withIndex('by_workspaceId_legacyId', (qIndex) =>
          qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId!)
        )
        .unique()

      if (existing) {
        await ctx.db.patch(existing._id, {
          description: args.description,
          amount: args.amount,
          currency: args.currency,
          costType: args.costType,
          incurredAt: args.incurredAt,
          categoryId: args.categoryId,
          categoryName: args.categoryName,
          vendorId: args.vendorId,
          vendorName: args.vendorName,
          status: args.status,
          employeeId: args.employeeId,
          submittedAt: args.submittedAt,
          approvedAt: args.approvedAt,
          rejectedAt: args.rejectedAt,
          decidedBy: args.decidedBy,
          decisionNote: args.decisionNote,
          attachments: args.attachments,
          updatedAt: timestamp,
        })

        return { ok: true }
      }

      await ctx.db.insert('financeExpenses', {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        description: args.description,
        amount: args.amount,
        currency: args.currency,
        costType: args.costType,
        incurredAt: args.incurredAt,
        categoryId: args.categoryId,
        categoryName: args.categoryName,
        vendorId: args.vendorId,
        vendorName: args.vendorName,
        status: args.status,
        employeeId: args.employeeId,
        submittedAt: args.submittedAt,
        approvedAt: args.approvedAt,
        rejectedAt: args.rejectedAt,
        decidedBy: args.decidedBy,
        decisionNote: args.decisionNote,
        attachments: args.attachments,
        createdBy: args.createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      return { ok: true }
    }

    const legacyId = crypto.randomUUID()

    await ctx.db.insert('financeExpenses', {
      workspaceId: args.workspaceId,
      legacyId,
      description: args.description,
      amount: args.amount,
      currency: args.currency,
      costType: args.costType,
      incurredAt: args.incurredAt,
      categoryId: args.categoryId,
      categoryName: args.categoryName,
      vendorId: args.vendorId,
      vendorName: args.vendorName,
      status: args.status,
      employeeId: args.employeeId,
      submittedAt: args.submittedAt,
      approvedAt: args.approvedAt,
      rejectedAt: args.rejectedAt,
      decidedBy: args.decidedBy,
      decisionNote: args.decisionNote,
      attachments: args.attachments,
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
      .query('financeExpenses')
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
