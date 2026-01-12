"use node"

import Stripe from 'stripe'
import { action, query } from './_generated/server'
import { api } from './_generated/api'
import { v } from 'convex/values'
import { authenticatedAction } from './functions'

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(secretKey)
}

function toISO(ms: number): string {
  return new Date(ms).toISOString()
}

type BillingPlanDefinition = {
  id: string
  name: string
  priceId: string
  features?: string[]
}

function getBillingPlans(): BillingPlanDefinition[] {
  const plansJson = process.env.BILLING_PLANS
  if (!plansJson) return []
  try {
    const parsed = JSON.parse(plansJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getBillingPlanById(planId: string): BillingPlanDefinition | null {
  const plans = getBillingPlans()
  return plans.find((p) => p.id === planId) ?? null
}

type PlanSummary = BillingPlanDefinition & {
  unitAmount: number | null
  currency: string | null
  interval: string | null
  productName: string | null
}

async function loadPlanSummaries(stripe: Stripe): Promise<PlanSummary[]> {
  const plans = getBillingPlans()
  if (!plans.length) return []

  const summaries: PlanSummary[] = []

  for (const plan of plans) {
    try {
      const price = await stripe.prices.retrieve(plan.priceId, {
        expand: ['product'],
      })

      const product = typeof price.product === 'object' && price.product !== null ? price.product : null

      summaries.push({
        ...plan,
        unitAmount: price.unit_amount ?? null,
        currency: price.currency ?? null,
        interval: price.recurring?.interval ?? null,
        productName: product && 'name' in product ? ((product as { name?: string }).name ?? null) : null,
      })
    } catch (error) {
      console.error(`[billing] Failed to fetch Stripe price ${plan.priceId}`, error)
    }
  }

  return summaries
}

type SubscriptionSummary = {
  id: string
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string | null
  currentPeriodStart: string | null
  price: {
    id: string
    currency: string | null
    unitAmount: number | null
    interval: string | null
    nickname: string | null
  } | null
  plan: {
    id: string
    name: string
  } | null
  isManagedByApp: boolean
}

function subscriptionDateField(subscription: Stripe.Subscription, field: string): string | null {
  const value = (subscription as unknown as Record<string, unknown>)[field]
  if (typeof value !== 'number') return null
  return toISO(value * 1000)
}

async function mapSubscriptionSummary(options: {
  subscription: Stripe.Subscription | null
  planSummaries: PlanSummary[]
  allowedPriceIds: Set<string>
}): Promise<{
  subscriptionSummary: SubscriptionSummary | null
  planIdForSubscription: string | null
}> {
  const { subscription, planSummaries, allowedPriceIds } = options

  if (!subscription) {
    return { subscriptionSummary: null, planIdForSubscription: null }
  }

  const price = subscription.items?.data?.[0]?.price ?? null
  const priceId = price?.id ?? null

  const planMatch = priceId ? planSummaries.find((plan) => plan.priceId === priceId) ?? null : null
  const allowed = priceId ? allowedPriceIds.has(priceId) : false

  const summary: SubscriptionSummary = {
    id: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    currentPeriodEnd: subscriptionDateField(subscription, 'current_period_end'),
    currentPeriodStart: subscriptionDateField(subscription, 'current_period_start'),
    price: price
      ? {
          id: price.id,
          currency: price.currency ?? null,
          unitAmount: price.unit_amount ?? null,
          interval: price.recurring?.interval ?? null,
          nickname: price.nickname ?? null,
        }
      : null,
    plan: planMatch
      ? {
          id: planMatch.id,
          name: planMatch.name,
        }
      : priceId
        ? {
            id: priceId,
            name: price?.nickname ?? price?.id ?? 'Stripe price',
          }
        : null,
    isManagedByApp: allowed,
  }

  return {
    subscriptionSummary: summary,
    planIdForSubscription: planMatch?.id ?? null,
  }
}

async function ensureStripeCustomer(
  ctx: { runQuery: any; runMutation: any },
  stripe: Stripe,
  uid: string,
  email: string | null
): Promise<string> {
  const user = await ctx.runQuery(api.users.getByLegacyId, { legacyId: uid })
  const existingCustomerId = user?.stripeCustomerId

  if (existingCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(existingCustomerId)
      if (typeof customer === 'object' && !('deleted' in customer && customer.deleted)) {
        return existingCustomerId
      }
    } catch {
      // Customer not found, create new
    }
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId: uid },
  })

  // Update user with new customer ID
  await ctx.runMutation(api.users.setStripeCustomerId, {
    legacyId: uid,
    stripeCustomerId: customer.id,
  })

  return customer.id
}

