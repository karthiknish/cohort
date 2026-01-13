"use node"

import Stripe from 'stripe'
import { action } from './_generated/server'
import { v } from 'convex/values'

import { getStripeClient } from '../src/lib/stripe'
import { api } from './_generated/api'
import { Errors, asErrorMessage, logAndThrow, withErrorHandling } from './errors'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) {
    throw Errors.auth.unauthorized()
  }
}

function formatPeriod(date: Date) {
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  return `${year}-${month}`
}

function formatPeriodLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

function normaliseAmount(amountCents: number | null | undefined): number | null {
  if (typeof amountCents === 'number' && Number.isFinite(amountCents)) {
    return amountCents / 100
  }
  return null
}

function resolveDueDate(invoice: Stripe.Invoice): Date | null {
  const dueDate = invoice.due_date
  if (typeof dueDate === 'number' && Number.isFinite(dueDate)) {
    return new Date(dueDate * 1000)
  }
  return null
}

function resolveIssuedAtDate(invoice: Stripe.Invoice): Date {
  const finalizedAt = invoice.status_transitions?.finalized_at
  if (typeof finalizedAt === 'number' && Number.isFinite(finalizedAt)) {
    return new Date(finalizedAt * 1000)
  }

  if (typeof invoice.created === 'number' && Number.isFinite(invoice.created)) {
    return new Date(invoice.created * 1000)
  }

  return new Date()
}

function resolvePaidAtDate(invoice: Stripe.Invoice): Date | null {
  const paidAt = invoice.status_transitions?.paid_at
  if (typeof paidAt === 'number' && Number.isFinite(paidAt)) {
    return new Date(paidAt * 1000)
  }

  const fallback = (invoice as Stripe.Invoice & { paid_at?: number | null }).paid_at
  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return new Date(fallback * 1000)
  }

  return null
}

