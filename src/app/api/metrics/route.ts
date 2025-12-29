import { z } from 'zod'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { UnauthorizedError, ValidationError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'

const querySchema = z.object({
  userId: z.string().optional(),
  clientIds: z.string().optional(),
  pageSize: z.string().transform((v) => parseInt(v, 10)).optional(),
  after: z.string().optional(),
})

const PAGE_SIZE_DEFAULT = 100
const PAGE_SIZE_MAX = 500

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema,
    rateLimit: 'standard',
  },
  async (req, { workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const clientIds = query.clientIds
      ? query.clientIds.split(',').map((value) => value.trim()).filter(Boolean)
      : []
    const clientIdFilter = clientIds.length === 1 ? clientIds[0] : null
    const pageSize = Math.min(Math.max(query.pageSize || PAGE_SIZE_DEFAULT, 1), PAGE_SIZE_MAX)
    const afterParam = query.after

    const baseCollection = workspace.metricsCollection

    let firestoreQuery = baseCollection.orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    if (clientIdFilter) {
      firestoreQuery = baseCollection
        .where('clientId', '==', clientIdFilter)
        .orderBy('createdAt', 'desc')
        .orderBy(FieldPath.documentId(), 'desc')
    }

    firestoreQuery = firestoreQuery.limit(pageSize + 1)

    if (afterParam) {
      const [timestamp, docId] = afterParam.split('|')
      if (timestamp && docId) {
        const afterDate = new Date(timestamp)
        if (!Number.isNaN(afterDate.getTime())) {
          firestoreQuery = firestoreQuery.startAfter(Timestamp.fromDate(afterDate), docId)
        }
      }
    }

    const snapshot = await firestoreQuery.get()
    const docs = snapshot.docs

    const mapped = docs.slice(0, pageSize).map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>
      return {
        id: docSnap.id,
        providerId: (data.providerId as string | undefined) ?? 'unknown',
        date: (data.date as string | undefined) ?? 'unknown',
        spend: Number(data.spend ?? 0),
        impressions: Number(data.impressions ?? 0),
        clicks: Number(data.clicks ?? 0),
        conversions: Number(data.conversions ?? 0),
        revenue: data.revenue !== undefined ? Number(data.revenue) : null,
        createdAt: toISO(data.createdAt ?? null),
        clientId: typeof data.clientId === 'string' ? data.clientId : null,
      }
    })

    let metrics = mapped
    if (clientIds.length > 1) {
      metrics = metrics.filter((record) => record.clientId && clientIds.includes(record.clientId))
    }

    const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
    const nextCursor = nextCursorDoc
      ? (() => {
          const createdAt = toISO(nextCursorDoc.get('createdAt'))
          return createdAt ? `${createdAt}|${nextCursorDoc.id}` : null
        })()
      : null

    return {
      metrics,
      nextCursor,
    }
  }
)
