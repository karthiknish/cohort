import type Stripe from 'stripe'
import { ConvexHttpClient } from 'convex/browser'

import { formatDate, parseDate } from '@/lib/dates'
import { api } from '../../convex/_generated/api'

export type SyncOptions = {
  eventType?: string
  refundTotalCents?: number | null
}

export type SyncOutcome = {
  workspaceId: string | null
  clientId: string
  paidAt: Date | null
  currency: string
  deltaPaid: number
  deltaRefunded: number
}

// -----------------------------------------------------------------------------
// Convex client (lazy singleton for server-side use)
// -----------------------------------------------------------------------------
let _convexClient: ConvexHttpClient | null = null

function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    console.error('[finance-sync] CONVEX_URL not configured')
    return null
  }
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

export function parseTimestampMillis(value: Date | string | number | null | undefined): number | null {
  if (!value) {
    return null
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value
  }

  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isNaN(time) ? null : time
  }

  if (typeof value !== 'string') {
    return null
  }

  const parsed = parseDate(value)
  return parsed ? parsed.getTime() : null
}

type InvoiceWithOptionalTotals = Stripe.Invoice & {
  amount_total?: number | null
  total?: number | null
}

type InvoiceWithOptionalPaymentIntent = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null
}

function getInvoiceAmountTotal(invoice: Stripe.Invoice): number | null {
  const invoiceWithTotals = invoice as InvoiceWithOptionalTotals
  if (typeof invoiceWithTotals.amount_total === 'number') {
    return invoiceWithTotals.amount_total
  }
  if (typeof invoiceWithTotals.total === 'number') {
    return invoiceWithTotals.total
  }
  return null
}

export function resolveIssuedAtDate(invoice: Stripe.Invoice): Date {
  const finalizedAt = invoice.status_transitions?.finalized_at
  if (typeof finalizedAt === 'number' && Number.isFinite(finalizedAt)) {
    return new Date(finalizedAt * 1000)
  }

  if (typeof invoice.created === 'number' && Number.isFinite(invoice.created)) {
    return new Date(invoice.created * 1000)
  }

  return new Date()
}

export function resolveDueDate(invoice: Stripe.Invoice): Date | null {
  const dueDate = invoice.due_date
  if (typeof dueDate === 'number' && Number.isFinite(dueDate)) {
    return new Date(dueDate * 1000)
  }
  return null
}

