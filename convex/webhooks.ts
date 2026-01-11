import type Stripe from 'stripe'

import { internalMutation } from './_generated/server'
import { v } from 'convex/values'

function nowMs() {
  return Date.now()
}

function toISO(ms: number): string {
  return new Date(ms).toISOString()
}

function normaliseAmount(cents: number | null | undefined): number | null {
  if (typeof cents !== 'number') return null
  return Math.round(cents) / 100
}

function resolvePaidAtDate(invoice: Stripe.Invoice): Date | null {
  const paidAt = (invoice as any).status_transitions?.paid_at
  if (typeof paidAt === 'number') return new Date(paidAt * 1000)
  return null
}

function resolveIssuedAtDate(invoice: Stripe.Invoice): Date {
  const finalized = (invoice as any).status_transitions?.finalized_at
  if (typeof finalized === 'number') return new Date(finalized * 1000)
  if (typeof invoice.created === 'number') return new Date(invoice.created * 1000)
  return new Date()
}

function resolveDueDate(invoice: Stripe.Invoice): Date | null {
  if (typeof invoice.due_date === 'number') return new Date(invoice.due_date * 1000)
  return null
}

function determineFinanceStatus(invoice: Stripe.Invoice): string {
  const stripeStatus = invoice.status
  if (stripeStatus === 'draft') return 'draft'
  if (stripeStatus === 'paid') return 'paid'
  if (stripeStatus === 'void') return 'draft'
  if (stripeStatus === 'uncollectible') return 'overdue'
  if (stripeStatus === 'open') {
    const dueDate = resolveDueDate(invoice)
    if (dueDate && dueDate.getTime() < Date.now()) return 'overdue'
    return 'sent'
  }
  return 'sent'
}

export const recordStripeWebhookEvent = internalMutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    livemode: v.boolean(),
    createdAtMs: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('stripeWebhookEvents')
      .withIndex('by_eventId', (q) => q.eq('eventId', args.eventId))
      .unique()

    if (existing) {
      return { received: true, duplicate: true }
    }

    await ctx.db.insert('stripeWebhookEvents', {
      eventId: args.eventId,
      eventType: args.eventType,
      livemode: args.livemode,
      createdAtMs: args.createdAtMs,
      processedAtMs: nowMs(),
    })

    return { received: true, duplicate: false }
  },
})

export const handleStripeInvoiceEvent = internalMutation({
  args: {
    eventType: v.string(),
    invoice: v.any(),
  },
  handler: async (ctx, args) => {
    const invoice = args.invoice as Stripe.Invoice

    const workspaceId = invoice?.metadata?.workspaceId
    const clientId = invoice?.metadata?.clientId

    if (!workspaceId) {
      return {
        ok: true,
        eventType: args.eventType,
        invoiceId: invoice?.id ?? null,
        workspaceId: null,
        clientId: null,
        skipped: true,
        reason: 'Missing workspaceId in metadata',
      }
    }

    const paidAt = resolvePaidAtDate(invoice)
    const issuedAt = resolveIssuedAtDate(invoice)
    const dueDate = resolveDueDate(invoice)
    const amountPaid = normaliseAmount(invoice.amount_paid)
    const amountRemaining = normaliseAmount(invoice.amount_remaining)
    const amountRefunded = normaliseAmount((invoice as any).amount_refunded)
    const currency = (invoice.currency ?? 'usd').toUpperCase()
    const status = determineFinanceStatus(invoice)

    const existing = await ctx.db
      .query('financeInvoices')
      .withIndex('by_workspaceId_legacyId', (q) =>
        q.eq('workspaceId', workspaceId).eq('legacyId', invoice.id)
      )
      .unique()

    const clientRow = clientId
      ? await ctx.db
          .query('clients')
          .withIndex('by_workspace_legacyId', (q) =>
            q.eq('workspaceId', workspaceId).eq('legacyId', clientId)
          )
          .unique()
      : null

    const clientName = clientRow?.name ?? clientId ?? 'Unknown Client'

    const invoiceData = {
      workspaceId,
      legacyId: invoice.id,
      clientId: clientId ?? null,
      clientName,
      amount: normaliseAmount(invoice.amount_due) ?? 0,
      status,
      stripeStatus: invoice.status ?? null,
      issuedDate: issuedAt.toISOString(),
      dueDate: dueDate?.toISOString() ?? null,
      paidDate: paidAt?.toISOString() ?? null,
      amountPaid,
      amountRemaining,
      amountRefunded,
      currency,
      description: invoice.description ?? null,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      number: invoice.number ?? null,
      paymentIntentId: typeof (invoice as any).payment_intent === 'string' ? (invoice as any).payment_intent : null,
      collectionMethod: invoice.collection_method ?? null,
      updatedAt: nowMs(),
    }

    if (existing) {
      await ctx.db.patch(existing._id, invoiceData)
    } else {
      await ctx.db.insert('financeInvoices', {
        ...invoiceData,
        createdAt: nowMs(),
      })
    }

    if (clientRow && (args.eventType === 'invoice.paid' || args.eventType === 'invoice.payment_succeeded')) {
      await ctx.db.patch(clientRow._id, {
        lastInvoiceStatus: status,
        lastInvoiceAmount: amountPaid,
        lastInvoiceCurrency: currency.toLowerCase(),
        lastInvoiceIssuedAtMs: issuedAt.getTime(),
        lastInvoiceNumber: invoice.number ?? null,
        lastInvoiceUrl: invoice.hosted_invoice_url ?? null,
        lastInvoicePaidAtMs: paidAt?.getTime() ?? null,
        updatedAtMs: nowMs(),
      })
    }

    return {
      ok: true,
      eventType: args.eventType,
      invoiceId: invoice?.id ?? null,
      workspaceId,
      clientId: clientId ?? null,
    }
  },
})

export const handleStripeChargeRefunded = internalMutation({
  args: {
    chargeId: v.string(),
    amountRefunded: v.number(),
    invoiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.invoiceId) {
      return { ok: true, skipped: true, reason: 'No invoice associated with charge' }
    }

    const invoiceRow = await ctx.db
      .query('financeInvoices')
      .filter((q) => q.eq(q.field('legacyId'), args.invoiceId))
      .first()

    if (!invoiceRow) {
      return { ok: true, skipped: true, reason: 'Invoice not found' }
    }

    const refundedDollars = args.amountRefunded / 100
    const existingRefunded = invoiceRow.amountRefunded ?? 0

    await ctx.db.patch(invoiceRow._id, {
      amountRefunded: existingRefunded + refundedDollars,
      updatedAt: nowMs(),
    })

    return { ok: true, invoiceId: args.invoiceId, amountRefunded: refundedDollars }
  },
})
