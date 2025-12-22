import type Stripe from 'stripe'

import { createApiHandler } from '@/lib/api-handler'
import { getStripeClient } from '@/lib/stripe'

export const POST = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required'
  },
  async (req, { workspace, params }) => {
    const { invoiceId } = params
    const trimmedInvoiceId = (invoiceId as string)?.trim()
    if (!trimmedInvoiceId) {
      return { error: 'Invoice id is required', status: 400 }
    }

    const invoiceRef = workspace!.financeInvoicesCollection.doc(trimmedInvoiceId)
    const invoiceSnapshot = await invoiceRef.get()

    if (!invoiceSnapshot.exists) {
      return { error: 'Invoice not found in this workspace', status: 404 }
    }

    try {
      const stripe = getStripeClient()
      const result = await stripe.invoices.sendInvoice(trimmedInvoiceId)

      return { ok: true, status: result.status ?? 'sent' }
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
