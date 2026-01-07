import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import type { FinanceCostEntry } from '@/types/finance'
import type { StoredFinanceCost } from '@/types/stored-types'
import { coerceNumber, toISO } from '@/lib/utils'
import { NotFoundError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'


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
  cadence: z.enum(['one-off', 'monthly', 'quarterly', 'annual']),
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
    cadence: cadence === 'one-off' || cadence === 'monthly' || cadence === 'quarterly' || cadence === 'annual' ? cadence : 'monthly',
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
      currency: payload.currency,
      workspaceId: workspace!.workspaceId,
      createdBy: auth.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
      clientId: payload.clientId ?? null,
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
