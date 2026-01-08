import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ConflictError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'
import type { StoredFinanceExpenseCategory } from '@/types/stored-types'

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  code: z.string().trim().min(1).max(50).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100000).optional(),
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
    const ref = workspace!.financeExpenseCategoriesCollection.doc(id)
    const snap = await ref.get()

    if (!snap.exists) {
      throw new NotFoundError('Expense category not found')
    }

    const existing = snap.data() as StoredFinanceExpenseCategory
    if (existing && typeof existing.isSystem === 'boolean' && existing.isSystem) {
      throw new ConflictError('System categories cannot be edited')
    }

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
    if (body.name !== undefined) updates.name = body.name
    if (body.code !== undefined) updates.code = body.code
    if (body.description !== undefined) updates.description = body.description
    if (body.isActive !== undefined) updates.isActive = body.isActive
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder

    await ref.update(updates)

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'expense_category_update', updates: Object.keys(updates) },
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
    const ref = workspace!.financeExpenseCategoriesCollection.doc(id)
    const snap = await ref.get()

    if (!snap.exists) {
      throw new NotFoundError('Expense category not found')
    }

    const existing = snap.data() as StoredFinanceExpenseCategory
    if (existing && typeof existing.isSystem === 'boolean' && existing.isSystem) {
      throw new ConflictError('System categories cannot be deleted')
    }

    await ref.delete()

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'expense_category_delete' },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)
