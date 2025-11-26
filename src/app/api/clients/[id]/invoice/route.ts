import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'
import type Stripe from 'stripe'

import { getStripeClient } from '@/lib/stripe'
import { authenticateRequest, assertAdmin, AuthenticationError } from '@/lib/server-auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { resolveWorkspaceContext } from '@/lib/workspace'
import { recordInvoiceSentNotification, notifyInvoiceSentWhatsApp } from '@/lib/notifications'

const invoiceSchema = z.object({
  amount: z.coerce
    .number()
    .min(1, 'Invoice amount must be at least $1')
    .max(100000, 'Invoice amount exceeds the maximum allowed'),
  description: z.string().trim().max(500).optional(),
  email: z.string().trim().email('Provide a valid billing email'),
  dueDate: z.string().trim().optional(),
})

type ClientBillingDoc = {
  name?: unknown
  billingEmail?: unknown
  stripeCustomerId?: unknown
}

type StripeInvoiceLike = {
  id: string
  number: string | null
  status: string | null
  currency: string | null
  amount_due: number | null
  due_date: number | null
  hosted_invoice_url: string | null
  created: number | null
  status_transitions?: {
    finalized_at?: number | null
  } | null
}

function isStripeResourceMissing(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const code = 'code' in error ? (error as { code?: unknown }).code : undefined
  if (typeof code === 'string' && code === 'resource_missing') {
    return true
  }

  const type = 'type' in error ? (error as { type?: unknown }).type : undefined
  return typeof type === 'string' && type === 'StripeInvalidRequestError'
}

function normaliseAmountCents(amountDollars: number): number {
  const converted = Math.round(amountDollars * 100)
  if (!Number.isFinite(converted) || converted <= 0) {
    throw new Error('Invoice amount is invalid after conversion')
  }
  return converted
}

function resolveInvoiceIssuedAt(invoice: StripeInvoiceLike): Date {
  const finalizedAt = invoice.status_transitions?.finalized_at
  if (typeof finalizedAt === 'number' && Number.isFinite(finalizedAt)) {
    return new Date(finalizedAt * 1000)
  }

  if (typeof invoice.created === 'number' && Number.isFinite(invoice.created)) {
    return new Date(invoice.created * 1000)
  }

  return new Date()
}

