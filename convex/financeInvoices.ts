import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { Errors } from './errors'
import {
  authenticatedMutation,
  authenticatedQuery,
  zAuthenticatedMutation,
  zAuthenticatedQuery,
} from './functions'
import { z } from 'zod/v4'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function now() {
  return Date.now()
}

/**
 * Get invoice by legacyId (no auth - server-side use).
 * Used by finance-sync to check existing values.
 */
export const getByLegacyIdServer = query({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
  },
  handler: async (ctx, args) => {
    // No auth required - called from server-side code
    const trimmedLegacyId = args.legacyId.trim()
    if (!trimmedLegacyId) return null

    const row = await ctx.db
      .query('financeInvoices')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', trimmedLegacyId)
      )
      .unique()

    if (!row) throw Errors.resource.notFound('Invoice', args.legacyId)

    return {
      legacyId: row.legacyId,
      clientId: row.clientId,
      clientName: row.clientName,
      amount: row.amount,
      status: row.status,
      stripeStatus: row.stripeStatus,
      issuedDate: row.issuedDate,
      dueDate: row.dueDate,
      paidDate: row.paidDate,
      amountPaid: row.amountPaid,
      amountRemaining: row.amountRemaining,
      amountRefunded: row.amountRefunded,
      currency: row.currency,
      description: row.description,
      hostedInvoiceUrl: row.hostedInvoiceUrl,
      number: row.number,
      paymentIntentId: row.paymentIntentId,
      collectionMethod: row.collectionMethod,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  },
})

/**
 * Upsert invoice (no auth - server-side use).
 * Used by finance-sync to sync Stripe invoices.
 */
