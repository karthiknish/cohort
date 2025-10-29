import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import type Stripe from 'stripe'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { ensureStripeCustomer, getBillingPlans, BillingPlanDefinition } from '@/lib/billing'
import { getStripeClient } from '@/lib/stripe'

interface PlanSummary extends BillingPlanDefinition {
  unitAmount: number | null
  currency: string | null
  interval: string | null
  productName: string | null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const stripe = getStripeClient()
    const { customerId, userRef } = await ensureStripeCustomer({
      uid: auth.uid,
      email: auth.email,
    })

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
      createdAt: invoice.created ? new Date(invoice.created * 1000).toISOString() : null,
    }))

    const { subscriptionSummary, planIdForSubscription } = await mapSubscriptionSummary({
      subscription: activeSubscription,
      planSummaries,
      allowedPriceIds: priceIds,
    })

    const upcomingInvoice = null

    await userRef.set(
      {
        stripeCustomerId: customerId,
        billingProfile: {
          subscriptionId: activeSubscription?.id ?? null,
          subscriptionStatus: activeSubscription?.status ?? null,
          planId: planIdForSubscription,
          priceId: activeSubscription?.items?.data?.[0]?.price?.id ?? null,
          cancelAtPeriodEnd: activeSubscription?.cancel_at_period_end ?? false,
          currentPeriodEnd: activeSubscription ? subscriptionDateField(activeSubscription, 'current_period_end') : null,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    )

    return NextResponse.json({
      plans: planSummaries,
      subscription: subscriptionSummary,
      invoices: invoiceSummaries,
      upcomingInvoice,
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('[billing/status] Failed to load billing overview', error)
    return NextResponse.json({ error: 'Unable to load billing overview' }, { status: 500 })
  }
}

async function loadPlanSummaries(stripe: Stripe): Promise<PlanSummary[]> {
  const plans = getBillingPlans()
  if (!plans.length) {
    return []
  }

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
  const value = readUnixTimestamp(subscription, field)
  if (value === null) {
    return null
  }

  return new Date(value * 1000).toISOString()
}

function readUnixTimestamp(subscription: Stripe.Subscription, field: string): number | null {
  const candidate = (subscription as unknown as Record<string, unknown>)[field]
  return typeof candidate === 'number' ? candidate : null
}
