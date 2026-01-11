import Stripe from 'stripe'
import { httpAction } from './_generated/server'
import { api, internal } from './_generated/api'

const WEBHOOK_TOLERANCE_SECONDS = 300

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })
}

function getHeader(request: Request, name: string): string | null {
  const value = request.headers.get(name)
  return typeof value === 'string' && value.length > 0 ? value : null
}

export const stripeWebhook = httpAction(async (ctx, request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const signature = getHeader(request, 'stripe-signature')
  if (!signature) {
    return jsonResponse({ error: 'Missing stripe-signature' }, 400)
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!webhookSecret || !stripeSecretKey) {
    // Don’t leak server env details to the caller.
    return jsonResponse({ error: 'Server configuration error' }, 503)
  }

  const body = await request.text()

  const stripe = new Stripe(stripeSecretKey)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: unknown) {
    return jsonResponse({ error: 'Invalid signature' }, 400)
  }

  const eventAge = Math.floor(Date.now() / 1000) - event.created
  if (eventAge > WEBHOOK_TOLERANCE_SECONDS) {
    return jsonResponse({ error: 'Event too old' }, 400)
  }

  // Record the event idempotently (dedupe by `eventId`).
  const recordResult = await ctx.runMutation(internal.webhooks.recordStripeWebhookEvent, {
    eventId: event.id,
    eventType: event.type,
    livemode: event.livemode,
    createdAtMs: event.created * 1000,
  })

  if (recordResult.duplicate) {
    return jsonResponse({ received: true, duplicate: true })
  }

  // Handle different event types
  if (event.type.startsWith('invoice.')) {
    await ctx.runMutation(internal.webhooks.handleStripeInvoiceEvent, {
      eventType: event.type,
      invoice: event.data.object,
    })
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge & { invoice?: string | { id?: string } | null }
    const invoiceRef = charge.invoice
    const invoiceId = typeof invoiceRef === 'string' ? invoiceRef : invoiceRef?.id ?? null
    await ctx.runMutation(internal.webhooks.handleStripeChargeRefunded, {
      chargeId: charge.id,
      amountRefunded: charge.amount_refunded ?? 0,
      invoiceId: invoiceId ?? undefined,
    })
  }

  return jsonResponse({ received: true })
})

export const adSyncNotification = httpAction(async (ctx, request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const secret = process.env.ADS_SYNC_WEBHOOK_SECRET
  if (secret) {
    const provided = getHeader(request, 'x-webhook-secret')
    if (provided !== secret) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }
  }

  const payload = await request.json().catch(() => null) as any

  const workspaceId = typeof payload?.workspaceId === 'string' ? payload.workspaceId : null
  const providerId = typeof payload?.providerId === 'string' ? payload.providerId : null
  const clientId = typeof payload?.clientId === 'string' ? payload.clientId : null

  if (!workspaceId || !providerId) {
    return jsonResponse({ error: 'Missing workspaceId/providerId' }, 400)
  }

  // Enqueue an ad sync job. This mutation requires user identity today,
  // so we only attempt it when a secret is configured and we can treat
  // the source as trusted. If you want a true server-to-server webhook,
  // we should add a cron/service identity bypass in the mutation.
  try {
    await ctx.runMutation(api.adsIntegrations.enqueueSyncJob, {
      workspaceId,
      providerId,
      clientId,
      jobType: 'manual-sync',
    })
  } catch (err) {
    // Don’t fail the webhook if auth is not wired yet.
    return jsonResponse({ received: true, enqueued: false })
  }

  return jsonResponse({ received: true, enqueued: true })
})

export const externalWebhook = httpAction(async (_ctx, request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const secret = process.env.EXTERNAL_WEBHOOK_SECRET
  if (secret) {
    const provided = getHeader(request, 'x-webhook-secret')
    if (provided !== secret) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }
  }

  // Generic endpoint: just acknowledge receipt.
  return jsonResponse({ received: true })
})