export const upsertServer = mutation({
  args: {
    workspaceId: v.string(),
    legacyId: v.string(),
    clientId: v.union(v.string(), v.null()),
    clientName: v.string(),
    amount: v.number(),
    status: v.string(),
    stripeStatus: v.union(v.string(), v.null()),
    issuedDate: v.union(v.string(), v.null()),
    dueDate: v.union(v.string(), v.null()),
    paidDate: v.union(v.string(), v.null()),
    amountPaid: v.union(v.number(), v.null()),
    amountRemaining: v.union(v.number(), v.null()),
    amountRefunded: v.union(v.number(), v.null()),
    currency: v.union(v.string(), v.null()),
    description: v.union(v.string(), v.null()),
    hostedInvoiceUrl: v.union(v.string(), v.null()),
    number: v.union(v.string(), v.null()),
    paymentIntentId: v.union(v.string(), v.null()),
    collectionMethod: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    // No auth required - called from server-side code
    const timestamp = now()

    const existing = await ctx.db
      .query('financeInvoices')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    const payload = {
      clientId: args.clientId,
      clientName: args.clientName,
      amount: args.amount,
      status: args.status,
      stripeStatus: args.stripeStatus,
      issuedDate: args.issuedDate,
      dueDate: args.dueDate,
      paidDate: args.paidDate,
      amountPaid: args.amountPaid,
      amountRemaining: args.amountRemaining,
      amountRefunded: args.amountRefunded,
      currency: args.currency,
      description: args.description,
      hostedInvoiceUrl: args.hostedInvoiceUrl,
      number: args.number,
      paymentIntentId: args.paymentIntentId,
      collectionMethod: args.collectionMethod,
      updatedAt: timestamp,
    }

    if (existing) {
      // Return previous values for delta calculation
      const previousAmountPaid = existing.amountPaid
      const previousAmountRefunded = existing.amountRefunded

      await ctx.db.patch(existing._id, payload)

      return {
        ok: true,
        created: false,
        previousAmountPaid,
        previousAmountRefunded,
      }
    }

    await ctx.db.insert('financeInvoices', {
      workspaceId: args.workspaceId,
      legacyId: args.legacyId,
      ...payload,
      createdAt: timestamp,
    })

    return {
      ok: true,
      created: true,
      previousAmountPaid: 0,
      previousAmountRefunded: 0,
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

    const trimmedLegacyId = args.legacyId.trim()
    if (!trimmedLegacyId) {
      throw Errors.validation.invalidInput('Invoice id is required')
    }

    const row = await ctx.db
      .query('financeInvoices')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', trimmedLegacyId)
      )
      .unique()

    if (!row) throw Errors.resource.notFound('Invoice', trimmedLegacyId)

    return {
      legacyId: row.legacyId,
      clientId: row.clientId,
      clientName: row.clientName,
      amount: row.amount,
      status: row.status,
      stripeStatus: row.stripeStatus,
      issuedDate: row.issuedDate,
      dueDate: row.dueDate,
      paidDate: row.paidDate,
      amountPaid: row.amountPaid,
      amountRemaining: row.amountRemaining,
      amountRefunded: row.amountRefunded,
      currency: row.currency,
      description: row.description,
      hostedInvoiceUrl: row.hostedInvoiceUrl,
      number: row.number,
      paymentIntentId: row.paymentIntentId,
      collectionMethod: row.collectionMethod,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  },
})

export const list = zAuthenticatedQuery({
  args: {
    workspaceId: z.string(),
    clientId: z.string().nullable().optional(),
    limit: z.number().optional(),
    cursorCreatedAt: z.number().optional(),
    cursorLegacyId: z.string().optional(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const limit = Math.min(Math.max(args.limit ?? 200, 1), 200)

    const rows = await ctx.db
      .query('financeInvoices')
      .withIndex('by_workspaceId', (qIndex) => qIndex.eq('workspaceId', args.workspaceId))
      .order('desc')
      .collect()

    const clientId = args.clientId ?? undefined

    const filtered = rows.filter((row) => {
      if (clientId === undefined) return true
      return row.clientId === clientId
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

    const invoices = page.slice(0, limit).map((row) => ({
      legacyId: row.legacyId,
      clientId: row.clientId,
      clientName: row.clientName,
      amount: row.amount,
      status: row.status,
      stripeStatus: row.stripeStatus,
      issuedDate: row.issuedDate,
      dueDate: row.dueDate,
      paidDate: row.paidDate,
      amountPaid: row.amountPaid,
      amountRemaining: row.amountRemaining,
      amountRefunded: row.amountRefunded,
      currency: row.currency,
      description: row.description,
      hostedInvoiceUrl: row.hostedInvoiceUrl,
      number: row.number,
      paymentIntentId: row.paymentIntentId,
      collectionMethod: row.collectionMethod,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))

    return {
      invoices,
      nextCursor: next ? { createdAt: next.createdAt, legacyId: next.legacyId } : null,
    }
  },
})

export const upsert = zAuthenticatedMutation({
  args: {
    workspaceId: z.string(),
    legacyId: z.string().optional(),
 
    clientId: z.string().nullable(),
    clientName: z.string(),
    amount: z.number(),
    status: z.string(),
    stripeStatus: z.string().nullable(),
    issuedDate: z.string().nullable(),
    dueDate: z.string().nullable(),
    paidDate: z.string().nullable(),
    amountPaid: z.number().nullable(),
    amountRemaining: z.number().nullable(),
    amountRefunded: z.number().nullable(),
    currency: z.string().nullable(),
    description: z.string().nullable(),
    hostedInvoiceUrl: z.string().nullable(),
    number: z.string().nullable(),
    paymentIntentId: z.string().nullable(),
    collectionMethod: z.string().nullable(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const timestamp = now()

    if (args.legacyId) {
      const existing = await ctx.db
        .query('financeInvoices')
        .withIndex('by_workspaceId_legacyId', (qIndex) =>
          qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId!)
        )
        .unique()

      if (existing) {
        await ctx.db.patch(existing._id, {
          clientId: args.clientId,
          clientName: args.clientName,
          amount: args.amount,
          status: args.status,
          stripeStatus: args.stripeStatus,
          issuedDate: args.issuedDate,
          dueDate: args.dueDate,
          paidDate: args.paidDate,
          amountPaid: args.amountPaid,
          amountRemaining: args.amountRemaining,
          amountRefunded: args.amountRefunded,
          currency: args.currency,
          description: args.description,
          hostedInvoiceUrl: args.hostedInvoiceUrl,
          number: args.number,
          paymentIntentId: args.paymentIntentId,
          collectionMethod: args.collectionMethod,
          updatedAt: timestamp,
        })

        return { ok: true }
      }

      await ctx.db.insert('financeInvoices', {
        workspaceId: args.workspaceId,
        legacyId: args.legacyId,
        clientId: args.clientId,
        clientName: args.clientName,
        amount: args.amount,
        status: args.status,
        stripeStatus: args.stripeStatus,
        issuedDate: args.issuedDate,
        dueDate: args.dueDate,
        paidDate: args.paidDate,
        amountPaid: args.amountPaid,
        amountRemaining: args.amountRemaining,
        amountRefunded: args.amountRefunded,
        currency: args.currency,
        description: args.description,
        hostedInvoiceUrl: args.hostedInvoiceUrl,
        number: args.number,
        paymentIntentId: args.paymentIntentId,
        collectionMethod: args.collectionMethod,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

      return { ok: true }
    }

    const legacyId = crypto.randomUUID()
    await ctx.db.insert('financeInvoices', {
      workspaceId: args.workspaceId,
      legacyId,
      clientId: args.clientId,
      clientName: args.clientName,
      amount: args.amount,
      status: args.status,
      stripeStatus: args.stripeStatus,
      issuedDate: args.issuedDate,
      dueDate: args.dueDate,
      paidDate: args.paidDate,
      amountPaid: args.amountPaid,
      amountRemaining: args.amountRemaining,
      amountRefunded: args.amountRefunded,
      currency: args.currency,
      description: args.description,
      hostedInvoiceUrl: args.hostedInvoiceUrl,
      number: args.number,
      paymentIntentId: args.paymentIntentId,
      collectionMethod: args.collectionMethod,
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
      .query('financeInvoices')
      .withIndex('by_workspaceId_legacyId', (qIndex) =>
        qIndex.eq('workspaceId', args.workspaceId).eq('legacyId', args.legacyId)
      )
      .unique()

    if (!existing) {
      throw Errors.resource.notFound('Invoice', args.legacyId)
    }

    await ctx.db.delete(existing._id)
  },
})