function determineFinanceStatus(invoice: Stripe.Invoice): 'draft' | 'sent' | 'paid' | 'overdue' {
  const stripeStatus = invoice.status ?? 'draft'
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

async function applyRevenueDelta(
  ctx: { runQuery: any; runMutation: any },
  params: {
    workspaceId: string
    clientId: string | null
    amountDelta: number
    paidAt: Date | null
    currency: string
  }
) {
  const { workspaceId, clientId, amountDelta, paidAt, currency } = params
  const roundedDelta = Math.round(amountDelta * 100) / 100
  if (!Number.isFinite(roundedDelta) || Math.abs(roundedDelta) < 0.0001) {
    return
  }

  const effectiveDate = paidAt ?? new Date()
  const period = formatPeriod(effectiveDate)
  const label = formatPeriodLabel(effectiveDate)
  const legacyId = clientId ? `${period}_${clientId}` : `${period}_workspace`

  const existing = (await ctx.runQuery(api.financeRevenue.list, {
    workspaceId,
    clientId,
    limit: 200,
  })) as { revenue: { legacyId: string; revenue: number; operatingExpenses: number }[] }

  const existingRow = existing.revenue.find((row) => row.legacyId === legacyId)

  await ctx.runMutation(api.financeRevenue.upsert, {
    workspaceId,
    legacyId,
    clientId,
    period,
    label,
    revenue: (existingRow?.revenue ?? 0) + roundedDelta,
    operatingExpenses: existingRow?.operatingExpenses ?? 0,
    currency: currency.toUpperCase(),
  })
}

export const refund = action({
  args: {
    workspaceId: v.string(),
    invoiceId: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const trimmedInvoiceId = args.invoiceId.trim()
      if (!trimmedInvoiceId) {
        throw Errors.validation.invalidInput('Invoice id is required')
      }

      const invoiceRow = (await ctx.runQuery(api.financeInvoices.getByLegacyId, {
        workspaceId: args.workspaceId,
        legacyId: trimmedInvoiceId,
      })) as any

      if (!invoiceRow) {
        throw Errors.resource.notFound('Invoice', trimmedInvoiceId)
      }

      const amountPaid = typeof invoiceRow.amountPaid === 'number' ? invoiceRow.amountPaid : invoiceRow.amount
      const amountAlreadyRefunded = typeof invoiceRow.amountRefunded === 'number' ? invoiceRow.amountRefunded : 0

      if (amountPaid <= 0) {
        throw Errors.validation.invalidState('Invoice has no recorded payments to refund')
      }

      const requestedAmount = args.amount
      if (typeof requestedAmount === 'number') {
        const normalizedRequested = Math.round(requestedAmount * 100) / 100
        const maxRefundable = Math.max(amountPaid - amountAlreadyRefunded, 0)
        if (normalizedRequested <= 0 || normalizedRequested - maxRefundable > 0.0001) {
          throw Errors.validation.invalidInput('Refund amount exceeds paid balance')
        }
      }

      const stripe = getStripeClient()

      const stripeInvoice = (await stripe.invoices.retrieve(trimmedInvoiceId, {
        expand: ['payment_intent'],
      })) as Stripe.Invoice

      const invoiceWithIntent = stripeInvoice as Stripe.Invoice & {
        payment_intent?: string | Stripe.PaymentIntent | null
      }

      const paymentIntentId =
        typeof invoiceWithIntent.payment_intent === 'string'
          ? invoiceWithIntent.payment_intent
          : invoiceWithIntent.payment_intent?.id ?? null

      if (!paymentIntentId) {
        throw Errors.resource.notFound('Payment intent')
      }

      const refundAmountCents =
        typeof requestedAmount === 'number'
          ? Math.round(requestedAmount * 100)
          : typeof stripeInvoice.amount_paid === 'number'
            ? stripeInvoice.amount_paid
            : Math.round(amountPaid * 100)

      const idempotencyKey = `refund_${trimmedInvoiceId}_${refundAmountCents}`

      const refund = await stripe.refunds.create(
        {
          payment_intent: paymentIntentId,
          amount: refundAmountCents,
          metadata: {
            workspaceId: args.workspaceId,
            invoiceId: trimmedInvoiceId,
            clientId: invoiceRow.clientId ?? '',
          },
        },
        { idempotencyKey }
      )

      const refreshedInvoice = (await stripe.invoices.retrieve(trimmedInvoiceId)) as Stripe.Invoice

      const paidAt = resolvePaidAtDate(refreshedInvoice)
      const issuedAt = resolveIssuedAtDate(refreshedInvoice)
      const dueDate = resolveDueDate(refreshedInvoice)

      const stripeCurrency = refreshedInvoice.currency ?? invoiceRow.currency ?? 'usd'

      const nextAmountPaid = normaliseAmount(refreshedInvoice.amount_paid) ?? amountPaid
      const nextAmountRemainingRaw = normaliseAmount(refreshedInvoice.amount_remaining)

      const invoiceTotal = invoiceRow.amount
      const nextAmountRemaining =
        nextAmountRemainingRaw !== null ? nextAmountRemainingRaw : Math.max(invoiceTotal - nextAmountPaid, 0)

      const nextAmountRefunded = amountAlreadyRefunded + refund.amount / 100
      const deltaRefunded = Math.max(nextAmountRefunded - amountAlreadyRefunded, 0)

      await ctx.runMutation(api.financeInvoices.upsert, {
        workspaceId: args.workspaceId,
        legacyId: invoiceRow.legacyId,
        clientId: invoiceRow.clientId,
        clientName: invoiceRow.clientName,
        amount: invoiceRow.amount,
        status: determineFinanceStatus(refreshedInvoice),
        stripeStatus: typeof refreshedInvoice.status === 'string' ? refreshedInvoice.status : null,
        issuedDate: issuedAt.toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        paidDate: paidAt ? paidAt.toISOString() : null,
        amountPaid: nextAmountPaid,
        amountRemaining: nextAmountRemaining,
        amountRefunded: nextAmountRefunded,
        currency: stripeCurrency.toUpperCase(),
        description: invoiceRow.description,
        hostedInvoiceUrl: refreshedInvoice.hosted_invoice_url ?? invoiceRow.hostedInvoiceUrl,
        number: refreshedInvoice.number ?? invoiceRow.number,
        paymentIntentId,
        collectionMethod: refreshedInvoice.collection_method ?? invoiceRow.collectionMethod,
      })

      if (deltaRefunded > 0) {
        await applyRevenueDelta(ctx, {
          workspaceId: args.workspaceId,
          clientId: invoiceRow.clientId,
          amountDelta: -deltaRefunded,
          paidAt,
          currency: stripeCurrency,
        })
      }

      return {
        refund: {
          id: refund.id,
          amount: Math.round((refund.amount / 100) * 100) / 100,
          currency: stripeCurrency,
        },
      }
    }, 'financeInvoicesActions:refund'),
})

