import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { ensureStripeCustomer } from '@/lib/billing'
import { getStripeClient } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const stripe = getStripeClient()
    const body = (await request.json().catch(() => null)) as { returnUrl?: string } | null

    const { customerId, userRef } = await ensureStripeCustomer({
      uid: auth.uid,
      email: auth.email,
    })

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnUrl = buildReturnUrl(origin, typeof body?.returnUrl === 'string' ? body.returnUrl : '/settings')

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    await userRef.set(
      {
        billingProfile: {
          lastPortalSessionId: portalSession.id,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )

    return NextResponse.json({ url: portalSession.url, sessionId: portalSession.id })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isStripeError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode ?? 400 })
    }

    console.error('[billing/portal] Failed to create billing portal session', error)
    return NextResponse.json({ error: 'Unable to open billing portal' }, { status: 500 })
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
