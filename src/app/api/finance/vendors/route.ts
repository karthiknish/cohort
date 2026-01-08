import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { logAuditAction } from '@/lib/audit-logger'
import type { Vendor } from '@/types/expenses'
import type { StoredFinanceVendor } from '@/types/stored-types'
import { toISO } from '@/lib/utils'

const listQuerySchema = z.object({
  includeInactive: z.string().optional(),
  q: z.string().optional(),
})

const upsertSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  website: z.string().trim().max(300).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

function mapVendor(docId: string, data: StoredFinanceVendor): Vendor {
  return {
    id: docId,
    name: typeof data.name === 'string' ? data.name : 'Untitled',
    email: typeof data.email === 'string' ? data.email : null,
    phone: typeof data.phone === 'string' ? data.phone : null,
    website: typeof data.website === 'string' ? data.website : null,
    notes: typeof data.notes === 'string' ? data.notes : null,
    isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
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
    const q = typeof query.q === 'string' ? query.q.trim().toLowerCase() : ''

    const snap = await workspace!.financeVendorsCollection.orderBy('name', 'asc').get()
    let vendors = snap.docs.map((doc) => mapVendor(doc.id, doc.data() as StoredFinanceVendor))

    if (!includeInactive) {
      vendors = vendors.filter((v) => v.isActive)
    }

    if (q) {
      vendors = vendors.filter((v) => v.name.toLowerCase().includes(q))
    }

    return { vendors }
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
    const docRef = workspace!.financeVendorsCollection.doc()

    await docRef.set({
      name: body.name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      website: body.website ?? null,
      notes: body.notes ?? null,
      isActive: body.isActive,
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
      metadata: { type: 'vendor_create', name: body.name },
      requestId: req.headers.get('x-request-id') || undefined,
    })

    const snapshot = await docRef.get()
    return { vendor: mapVendor(snapshot.id, snapshot.data() as StoredFinanceVendor) }
  }
)
