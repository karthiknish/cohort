import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ConflictError, NotFoundError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'
import { coerceNumber, toISO } from '@/lib/utils'

import type { PurchaseOrder, PurchaseOrderLineItem, PurchaseOrderStatus } from '@/types/purchase-orders'
import type { StoredFinancePurchaseOrder } from '@/types/stored-types'

const listQuerySchema = z.object({
  status: z.string().optional(),
  vendorId: z.string().optional(),
  createdBy: z.string().optional(),
  limit: z.string().optional(),
})

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

const createSchema = z.object({
  number: z.string().trim().max(50).optional().nullable(),
  vendorId: z.string().trim().min(1).max(200).optional().nullable(),
  currency: z.string().trim().min(3).max(3).toUpperCase().default('USD'),
  items: z.array(lineItemSchema).optional().default([]),
  notes: z.string().trim().max(2000).optional().nullable(),
  requestedBy: z.string().trim().min(1).max(200).optional().nullable(),
})

const STATUSES: PurchaseOrderStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'ordered', 'received', 'closed', 'cancelled']

function computeTotalAmount(items: PurchaseOrderLineItem[]): number {
  return items.reduce((sum, item) => sum + (coerceNumber(item.quantity) ?? 0) * (coerceNumber(item.unitPrice) ?? 0), 0)
}

function mapPurchaseOrder(docId: string, data: StoredFinancePurchaseOrder): PurchaseOrder {
  const status = (typeof data.status === 'string' ? data.status : 'draft') as PurchaseOrderStatus
  const currency = typeof data.currency === 'string' ? data.currency.toUpperCase() : 'USD'

  const itemsRaw = Array.isArray(data.items) ? (data.items as unknown[]) : []
  const items: PurchaseOrderLineItem[] = itemsRaw
    .map((item) => {
      const record = item as Record<string, unknown>
      const description = typeof record.description === 'string' ? record.description : ''
      const quantity = coerceNumber(record.quantity)
      const unitPrice = coerceNumber(record.unitPrice)
      if (!description || !Number.isFinite(quantity ?? NaN) || !Number.isFinite(unitPrice ?? NaN)) return null
      return { description, quantity: quantity ?? 0, unitPrice: unitPrice ?? 0 }
    })
    .filter(Boolean) as PurchaseOrderLineItem[]

  const totalAmount = coerceNumber(data.totalAmount) ?? computeTotalAmount(items)

  return {
    id: docId,
    number: typeof data.number === 'string' ? data.number : null,
    status: STATUSES.includes(status) ? status : 'draft',
    vendorId: typeof data.vendorId === 'string' ? data.vendorId : null,
    vendorName: typeof data.vendorName === 'string' ? data.vendorName : null,
    currency,
    items,
    totalAmount,
    notes: typeof data.notes === 'string' ? data.notes : null,
    requestedBy: typeof data.requestedBy === 'string' ? data.requestedBy : null,
    submittedAt: toISO(data.submittedAt),
    approvedAt: toISO(data.approvedAt),
    rejectedAt: toISO(data.rejectedAt),
    decidedBy: typeof data.decidedBy === 'string' ? data.decidedBy : null,
    decisionNote: typeof data.decisionNote === 'string' ? data.decisionNote : null,
    orderedAt: toISO(data.orderedAt),
    receivedAt: toISO(data.receivedAt),
    createdBy: typeof data.createdBy === 'string' ? data.createdBy : null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: listQuerySchema,
    rateLimit: 'sensitive',
  },
  async (_req, { auth, workspace, query }) => {
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 200)
    const isAdmin = auth.claims?.role === 'admin'

    let ref: FirebaseFirestore.Query = workspace!.financePurchaseOrdersCollection.orderBy('createdAt', 'desc').limit(limit)

    if (!isAdmin) {
      if (!auth.uid) throw new ConflictError('Authentication required')
      ref = workspace!.financePurchaseOrdersCollection.where('createdBy', '==', auth.uid).orderBy('createdAt', 'desc').limit(limit)
    } else if (query.createdBy) {
      ref = workspace!.financePurchaseOrdersCollection.where('createdBy', '==', query.createdBy).orderBy('createdAt', 'desc').limit(limit)
    }

    if (query.vendorId) {
      ref = ref.where('vendorId', '==', query.vendorId)
    }

    if (query.status) {
      ref = ref.where('status', '==', query.status)
    }

    const snap = await ref.get()
    return { purchaseOrders: snap.docs.map((doc) => mapPurchaseOrder(doc.id, doc.data() as StoredFinancePurchaseOrder)) }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    if (!auth.uid) {
      throw new ConflictError('Authentication required')
    }

    let vendorName: string | null = null
    if (body.vendorId) {
      const vendorSnap = await workspace!.financeVendorsCollection.doc(body.vendorId).get()
      if (!vendorSnap.exists) throw new NotFoundError('Vendor not found')
      const data = vendorSnap.data() as { name?: unknown; isActive?: unknown }
      if (typeof data.isActive === 'boolean' && data.isActive === false) throw new ConflictError('Vendor is inactive')
      vendorName = typeof data.name === 'string' ? data.name : null
    }

    const items = body.items ?? []
    const totalAmount = computeTotalAmount(items)

    const timestamp = FieldValue.serverTimestamp()
    const ref = workspace!.financePurchaseOrdersCollection.doc()

    await ref.set({
      number: body.number ?? null,
      status: 'draft',
      vendorId: body.vendorId ?? null,
      vendorName,
      currency: body.currency,
      items,
      totalAmount,
      notes: body.notes ?? null,
      requestedBy: body.requestedBy ?? auth.uid,
      workspaceId: workspace!.workspaceId,
      createdBy: auth.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      targetId: ref.id,
      metadata: { type: 'po_create', totalAmount, currency: body.currency, itemCount: items.length },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    const snap = await ref.get()
    return { purchaseOrder: mapPurchaseOrder(snap.id, snap.data() as StoredFinancePurchaseOrder) }
  }
)