export const getStatus = authenticatedAction({
  args: {},
  handler: async (ctx: any) => {
    const uid = ctx.legacyId
    const email = ctx.user.email ?? null

    const stripe = getStripeClient()
    const customerId = await ensureStripeCustomer(ctx, stripe, uid, email)

    const planSummaries = await loadPlanSummaries(stripe)
    const priceIds = new Set(planSummaries.map((plan) => plan.priceId))

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
      expand: ['data.items.data.price.product', 'data.latest_invoice'],
    })

    const activeSubscription = subscriptions.data[0] ?? null

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 6,
      expand: ['data.charge'],
    })

    const invoiceSummaries = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amountPaid: invoice.amount_paid ?? 0,
      total: invoice.total ?? 0,
      currency: invoice.currency ?? null,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      invoicePdf: invoice.invoice_pdf ?? null,
      createdAt: invoice.created ? toISO(invoice.created * 1000) : null,
    }))

    const { subscriptionSummary } = await mapSubscriptionSummary({
      subscription: activeSubscription,
      planSummaries,
      allowedPriceIds: priceIds,
    })

    return {
      plans: planSummaries,
      subscription: subscriptionSummary,
      invoices: invoiceSummaries,
      upcomingInvoice: null,
    }
  },
})

export const createCheckoutSession = authenticatedAction({
  args: {
    planId: v.string(),
    successPath: v.optional(v.string()),
    cancelPath: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const uid = ctx.legacyId
    const email = ctx.user.email ?? null

    const stripe = getStripeClient()

    const plan = getBillingPlanById(args.planId)
    if (!plan) {
      throw new Error('Plan is not available')
    }

    const customerId = await ensureStripeCustomer(ctx, stripe, uid, email)

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const successUrl = buildReturnUrl(origin, args.successPath ?? '/settings?checkout=success')
    const cancelUrl = buildReturnUrl(origin, args.cancelPath ?? '/settings?checkout=cancelled')

    const idempotencyKey = `checkout_${uid}_${plan.id}_${Date.now().toString(36)}`

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
            userId: uid,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      { idempotencyKey }
    )

    return { url: session.url, sessionId: session.id }
  },
})

export const createPortalSession = authenticatedAction({
  args: {
    clientId: v.optional(v.string()),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const uid = ctx.legacyId
    const email = ctx.user.email ?? null

    const stripe = getStripeClient()
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const returnPath =
      typeof args.returnUrl === 'string' && args.returnUrl.trim().length > 0
        ? args.returnUrl.trim()
        : args.clientId
          ? '/dashboard/finance/payments'
          : '/settings'

    if (args.clientId) {
      const client = await ctx.runQuery(api.clients.getByLegacyId, {
        workspaceId: ctx.legacyId,
        legacyId: args.clientId,
      })

      if (!client) {
        throw new Error('Client not found')
      }

      const stripeCustomerId = client.stripeCustomerId
      if (!stripeCustomerId) {
        throw new Error('This client does not have a Stripe customer profile yet')
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: buildReturnUrl(origin, returnPath),
      })

      return { url: portalSession.url, sessionId: portalSession.id }
    }

    const customerId = await ensureStripeCustomer(ctx, stripe, uid, email)

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: buildReturnUrl(origin, returnPath),
    })

    return { url: portalSession.url, sessionId: portalSession.id }
  },
})

function buildReturnUrl(origin: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path)
      const originUrl = new URL(origin)
      if (url.origin !== originUrl.origin) {
        return origin
      }
      return path
    } catch {
      return origin
    }
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${origin.replace(/\/$/, '')}${normalizedPath}`
}
