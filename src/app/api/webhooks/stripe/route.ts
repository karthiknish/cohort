import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { getStripeClient } from '@/lib/stripe'
import { adminDb } from '@/lib/firebase-admin'
import { recordInvoicePaidNotification, notifyInvoicePaidWhatsApp } from '@/lib/notifications'
import { syncInvoiceRecords, recordInvoiceRevenue } from '@/lib/finance-sync'
import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError, ValidationError } from '@/lib/api-errors'

// Maximum age of webhook events to accept (5 minutes)
const WEBHOOK_TOLERANCE_SECONDS = 300

export const POST = createApiHandler({ auth: 'none', rateLimit: 'standard' }, async (req) => {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    throw new ValidationError('Missing stripe-signature')
  }

  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set')
    throw new ServiceUnavailableError('Server configuration error')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[stripe-webhook] Webhook signature verification failed: ${message}`)
    throw new ValidationError('Invalid signature')
  }

  // Replay attack protection: reject events older than tolerance
  const eventAge = Math.floor(Date.now() / 1000) - event.created
  if (eventAge > WEBHOOK_TOLERANCE_SECONDS) {
    console.warn(`[stripe-webhook] Rejecting stale event ${event.id}, age: ${eventAge}s`)
    throw new ValidationError('Event too old')
  }

  // Idempotency check: ensure we haven't processed this event before
  const processedRef = adminDb.collection('_stripeWebhookEvents').doc(event.id)
  const processedSnap = await processedRef.get()
  
  if (processedSnap.exists) {
    // Already processed this event, return success to prevent retries
    console.log(`[stripe-webhook] Event ${event.id} already processed, skipping`)
    return { received: true, duplicate: true }
  }

  try {
    switch (event.type) {
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice, event.type)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, event.type)
        break
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      case 'invoice.finalized':
      case 'invoice.voided':
      case 'invoice.marked_uncollectible':
      case 'invoice.payment_action_required':
        await syncInvoiceRecords(event.data.object as Stripe.Invoice, { eventType: event.type })
        break
      default:
        // Unhandled event type
        break
    }

    // Mark event as processed
    await processedRef.set({
      eventType: event.type,
      processedAt: new Date().toISOString(),
      livemode: event.livemode,
    })
  } catch (error) {
    console.error(`[stripe-webhook] Error handling event ${event.type}`, error)
    throw new ServiceUnavailableError('Webhook handler failed')
  }

  return { received: true }
})

async function handleInvoicePaid(invoice: Stripe.Invoice, eventType: string) {
  const workspaceId = invoice.metadata?.workspaceId
  const clientId = invoice.metadata?.clientId

  if (!workspaceId || !clientId) {
    console.warn('[stripe-webhook] Invoice missing metadata', { id: invoice.id, metadata: invoice.metadata })
    return
  }

  // Sync with Firestore (Finance & Client records)
  const outcome = await syncInvoiceRecords(invoice, { eventType })

  // Record Revenue if paid
  if (outcome && outcome.workspaceId) {
    if (outcome.deltaPaid > 0) {
      await recordInvoiceRevenue({
        workspaceId: outcome.workspaceId,
        clientId: outcome.clientId,
        amountDelta: outcome.deltaPaid,
        paidAt: outcome.paidAt,
        currency: outcome.currency,
      })
    }
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

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, eventType: string) {
  // Sync with Firestore to update status to 'overdue' or 'open' (handled by syncInvoiceRecords logic)
  await syncInvoiceRecords(invoice, { eventType })
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const stripe = getStripeClient()
  const chargeWithInvoice = charge as Stripe.Charge & { invoice?: string | Stripe.Invoice | null }
  const invoiceRef = chargeWithInvoice.invoice ?? null
  const invoiceId = typeof invoiceRef === 'string' ? invoiceRef : invoiceRef?.id ?? null

  if (!invoiceId) {
    console.warn('[stripe-webhook] Charge refund missing invoice reference', {
      chargeId: charge.id,
    })
    return
  }

  const invoice = await stripe.invoices.retrieve(invoiceId)
  const refundTotalCents = typeof charge.amount_refunded === 'number' ? charge.amount_refunded : null

  const outcome = await syncInvoiceRecords(invoice, {
    eventType: 'charge.refunded',
    refundTotalCents,
  })

  if (outcome && outcome.workspaceId && outcome.deltaRefunded > 0) {
    await recordInvoiceRevenue({
      workspaceId: outcome.workspaceId,
      clientId: outcome.clientId,
      amountDelta: -outcome.deltaRefunded,
      paidAt: outcome.paidAt,
      currency: outcome.currency,
    })
  }
}
