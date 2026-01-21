import { cache } from 'react'
import { ConvexHttpClient } from 'convex/browser'

import { getStripeClient } from '@/lib/stripe'
import { api } from '../../convex/_generated/api'

// Lazy-init Convex client
let _convexClient: ConvexHttpClient | null = null
function getConvexClient(): ConvexHttpClient | null {
  if (_convexClient) return _convexClient
  const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  _convexClient = new ConvexHttpClient(url)
  return _convexClient
}

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

const getStripeCustomerIdFromConvex = cache(
  async (convex: ConvexHttpClient, legacyId: string) => {
    // TODO: This function is now internal to Convex. Use a dedicated Action or verify this code path is needed.
    // return await convex.query(api.users.getStripeCustomerId, { legacyId })
    console.warn('Skipping getStripeCustomerIdFromConvex - internal function')
    return { stripeCustomerId: null, userExists: false }
  }
)

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
}): Promise<{ customerId: string }> {
  const { uid, email, name } = options
  const stripe = getStripeClient()
  const convex = getConvexClient()

  // Get existing Stripe customer ID from Convex
  let customerId: string | undefined
  if (convex) {
    const result = await getStripeCustomerIdFromConvex(convex, uid)
    customerId = result.stripeCustomerId ?? undefined
  }

  // Verify customer still exists in Stripe
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

  // Create new Stripe customer if needed
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: email ?? undefined,
      name: name ?? undefined,
      metadata: {
        userId: uid,
      },
    })
    customerId = customer.id

    // Save to Convex
    if (convex) {
      // TODO: This mutation is now internal to Convex. Use a dedicated Action or verify this code path is needed.
      /*
      await convex.mutation(api.users.setStripeCustomerId, {
        legacyId: uid,
        stripeCustomerId: customerId,
        email: email ?? null,
        name: name ?? null,
      })
      */
      console.warn('Skipping setStripeCustomerId - internal mutation')
    }
  }

  return { customerId }
}

function isResourceMissingError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'resource_missing'
}
