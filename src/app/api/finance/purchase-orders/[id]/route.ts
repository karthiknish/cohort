import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ConflictError, ForbiddenError, NotFoundError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'
import { coerceNumber } from '@/lib/utils'

import type { PurchaseOrderLineItem, PurchaseOrderStatus } from '@/types/purchase-orders'

const lineItemSchema = z.object({
  description: z.string().trim().min(1).max(300),
  quantity: z.union([z.number(), z.string()]).transform((value) => {
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric) || numeric <= 0) throw new Error('Quantity must be a positive number')
    return numeric
  }),
  unitPrice: z.union([z.number(), z.string()]).transform((value) => {
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric) || numeric < 0) throw new Error('Unit price must be a valid number')
    return numeric
  }),
})

const patchSchema = z.object({
  number: z.string().trim().max(50).optional().nullable(),
  vendorId: z.string().trim().min(1).max(200).optional().nullable(),
  currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
  items: z.array(lineItemSchema).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  requestedBy: z.string().trim().min(1).max(200).optional().nullable(),
})

const transitionSchema = z.object({
  action: z.enum(['submit', 'approve', 'reject', 'mark_ordered', 'mark_received', 'close', 'cancel']),
  note: z.string().trim().max(1000).optional().nullable(),
})

const STATUSES: PurchaseOrderStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'ordered', 'received', 'closed', 'cancelled']

function computeTotalAmount(items: PurchaseOrderLineItem[]): number {
  return items.reduce((sum, item) => sum + (coerceNumber(item.quantity) ?? 0) * (coerceNumber(item.unitPrice) ?? 0), 0)
}

function canEdit(auth: { uid: string | null; claims: Record<string, unknown> }, po: Record<string, unknown>): boolean {
  if (auth.claims?.role === 'admin') return true
  if (!auth.uid) return false
  const createdBy = typeof po.createdBy === 'string' ? po.createdBy : null
  return createdBy === auth.uid
}

export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: patchSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body, params }) => {
    const id = params.id as string
    const ref = workspace!.financePurchaseOrdersCollection.doc(id)
    const snap = await ref.get()
    if (!snap.exists) throw new NotFoundError('Purchase order not found')

    const data = (snap.data() ?? {}) as Record<string, unknown>
    if (!canEdit(auth, data)) throw new ForbiddenError('You do not have permission to edit this purchase order')

    const status = typeof data.status === 'string' ? data.status : 'draft'
    if (status !== 'draft' && auth.claims?.role !== 'admin') {
      throw new ConflictError('Only draft purchase orders can be edited')
    }

    const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }

    if (body.number !== undefined) updates.number = body.number
    if (body.currency !== undefined) updates.currency = body.currency
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.requestedBy !== undefined) updates.requestedBy = body.requestedBy

    if (body.vendorId !== undefined) {
      if (body.vendorId) {
        const vendorSnap = await workspace!.financeVendorsCollection.doc(body.vendorId).get()
        if (!vendorSnap.exists) throw new NotFoundError('Vendor not found')
        const vendorData = vendorSnap.data() as { name?: unknown; isActive?: unknown }
        if (typeof vendorData.isActive === 'boolean' && vendorData.isActive === false) throw new ConflictError('Vendor is inactive')
        updates.vendorId = body.vendorId
        updates.vendorName = typeof vendorData.name === 'string' ? vendorData.name : null
      } else {
        updates.vendorId = null
        updates.vendorName = null
      }
    }

    if (body.items !== undefined) {
      updates.items = body.items
      updates.totalAmount = computeTotalAmount(body.items)
    }

    await ref.update(updates)

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'po_update', updates: Object.keys(updates) },
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
    const ref = workspace!.financePurchaseOrdersCollection.doc(id)
    const snap = await ref.get()
    if (!snap.exists) throw new NotFoundError('Purchase order not found')

    const data = (snap.data() ?? {}) as Record<string, unknown>
    const status = typeof data.status === 'string' ? data.status : 'draft'

    const isAdmin = auth.claims?.role === 'admin'

    if (body.action === 'submit') {
      if (!canEdit(auth, data)) throw new ForbiddenError('You do not have permission to submit this purchase order')
      if (status !== 'draft') throw new ConflictError('Only draft purchase orders can be submitted')

      const vendorId = typeof data.vendorId === 'string' ? data.vendorId : null
      const items = Array.isArray(data.items) ? (data.items as unknown[]) : []
      if (!vendorId) throw new ConflictError('Select a vendor before submitting')
      if (items.length === 0) throw new ConflictError('Add at least one line item before submitting')

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
        metadata: { type: 'po_submit' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'approve') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to approve purchase orders')
      if (status !== 'submitted') throw new ConflictError('Only submitted purchase orders can be approved')

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
        metadata: { type: 'po_approve' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'reject') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to reject purchase orders')
      if (status !== 'submitted') throw new ConflictError('Only submitted purchase orders can be rejected')

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
        metadata: { type: 'po_reject' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'mark_ordered') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to mark ordered')
      if (status !== 'approved') throw new ConflictError('Only approved purchase orders can be marked ordered')

      await ref.update({
        status: 'ordered',
        orderedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'po_mark_ordered' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'mark_received') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to mark received')
      if (status !== 'ordered') throw new ConflictError('Only ordered purchase orders can be marked received')

      await ref.update({
        status: 'received',
        receivedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'po_mark_received' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'close') {
      if (!isAdmin) throw new ForbiddenError('Admin access required to close')
      if (status !== 'received') throw new ConflictError('Only received purchase orders can be closed')

      await ref.update({
        status: 'closed',
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'po_close' },
        requestId: req.headers.get('x-request-id') || undefined,
      })

      return { ok: true }
    }

    if (body.action === 'cancel') {
      if (!canEdit(auth, data) && !isAdmin) throw new ForbiddenError('You do not have permission to cancel this purchase order')
      if (status !== 'draft' && status !== 'submitted') throw new ConflictError('Only draft or submitted purchase orders can be cancelled')

      await ref.update({
        status: 'cancelled',
        updatedAt: FieldValue.serverTimestamp(),
      })

      await logAuditAction({
        action: 'FINANCIAL_SETTINGS_UPDATE',
        actorId: auth.uid!,
        actorEmail: auth.email || undefined,
        workspaceId: workspace!.workspaceId,
        targetId: id,
        metadata: { type: 'po_cancel' },
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
    const ref = workspace!.financePurchaseOrdersCollection.doc(id)
    const snap = await ref.get()
    if (!snap.exists) throw new NotFoundError('Purchase order not found')

    const data = (snap.data() ?? {}) as Record<string, unknown>
    if (!canEdit(auth, data)) throw new ForbiddenError('You do not have permission to delete this purchase order')

    const status = typeof data.status === 'string' ? data.status : 'draft'
    if (status !== 'draft' && auth.claims?.role !== 'admin') {
      throw new ConflictError('Only draft purchase orders can be deleted')
    }

    await ref.delete()

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: id,
      metadata: { type: 'po_delete' },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true }
  }
)
