import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

import { adminDb } from '@/lib/firebase-admin'
import { getStripeClient } from '@/lib/stripe'

export const runtime = 'nodejs'

const RELEVANT_EVENTS = new Set([
  'invoice.finalized',
  'invoice.payment_failed',
  'invoice.paid',
  'invoice.voided',
])

type TimestampInput = Timestamp | Date | string | null | undefined

function parseTimestampMillis(value: TimestampInput): number | null {
  if (!value) {
    return null
  }

  if (value instanceof Timestamp) {
    return value.toMillis()
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime()
    }
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

function resolveDueDate(invoice: Stripe.Invoice): Date | null {
  const dueDate = invoice.due_date
  if (typeof dueDate === 'number' && Number.isFinite(dueDate)) {
    return new Date(dueDate * 1000)
  }
  return null
}

function normaliseAmount(amountCents: number | null | undefined): number | null {
  if (typeof amountCents === 'number' && Number.isFinite(amountCents)) {
    return amountCents / 100
  }
  return null
}

async function syncInvoiceRecords(invoice: Stripe.Invoice, ownerUid: string, clientId: string, workspaceId?: string | null) {
  let financeInvoiceRef: FirebaseFirestore.DocumentReference
  let clientRef: FirebaseFirestore.DocumentReference

  if (workspaceId) {
    const workspaceRef = adminDb.collection('workspaces').doc(workspaceId)
    financeInvoiceRef = workspaceRef.collection('financeInvoices').doc(invoice.id)
    clientRef = workspaceRef.collection('clients').doc(clientId)
  } else {
    const userRef = adminDb.collection('users').doc(ownerUid)
    financeInvoiceRef = userRef.collection('financeInvoices').doc(invoice.id)
    clientRef = userRef.collection('clients').doc(clientId)
  }

  const issuedAt = resolveIssuedAtDate(invoice)
  const dueDate = resolveDueDate(invoice)
  const amountDue = normaliseAmount(invoice.amount_due)
  const hostedUrl = invoice.hosted_invoice_url ?? null
  const invoiceStatus = invoice.status ?? 'draft'
  const invoiceNumber = invoice.number ?? null
  const invoiceCurrency = invoice.currency ?? 'usd'
  const invoiceDescription = invoice.description ?? null
  const clientNameFallback = invoice.customer_name ?? invoice.customer_email ?? clientId

  await adminDb.runTransaction(async (transaction) => {
    const financeSnapshot = await transaction.get(financeInvoiceRef)

    const baseFinanceData: Record<string, unknown> = {
      clientId,
      clientName: clientNameFallback,
      amount: amountDue ?? 0,
      status: invoiceStatus,
      issuedDate: issuedAt,
      dueDate,
      description: invoiceDescription,
      hostedInvoiceUrl: hostedUrl,
      stripeInvoiceId: invoice.id,
      number: invoiceNumber,
      currency: invoiceCurrency,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (workspaceId) {
      baseFinanceData.workspaceId = workspaceId
      baseFinanceData.updatedBy = ownerUid
    }

    if (financeSnapshot.exists) {
      transaction.set(financeInvoiceRef, baseFinanceData, { merge: true })
    } else {
      const creationPayload: Record<string, unknown> = {
        ...baseFinanceData,
        createdAt: FieldValue.serverTimestamp(),
      }

      if (workspaceId) {
        creationPayload.createdBy = ownerUid
      }

      transaction.set(financeInvoiceRef, creationPayload)
    }

    const clientSnapshot = await transaction.get(clientRef)
    const clientData = clientSnapshot.exists ? (clientSnapshot.data() as Record<string, unknown>) : {}
    const existingIssuedAtMillis = parseTimestampMillis(clientData?.lastInvoiceIssuedAt as TimestampInput)

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
      lastInvoiceStatus: invoiceStatus,
      lastInvoiceAmount: amountDue ?? 0,
      lastInvoiceCurrency: invoiceCurrency,
      lastInvoiceIssuedAt: issuedAt,
      lastInvoiceNumber: invoiceNumber,
      lastInvoiceUrl: hostedUrl,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (workspaceId) {
      clientPayload.workspaceId = workspaceId
      clientPayload.updatedBy = ownerUid
    }

    if (shouldUpdateClient) {
      transaction.set(
        clientRef,
        clientPayload,
        { merge: true }
      )
    } else if (clientSnapshot.exists) {
      const storedNumber = typeof clientData?.lastInvoiceNumber === 'string' ? (clientData.lastInvoiceNumber as string) : null
      if (storedNumber && storedNumber === invoiceNumber) {
        const deltaPayload: Record<string, unknown> = {
          lastInvoiceStatus: invoiceStatus,
          lastInvoiceAmount: amountDue ?? 0,
          lastInvoiceCurrency: invoiceCurrency,
          lastInvoiceIssuedAt: issuedAt,
          lastInvoiceUrl: hostedUrl,
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
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[billing] Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    console.warn('[billing] Stripe signature missing from webhook')
    return NextResponse.json({ error: 'Signature missing' }, { status: 400 })
  }

  const rawBody = await request.text()
  const stripe = getStripeClient()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload'
    console.error('[billing] Failed to verify webhook signature', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true })
  }

  const invoice = event.data.object as Stripe.Invoice
  const ownerUid = invoice.metadata?.ownerUid
  const clientId = invoice.metadata?.clientId
  const workspaceId = invoice.metadata?.workspaceId ?? null

  if (!ownerUid || !clientId) {
    console.warn('[billing] Invoice metadata missing owner or client identifiers', {
      invoiceId: invoice.id,
      ownerUid,
      clientId,
    })
    return NextResponse.json({ received: true })
  }

  try {
    await syncInvoiceRecords(invoice, ownerUid, clientId, workspaceId)
  } catch (error) {
    console.error('[billing] Failed to sync invoice from webhook', error)
    return NextResponse.json({ error: 'Failed to persist invoice' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
