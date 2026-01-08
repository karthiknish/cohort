import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { logAuditAction } from '@/lib/audit-logger'
import type { ExpenseCategory } from '@/types/expenses'
import type { StoredFinanceExpenseCategory } from '@/types/stored-types'
import { coerceNumber, toISO } from '@/lib/utils'

const listQuerySchema = z.object({
  includeInactive: z.string().optional(),
})

const upsertSchema = z.object({
  name: z.string().trim().min(1).max(100),
  code: z.string().trim().min(1).max(50).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).max(100000).optional().default(0),
})

function mapCategory(docId: string, data: StoredFinanceExpenseCategory): ExpenseCategory {
  const isActive = typeof data.isActive === 'boolean' ? data.isActive : true
  const isSystem = typeof data.isSystem === 'boolean' ? data.isSystem : false

  return {
    id: docId,
    name: typeof data.name === 'string' ? data.name : 'Untitled',
    code: typeof data.code === 'string' ? data.code : null,
    description: typeof data.description === 'string' ? data.description : null,
    isActive,
    isSystem,
    sortOrder: coerceNumber(data.sortOrder) ?? 0,
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
    const includeInactive = query.includeInactive === 'true'

    let ref: FirebaseFirestore.Query = workspace!.financeExpenseCategoriesCollection
    if (!includeInactive) {
      ref = ref.where('isActive', '==', true)
    }

    const snap = await ref.orderBy('sortOrder', 'asc').orderBy('name', 'asc').get()
    const categories = snap.docs.map((doc) => mapCategory(doc.id, doc.data() as StoredFinanceExpenseCategory))
    return { categories }
  }
)

export const POST = createApiHandler(
  {
    adminOnly: true,
    workspace: 'required',
    bodySchema: upsertSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    const timestamp = FieldValue.serverTimestamp()
    const docRef = workspace!.financeExpenseCategoriesCollection.doc()

    await docRef.set({
      name: body.name,
      code: body.code ?? null,
      description: body.description ?? null,
      isActive: body.isActive,
      isSystem: false,
      sortOrder: body.sortOrder,
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
      metadata: { type: 'expense_category_create', name: body.name },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    const snapshot = await docRef.get()
    return { category: mapCategory(snapshot.id, snapshot.data() as StoredFinanceExpenseCategory) }
  }
)
