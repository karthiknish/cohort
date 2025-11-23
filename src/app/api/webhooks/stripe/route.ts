import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { getStripeClient } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { recordInvoicePaidNotification, notifyInvoicePaidWhatsApp } from '@/lib/notifications'
import { syncInvoiceRecords, recordInvoiceRevenue } from '@/lib/finance-sync'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[stripe-webhook] Webhook signature verification failed: ${message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        // Unhandled event type
        break
    }
  } catch (error) {
    console.error(`[stripe-webhook] Error handling event ${event.type}`, error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const workspaceId = invoice.metadata?.workspaceId
  const clientId = invoice.metadata?.clientId

  if (!workspaceId || !clientId) {
    console.warn('[stripe-webhook] Invoice missing metadata', { id: invoice.id, metadata: invoice.metadata })
    return
  }

  // Sync with Firestore (Finance & Client records)
  const outcome = await syncInvoiceRecords(invoice)

  // Record Revenue if paid
  if (outcome && outcome.deltaPaid > 0 && outcome.workspaceId) {
    await recordInvoiceRevenue({
      workspaceId: outcome.workspaceId,
      clientId: outcome.clientId,
      amountDelta: outcome.deltaPaid,
      paidAt: outcome.paidAt,
      currency: outcome.currency,
    })
  }

  const clientRef = adminDb
    .collection('workspaces')
    .doc(workspaceId)
    .collection('clients')
    .doc(clientId)

  const clientSnapshot = await clientRef.get()
  const clientData = clientSnapshot.data()
  const clientName = (clientData?.name as string) || 'Client'
  const amountPaid = invoice.amount_paid
  const currency = invoice.currency

  await recordInvoicePaidNotification({
    workspaceId,
    invoiceId: invoice.id,
    clientId,
    clientName,
    amount: amountPaid / 100,
    currency,
    invoiceNumber: invoice.number,
  })

  await notifyInvoicePaidWhatsApp({
    workspaceId,
    clientName,
    amount: amountPaid / 100,
    currency,
    invoiceNumber: invoice.number,
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Sync with Firestore to update status to 'overdue' or 'open' (handled by syncInvoiceRecords logic)
  await syncInvoiceRecords(invoice)
}
