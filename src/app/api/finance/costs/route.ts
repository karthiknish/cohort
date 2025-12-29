import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import type { FinanceCostEntry } from '@/types/finance'
import { coerceNumber, toISO } from '@/lib/utils'
import { NotFoundError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'

type StoredFinanceCost = {
  clientId?: unknown
  category?: unknown
  amount?: unknown
  cadence?: unknown
  currency?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

const amountSchema = z
  .union([z.number(), z.string()])
  .transform((value) => {
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric)) {
      throw new Error('Amount must be a number')
    }
    return numeric
  })
  .refine((value) => value > 0, { message: 'Amount must be greater than zero' })

const createCostSchema = z.object({
  category: z.string().trim().min(1, 'Category is required').max(200),
  amount: amountSchema,
  cadence: z.enum(['monthly', 'quarterly', 'annual']),
  currency: z.string().trim().min(3).max(3).toUpperCase().default('USD'),
  clientId: z
    .union([z.string().trim().min(1), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value : null))
    .optional(),
})

const updateCostSchema = z.object({
  id: z.string().trim().min(1, 'Cost ID is required'),
  category: z.string().trim().min(1).max(200).optional(),
  amount: amountSchema.optional(),
  cadence: z.enum(['monthly', 'quarterly', 'annual']).optional(),
  currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
  clientId: z
    .union([z.string().trim().min(1), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value : null))
    .optional(),
})

function mapCostDoc(docId: string, data: StoredFinanceCost): FinanceCostEntry {
  const cadence = (typeof data.cadence === 'string' ? data.cadence : 'monthly') as FinanceCostEntry['cadence']
  return {
    id: docId,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    category: typeof data.category === 'string' ? data.category : 'Uncategorized',
    amount: coerceNumber(data.amount) ?? 0,
    cadence: cadence === 'monthly' || cadence === 'quarterly' || cadence === 'annual' ? cadence : 'monthly',
    currency: typeof data.currency === 'string' ? data.currency.toUpperCase() : 'USD',
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

export const POST = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required',
    bodySchema: createCostSchema,
    rateLimit: 'sensitive'
  },
  async (req, { auth, workspace, body: payload }) => {
    const docRef = workspace!.financeCostsCollection.doc()
    const timestamp = FieldValue.serverTimestamp()

    await docRef.set({
      category: payload.category,
      amount: payload.amount,
      cadence: payload.cadence,
      clientId: payload.clientId ?? null,
      workspaceId: workspace!.workspaceId,
      createdBy: auth.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    const snapshot = await docRef.get()
    const cost = mapCostDoc(snapshot.id, snapshot.data() as StoredFinanceCost)

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: docRef.id,
      metadata: { type: 'cost_create', category: payload.category, amount: payload.amount },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { cost }
  }
)

export const PATCH = createApiHandler(
  {
    adminOnly: true,
    workspace: 'required',
    bodySchema: updateCostSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body: payload }) => {
    const docRef = workspace!.financeCostsCollection.doc(payload.id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Cost entry not found')
    }

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (payload.category !== undefined) updates.category = payload.category
    if (payload.amount !== undefined) updates.amount = payload.amount
    if (payload.cadence !== undefined) updates.cadence = payload.cadence
    if (payload.currency !== undefined) updates.currency = payload.currency
    if (payload.clientId !== undefined) updates.clientId = payload.clientId

    await docRef.update(updates)

    const updatedSnapshot = await docRef.get()
    const cost = mapCostDoc(updatedSnapshot.id, updatedSnapshot.data() as StoredFinanceCost)

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: docRef.id,
      metadata: { type: 'cost_update', updates: Object.keys(updates) },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { cost }
  }
)

export const DELETE = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required',
    querySchema: z.object({ id: z.string().trim().min(1) }),
    rateLimit: 'sensitive'
  },
  async (req, { auth, workspace, query }) => {
    const { id } = query
    const docRef = workspace!.financeCostsCollection.doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Cost entry not found')
    }

    await docRef.delete()

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'cost_delete' },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)
