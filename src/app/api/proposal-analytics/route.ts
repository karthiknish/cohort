import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import type { Query, DocumentData } from 'firebase-admin/firestore'
import { z } from 'zod'

import { adminDb } from '@/lib/firebase-admin'
import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import type {
  ProposalEventType,
  ProposalAnalyticsSummary,
  ProposalAnalyticsTimeSeriesPoint,
  ProposalAnalyticsByClient,
} from '@/types/proposal-analytics'

const EVENT_TYPES: ProposalEventType[] = [
  'draft_created',
  'draft_updated',
  'ai_generation_started',
  'ai_generation_completed',
  'ai_generation_failed',
  'deck_generation_started',
  'deck_generation_completed',
  'deck_generation_failed',
  'proposal_submitted',
  'proposal_sent',
  'proposal_viewed',
  'proposal_downloaded',
]

const createEventSchema = z.object({
  eventType: z.enum(EVENT_TYPES as [ProposalEventType, ...ProposalEventType[]]),
  proposalId: z.string().min(1, 'Proposal ID is required'),
  clientId: z.string().nullable().optional(),
  clientName: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  duration: z.number().nullable().optional(),
  error: z.string().nullable().optional(),
})

type TimestampLike = Timestamp | Date | { toDate: () => Date } | string | null | undefined

function serializeTimestamp(value: TimestampLike): string | null {
  if (value === null || value === undefined) return null
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') return value
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    const date = value.toDate()
    return date instanceof Date ? date.toISOString() : null
  }
  return null
}

// GET: Retrieve analytics summary or time series data
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const url = new URL(request.url)
    const view = url.searchParams.get('view') || 'summary' // summary | timeseries | by-client | events
    const startDateParam = url.searchParams.get('startDate')
    const endDateParam = url.searchParams.get('endDate')
    const clientIdParam = url.searchParams.get('clientId')
    const limitParam = url.searchParams.get('limit')

    const eventsRef = adminDb.collection('users').doc(auth.uid).collection('proposalAnalytics')
    let query: Query<DocumentData> = eventsRef

    // Apply date filters
    if (startDateParam) {
      const startDate = new Date(startDateParam)
      if (!isNaN(startDate.getTime())) {
        query = query.where('createdAt', '>=', Timestamp.fromDate(startDate))
      }
    }
    if (endDateParam) {
      const endDate = new Date(endDateParam)
      if (!isNaN(endDate.getTime())) {
        // End of day
        endDate.setHours(23, 59, 59, 999)
        query = query.where('createdAt', '<=', Timestamp.fromDate(endDate))
      }
    }
    if (clientIdParam) {
      query = query.where('clientId', '==', clientIdParam)
    }

    query = query.orderBy('createdAt', 'desc')

    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 1000) : 500
    query = query.limit(limit)

    const snapshot = await query.get()
    const events = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        eventType: data.eventType as ProposalEventType,
        proposalId: data.proposalId as string,
        userId: data.userId as string,
        clientId: data.clientId ?? null,
        clientName: data.clientName ?? null,
        metadata: data.metadata ?? {},
        duration: typeof data.duration === 'number' ? data.duration : null,
        error: data.error ?? null,
        createdAt: serializeTimestamp(data.createdAt),
      }
    })

    if (view === 'events') {
      return NextResponse.json({ events })
    }

    if (view === 'summary') {
      const summary = calculateSummary(events)
      return NextResponse.json({ summary })
    }

    if (view === 'timeseries') {
      const timeseries = calculateTimeSeries(events)
      return NextResponse.json({ timeseries })
    }

    if (view === 'by-client') {
      const byClient = calculateByClient(events)
      return NextResponse.json({ byClient })
    }

    return NextResponse.json({ events })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[api/proposal-analytics] GET failed', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}

