import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'
import { z } from 'zod'

import { checkRateLimit } from '@/lib/rate-limit'
import { ensureStripeCustomer, getBillingPlanById } from '@/lib/billing'
import { getStripeClient } from '@/lib/stripe'
import { createApiHandler } from '@/lib/api-handler'

const checkoutSchema = z.object({
  planId: z.string().min(1),
  successPath: z.string().optional(),
  cancelPath: z.string().optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: checkoutSchema,
  },
  async (req, { auth, body }) => {
  if (!auth.uid) {
    return { error: 'Authentication required', status: 401 }
  }

  // Rate limit: 5 checkout attempts per minute per user
  const rateLimitResult = await checkRateLimit(`checkout:${auth.uid}`)
  if (!rateLimitResult.success) {
    return { 
      error: 'Too many checkout attempts. Please wait a moment.', 
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.reset),
      }
    }
  }

  const stripe = getStripeClient()
  const { planId, successPath, cancelPath } = body

  const plan = getBillingPlanById(planId)
  if (!plan) {
    return { error: 'Plan is not available', status: 404 }
  }

  const { customerId, userRef } = await ensureStripeCustomer({
    uid: auth.uid,
    email: auth.email,
  })

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const successUrl = buildReturnUrl(origin, successPath ?? '/settings?checkout=success')
  const cancelUrl = buildReturnUrl(origin, cancelPath ?? '/settings?checkout=cancelled')

  // Generate idempotency key to prevent duplicate sessions
  const idempotencyKey = `checkout_${auth.uid}_${plan.id}_${Date.now().toString(36)}`

  try {
    const session = await stripe.checkout.sessions.create(
      {
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
      },
      {
        idempotencyKey,
      }
    )

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

    return { url: session.url, sessionId: session.id }
  } catch (error: unknown) {
    if (isStripeError(error)) {
      return { error: error.message, status: error.statusCode ?? 400 }
    }
    throw error
  }
})

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
