import { FieldValue, DocumentReference } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { getStripeClient } from '@/lib/stripe'

interface PlanConfigInput {
  id: string
  name: string
  description: string
  envKey: string
  badge?: string
  features: string[]
}

export interface BillingPlanDefinition {
  id: string
  name: string
  description: string
  priceId: string
  badge?: string
  features: string[]
}

const planInputs: PlanConfigInput[] = [
  {
    id: 'starter-monthly',
    name: 'Starter',
    description: 'Everything small teams need to get productive quickly.',
    envKey: 'STRIPE_PRICE_STARTER_MONTHLY',
    features: ['Up to 5 client workspaces', 'Proposal generator access', 'Analytics overview dashboards'],
  },
  {
    id: 'growth-monthly',
    name: 'Growth',
    description: 'Advanced automation for scaling agencies that need deeper insights.',
    envKey: 'STRIPE_PRICE_GROWTH_MONTHLY',
    badge: 'Popular',
    features: ['Unlimited client workspaces', 'Advanced analytics and forecasting', 'Priority support & automations'],
  },
  {
    id: 'scale-monthly',
    name: 'Scale',
    description: 'Designed for enterprise teams that need compliance-ready collaboration.',
    envKey: 'STRIPE_PRICE_SCALE_MONTHLY',
    features: ['Custom integrations & SLAs', 'Dedicated success manager', 'Advanced permissions & audit logs'],
  },
]

let cachedPlans: BillingPlanDefinition[] | null = null

function loadConfiguredPlans(): BillingPlanDefinition[] {
  if (cachedPlans) {
    return cachedPlans
  }

  const plans: BillingPlanDefinition[] = []

  for (const input of planInputs) {
    const priceId = process.env[input.envKey as keyof NodeJS.ProcessEnv]
    if (!priceId) {
      continue
    }

    plans.push({
      id: input.id,
      name: input.name,
      description: input.description,
      priceId,
      badge: input.badge,
      features: input.features,
    })
  }

  cachedPlans = plans

  return cachedPlans
}

export function getBillingPlans(): BillingPlanDefinition[] {
  return loadConfiguredPlans()
}

export function getBillingPlanById(planId: string): BillingPlanDefinition | undefined {
  return loadConfiguredPlans().find((plan) => plan.id === planId)
}

export function getBillingPlanByPriceId(priceId: string): BillingPlanDefinition | undefined {
  return loadConfiguredPlans().find((plan) => plan.priceId === priceId)
}

export async function ensureStripeCustomer(options: {
  uid: string
  email?: string | null
  name?: string | null
}): Promise<{ customerId: string; userRef: DocumentReference }> {
  const { uid, email, name } = options
  const stripe = getStripeClient()
  const userRef = adminDb.collection('users').doc(uid)
  const userSnapshot = await userRef.get()
  let customerId = userSnapshot.exists
    ? ((userSnapshot.get('stripeCustomerId') as string | undefined) ?? undefined)
    : undefined

  if (customerId) {
    try {
      const existing = await stripe.customers.retrieve(customerId)
      if (typeof existing === 'object' && 'deleted' in existing && existing.deleted) {
        customerId = undefined
      }
    } catch (error: unknown) {
      if (!isResourceMissingError(error)) {
        throw error
      }
      customerId = undefined
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      name: name ?? undefined,
      metadata: {
        firebaseUid: uid,
      },
    })
    customerId = customer.id

    await userRef.set(
      {
        stripeCustomerId: customerId,
        billingProfile: {
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )
  } else {
    await userRef.set(
      {
        billingProfile: {
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )
  }

  return { customerId, userRef }
}

function isResourceMissingError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'resource_missing'
}
