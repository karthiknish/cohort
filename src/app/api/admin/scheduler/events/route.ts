import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'
import { createApiHandler } from '@/lib/api-handler'

const MAX_LIMIT = 100

function encodeCursor(createdAt: Timestamp, docId: string): string {
  return Buffer.from(JSON.stringify({ createdAt: createdAt.toMillis(), docId }), 'utf8').toString(
    'base64url'
  )
}

function decodeCursor(cursor?: string | null): { createdAt: Timestamp; docId: string } | null {
  if (!cursor) return null
  try {
    const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as {
      createdAt: number
      docId: string
    }
    if (!decoded || typeof decoded.createdAt !== 'number' || typeof decoded.docId !== 'string') {
      return null
    }
    return { createdAt: Timestamp.fromMillis(decoded.createdAt), docId: decoded.docId }
  } catch (error) {
    console.warn('[admin/scheduler/events] invalid cursor supplied', error)
    return null
  }
}

export const GET = createApiHandler(
  {
    adminOnly: true,
  },
  async (req) => {
    const searchParams = req.nextUrl.searchParams
    const limitParam = searchParams.get('limit')
    const cursorParam = searchParams.get('cursor')
    const severityFilter = searchParams.get('severity')
    const sourceFilter = searchParams.get('source')

    const limit = Math.min(Math.max(Number(limitParam) || 25, 1), MAX_LIMIT)
    const decodedCursor = decodeCursor(cursorParam)

    let query = adminDb
      .collection('admin')
      .doc('scheduler')
      .collection('events')
      .orderBy('createdAt', 'desc')
      .limit(limit + 1)

    if (decodedCursor) {
      query = query.startAfter(decodedCursor.createdAt, decodedCursor.docId)
    }

    if (severityFilter) {
      query = query.where('severity', '==', severityFilter)
    }

    if (sourceFilter) {
      query = query.where('source', '==', sourceFilter)
    }

    const snapshot = await query.get()
    const events = snapshot.docs.slice(0, limit).map((doc) => {
      const data = doc.data() as Record<string, unknown>
      const createdAt =
        data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null

      return {
        id: doc.id,
        createdAt,
        source: (data.source as string) ?? 'unknown',
        operation: (data.operation as string | null | undefined) ?? null,
        processedJobs: (data.processedJobs as number | undefined) ?? 0,
        successfulJobs: (data.successfulJobs as number | undefined) ?? 0,
        failedJobs: (data.failedJobs as number | undefined) ?? 0,
        hadQueuedJobs: Boolean(data.hadQueuedJobs),
        inspectedQueuedJobs: (data.inspectedQueuedJobs as number | undefined) ?? null,
        durationMs: (data.durationMs as number | undefined) ?? null,
        severity: (data.severity as string | undefined) ?? 'info',
        errors: Array.isArray(data.errors)
          ? data.errors
              .filter((item) => typeof item === 'string' && item.trim().length > 0)
              .slice(0, 10)
          : [],
        notes: (data.notes as string | null | undefined) ?? null,
        failureThreshold: (data.failureThreshold as number | null | undefined) ?? null,
        providerFailureThresholds: Array.isArray(data.providerFailureThresholds)
          ? data.providerFailureThresholds
              .filter(
                (
                  entry
                ): entry is { providerId: string; failedJobs: number; threshold: number | null } =>
                  entry != null &&
                  typeof entry === 'object' &&
                  typeof entry.providerId === 'string'
              )
              .map((entry) => ({
                providerId: entry.providerId,
                failedJobs: typeof entry.failedJobs === 'number' ? entry.failedJobs : 0,
                threshold:
                  typeof entry.threshold === 'number' &&
                  Number.isFinite(entry.threshold) &&
                  entry.threshold >= 0
                    ? entry.threshold
                    : null,
              }))
          : [],
      }
    })

    const hasNext = snapshot.docs.length > limit
    const nextCursor = hasNext
      ? encodeCursor(snapshot.docs[limit].get('createdAt') as Timestamp, snapshot.docs[limit].id)
      : null

    return { events, nextCursor }
  }
)
