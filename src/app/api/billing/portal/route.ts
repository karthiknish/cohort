import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'
import { z } from 'zod'

import { ensureStripeCustomer } from '@/lib/billing'
import { getStripeClient } from '@/lib/stripe'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { ApiError, NotFoundError, UnauthorizedError, ValidationError } from '@/lib/api-errors'
import { createApiHandler } from '@/lib/api-handler'

const portalSchema = z.object({
  clientId: z.string().trim().min(1).optional().nullable(),
  returnUrl: z.string().trim().optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: portalSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const stripe = getStripeClient()
    const { clientId, returnUrl: requestedReturnUrl } = body
    const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const returnPath = typeof requestedReturnUrl === 'string' && requestedReturnUrl.trim().length > 0
      ? requestedReturnUrl.trim()
      : clientId
        ? '/dashboard/finance/payments'
        : '/settings'

    try {
      if (clientId) {
        const workspace = await resolveWorkspaceContext(auth)
        const clientRef = workspace.clientsCollection.doc(clientId)
        const clientSnapshot = await clientRef.get()

        if (!clientSnapshot.exists) {
          throw new NotFoundError('Client not found')
        }

        const clientData = clientSnapshot.data() as { stripeCustomerId?: unknown }
        const stripeCustomerId =
          typeof clientData?.stripeCustomerId === 'string' && clientData.stripeCustomerId.trim().length > 0
            ? clientData.stripeCustomerId.trim()
            : null

        if (!stripeCustomerId) {
          throw new ValidationError('This client does not have a Stripe customer profile yet')
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: stripeCustomerId,
          return_url: buildReturnUrl(origin, returnPath),
        })

        if (!portalSession?.url) {
          throw new Error('Stripe did not return a portal URL')
        }

        return { url: portalSession.url, sessionId: portalSession.id }
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

      return { url: portalSession.url, sessionId: portalSession.id }
    } catch (error: unknown) {
      if (isStripeError(error)) {
        throw new ApiError(error.message, error.statusCode ?? 400, 'STRIPE_ERROR')
      }
      throw error
    }
  }
)

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
