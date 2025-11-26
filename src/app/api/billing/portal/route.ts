import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { ensureStripeCustomer } from '@/lib/billing'
import { getStripeClient } from '@/lib/stripe'
import { resolveWorkspaceContext } from '@/lib/workspace'

const portalSchema = z.object({
  clientId: z.string().trim().min(1).optional().nullable(),
  returnUrl: z.string().trim().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    // Rate limit: 10 portal access attempts per minute per user
    const rateLimitResult = await checkRateLimit(`portal:${auth.uid}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      )
    }

    const stripe = getStripeClient()
    const rawBody = await request.json().catch(() => ({}))
    const parsed = portalSchema.safeParse(rawBody)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid portal request' }, { status: 400 })
    }

    const { clientId, returnUrl: requestedReturnUrl } = parsed.data
    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnPath = typeof requestedReturnUrl === 'string' && requestedReturnUrl.trim().length > 0
      ? requestedReturnUrl.trim()
      : clientId
        ? '/dashboard/finance/payments'
        : '/settings'

    if (clientId) {
      const workspace = await resolveWorkspaceContext(auth)
      const clientRef = workspace.clientsCollection.doc(clientId)
      const clientSnapshot = await clientRef.get()

      if (!clientSnapshot.exists) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }

      const clientData = clientSnapshot.data() as { stripeCustomerId?: unknown }
      const stripeCustomerId =
        typeof clientData?.stripeCustomerId === 'string' && clientData.stripeCustomerId.trim().length > 0
          ? clientData.stripeCustomerId.trim()
          : null

      if (!stripeCustomerId) {
        return NextResponse.json({ error: 'This client does not have a Stripe customer profile yet' }, { status: 400 })
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: buildReturnUrl(origin, returnPath),
      })

      if (!portalSession?.url) {
        throw new Error('Stripe did not return a portal URL')
      }

      return NextResponse.json({ url: portalSession.url, sessionId: portalSession.id })
    }

    const { customerId, userRef } = await ensureStripeCustomer({
      uid: auth.uid,
      email: auth.email,
    })

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: buildReturnUrl(origin, returnPath),
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
