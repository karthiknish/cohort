import type Stripe from 'stripe'

import { createApiHandler } from '@/lib/api-handler'
import { getStripeClient } from '@/lib/stripe'
import { NotFoundError, ServiceUnavailableError, ValidationError } from '@/lib/api-errors'

export const POST = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required',
    rateLimit: 'sensitive'
  },
  async (req, { workspace, params }) => {
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

    try {
      const stripe = getStripeClient()
      const result = await stripe.invoices.sendInvoice(trimmedInvoiceId)

      return { ok: true, status: result.status ?? 'sent' }
    } catch (error: unknown) {
      if (isStripeError(error)) {
        throw new ServiceUnavailableError(error.message)
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