export const remind = action({
  args: {
    workspaceId: v.string(),
    invoiceId: v.string(),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const trimmedInvoiceId = args.invoiceId.trim()
      if (!trimmedInvoiceId) {
        throw Errors.validation.invalidInput('Invoice id is required')
      }

      const invoiceRow = (await ctx.runQuery(api.financeInvoices.getByLegacyId, {
        workspaceId: args.workspaceId,
        legacyId: trimmedInvoiceId,
      })) as any

      if (!invoiceRow) {
        throw Errors.resource.notFound('Invoice', trimmedInvoiceId)
      }

      const stripe = getStripeClient()
      const result = await stripe.invoices.sendInvoice(trimmedInvoiceId)

      return { ok: true, status: result.status ?? 'sent' }
    }, 'financeInvoicesActions:remind'),
})

function isStripeResourceMissing(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const code = 'code' in error ? (error as { code?: unknown }).code : undefined
  if (typeof code === 'string' && code === 'resource_missing') {
    return true
  }

  const type = 'type' in error ? (error as { type?: unknown }).type : undefined
  return typeof type === 'string' && type === 'StripeInvalidRequestError'
}

function normaliseAmountCents(amountDollars: number): number {
  const converted = Math.round(amountDollars * 100)
  if (!Number.isFinite(converted) || converted <= 0) {
    throw Errors.validation.error('Invoice amount is invalid after conversion')
  }
  return converted
}

type StripeInvoiceLike = {
  id: string
  number: string | null
  status: string | null
  currency: string | null
  amount_due: number | null
  due_date: number | null
  hosted_invoice_url: string | null
  created: number | null
  status_transitions?: {
    finalized_at?: number | null
  } | null
}

function resolveInvoiceIssuedAt(invoice: StripeInvoiceLike): Date {
  const finalizedAt = invoice.status_transitions?.finalized_at
  if (typeof finalizedAt === 'number' && Number.isFinite(finalizedAt)) {
    return new Date(finalizedAt * 1000)
  }

  if (typeof invoice.created === 'number' && Number.isFinite(invoice.created)) {
    return new Date(invoice.created * 1000)
  }

  return new Date()
}

function resolveInvoiceDueDateStr(invoice: StripeInvoiceLike, fallbackIso: string | null): string | null {
  if (typeof invoice.due_date === 'number' && Number.isFinite(invoice.due_date)) {
    return new Date(invoice.due_date * 1000).toISOString()
  }
  return fallbackIso
}

