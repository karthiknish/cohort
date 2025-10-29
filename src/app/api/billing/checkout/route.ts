import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { ensureStripeCustomer, getBillingPlanById } from '@/lib/billing'
import { getStripeClient } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const stripe = getStripeClient()
    const body = (await request.json().catch(() => null)) as { planId?: string; successPath?: string; cancelPath?: string } | null
    const planId = typeof body?.planId === 'string' ? body.planId : null

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
    }

    const plan = getBillingPlanById(planId)
    if (!plan) {
      return NextResponse.json({ error: 'Plan is not available' }, { status: 404 })
    }

    const { customerId, userRef } = await ensureStripeCustomer({
      uid: auth.uid,
      email: auth.email,
    })

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const successUrl = buildReturnUrl(origin, typeof body?.successPath === 'string' ? body.successPath : '/settings?checkout=success')
    const cancelUrl = buildReturnUrl(origin, typeof body?.cancelPath === 'string' ? body.cancelPath : '/settings?checkout=cancelled')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          planId: plan.id,
          firebaseUid: auth.uid,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    await userRef.set(
      {
        billingProfile: {
          lastCheckoutSessionId: session.id,
          lastPlanIdAttempted: plan.id,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isStripeError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode ?? 400 })
    }

    console.error('[billing/checkout] Failed to create checkout session', error)
    return NextResponse.json({ error: 'Unable to start checkout session' }, { status: 500 })
  }
}

function buildReturnUrl(origin: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${origin.replace(/\/$/, '')}${normalizedPath}`
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
