import type Stripe from 'stripe'

import { getStripeClient } from '@/lib/stripe'
import { recordInvoiceRevenue, syncInvoiceRecords, type SyncOutcome } from '@/lib/finance-sync'
import { createApiHandler } from '@/lib/api-handler'
import { ServiceUnavailableError, ValidationError } from '@/lib/api-errors'

export const runtime = 'nodejs'

const RELEVANT_EVENTS = new Set([
  'invoice.finalized',
  'invoice.payment_failed',
  'invoice.paid',
  'invoice.voided',
  'invoice.payment_succeeded',
  'invoice.payment_action_required',
  'invoice.marked_uncollectible',
  'charge.refunded',
])

export const POST = createApiHandler({ auth: 'none', rateLimit: 'standard' }, async (req) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[billing] Missing STRIPE_WEBHOOK_SECRET')
    throw new ServiceUnavailableError('Webhook not configured')
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.warn('[billing] Stripe signature missing from webhook')
    throw new ValidationError('Signature missing')
  }

  const rawBody = await req.text()
  const stripe = getStripeClient()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid payload'
    console.error('[billing] Failed to verify webhook signature', message)
    throw new ValidationError('Invalid signature')
  }

  if (!RELEVANT_EVENTS.has(event.type)) {
    return { received: true }
  }

  try {
    let syncOutcome: SyncOutcome | null = null

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge & { invoice?: string | Stripe.Invoice | null }
      const invoiceRef = charge.invoice ?? null
      const invoiceId = typeof invoiceRef === 'string' ? invoiceRef : invoiceRef?.id ?? null

      if (!invoiceId) {
        console.warn('[billing] Charge refund missing invoice reference', {
          chargeId: charge.id,
        })
        return { received: true }
      }

      const invoice = await stripe.invoices.retrieve(invoiceId)
      const refundTotalCents = typeof charge.amount_refunded === 'number' ? charge.amount_refunded : undefined
      syncOutcome = await syncInvoiceRecords(invoice, {
        eventType: event.type,
        refundTotalCents: refundTotalCents ?? null,
      })
    } else {
      const invoice = event.data.object as Stripe.Invoice
      syncOutcome = await syncInvoiceRecords(invoice, { eventType: event.type })
    }

    if (syncOutcome && syncOutcome.workspaceId) {
      if (syncOutcome.deltaPaid > 0) {
        await recordInvoiceRevenue({
          workspaceId: syncOutcome.workspaceId,
          clientId: syncOutcome.clientId,
          amountDelta: syncOutcome.deltaPaid,
          paidAt: syncOutcome.paidAt,
          currency: syncOutcome.currency,
        })
      }

      if (syncOutcome.deltaRefunded > 0) {
        await recordInvoiceRevenue({
          workspaceId: syncOutcome.workspaceId,
          clientId: syncOutcome.clientId,
          amountDelta: -syncOutcome.deltaRefunded,
          paidAt: syncOutcome.paidAt,
          currency: syncOutcome.currency,
        })
      }
    }
  } catch (error) {
    console.error('[billing] Failed to sync invoice from webhook', error)
    throw new ServiceUnavailableError('Failed to persist invoice')
  }

  return { received: true }
})
