import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ConflictError, ForbiddenError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(300),
  url: z.string().trim().min(1).max(2000),
  type: z.string().trim().min(1).max(200),
  size: z.string().trim().min(1).max(50),
})

const patchSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  amount: z.union([z.number(), z.string()]).optional(),
  currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
  costType: z.enum(['fixed', 'variable', 'time', 'milestone', 'reimbursement', 'employee_reimbursement']).optional(),
  incurredAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().trim().min(1).max(200).optional().nullable(),
  vendorId: z.string().trim().min(1).max(200).optional().nullable(),
  employeeId: z.string().trim().min(1).max(200).optional().nullable(),
  attachments: z.array(attachmentSchema).optional(),
})

const transitionSchema = z.object({
  action: z.enum(['submit', 'approve', 'reject', 'mark_paid']),
  note: z.string().trim().max(1000).optional().nullable(),
})

function canEditExpense(auth: { uid: string | null; claims: Record<string, unknown> }, expense: Record<string, unknown>): boolean {
  if (auth.claims?.role === 'admin') return true
  if (!auth.uid) return false
  const createdBy = typeof expense.createdBy === 'string' ? expense.createdBy : null
  const employeeId = typeof expense.employeeId === 'string' ? expense.employeeId : null
  return createdBy === auth.uid || employeeId === auth.uid
}

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: patchSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body, params }) => {
    const id = params.id as string
    const ref = workspace!.financeExpensesCollection.doc(id)
    const snap = await ref.get()
    if (!snap.exists) throw new NotFoundError('Expense not found')

    const data = (snap.data() ?? {}) as Record<string, unknown>
    if (!canEditExpense(auth, data)) throw new ForbiddenError('You do not have permission to edit this expense')

    const status = typeof data.status === 'string' ? data.status : 'draft'
    if (status !== 'draft' && auth.claims?.role !== 'admin') {
      throw new ConflictError('Only draft expenses can be edited')
    }

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }

    if (body.description !== undefined) updates.description = body.description
    if (body.amount !== undefined) updates.amount = typeof body.amount === 'string' ? Number(body.amount) : body.amount
    if (body.currency !== undefined) updates.currency = body.currency
    if (body.costType !== undefined) updates.costType = body.costType
    if (body.incurredAt !== undefined) updates.incurredAt = body.incurredAt
    if (body.categoryId !== undefined) updates.categoryId = body.categoryId
    if (body.vendorId !== undefined) updates.vendorId = body.vendorId
    if (body.employeeId !== undefined) updates.employeeId = body.employeeId
    if (body.attachments !== undefined) updates.attachments = body.attachments

    await ref.update(updates)

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'expense_update', updates: Object.keys(updates) },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: transitionSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body, params }) => {
    const id = params.id as string
    const ref = workspace!.financeExpensesCollection.doc(id)
    const snap = await ref.get()
    if (!snap.exists) throw new NotFoundError('Expense not found')

    const data = (snap.data() ?? {}) as Record<string, unknown>
    const currentStatus = typeof data.status === 'string' ? data.status : 'draft'

    const isAdmin = auth.claims?.role === 'admin'

    if (body.action === 'submit') {
      if (!canEditExpense(auth, data)) throw new ForbiddenError('You do not have permission to submit this expense')
      if (currentStatus !== 'draft') throw new ConflictError('Only draft expenses can be submitted')

      await ref.update({
        status: 'submitted',
        submittedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'expense_submit' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'approve') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to approve expenses')
      if (currentStatus !== 'submitted') throw new ConflictError('Only submitted expenses can be approved')

      await ref.update({
        status: 'approved',
        approvedAt: FieldValue.serverTimestamp(),
        decidedBy: auth.uid,
        decisionNote: body.note ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'expense_approve' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'reject') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to reject expenses')
      if (currentStatus !== 'submitted') throw new ConflictError('Only submitted expenses can be rejected')

      await ref.update({
        status: 'rejected',
        rejectedAt: FieldValue.serverTimestamp(),
        decidedBy: auth.uid,
        decisionNote: body.note ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'expense_reject' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'mark_paid') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to mark paid')
      if (currentStatus !== 'approved') throw new ConflictError('Only approved expenses can be marked paid')

      await ref.update({
        status: 'paid',
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'expense_mark_paid' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    throw new ConflictError('Unsupported transition')
  }
)

export const DELETE = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, params }) => {
    const id = params.id as string
    const ref = workspace!.financeExpensesCollection.doc(id)
    const snap = await ref.get()
    if (!snap.exists) throw new NotFoundError('Expense not found')

    const data = (snap.data() ?? {}) as Record<string, unknown>
    if (!canEditExpense(auth, data)) throw new ForbiddenError('You do not have permission to delete this expense')

    const status = typeof data.status === 'string' ? data.status : 'draft'
    if (status !== 'draft' && auth.claims?.role !== 'admin') {
      throw new ConflictError('Only draft expenses can be deleted')
    }

    await ref.delete()

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'expense_delete' },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)
