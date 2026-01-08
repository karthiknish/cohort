import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  website: z.string().trim().max(300).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const PATCH = createApiHandler(
  {
    adminOnly: true,
    workspace: 'required',
    bodySchema: updateSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body, params }) => {
    const id = params.id as string
    const ref = workspace!.financeVendorsCollection.doc(id)
    const snap = await ref.get()

    if (!snap.exists) {
      throw new NotFoundError('Vendor not found')
    }

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) updates.email = body.email
    if (body.phone !== undefined) updates.phone = body.phone
    if (body.website !== undefined) updates.website = body.website
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.isActive !== undefined) updates.isActive = body.isActive

    await ref.update(updates)

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'vendor_update', updates: Object.keys(updates) },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)

export const DELETE = createApiHandler(
  {
    adminOnly: true,
    workspace: 'required',
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, params }) => {
    const id = params.id as string
    const ref = workspace!.financeVendorsCollection.doc(id)
    const snap = await ref.get()

    if (!snap.exists) {
      throw new NotFoundError('Vendor not found')
    }

    await ref.delete()

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'vendor_delete' },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)
