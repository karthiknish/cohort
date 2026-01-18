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

const attachmentZ = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
  size: z.string(),
})

export const list = zAuthenticatedQuery({
  args: {
    workspaceId: z.string(),
    employeeId: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().optional(),
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

export const getByLegacyId = zAuthenticatedQuery({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
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

    if (!row) throw Errors.resource.notFound('Expense', args.legacyId)

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

export const upsert = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string().optional(),
 
    description: z.string(),
    amount: z.number(),
    currency: z.string(),
    costType: z.string(),
    incurredAt: z.string().nullable(),
    categoryId: z.string().nullable(),
    categoryName: z.string().nullable(),
    vendorId: z.string().nullable(),
    vendorName: z.string().nullable(),
 
    status: z.string(),
    employeeId: z.string().nullable(),
 
    submittedAt: z.number().nullable(),
    approvedAt: z.number().nullable(),
    rejectedAt: z.number().nullable(),
    decidedBy: z.string().nullable(),
    decisionNote: z.string().nullable(),
 
    attachments: z.array(attachmentZ),
 
    createdBy: z.string().nullable(),
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

export const remove = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string(),
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

    if (!existing) {
      throw Errors.resource.notFound('Expense', args.legacyId)
    }

    await ctx.db.delete(existing._id)
  },
})