export const createAndSend = action({
  args: {
    workspaceId: v.string(),
    clientId: v.string(),
    clientName: v.string(),
    amount: v.number(),
    email: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    stripeCustomerId: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      const amountCents = normaliseAmountCents(args.amount)
      const normalizedEmail = args.email.trim().toLowerCase()
      const description = args.description?.trim() ?? undefined

      let dueDateIso: string | null = null
      let dueDateUnix: number | undefined
      if (args.dueDate) {
        const parsedDueDate = new Date(args.dueDate)
        if (Number.isNaN(parsedDueDate.getTime())) {
          throw Errors.validation.error('Provide a valid due date')
        }
        dueDateIso = parsedDueDate.toISOString()
        const seconds = Math.floor(parsedDueDate.getTime() / 1000)
        dueDateUnix = seconds > 0 ? seconds : undefined
        if (dueDateUnix && dueDateUnix <= Math.floor(Date.now() / 1000)) {
          throw Errors.validation.error('Due date must be in the future')
        }
      }

      const stripe = getStripeClient()
      let stripeCustomerId = args.stripeCustomerId ?? null

      // Verify existing customer or create new
      if (stripeCustomerId) {
        try {
          const existing = await stripe.customers.retrieve(stripeCustomerId)
          if (typeof existing === 'object' && 'deleted' in existing && existing.deleted) {
            stripeCustomerId = null
          }
        } catch (error) {
          if (isStripeResourceMissing(error)) {
            stripeCustomerId = null
          } else {
            throw error
          }
        }
      }

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: normalizedEmail || undefined,
          name: args.clientName,
          metadata: {
            clientId: args.clientId,
            workspaceId: args.workspaceId,
          },
        })
        stripeCustomerId = customer.id
      } else {
        try {
          await stripe.customers.update(stripeCustomerId, {
            email: normalizedEmail || undefined,
            name: args.clientName,
          })
        } catch (updateError) {
          console.warn('[financeInvoices] Failed to update Stripe customer details', updateError)
        }
      }

      const invoiceLineDescription = description ?? `Services for ${args.clientName}`

      // Generate idempotency key to prevent duplicate invoice items
      const idempotencyKey = `invoice_${args.workspaceId}_${
        args.clientId
      }_${amountCents}_${Date.now().toString(36)}`

      const invoiceItem = await stripe.invoiceItems.create(
        {
          customer: stripeCustomerId,
          amount: amountCents,
          currency: 'usd',
          description: invoiceLineDescription,
          metadata: {
            clientId: args.clientId,
            workspaceId: args.workspaceId,
            source: 'convex_invoice',
          },
        },
        { idempotencyKey: `${idempotencyKey}_item` }
      )

      const baseInvoiceParams: Stripe.InvoiceCreateParams = {
        customer: stripeCustomerId,
        collection_method: 'send_invoice',
        auto_advance: true,
        metadata: {
          clientId: args.clientId,
          workspaceId: args.workspaceId,
        },
      }

      const invoiceParams: Stripe.InvoiceCreateParams = dueDateUnix
        ? { ...baseInvoiceParams, due_date: dueDateUnix }
        : { ...baseInvoiceParams, days_until_due: 14 }

      let invoice = await stripe.invoices.create(invoiceParams)

      if (invoice.status === 'draft') {
        invoice = await stripe.invoices.finalizeInvoice(invoice.id)
      }

      if (invoice.collection_method === 'send_invoice' && invoice.status === 'open') {
        invoice = await stripe.invoices.sendInvoice(invoice.id)
      }

      const amountDueCents = typeof invoice.amount_due === 'number' ? invoice.amount_due : amountCents
      const issuedAt = resolveInvoiceIssuedAt(invoice as StripeInvoiceLike)
      const responseDueDate = resolveInvoiceDueDateStr(invoice as StripeInvoiceLike, dueDateIso)

      const issuedDateIso = issuedAt.toISOString()
      const resolvedDueDateIso = responseDueDate
        ? (() => {
            const parsed = new Date(responseDueDate)
            return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
          })()
        : null

      // Save to Convex
      await ctx.runMutation(api.financeInvoices.upsert, {
        workspaceId: args.workspaceId,
        legacyId: invoice.id,
        clientId: args.clientId,
        clientName: args.clientName,
        amount: amountDueCents / 100,
        status: invoice.status ?? 'draft',
        stripeStatus: invoice.status ?? null,
        issuedDate: issuedDateIso,
        dueDate: resolvedDueDateIso,
        paidDate: null,
        amountPaid: null,
        amountRemaining: null,
        amountRefunded: null,
        currency: (invoice.currency ?? 'usd').toUpperCase(),
        description: invoiceLineDescription,
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
        number: invoice.number ?? null,
        paymentIntentId: null,
        collectionMethod: invoice.collection_method ?? null,
      })

      // Update client's billing fields
      await ctx.runMutation(api.clients.updateInvoiceFields, {
        workspaceId: args.workspaceId,
        legacyId: args.clientId,
        billingEmail: normalizedEmail,
        stripeCustomerId,
        lastInvoiceStatus: invoice.status ?? null,
        lastInvoiceAmount: amountDueCents / 100,
        lastInvoiceCurrency: invoice.currency ?? 'usd',
        lastInvoiceIssuedAtMs: issuedAt.getTime(),
        lastInvoiceNumber: invoice.number ?? null,
        lastInvoiceUrl: invoice.hosted_invoice_url ?? null,
        lastInvoicePaidAtMs: null,
      })

      return {
        invoice: {
          id: invoice.id,
          number: invoice.number ?? null,
          status: invoice.status ?? null,
          currency: invoice.currency ?? null,
          amountDue: amountDueCents,
          dueDate: responseDueDate,
          hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
          issuedAt: issuedAt.toISOString(),
        },
        client: {
          billingEmail: normalizedEmail,
          stripeCustomerId,
          lastInvoiceStatus: invoice.status ?? null,
          lastInvoiceAmount: amountDueCents / 100,
          lastInvoiceCurrency: invoice.currency ?? 'usd',
          lastInvoiceIssuedAt: issuedAt.toISOString(),
          lastInvoiceNumber: invoice.number ?? null,
          lastInvoiceUrl: invoice.hosted_invoice_url ?? null,
        },
      }
    }, 'financeInvoicesActions:createAndSend'),
})
