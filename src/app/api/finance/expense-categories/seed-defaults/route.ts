import { FieldValue } from 'firebase-admin/firestore'

import { createApiHandler } from '@/lib/api-handler'
import { logAuditAction } from '@/lib/audit-logger'

const DEFAULTS: Array<{ name: string; code: string; sortOrder: number; description?: string }> = [
  { name: 'Legal / Compliance Fees', code: 'legal_compliance', sortOrder: 10 },
  { name: 'Professional Fees (Accounting / Consulting)', code: 'professional_fees', sortOrder: 20 },
  { name: 'Taxes', code: 'taxes', sortOrder: 30 },
  { name: 'Bank Fees / Transaction Fees', code: 'bank_fees', sortOrder: 40 },
  { name: 'Credit Card Processing Fees', code: 'card_processing_fees', sortOrder: 50 },
]

export const POST = createApiHandler(
  {
    adminOnly: true,
    workspace: 'required',
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace }) => {
    const collection = workspace!.financeExpenseCategoriesCollection
    const existing = await collection.limit(1).get()

    if (!existing.empty) {
      return { ok: true, seeded: 0 }
    }

    const timestamp = FieldValue.serverTimestamp()
    const batch = collection.firestore.batch()

    DEFAULTS.forEach((entry) => {
      const ref = collection.doc()
      batch.set(ref, {
        name: entry.name,
        code: entry.code,
        description: entry.description ?? null,
        isActive: true,
        isSystem: true,
        sortOrder: entry.sortOrder,
        workspaceId: workspace!.workspaceId,
        createdBy: auth.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
    })

    await batch.commit()

    await logAuditAction({
      action: 'FINANCIAL_SETTINGS_UPDATE',
      actorId: auth.uid!,
      actorEmail: auth.email || undefined,
      workspaceId: workspace!.workspaceId,
      metadata: { type: 'expense_category_seed_defaults', count: DEFAULTS.length },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    return { ok: true, seeded: DEFAULTS.length }
  }
)
