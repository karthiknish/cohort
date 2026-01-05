import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
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

const updateCostSchema = z.object({
  category: z.string().trim().min(1).max(200).optional(),
  amount: amountSchema.optional(),
  cadence: z.enum(['monthly', 'quarterly', 'annual']).optional(),
  currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
  clientId: z
    .union([z.string().trim().min(1), z.null(), z.undefined()])
    .transform((value) => (typeof value === 'string' ? value : null))
    .optional(),
})

export const PATCH = createApiHandler(
  {
    adminOnly: true,
    workspace: 'required',
    bodySchema: updateCostSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body: payload, params }) => {
    const id = params.id as string
    const docRef = workspace!.financeCostsCollection.doc(id)
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

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'cost_update', updates: Object.keys(updates) },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)

export const DELETE = createApiHandler(
  { 
    adminOnly: true,
    workspace: 'required',
    rateLimit: 'sensitive'
  },
  async (req, { auth, workspace, params }) => {
    const id = params.id as string
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
