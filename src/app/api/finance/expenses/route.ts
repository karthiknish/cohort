import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ConflictError } from '@/lib/api-errors'
import { logAuditAction } from '@/lib/audit-logger'
import type { Expense, ExpenseAttachment, ExpenseCostType, ExpenseStatus } from '@/types/expenses'
import type { StoredFinanceExpense } from '@/types/stored-types'
import { coerceNumber, toISO } from '@/lib/utils'

const listQuerySchema = z.object({
  employeeId: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.string().optional(),
})

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(300),
  url: z.string().trim().min(1).max(2000),
  type: z.string().trim().min(1).max(200),
  size: z.string().trim().min(1).max(50),
})

const createSchema = z.object({
  description: z.string().trim().min(1).max(500),
  amount: z.union([z.number(), z.string()]).transform((value) => {
    const numeric = typeof value === 'string' ? Number(value) : value
    if (!Number.isFinite(numeric) || numeric <= 0) throw new Error('Amount must be a positive number')
    return numeric
  }),
  currency: z.string().trim().min(3).max(3).toUpperCase().default('USD'),
  costType: z.enum(['fixed', 'variable', 'time', 'milestone', 'reimbursement', 'employee_reimbursement']).default('variable'),
  incurredAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().trim().min(1).max(200).optional().nullable(),
  vendorId: z.string().trim().min(1).max(200).optional().nullable(),
  employeeId: z.string().trim().min(1).max(200).optional().nullable(),
  attachments: z.array(attachmentSchema).optional().default([]),
})

function mapExpense(docId: string, data: StoredFinanceExpense): Expense {
  const costType = (typeof data.costType === 'string' ? data.costType : 'variable') as ExpenseCostType
  const status = (typeof data.status === 'string' ? data.status : 'draft') as ExpenseStatus

  const attachmentsRaw = Array.isArray(data.attachments) ? (data.attachments as unknown[]) : []
  const attachments: ExpenseAttachment[] = attachmentsRaw
    .map((item) => {
      const record = item as Record<string, unknown>
      const name = typeof record.name === 'string' ? record.name : ''
      const url = typeof record.url === 'string' ? record.url : ''
      const type = typeof record.type === 'string' ? record.type : ''
      const size = typeof record.size === 'string' ? record.size : ''
      if (!name || !url || !type || !size) return null
      return { name, url, type, size }
    })
    .filter(Boolean) as ExpenseAttachment[]

  return {
    id: docId,
    description: typeof data.description === 'string' ? data.description : 'Untitled',
    amount: coerceNumber(data.amount) ?? 0,
    currency: typeof data.currency === 'string' ? data.currency.toUpperCase() : 'USD',
    costType:
      costType === 'fixed' || costType === 'variable' || costType === 'time' || costType === 'milestone' || costType === 'reimbursement' || costType === 'employee_reimbursement'
        ? costType
        : 'variable',
    status: status === 'draft' || status === 'submitted' || status === 'approved' || status === 'rejected' || status === 'paid' ? status : 'draft',
    incurredAt: toISO(data.incurredAt),
    categoryId: typeof data.categoryId === 'string' ? data.categoryId : null,
    categoryName: typeof data.categoryName === 'string' ? data.categoryName : null,
    vendorId: typeof data.vendorId === 'string' ? data.vendorId : null,
    vendorName: typeof data.vendorName === 'string' ? data.vendorName : null,
    employeeId: typeof data.employeeId === 'string' ? data.employeeId : null,
    submittedAt: toISO(data.submittedAt),
    approvedAt: toISO(data.approvedAt),
    rejectedAt: toISO(data.rejectedAt),
    decidedBy: typeof data.decidedBy === 'string' ? data.decidedBy : null,
    decisionNote: typeof data.decisionNote === 'string' ? data.decisionNote : null,
    attachments,
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
  async (_req, { workspace, query }) => {
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 200)

    let ref: FirebaseFirestore.Query = workspace!.financeExpensesCollection.orderBy('createdAt', 'desc').limit(limit)

    if (query.employeeId) {
      ref = workspace!.financeExpensesCollection.where('employeeId', '==', query.employeeId).orderBy('createdAt', 'desc').limit(limit)
    }

    if (query.status) {
      ref = ref.where('status', '==', query.status)
    }

    const snap = await ref.get()
    const expenses = snap.docs.map((doc) => mapExpense(doc.id, doc.data() as StoredFinanceExpense))
    return { expenses }
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

    const timestamp = FieldValue.serverTimestamp()

    let categoryName: string | null = null
    if (body.categoryId) {
      const categorySnap = await workspace!.financeExpenseCategoriesCollection.doc(body.categoryId).get()
      if (!categorySnap.exists) throw new NotFoundError('Expense category not found')
      const data = categorySnap.data() as { name?: unknown; isActive?: unknown }
      if (typeof data.isActive === 'boolean' && data.isActive === false) throw new ConflictError('Expense category is inactive')
      if (typeof data.name === 'string') categoryName = data.name
    }

    let vendorName: string | null = null
    if (body.vendorId) {
      const vendorSnap = await workspace!.financeVendorsCollection.doc(body.vendorId).get()
      if (!vendorSnap.exists) throw new NotFoundError('Vendor not found')
      const data = vendorSnap.data() as { name?: unknown; isActive?: unknown }
      if (typeof data.isActive === 'boolean' && data.isActive === false) throw new ConflictError('Vendor is inactive')
      if (typeof data.name === 'string') vendorName = data.name
    }

    const docRef = workspace!.financeExpensesCollection.doc()

    await docRef.set({
      description: body.description,
      amount: body.amount,
      currency: body.currency,
      costType: body.costType,
      status: 'draft',
      incurredAt: body.incurredAt ?? null,
      categoryId: body.categoryId ?? null,
      categoryName,
      vendorId: body.vendorId ?? null,
      vendorName,
      employeeId: body.employeeId ?? auth.uid,
      attachments: body.attachments ?? [],
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
      targetId: docRef.id,
      metadata: { type: 'expense_create', amount: body.amount, currency: body.currency, costType: body.costType },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    const snapshot = await docRef.get()
    return { expense: mapExpense(snapshot.id, snapshot.data() as StoredFinanceExpense) }
  }
)
