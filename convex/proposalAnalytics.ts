import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

function requireIdentity(identity: unknown): asserts identity {
  if (!identity) throw new Error('Unauthorized')
}

function nowMs() {
  return Date.now()
}

function generateId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

const EVENT_TYPES = [
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
] as const

export const addEvent = mutation({
  args: {
    workspaceId: v.string(),
    eventType: v.union(
      v.literal('draft_created'),
      v.literal('draft_updated'),
      v.literal('ai_generation_started'),
      v.literal('ai_generation_completed'),
      v.literal('ai_generation_failed'),
      v.literal('deck_generation_started'),
      v.literal('deck_generation_completed'),
      v.literal('deck_generation_failed'),
      v.literal('proposal_submitted'),
      v.literal('proposal_sent'),
      v.literal('proposal_viewed'),
      v.literal('proposal_downloaded'),
    ),
    proposalId: v.string(),
    clientId: v.optional(v.union(v.string(), v.null())),
    clientName: v.optional(v.union(v.string(), v.null())),
    metadata: v.optional(v.any()),
    duration: v.optional(v.union(v.number(), v.null())),
    error: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const legacyId = generateId('proposal-analytics')
    const createdAtMs = nowMs()

    await ctx.db.insert('proposalAnalyticsEvents', {
      workspaceId: args.workspaceId,
      legacyId,
      eventType: args.eventType,
      proposalId: args.proposalId,
      userId: identity.subject,
      clientId: args.clientId ?? null,
      clientName: args.clientName ?? null,
      metadata: args.metadata ?? {},
      duration: args.duration ?? null,
      error: args.error ?? null,
      createdAtMs,
    })

    return { legacyId }
  },
})

type ListEventsArgs = {
  workspaceId: string
  startDateMs?: number
  endDateMs?: number
  clientId?: string | null
  limit?: number
}

type ListedEvent = {
  legacyId: string
  eventType: string
  proposalId: string
  userId: string
  clientId: string | null
  clientName: string | null
  metadata: Record<string, unknown>
  duration: number | null
  error: string | null
  createdAtMs: number
}

async function listEventsImpl(ctx: any, args: ListEventsArgs): Promise<ListedEvent[]> {
  const limit = typeof args.limit === 'number' && Number.isFinite(args.limit) ? Math.min(Math.max(args.limit, 1), 1000) : 500

  const useClientIndex = args.clientId !== undefined

  const rows = useClientIndex
    ? await ctx.db
        .query('proposalAnalyticsEvents')
        .withIndex('by_workspace_clientId_createdAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId ?? null))
        .order('desc')
        .take(limit)
    : await ctx.db
        .query('proposalAnalyticsEvents')
        .withIndex('by_workspace_createdAtMs_legacyId', (q: any) => q.eq('workspaceId', args.workspaceId))
        .order('desc')
        .take(limit)

  const start = typeof args.startDateMs === 'number' ? args.startDateMs : null
  const end = typeof args.endDateMs === 'number' ? args.endDateMs : null

  const filtered = rows.filter((row: any) => {
    const createdAtMs = typeof row.createdAtMs === 'number' ? row.createdAtMs : 0
    if (start !== null && createdAtMs < start) return false
    if (end !== null && createdAtMs > end) return false
    return true
  })

  return filtered.map((row: any) => ({
    legacyId: String(row.legacyId),
    eventType: String(row.eventType),
    proposalId: String(row.proposalId),
    userId: String(row.userId),
    clientId: row.clientId ?? null,
    clientName: row.clientName ?? null,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    duration: typeof row.duration === 'number' ? row.duration : null,
    error: typeof row.error === 'string' ? row.error : null,
    createdAtMs: typeof row.createdAtMs === 'number' ? row.createdAtMs : 0,
  }))
}

export const listEvents = query({
  args: {
    workspaceId: v.string(),
    startDateMs: v.optional(v.number()),
    endDateMs: v.optional(v.number()),
    clientId: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    return listEventsImpl(ctx, {
      workspaceId: args.workspaceId,
      startDateMs: args.startDateMs,
      endDateMs: args.endDateMs,
      clientId: args.clientId,
      limit: args.limit,
    })
  },
})

type EventRow = {
  eventType: string
  clientId: string | null
  duration: number | null
  createdAtMs: number
}

export const summarize = query({
  args: {
    workspaceId: v.string(),
    startDateMs: v.optional(v.number()),
    endDateMs: v.optional(v.number()),
    clientId: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const events = await listEventsImpl(ctx, {
      workspaceId: args.workspaceId,
      startDateMs: args.startDateMs,
      endDateMs: args.endDateMs,
      clientId: args.clientId,
      limit: args.limit,
    })

    const summary = calculateSummary(events)
    return { summary }
  },
})

export const timeSeries = query({
  args: {
    workspaceId: v.string(),
    startDateMs: v.optional(v.number()),
    endDateMs: v.optional(v.number()),
    clientId: v.optional(v.union(v.string(), v.null())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const events = await listEventsImpl(ctx, {
      workspaceId: args.workspaceId,
      startDateMs: args.startDateMs,
      endDateMs: args.endDateMs,
      clientId: args.clientId,
      limit: args.limit,
    })

    const timeseries = calculateTimeSeries(events)
    return { timeseries }
  },
})

export const byClient = query({
  args: {
    workspaceId: v.string(),
    startDateMs: v.optional(v.number()),
    endDateMs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)

    const events = await listEventsImpl(ctx, {
      workspaceId: args.workspaceId,
      startDateMs: args.startDateMs,
      endDateMs: args.endDateMs,
      clientId: undefined,
      limit: args.limit,
    })

    const byClient = calculateByClient(events)
    return { byClient }
  },
})



function calculateSummary(events: Array<{ eventType: string; duration?: number | null }>) {
  let totalDrafts = 0
  let totalSubmitted = 0
  let totalSent = 0
  let aiGenerationsAttempted = 0
  let aiGenerationsSucceeded = 0
  let aiGenerationsFailed = 0
  let deckGenerationsAttempted = 0
  let deckGenerationsSucceeded = 0
  let deckGenerationsFailed = 0
  const aiGenerationTimes: number[] = []
  const deckGenerationTimes: number[] = []

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

  const averageAiGenerationTime =
    aiGenerationTimes.length > 0 ? aiGenerationTimes.reduce((a, b) => a + b, 0) / aiGenerationTimes.length : null

  const averageDeckGenerationTime =
    deckGenerationTimes.length > 0 ? deckGenerationTimes.reduce((a, b) => a + b, 0) / deckGenerationTimes.length : null

  const aiSuccessRate =
    aiGenerationsAttempted > 0 ? (aiGenerationsSucceeded / aiGenerationsAttempted) * 100 : 0

  const deckSuccessRate =
    deckGenerationsAttempted > 0 ? (deckGenerationsSucceeded / deckGenerationsAttempted) * 100 : 0

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
    aiSuccessRate,
    deckSuccessRate,
    averageAiGenerationTime,
    averageDeckGenerationTime,
  }
}

