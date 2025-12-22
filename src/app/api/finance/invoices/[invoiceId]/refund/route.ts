import { z } from 'zod'
import type Stripe from 'stripe'

import { createApiHandler } from '@/lib/api-handler'
import { checkRateLimit } from '@/lib/rate-limit'
import { getStripeClient } from '@/lib/stripe'
import { recordInvoiceRevenue, syncInvoiceRecords } from '@/lib/finance-sync'

type InvoiceWithPaymentIntent = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null
}

const refundSchema = z.object({
  amount: z.number().positive().optional(),
})

export const POST = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required',
    bodySchema: refundSchema
  },
  async (req, { auth, workspace, body: payload, params }) => {
    const { invoiceId } = params
    const trimmedInvoiceId = (invoiceId as string)?.trim()
    if (!trimmedInvoiceId) {
      return { error: 'Invoice id is required', status: 400 }
    }

    // Rate limit: 5 refund attempts per minute per user
    const rateLimitResult = await checkRateLimit(`refund:${auth.uid}`)
    if (!rateLimitResult.success) {
      return { error: 'Too many refund requests. Please wait a moment.', status: 429 }
    }

    const invoiceRef = workspace!.financeInvoicesCollection.doc(trimmedInvoiceId)
    const invoiceSnapshot = await invoiceRef.get()

    if (!invoiceSnapshot.exists) {
      return { error: 'Invoice not found in this workspace', status: 404 }
    }

    const invoiceData = invoiceSnapshot.data() as { amount?: unknown; amountPaid?: unknown; amountRefunded?: unknown; clientId?: unknown }
    const amountPaid = typeof invoiceData?.amountPaid === 'number' ? invoiceData.amountPaid : typeof invoiceData?.amount === 'number' ? invoiceData.amount : 0
    const amountAlreadyRefunded = typeof invoiceData?.amountRefunded === 'number' ? invoiceData.amountRefunded : 0

    if (amountPaid <= 0) {
      return { error: 'Invoice has no recorded payments to refund', status: 400 }
    }

    const requestedAmount = payload.amount
    if (typeof requestedAmount === 'number') {
      const normalizedRequested = Math.round(requestedAmount * 100) / 100
      const maxRefundable = Math.max(amountPaid - amountAlreadyRefunded, 0)
      if (normalizedRequested <= 0 || normalizedRequested - maxRefundable > 0.0001) {
        return { error: 'Refund amount exceeds paid balance', status: 400 }
      }
    }

    try {
      const stripe = getStripeClient()
      const stripeInvoice = (await stripe.invoices.retrieve(trimmedInvoiceId, { expand: ['payment_intent'] })) as Stripe.Invoice
      const invoiceWithIntent = stripeInvoice as InvoiceWithPaymentIntent

      if (!invoiceWithIntent.payment_intent) {
        return { error: 'Unable to locate payment intent for this invoice', status: 400 }
      }

      const paymentIntentId = typeof invoiceWithIntent.payment_intent === 'string'
        ? invoiceWithIntent.payment_intent
        : invoiceWithIntent.payment_intent?.id ?? null

      if (!paymentIntentId) {
        return { error: 'Unable to locate payment intent for this invoice', status: 400 }
      }

      const invoiceCurrency = typeof stripeInvoice.currency === 'string' ? stripeInvoice.currency : 'usd'

      const refundAmountCents = typeof requestedAmount === 'number'
        ? Math.round(requestedAmount * 100)
        : typeof stripeInvoice.amount_paid === 'number'
          ? stripeInvoice.amount_paid
          : Math.round(amountPaid * 100)

      // Generate idempotency key to prevent duplicate refunds
      const idempotencyKey = `refund_${trimmedInvoiceId}_${refundAmountCents}_${Date.now().toString(36)}`

      const refund = await stripe.refunds.create(
        {
          payment_intent: paymentIntentId,
          amount: refundAmountCents,
          metadata: {
            workspaceId: workspace!.workspaceId,
            invoiceId: trimmedInvoiceId,
            clientId: typeof invoiceData?.clientId === 'string' ? invoiceData.clientId : '',
          },
        },
        { idempotencyKey }
      )

      const refundAmountDollars = Math.round((refund.amount / 100) * 100) / 100

      const refreshedInvoice = (await stripe.invoices.retrieve(trimmedInvoiceId)) as Stripe.Invoice
      const previousRefundedCents = Math.round(Math.max(amountAlreadyRefunded, 0) * 100)
      const refundTotalCents = previousRefundedCents + refund.amount

      const syncOutcome = await syncInvoiceRecords(refreshedInvoice, {
        eventType: 'manual.refund',
        refundTotalCents,
      })

      if (syncOutcome && syncOutcome.workspaceId && syncOutcome.deltaRefunded > 0) {
        await recordInvoiceRevenue({
          workspaceId: syncOutcome.workspaceId,
          clientId: syncOutcome.clientId,
          amountDelta: -syncOutcome.deltaRefunded,
          paidAt: syncOutcome.paidAt,
          currency: syncOutcome.currency,
        })
      }

      return {
        refund: {
          id: refund.id,
          amount: refundAmountDollars,
          currency: invoiceCurrency,
        },
      }
    } catch (error: unknown) {
      if (isStripeError(error)) {
        return { error: error.message, status: error.statusCode ?? 400 }
      }
      throw error
    }
  }
)

function isStripeError(error: unknown): error is Stripe.errors.StripeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  )
}
