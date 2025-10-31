import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type Stripe from 'stripe'

import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { getStripeClient } from '@/lib/stripe'
import { recordInvoiceRevenue, syncInvoiceRecords } from '@/lib/finance-sync'

type InvoiceWithPaymentIntent = Stripe.Invoice & {
  payment_intent?: string | Stripe.PaymentIntent | null
}

const refundSchema = z.object({
  amount: z.number().positive().optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    assertAdmin(auth)

    const { invoiceId } = await context.params
    const trimmedInvoiceId = invoiceId?.trim()
    if (!trimmedInvoiceId) {
      return NextResponse.json({ error: 'Invoice id is required' }, { status: 400 })
    }

    const workspace = await resolveWorkspaceContext(auth)
    const invoiceRef = workspace.financeInvoicesCollection.doc(trimmedInvoiceId)
    const invoiceSnapshot = await invoiceRef.get()

    if (!invoiceSnapshot.exists) {
      return NextResponse.json({ error: 'Invoice not found in this workspace' }, { status: 404 })
    }

    const invoiceData = invoiceSnapshot.data() as { amount?: unknown; amountPaid?: unknown; amountRefunded?: unknown; clientId?: unknown }
    const amountPaid = typeof invoiceData?.amountPaid === 'number' ? invoiceData.amountPaid : typeof invoiceData?.amount === 'number' ? invoiceData.amount : 0
    const amountAlreadyRefunded = typeof invoiceData?.amountRefunded === 'number' ? invoiceData.amountRefunded : 0

    if (amountPaid <= 0) {
      return NextResponse.json({ error: 'Invoice has no recorded payments to refund' }, { status: 400 })
    }

    const rawBody = await request.json().catch(() => ({}))
    const parsed = refundSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid refund payload' }, { status: 400 })
    }

    const requestedAmount = parsed.data.amount
    if (typeof requestedAmount === 'number') {
      const normalizedRequested = Math.round(requestedAmount * 100) / 100
      const maxRefundable = Math.max(amountPaid - amountAlreadyRefunded, 0)
      if (normalizedRequested <= 0 || normalizedRequested - maxRefundable > 0.0001) {
        return NextResponse.json({ error: 'Refund amount exceeds paid balance' }, { status: 400 })
      }
    }

    const stripe = getStripeClient()
    const stripeInvoice = (await stripe.invoices.retrieve(trimmedInvoiceId, { expand: ['payment_intent'] })) as Stripe.Invoice
    const invoiceWithIntent = stripeInvoice as InvoiceWithPaymentIntent

    if (!invoiceWithIntent.payment_intent) {
      return NextResponse.json({ error: 'Unable to locate payment intent for this invoice' }, { status: 400 })
    }

    const paymentIntentId = typeof invoiceWithIntent.payment_intent === 'string'
      ? invoiceWithIntent.payment_intent
      : invoiceWithIntent.payment_intent?.id ?? null

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Unable to locate payment intent for this invoice' }, { status: 400 })
    }

    const invoiceCurrency = typeof stripeInvoice.currency === 'string' ? stripeInvoice.currency : 'usd'

    const refundAmountCents = typeof requestedAmount === 'number'
      ? Math.round(requestedAmount * 100)
      : typeof stripeInvoice.amount_paid === 'number'
        ? stripeInvoice.amount_paid
        : Math.round(amountPaid * 100)

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmountCents,
      metadata: {
        workspaceId: workspace.workspaceId,
        invoiceId: trimmedInvoiceId,
        clientId: typeof invoiceData?.clientId === 'string' ? invoiceData.clientId : '',
      },
    })

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

    return NextResponse.json({
      refund: {
        id: refund.id,
        amount: refundAmountDollars,
        currency: invoiceCurrency,
      },
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isStripeError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode ?? 400 })
    }

    console.error('[finance] Failed to issue invoice refund', error)
    return NextResponse.json({ error: 'Unable to issue refund' }, { status: 500 })
  }
}

function isStripeError(error: unknown): error is Stripe.errors.StripeError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'statusCode' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  )
}
