import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'
import {
  zAuthenticatedMutation,
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'
import type { Id } from './_generated/dataModel'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function now() {
  return Date.now()
}

const lineItemZ = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
})

export const list = zAuthenticatedQuery({
  args: {
    workspaceId: z.string(),
    createdBy: z.string().optional(),
    vendorId: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().optional(),
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

export const getByLegacyId = zAuthenticatedQuery({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
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

    if (!row) throw Errors.resource.notFound('Purchase Order', args.legacyId)

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

export const upsert = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string().optional(),
 
    number: z.string().nullable(),
    status: z.string(),
    vendorId: z.string().nullable(),
    vendorName: z.string().nullable(),
    currency: z.string(),
 
    items: z.array(lineItemZ),
    totalAmount: z.number(),
 
    notes: z.string().nullable(),
    requestedBy: z.string().nullable(),
 
    submittedAt: z.number().nullable(),
    approvedAt: z.number().nullable(),
    rejectedAt: z.number().nullable(),
    decidedBy: z.string().nullable(),
    decisionNote: z.string().nullable(),
    orderedAt: z.number().nullable(),
    receivedAt: z.number().nullable(),
 
    createdBy: z.string().nullable(),
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

export const remove = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
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

    if (!existing) {
      throw Errors.resource.notFound('Purchase Order', args.legacyId)
    }

    await ctx.db.delete(existing._id)

    return { ok: true }
  },
})
