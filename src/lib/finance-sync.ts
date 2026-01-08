import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

import { formatDate, parseDate } from '@/lib/dates'
import { adminDb } from '@/lib/firebase-admin'

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

export function parseTimestampMillis(value: Timestamp | Date | string | null | undefined): number | null {
  if (!value) {
    return null
  }

  if (value instanceof Timestamp) {
    return value.toMillis()
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

  const effectiveDate = paidAt ?? new Date()
  const period = formatDate(effectiveDate, 'yyyy-MM')
  const label = formatDate(effectiveDate, 'MMMM yyyy')
  const docId = clientId ? `${period}_${clientId}` : `${period}_workspace`

  const revenueRef = adminDb.collection('workspaces').doc(workspaceId).collection('financeRevenue').doc(docId)

  try {
    await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(revenueRef)
      const payload: Record<string, unknown> = {
        clientId: clientId || null,
        period,
        label,
        currency,
        revenue: FieldValue.increment(roundedDelta),
        operatingExpenses: FieldValue.increment(0),
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (!snapshot.exists) {
        payload.createdAt = FieldValue.serverTimestamp()
      }

      transaction.set(revenueRef, payload, { merge: true })
    })
  } catch (error) {
    console.error('[finance-sync] Failed to record invoice revenue transaction:', error)
    throw error // Re-throw to allow caller to handle or for transaction to fail properly
  }
}

export async function syncInvoiceRecords(invoice: Stripe.Invoice, options: SyncOptions = {}): Promise<SyncOutcome | null> {
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
  const paymentIntentId = typeof invoiceWithIntent.payment_intent === 'string'
    ? invoiceWithIntent.payment_intent
    : invoiceWithIntent.payment_intent?.id ?? null
  const collectionMethod = invoice.collection_method ?? null

  const workspaceRef = workspaceId ? adminDb.collection('workspaces').doc(workspaceId) : null
  const financeInvoiceRef = workspaceRef
    ? workspaceRef.collection('financeInvoices').doc(invoice.id)
    : adminDb.collection('users').doc(ownerUid).collection('financeInvoices').doc(invoice.id)
  const clientRef = workspaceRef
    ? workspaceRef.collection('clients').doc(clientId)
    : adminDb.collection('users').doc(ownerUid).collection('clients').doc(clientId)

  let deltaPaid = 0
  let deltaRefunded = 0

  try {
    await adminDb.runTransaction(async (transaction) => {
      const financeSnapshot = await transaction.get(financeInvoiceRef)
      const existingData = financeSnapshot.exists ? (financeSnapshot.data() as Record<string, unknown>) : {}

      const previousPaid = typeof existingData.amountPaid === 'number' ? existingData.amountPaid : 0
      const previousRefunded = typeof existingData.amountRefunded === 'number' ? existingData.amountRefunded : 0

      if (resolvedRefunded === null) {
        resolvedRefunded = previousRefunded
      }

      const incomingRefundTotal = resolvedRefunded ?? previousRefunded

      deltaPaid = Math.max(amountPaid - previousPaid, 0)
      deltaRefunded = incomingRefundTotal > previousRefunded ? incomingRefundTotal - previousRefunded : 0

      const baseFinanceData: Record<string, unknown> = {
        clientId,
        clientName: clientNameFallback,
        amount: amountTotal,
        amountPaid,
        amountRemaining,
        amountRefunded: incomingRefundTotal,
        status: financeStatus,
        stripeStatus,
        issuedDate: issuedAt,
        dueDate,
        paidDate: paidAt,
        description: invoiceDescription,
        hostedInvoiceUrl: hostedUrl,
        stripeInvoiceId: invoice.id,
        number: invoiceNumber,
        currency,
        paymentIntentId,
        collectionMethod,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (workspaceId) {
        baseFinanceData.workspaceId = workspaceId
        baseFinanceData.updatedBy = ownerUid
      }

      if (financeSnapshot.exists) {
        transaction.set(financeInvoiceRef, baseFinanceData, { merge: true })
      } else {
        transaction.set(
          financeInvoiceRef,
          {
            ...baseFinanceData,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: ownerUid,
          },
          { merge: true }
        )
      }

      const clientSnapshot = await transaction.get(clientRef)
      const clientData = clientSnapshot.exists ? (clientSnapshot.data() as Record<string, unknown>) : {}
      const existingIssuedAtMillis = parseTimestampMillis(clientData?.lastInvoiceIssuedAt as Timestamp | Date | string | null | undefined)

      let shouldUpdateClient = true
      if (existingIssuedAtMillis !== null) {
        shouldUpdateClient = issuedAt.getTime() >= existingIssuedAtMillis
      }

      const clientName =
        typeof clientData?.name === 'string' && clientData.name.trim().length > 0
          ? (clientData.name as string)
          : clientNameFallback

      const clientPayload: Record<string, unknown> = {
        name: clientName,
        lastInvoiceStatus: financeStatus,
        lastInvoiceAmount: amountTotal,
        lastInvoiceCurrency: currency,
        lastInvoiceIssuedAt: issuedAt,
        lastInvoiceNumber: invoiceNumber,
        lastInvoiceUrl: hostedUrl,
        lastInvoicePaidAt: paidAt ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      }

      if (workspaceId) {
        clientPayload.workspaceId = workspaceId
        clientPayload.updatedBy = ownerUid
      }

      if (shouldUpdateClient) {
        transaction.set(clientRef, clientPayload, { merge: true })
      } else if (clientSnapshot.exists) {
        const storedNumber = typeof clientData?.lastInvoiceNumber === 'string' ? (clientData.lastInvoiceNumber as string) : null
        if (storedNumber && storedNumber === invoiceNumber) {
          const deltaPayload: Record<string, unknown> = {
            lastInvoiceStatus: financeStatus,
            lastInvoiceAmount: amountTotal,
            lastInvoiceCurrency: currency,
            lastInvoiceIssuedAt: issuedAt,
            lastInvoiceUrl: hostedUrl,
            lastInvoicePaidAt: paidAt ?? null,
            updatedAt: FieldValue.serverTimestamp(),
          }

          if (workspaceId) {
            deltaPayload.workspaceId = workspaceId
            deltaPayload.updatedBy = ownerUid
          }

          transaction.set(clientRef, deltaPayload, { merge: true })
        }
      }
    })
  } catch (error) {
    console.error('[finance-sync] Failed to sync invoice records transaction:', error)
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
