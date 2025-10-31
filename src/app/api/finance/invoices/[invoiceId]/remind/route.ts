import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { getStripeClient } from '@/lib/stripe'

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

    const stripe = getStripeClient()
    const result = await stripe.invoices.sendInvoice(trimmedInvoiceId)

    return NextResponse.json({ ok: true, status: result.status ?? 'sent' })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isStripeError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode ?? 400 })
    }

    console.error('[finance] Failed to send invoice reminder', error)
    return NextResponse.json({ error: 'Unable to send invoice reminder' }, { status: 500 })
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