export function resolvePaidAtDate(invoice: Stripe.Invoice): Date | null {
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

export function determineFinanceStatus(invoice: Stripe.Invoice): 'draft' | 'sent' | 'paid' | 'overdue' {
  const stripeStatus = invoice.status ?? 'draft'
  if (stripeStatus === 'draft') {
    return 'draft'
  }

  if (stripeStatus === 'paid') {
    return 'paid'
  }

  if (stripeStatus === 'void') {
    return 'draft'
  }

  if (stripeStatus === 'uncollectible') {
    return 'overdue'
  }

  if (stripeStatus === 'open') {
    const dueDate = resolveDueDate(invoice)
    if (dueDate && dueDate.getTime() < Date.now()) {
      return 'overdue'
    }
    return 'sent'
  }

  return 'sent'
}

export function normaliseAmount(amountCents: number | null | undefined): number | null {
  if (typeof amountCents === 'number' && Number.isFinite(amountCents)) {
    return amountCents / 100
  }
  return null
}

export async function recordInvoiceRevenue(params: {
  workspaceId: string
  clientId: string
  amountDelta: number
  paidAt: Date | null
  currency: string
}) {
  const { workspaceId, clientId, amountDelta, paidAt, currency } = params
  if (!workspaceId) {
    return
  }

  const roundedDelta = Math.round(amountDelta * 100) / 100
  if (!Number.isFinite(roundedDelta) || Math.abs(roundedDelta) < 0.0001) {
    return
  }

  const convex = getConvexClient()
  if (!convex) {
    console.error('[finance-sync] Convex client not available for revenue recording')
    return
  }

  const effectiveDate = paidAt ?? new Date()
  const period = formatDate(effectiveDate, 'yyyy-MM')
  const label = formatDate(effectiveDate, 'MMMM yyyy')
  const docId = clientId ? `${period}_${clientId}` : `${period}_workspace`

  try {
    // Get existing revenue record to calculate new total
    const existing = await convex.query(api.financeRevenue.getByLegacyId, {
      workspaceId,
      legacyId: docId,
    })

    const existingRevenue = existing?.revenue ?? 0
    const existingOperatingExpenses = existing?.operatingExpenses ?? 0

    // Upsert with new total (atomic increment replacement)
    await convex.mutation(api.financeRevenue.upsertServer, {
      workspaceId,
      legacyId: docId,
      clientId: clientId || null,
      period,
      label,
      revenue: existingRevenue + roundedDelta,
      operatingExpenses: existingOperatingExpenses,
      currency: currency.toUpperCase(),
    })
  } catch (error) {
    console.error('[finance-sync] Failed to record invoice revenue:', error)
    throw error
  }
}

export async function syncInvoiceRecords(
  invoice: Stripe.Invoice,
  options: SyncOptions = {}
): Promise<SyncOutcome | null> {
  const ownerUid = typeof invoice.metadata?.ownerUid === 'string' ? invoice.metadata.ownerUid : null
  const clientId = typeof invoice.metadata?.clientId === 'string' ? invoice.metadata.clientId : null
  const workspaceId = typeof invoice.metadata?.workspaceId === 'string' ? invoice.metadata.workspaceId : null

  if (!ownerUid || !clientId) {
    console.warn('[finance-sync] Invoice missing owner or client metadata', {
      invoiceId: invoice.id,
      ownerUid,
      clientId,
    })
    return null
  }

  if (!workspaceId) {
    console.warn('[finance-sync] Invoice missing workspaceId metadata, skipping', {
      invoiceId: invoice.id,
    })
    return null
  }

  const convex = getConvexClient()
  if (!convex) {
    console.error('[finance-sync] Convex client not available')
    return null
  }

  const issuedAt = resolveIssuedAtDate(invoice)
  const dueDate = resolveDueDate(invoice)
  const paidAt = resolvePaidAtDate(invoice)

  const amountTotal =
    normaliseAmount(getInvoiceAmountTotal(invoice)) ??
    normaliseAmount(invoice.subtotal) ??
    (() => {
      const due = normaliseAmount(invoice.amount_due)
      const paid = normaliseAmount(invoice.amount_paid)
      if (due !== null && paid !== null) {
        return due + paid
      }
      if (paid !== null) {
        return paid
      }
      if (due !== null) {
        return due
      }
      return 0
    })()

  const amountPaid = normaliseAmount(invoice.amount_paid) ?? 0
  const amountRemainingRaw = normaliseAmount(invoice.amount_remaining)
  const amountRemaining = amountRemainingRaw !== null ? amountRemainingRaw : Math.max(amountTotal - amountPaid, 0)
  let resolvedRefunded = typeof options.refundTotalCents === 'number' ? options.refundTotalCents / 100 : null

  const hostedUrl = invoice.hosted_invoice_url ?? null
  const invoiceNumber = invoice.number ?? null
  const currency = invoice.currency ?? 'usd'
  const invoiceDescription = invoice.description ?? null
  const clientNameFallback = invoice.customer_name ?? invoice.customer_email ?? clientId
  const stripeStatus = invoice.status ?? options.eventType ?? 'unknown'
  const financeStatus = determineFinanceStatus(invoice)
  const invoiceWithIntent = invoice as InvoiceWithOptionalPaymentIntent
  const paymentIntentId =
    typeof invoiceWithIntent.payment_intent === 'string'
      ? invoiceWithIntent.payment_intent
      : invoiceWithIntent.payment_intent?.id ?? null
  const collectionMethod = invoice.collection_method ?? null

  let deltaPaid = 0
  let deltaRefunded = 0

  try {
    // 1. Upsert invoice record and get previous values for delta calculation
    const invoiceResult = await convex.mutation(api.financeInvoices.upsertServer, {
      workspaceId,
      legacyId: invoice.id,
      clientId,
      clientName: clientNameFallback,
      amount: amountTotal,
      status: financeStatus,
      stripeStatus: typeof stripeStatus === 'string' ? stripeStatus : null,
      issuedDate: issuedAt.toISOString(),
      dueDate: dueDate ? dueDate.toISOString() : null,
      paidDate: paidAt ? paidAt.toISOString() : null,
      amountPaid,
      amountRemaining,
      amountRefunded: resolvedRefunded ?? 0,
      currency: currency.toUpperCase(),
      description: invoiceDescription,
      hostedInvoiceUrl: hostedUrl,
      number: invoiceNumber,
      paymentIntentId,
      collectionMethod,
    })

    const previousPaid = invoiceResult.previousAmountPaid ?? 0
    const previousRefunded = invoiceResult.previousAmountRefunded ?? 0

    if (resolvedRefunded === null) {
      resolvedRefunded = previousRefunded
    }

    const incomingRefundTotal = resolvedRefunded ?? previousRefunded

    deltaPaid = Math.max(amountPaid - previousPaid, 0)
    deltaRefunded = incomingRefundTotal > previousRefunded ? incomingRefundTotal - previousRefunded : 0

    // 2. Update client record with latest invoice info
    const existingClient = await convex.query(api.clients.getByLegacyIdServer, {
      workspaceId,
      legacyId: clientId,
    })

    const existingIssuedAtMillis = existingClient?.lastInvoiceIssuedAtMs ?? null

    let shouldUpdateClient = true
    if (existingIssuedAtMillis !== null) {
      shouldUpdateClient = issuedAt.getTime() >= existingIssuedAtMillis
    }

    const clientName =
      existingClient?.name && existingClient.name.trim().length > 0
        ? existingClient.name
        : clientNameFallback

    if (shouldUpdateClient) {
      await convex.mutation(api.clients.updateInvoiceFieldsServer, {
        workspaceId,
        legacyId: clientId,
        name: clientName,
        lastInvoiceStatus: financeStatus,
        lastInvoiceAmount: amountTotal,
        lastInvoiceCurrency: currency,
        lastInvoiceIssuedAtMs: issuedAt.getTime(),
        lastInvoiceNumber: invoiceNumber,
        lastInvoiceUrl: hostedUrl,
        lastInvoicePaidAtMs: paidAt ? paidAt.getTime() : null,
        createIfMissing: true,
      })
    } else if (existingClient) {
      // Check if this is an update to the same invoice number
      const storedNumber = existingClient.lastInvoiceNumber
      if (storedNumber && storedNumber === invoiceNumber) {
        await convex.mutation(api.clients.updateInvoiceFieldsServer, {
          workspaceId,
          legacyId: clientId,
          lastInvoiceStatus: financeStatus,
          lastInvoiceAmount: amountTotal,
          lastInvoiceCurrency: currency,
          lastInvoiceIssuedAtMs: issuedAt.getTime(),
          lastInvoiceNumber: invoiceNumber,
          lastInvoiceUrl: hostedUrl,
          lastInvoicePaidAtMs: paidAt ? paidAt.getTime() : null,
        })
      }
    }
  } catch (error) {
    console.error('[finance-sync] Failed to sync invoice records:', error)
    throw error
  }

  return {
    workspaceId,
    clientId,
    paidAt,
    currency,
    deltaPaid,
    deltaRefunded,
  }
}