function calculateTimeSeries(events: Array<{ eventType: string; createdAtMs?: number }>) {
  const dailyStats = new Map<
    string,
    { date: string; drafts: number; submissions: number; aiGenerations: number; deckGenerations: number; aiFailures: number; deckFailures: number }
  >()

  events.forEach((event) => {
    const createdAtMs = typeof event.createdAtMs === 'number' ? event.createdAtMs : 0
    const date = new Date(createdAtMs).toISOString().split('T')[0]

    if (!dailyStats.has(date)) {
      dailyStats.set(date, {
        date,
        drafts: 0,
        submissions: 0,
        aiGenerations: 0,
        deckGenerations: 0,
        aiFailures: 0,
        deckFailures: 0,
      })
    }

    const stats = dailyStats.get(date)!

    switch (event.eventType) {
      case 'draft_created':
        stats.drafts++
        break
      case 'proposal_submitted':
        stats.submissions++
        break
      case 'ai_generation_started':
        stats.aiGenerations++
        break
      case 'deck_generation_started':
        stats.deckGenerations++
        break
      case 'ai_generation_failed':
        stats.aiFailures++
        break
      case 'deck_generation_failed':
        stats.deckFailures++
        break
    }
  })

  return Array.from(dailyStats.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((stats) => ({
      date: stats.date,
      drafts: stats.drafts,
      submissions: stats.submissions,
      aiGenerations: stats.aiGenerations,
      deckGenerations: stats.deckGenerations,
      aiFailures: stats.aiFailures,
      deckFailures: stats.deckFailures,
    }))
}

function calculateByClient(events: EventRow[]) {
  const map = new Map<
    string,
    {
      clientId: string
      clientName: string
      drafts: number
      submissions: number
      aiGenerations: number
      deckGenerations: number
      avgAiTime: number | null
      avgDeckTime: number | null
    }
  >()

  const aiTimes = new Map<string, number[]>()
  const deckTimes = new Map<string, number[]>()

  events.forEach((event: any) => {
    const clientId = typeof event.clientId === 'string' ? event.clientId : null
    const clientName = typeof event.clientName === 'string' ? event.clientName : null
    if (!clientId || !clientName) return

    if (!map.has(clientId)) {
      map.set(clientId, {
        clientId,
        clientName,
        drafts: 0,
        submissions: 0,
        aiGenerations: 0,
        deckGenerations: 0,
        avgAiTime: null,
        avgDeckTime: null,
      })
      aiTimes.set(clientId, [])
      deckTimes.set(clientId, [])
    }

    const row = map.get(clientId)!

    switch (event.eventType) {
      case 'draft_created':
        row.drafts++
        break
      case 'proposal_submitted':
        row.submissions++
        break
      case 'ai_generation_started':
        row.aiGenerations++
        break
      case 'deck_generation_started':
        row.deckGenerations++
        break
      case 'ai_generation_completed':
        if (typeof event.duration === 'number' && event.duration > 0) {
          aiTimes.get(clientId)!.push(event.duration)
        }
        break
      case 'deck_generation_completed':
        if (typeof event.duration === 'number' && event.duration > 0) {
          deckTimes.get(clientId)!.push(event.duration)
        }
        break
    }
  })

  for (const [clientId, row] of map.entries()) {
    const ai = aiTimes.get(clientId) ?? []
    const deck = deckTimes.get(clientId) ?? []
    row.avgAiTime = ai.length > 0 ? ai.reduce((a, b) => a + b, 0) / ai.length : null
    row.avgDeckTime = deck.length > 0 ? deck.reduce((a, b) => a + b, 0) / deck.length : null
  }

  return Array.from(map.values()).sort((a, b) => b.submissions - a.submissions)
}

export const eventTypes = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    requireIdentity(identity)
    return EVENT_TYPES
  },
})