function resolveInvoiceDueDate(invoice: StripeInvoiceLike, fallbackIso: string | null): string | null {
  if (typeof invoice.due_date === 'number' && Number.isFinite(invoice.due_date)) {
    return new Date(invoice.due_date * 1000).toISOString()
  }
  return fallbackIso
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  let createdInvoiceItemId: string | null = null
  let invoiceCreated = false
  let stripeClient: Stripe | null = null

  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    assertAdmin(auth)

    // Rate limit: 10 invoices per minute per user
    const rateLimitResult = await checkRateLimit(`invoice:${auth.uid}`)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many invoice requests. Please wait a moment.' },
        { status: 429 }
      )
    }

    const { id } = await context.params
    const clientId = id?.trim()

    if (!clientId) {
      return NextResponse.json({ error: 'Client id is required' }, { status: 400 })
    }

    const json = (await request.json().catch(() => null)) ?? {}
    const parsed = invoiceSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid invoice data', details: parsed.error.flatten() }, { status: 400 })
    }

    const payload = parsed.data
    const amountCents = normaliseAmountCents(payload.amount)
    const normalizedEmail = payload.email.trim().toLowerCase()
    const description = payload.description?.trim() ?? undefined

    let dueDateIso: string | null = null
    let dueDateUnix: number | undefined
    if (payload.dueDate) {
      const parsedDueDate = new Date(payload.dueDate)
      if (Number.isNaN(parsedDueDate.getTime())) {
        return NextResponse.json({ error: 'Provide a valid due date' }, { status: 400 })
      }
      dueDateIso = parsedDueDate.toISOString()
      const seconds = Math.floor(parsedDueDate.getTime() / 1000)
      dueDateUnix = seconds > 0 ? seconds : undefined
      if (dueDateUnix && dueDateUnix <= Math.floor(Date.now() / 1000)) {
        return NextResponse.json({ error: 'Due date must be in the future' }, { status: 400 })
      }
    }

    const workspace = await resolveWorkspaceContext(auth)
    const clientRef = workspace.clientsCollection.doc(clientId)
    const clientSnapshot = await clientRef.get()
    if (!clientSnapshot.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const clientData = clientSnapshot.data() as ClientBillingDoc | undefined
    const clientName = typeof clientData?.name === 'string' && clientData.name.trim().length > 0 ? clientData.name.trim() : clientId

    const stripe = getStripeClient()
    stripeClient = stripe
    let stripeCustomerId = typeof clientData?.stripeCustomerId === 'string' && clientData.stripeCustomerId ? clientData.stripeCustomerId : null

    if (stripeCustomerId) {
      try {
        const existing = await stripe.customers.retrieve(stripeCustomerId)
        if (typeof existing === 'object' && 'deleted' in existing && existing.deleted) {
          stripeCustomerId = null
        }
      } catch (error) {
        if (isStripeResourceMissing(error)) {
          stripeCustomerId = null
        } else {
          throw error
        }
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: normalizedEmail || undefined,
        name: clientName,
        metadata: {
          firestorePath: `workspaces/${workspace.workspaceId}/clients/${clientId}`,
          ownerUid: auth.uid,
          clientId,
          workspaceId: workspace.workspaceId,
        },
      })
      stripeCustomerId = customer.id
    } else {
      try {
        await stripe.customers.update(stripeCustomerId, {
          email: normalizedEmail || undefined,
          name: clientName,
        })
      } catch (updateError) {
        console.warn('[clients] Failed to update Stripe customer details', updateError)
      }
    }

    const invoiceLineDescription = description ?? `Services for ${clientName}`

    // Generate idempotency key to prevent duplicate invoice items
    const idempotencyKey = `invoice_${workspace.workspaceId}_${clientId}_${amountCents}_${Date.now().toString(36)}`

    const invoiceItem = await stripe.invoiceItems.create(
      {
        customer: stripeCustomerId,
        amount: amountCents,
        currency: 'usd',
        description: invoiceLineDescription,
        metadata: {
          ownerUid: auth.uid,
          clientId,
          workspaceId: workspace.workspaceId,
          source: 'admin_manual_invoice',
        },
      },
      { idempotencyKey: `${idempotencyKey}_item` }
    )
    createdInvoiceItemId = typeof invoiceItem?.id === 'string' ? invoiceItem.id : null

    const baseInvoiceParams: Stripe.InvoiceCreateParams = {
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      auto_advance: true,
      metadata: {
        ownerUid: auth.uid,
        clientId,
        workspaceId: workspace.workspaceId,
      },
    }

    const invoiceParams: Stripe.InvoiceCreateParams = dueDateUnix
      ? { ...baseInvoiceParams, due_date: dueDateUnix }
      : { ...baseInvoiceParams, days_until_due: 14 }

    let invoice = await stripe.invoices.create(invoiceParams)
    invoiceCreated = true

    if (invoice.status === 'draft') {
      invoice = await stripe.invoices.finalizeInvoice(invoice.id)
    }

    if (invoice.collection_method === 'send_invoice' && invoice.status === 'open') {
      invoice = await stripe.invoices.sendInvoice(invoice.id)
    }

    const amountDueCents = typeof invoice.amount_due === 'number' ? invoice.amount_due : amountCents
    const issuedAt = resolveInvoiceIssuedAt(invoice as StripeInvoiceLike)
    const responseDueDate = resolveInvoiceDueDate(invoice as StripeInvoiceLike, dueDateIso)

    await clientRef.set(
      {
        billingEmail: normalizedEmail,
        stripeCustomerId,
        lastInvoiceStatus: invoice.status ?? null,
        lastInvoiceAmount: amountDueCents / 100,
        lastInvoiceCurrency: invoice.currency ?? 'usd',
        lastInvoiceIssuedAt: issuedAt,
        lastInvoiceNumber: invoice.number ?? null,
        lastInvoiceUrl: invoice.hosted_invoice_url ?? null,
        workspaceId: workspace.workspaceId,
        updatedBy: auth.uid,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    const financeInvoiceRef = workspace.financeInvoicesCollection.doc(invoice.id)
    const dueDateForStorage = (() => {
      if (!responseDueDate) {
        return null
      }
      const parsed = new Date(responseDueDate)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    })()
    await financeInvoiceRef.set({
      clientId,
      clientName,
      amount: amountDueCents / 100,
      status: invoice.status ?? 'draft',
      issuedDate: issuedAt,
      dueDate: dueDateForStorage,
      description: invoiceLineDescription,
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      stripeInvoiceId: invoice.id,
      workspaceId: workspace.workspaceId,
      createdBy: auth.uid,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    try {
      await recordInvoiceSentNotification({
        workspaceId: workspace.workspaceId,
        invoiceId: invoice.id,
        clientId,
        clientName,
        amount: amountDueCents / 100,
        currency: invoice.currency ?? 'usd',
        invoiceNumber: invoice.number,
        actorId: auth.uid,
      })

      await notifyInvoiceSentWhatsApp({
        workspaceId: workspace.workspaceId,
        clientName,
        amount: amountDueCents / 100,
        currency: invoice.currency ?? 'usd',
        invoiceNumber: invoice.number,
        invoiceUrl: invoice.hosted_invoice_url ?? null,
      })
    } catch (notifyError) {
      console.error('[clients] Failed to send invoice notifications', notifyError)
    }

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        number: invoice.number ?? null,
        status: invoice.status ?? null,
        currency: invoice.currency ?? null,
        amountDue: amountDueCents,
        dueDate: responseDueDate,
        hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
        issuedAt: issuedAt.toISOString(),
      },
      client: {
        billingEmail: normalizedEmail,
        stripeCustomerId,
        lastInvoiceStatus: invoice.status ?? null,
        lastInvoiceAmount: amountDueCents / 100,
        lastInvoiceCurrency: invoice.currency ?? 'usd',
        lastInvoiceIssuedAt: issuedAt.toISOString(),
        lastInvoiceNumber: invoice.number ?? null,
        lastInvoiceUrl: invoice.hosted_invoice_url ?? null,
      },
    })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid invoice data', details: error.flatten() }, { status: 400 })
    }

    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error && typeof (error as { statusCode?: unknown }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 500

    const message = error instanceof Error && error.message ? error.message : 'Failed to create invoice'
    console.error('[clients] Invoice creation failed', error)
    return NextResponse.json({ error: message }, { status: statusCode >= 400 && statusCode < 600 ? statusCode : 500 })
  } finally {
    if (!invoiceCreated && createdInvoiceItemId && stripeClient) {
      try {
        await stripeClient.invoiceItems.del(createdInvoiceItemId)
      } catch (cleanupError) {
        console.error('[clients] Failed to roll back pending invoice item', cleanupError)
      }
    }
  }
}
