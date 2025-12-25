import { z } from 'zod'
import type Stripe from 'stripe'

import { ApiError, NotFoundError, ValidationError } from '@/lib/api-errors'
import { createApiHandler } from '@/lib/api-handler'
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
    bodySchema: refundSchema,
    rateLimit: 'sensitive'
  },
  async (req, { auth, workspace, body: payload, params }) => {
    const { invoiceId } = params
    const trimmedInvoiceId = (invoiceId as string)?.trim()
    if (!trimmedInvoiceId) {
      throw new ValidationError('Invoice id is required')
    }

    const invoiceRef = workspace!.financeInvoicesCollection.doc(trimmedInvoiceId)
    const invoiceSnapshot = await invoiceRef.get()

    if (!invoiceSnapshot.exists) {
      throw new NotFoundError('Invoice not found in this workspace')
    }

    const invoiceData = invoiceSnapshot.data() as { amount?: unknown; amountPaid?: unknown; amountRefunded?: unknown; clientId?: unknown }
    const amountPaid = typeof invoiceData?.amountPaid === 'number' ? invoiceData.amountPaid : typeof invoiceData?.amount === 'number' ? invoiceData.amount : 0
    const amountAlreadyRefunded = typeof invoiceData?.amountRefunded === 'number' ? invoiceData.amountRefunded : 0

    if (amountPaid <= 0) {
      throw new ValidationError('Invoice has no recorded payments to refund')
    }

    const requestedAmount = payload.amount
    if (typeof requestedAmount === 'number') {
      const normalizedRequested = Math.round(requestedAmount * 100) / 100
      const maxRefundable = Math.max(amountPaid - amountAlreadyRefunded, 0)
      if (normalizedRequested <= 0 || normalizedRequested - maxRefundable > 0.0001) {
        throw new ValidationError('Refund amount exceeds paid balance')
      }
    }

    try {
      const stripe = getStripeClient()
      const stripeInvoice = (await stripe.invoices.retrieve(trimmedInvoiceId, { expand: ['payment_intent'] })) as Stripe.Invoice
      const invoiceWithIntent = stripeInvoice as InvoiceWithPaymentIntent

      if (!invoiceWithIntent.payment_intent) {
        throw new ValidationError('Unable to locate payment intent for this invoice')
      }

      const paymentIntentId = typeof invoiceWithIntent.payment_intent === 'string'
        ? invoiceWithIntent.payment_intent
        : invoiceWithIntent.payment_intent?.id ?? null

      if (!paymentIntentId) {
        throw new ValidationError('Unable to locate payment intent for this invoice')
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
        throw new ApiError(error.message, error.statusCode ?? 400, 'STRIPE_ERROR')
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
