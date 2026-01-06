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
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  aggregate: z.string().transform((v) => v === 'true').optional(),
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

    const startDate = query.startDate
    const endDate = query.endDate
    const shouldAggregate = query.aggregate === true

    const baseCollection = workspace.metricsCollection

    // Start building query
    // Default sorting is by performance date, then sync time
    let firestoreQuery: FirebaseFirestore.Query = baseCollection

    if (clientIdFilter) {
      firestoreQuery = firestoreQuery.where('clientId', '==', clientIdFilter)
    }

    if (startDate) {
      firestoreQuery = firestoreQuery.where('date', '>=', startDate)
    }
    if (endDate) {
      firestoreQuery = firestoreQuery.where('date', '<=', endDate)
    }

    // Always sort by performance date descending for reliable range filtering and dashboard display
    // Fall back to createdAt and docId for cursor stability
    firestoreQuery = firestoreQuery.orderBy('date', 'desc').orderBy('createdAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    // Handle pagination cursor
    if (afterParam) {
      const [perfDate, syncTimestamp, docId] = afterParam.split('|')
      if (perfDate && syncTimestamp && docId) {
        const syncDate = new Date(syncTimestamp)
        if (!Number.isNaN(syncDate.getTime())) {
          firestoreQuery = firestoreQuery.startAfter(perfDate, Timestamp.fromDate(syncDate), docId)
        }
      }
    }

    // If aggregation is requested, we need to sum metrics for the period
    // We deduplicate by providerId|date in memory to ensure accurate totals 
    // even if overlapping syncs exist.
    let summary: any = null
    if (shouldAggregate) {
      // Fetch documents for the period (limit to a safe amount for in-memory processing)
      const aggregationSnapshot = await firestoreQuery.limit(3000).get()
      const uniqueMetrics = new Map<string, any>()

      aggregationSnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data()
        const key = `${data.providerId}|${data.date}`
        const existing = uniqueMetrics.get(key)

        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 0
        const existingCreatedAt = existing?.createdAtMillis || 0

        if (!existing || createdAt > existingCreatedAt) {
          uniqueMetrics.set(key, {
            ...data,
            createdAtMillis: createdAt,
          })
        }
      })

      const totals = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      const providers: Record<string, typeof totals> = {}

      uniqueMetrics.forEach((m) => {
        const pId = m.providerId || 'unknown'
        if (!providers[pId]) {
          providers[pId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
        }
        
        const p = providers[pId]
        p.spend += Number(m.spend || 0)
        p.impressions += Number(m.impressions || 0)
        p.clicks += Number(m.clicks || 0)
        p.conversions += Number(m.conversions || 0)
        p.revenue += Number(m.revenue || 0)

        totals.spend += Number(m.spend || 0)
        totals.impressions += Number(m.impressions || 0)
        totals.clicks += Number(m.clicks || 0)
        totals.conversions += Number(m.conversions || 0)
        totals.revenue += Number(m.revenue || 0)
      })

      summary = {
        totals,
        providers,
        count: uniqueMetrics.size,
      }
    }

    // FETCH PAGE DATA
    firestoreQuery = firestoreQuery.limit(pageSize + 1)
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
          const date = nextCursorDoc.get('date') as string
          return createdAt && date ? `${date}|${createdAt}|${nextCursorDoc.id}` : null
        })()
      : null

    return {
      metrics,
      nextCursor,
      summary,
    }
  }
)
