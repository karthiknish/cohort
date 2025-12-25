import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import type { FinanceCostEntry } from '@/types/finance'
import { coerceNumber, toISO } from '@/lib/utils'
import { NotFoundError } from '@/lib/api-errors'

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
  async (req, { workspace, query }) => {
    const { id } = query
    const docRef = workspace!.financeCostsCollection.doc(id)
    const snapshot = await docRef.get()

    if (!snapshot.exists) {
      throw new NotFoundError('Cost entry not found')
    }

    await docRef.delete()

    return { ok: true }
  }
)