// POST: Track a new analytics event
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const body = await request.json().catch(() => ({}))
    const parsed = createEventSchema.parse(body)

    const eventData = {
      eventType: parsed.eventType,
      proposalId: parsed.proposalId,
      userId: auth.uid,
      clientId: parsed.clientId ?? null,
      clientName: parsed.clientName ?? null,
      metadata: parsed.metadata ?? {},
      duration: parsed.duration ?? null,
      error: parsed.error ?? null,
      createdAt: FieldValue.serverTimestamp(),
    }

    const docRef = await adminDb
      .collection('users')
      .doc(auth.uid)
      .collection('proposalAnalytics')
      .add(eventData)

    return NextResponse.json({ id: docRef.id }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload', details: error.flatten() }, { status: 400 })
    }
    console.error('[api/proposal-analytics] POST failed', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

// Helper function to calculate summary statistics
function calculateSummary(events: Array<{ eventType: ProposalEventType; duration?: number | null }>): ProposalAnalyticsSummary {
  let totalDrafts = 0
  let totalSubmitted = 0
  let totalSent = 0
  let aiGenerationsAttempted = 0
  let aiGenerationsSucceeded = 0
  let aiGenerationsFailed = 0
  let deckGenerationsAttempted = 0
  let deckGenerationsSucceeded = 0
  let deckGenerationsFailed = 0
  let aiGenerationTimes: number[] = []
  let deckGenerationTimes: number[] = []

  events.forEach((event) => {
    switch (event.eventType) {
      case 'draft_created':
        totalDrafts++
        break
      case 'proposal_submitted':
        totalSubmitted++
        break
      case 'proposal_sent':
        totalSent++
        break
      case 'ai_generation_started':
        aiGenerationsAttempted++
        break
      case 'ai_generation_completed':
        aiGenerationsSucceeded++
        if (event.duration && event.duration > 0) {
          aiGenerationTimes.push(event.duration)
        }
        break
      case 'ai_generation_failed':
        aiGenerationsFailed++
        break
      case 'deck_generation_started':
        deckGenerationsAttempted++
        break
      case 'deck_generation_completed':
        deckGenerationsSucceeded++
        if (event.duration && event.duration > 0) {
          deckGenerationTimes.push(event.duration)
        }
        break
      case 'deck_generation_failed':
        deckGenerationsFailed++
        break
    }
  })

  const averageAiGenerationTime = aiGenerationTimes.length > 0
    ? aiGenerationTimes.reduce((a, b) => a + b, 0) / aiGenerationTimes.length
    : null

  const averageDeckGenerationTime = deckGenerationTimes.length > 0
    ? deckGenerationTimes.reduce((a, b) => a + b, 0) / deckGenerationTimes.length
    : null

  const successRate = aiGenerationsAttempted > 0
    ? (aiGenerationsSucceeded / aiGenerationsAttempted) * 100
    : 0

  const deckSuccessRate = deckGenerationsAttempted > 0
    ? (deckGenerationsSucceeded / deckGenerationsAttempted) * 100
    : 0

  return {
    totalDrafts,
    totalSubmitted,
    totalSent,
    aiGenerationsAttempted,
    aiGenerationsSucceeded,
    aiGenerationsFailed,
    deckGenerationsAttempted,
    deckGenerationsSucceeded,
    deckGenerationsFailed,
    averageAiGenerationTime,
    averageDeckGenerationTime,
    successRate: Math.round(successRate * 10) / 10,
    deckSuccessRate: Math.round(deckSuccessRate * 10) / 10,
  }
}

// Helper function to calculate time series data
function calculateTimeSeries(events: Array<{ eventType: ProposalEventType; createdAt: string | null }>): ProposalAnalyticsTimeSeriesPoint[] {
  const byDate = new Map<string, ProposalAnalyticsTimeSeriesPoint>()

  events.forEach((event) => {
    if (!event.createdAt) return
    const date = event.createdAt.split('T')[0] // Extract YYYY-MM-DD

    if (!byDate.has(date)) {
      byDate.set(date, {
        date,
        draftsCreated: 0,
        proposalsSubmitted: 0,
        aiGenerations: 0,
        aiFailures: 0,
        deckGenerations: 0,
        deckFailures: 0,
      })
    }

    const point = byDate.get(date)!
    switch (event.eventType) {
      case 'draft_created':
        point.draftsCreated++
        break
      case 'proposal_submitted':
        point.proposalsSubmitted++
        break
      case 'ai_generation_completed':
        point.aiGenerations++
        break
      case 'ai_generation_failed':
        point.aiFailures++
        break
      case 'deck_generation_completed':
        point.deckGenerations++
        break
      case 'deck_generation_failed':
        point.deckFailures++
        break
    }
  })

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// Helper function to calculate analytics by client
function calculateByClient(events: Array<{ eventType: ProposalEventType; clientId?: string | null; clientName?: string | null; createdAt: string | null }>): ProposalAnalyticsByClient[] {
  const byClient = new Map<string, ProposalAnalyticsByClient>()

  events.forEach((event) => {
    const clientId = event.clientId
    if (!clientId) return

    if (!byClient.has(clientId)) {
      byClient.set(clientId, {
        clientId,
        clientName: event.clientName || 'Unknown Client',
        proposalCount: 0,
        submittedCount: 0,
        sentCount: 0,
        lastProposalAt: null,
      })
    }

    const client = byClient.get(clientId)!
    if (event.eventType === 'draft_created') {
      client.proposalCount++
      if (!client.lastProposalAt || (event.createdAt && event.createdAt > client.lastProposalAt)) {
        client.lastProposalAt = event.createdAt
      }
    } else if (event.eventType === 'proposal_submitted') {
      client.submittedCount++
    } else if (event.eventType === 'proposal_sent') {
      client.sentCount++
    }
  })

  return Array.from(byClient.values()).sort((a, b) => b.proposalCount - a.proposalCount)
}
