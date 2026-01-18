import { cache } from 'react'
import { ConvexHttpClient } from 'convex/browser'
import { logger } from '@/lib/logger'

import type {
  ProposalAnalyticsEvent,
  ProposalAnalyticsSummary,
  ProposalAnalyticsTimeSeriesPoint,
  ProposalAnalyticsByClient,
  ProposalAnalyticsInput,
  ProposalAnalyticsFilters,
} from '@/types/proposal-analytics'

type WorkspaceScopedInput = ProposalAnalyticsInput & { workspaceId: string }

type AnalyticsEventRow = {
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

function getConvexHttpClient(): ConvexHttpClient {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL not set')
  return new ConvexHttpClient(url)
}

const queryConvex = cache(async (functionName: string, args: any) => {
  const client = getConvexHttpClient()

  try {
    return await client.query(functionName as any, args)
  } catch (error) {
    logger.error(`Convex Query Error: ${functionName}`, error, {
      type: 'convex_error',
      method: 'query',
      name: functionName,
      workspaceId: args.workspaceId,
    })
    throw error
  }
})

async function mutateConvex(functionName: string, args: any) {
  const client = getConvexHttpClient()

  try {
    return await client.mutation(functionName as any, args)
  } catch (error) {
    logger.error(`Convex Mutation Error: ${functionName}`, error, {
      type: 'convex_error',
      method: 'mutation',
      name: functionName,
      workspaceId: args.workspaceId,
    })
    throw error
  }
}

function parseDateOnlyToMs(dateOnly: string | undefined, endOfDay = false): number | undefined {
  if (!dateOnly) return undefined
  const d = new Date(dateOnly)
  if (Number.isNaN(d.getTime())) return undefined
  if (endOfDay) d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/**
 * Track a proposal analytics event
 */
export async function trackProposalEvent(input: WorkspaceScopedInput): Promise<{ id: string }> {
  const res = (await mutateConvex('proposalAnalytics:addEvent' as any, {
    workspaceId: input.workspaceId,
    eventType: input.eventType,
    proposalId: input.proposalId,
    clientId: input.clientId ?? null,
    clientName: input.clientName ?? null,
    metadata: input.metadata ?? {},
    duration: input.duration ?? null,
    error: input.error ?? null,
  })) as { legacyId: string }

  return { id: res.legacyId }
}

/**
 * Track draft creation event
 */
export async function trackDraftCreated(
  workspaceId: string,
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'draft_created',
    proposalId,
    clientId,
    clientName,
  })
}

/**
 * Track AI generation start
 */
export async function trackAiGenerationStarted(
  workspaceId: string,
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'ai_generation_started',
    proposalId,
    clientId,
    clientName,
  })
}

/**
 * Track AI generation completion
 */
export async function trackAiGenerationCompleted(
  workspaceId: string,
  proposalId: string,
  duration: number,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'ai_generation_completed',
    proposalId,
    duration,
    clientId,
    clientName,
  })
}

/**
 * Track AI generation failure
 */
export async function trackAiGenerationFailed(
  workspaceId: string,
  proposalId: string,
  error: string,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'ai_generation_failed',
    proposalId,
    error,
    clientId,
    clientName,
  })
}

/**
 * Track deck generation start
 */
export async function trackDeckGenerationStarted(
  workspaceId: string,
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'deck_generation_started',
    proposalId,
    clientId,
    clientName,
  })
}

/**
 * Track deck generation completion
 */
export async function trackDeckGenerationCompleted(
  workspaceId: string,
  proposalId: string,
  duration: number,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'deck_generation_completed',
    proposalId,
    duration,
    clientId,
    clientName,
  })
}

/**
 * Track deck generation failure
 */
export async function trackDeckGenerationFailed(
  workspaceId: string,
  proposalId: string,
  error: string,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'deck_generation_failed',
    proposalId,
    error,
    clientId,
    clientName,
  })
}

/**
 * Track proposal submission
 */
export async function trackProposalSubmitted(
  workspaceId: string,
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'proposal_submitted',
    proposalId,
    clientId,
    clientName,
  })
}

/**
 * Track proposal sent to client
 */
export async function trackProposalSent(
  workspaceId: string,
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null,
): Promise<void> {
  await trackProposalEvent({
    workspaceId,
    eventType: 'proposal_sent',
    proposalId,
    clientId,
    clientName,
  })
}

/**
 * Fetch proposal analytics summary
 */
export async function fetchProposalAnalyticsSummary(
  workspaceId: string,
  filters?: ProposalAnalyticsFilters,
): Promise<ProposalAnalyticsSummary> {
  const res = (await queryConvex('proposalAnalytics:summarize' as any, {
    workspaceId,
    startDateMs: parseDateOnlyToMs(filters?.startDate),
    endDateMs: parseDateOnlyToMs(filters?.endDate, true),
    clientId: filters?.clientId ?? undefined,
    limit: 1000,
  })) as { summary: ProposalAnalyticsSummary }

  return res.summary
}

/**
 * Fetch proposal analytics time series
 */
export async function fetchProposalAnalyticsTimeSeries(
  workspaceId: string,
  filters?: ProposalAnalyticsFilters,
): Promise<ProposalAnalyticsTimeSeriesPoint[]> {
  const res = (await queryConvex('proposalAnalytics:timeSeries' as any, {
    workspaceId,
    startDateMs: parseDateOnlyToMs(filters?.startDate),
    endDateMs: parseDateOnlyToMs(filters?.endDate, true),
    clientId: filters?.clientId ?? undefined,
    limit: 1000,
  })) as { timeseries: ProposalAnalyticsTimeSeriesPoint[] }

  return res.timeseries
}

/**
 * Fetch proposal analytics by client
 */
export async function fetchProposalAnalyticsByClient(
  workspaceId: string,
  filters?: ProposalAnalyticsFilters,
): Promise<ProposalAnalyticsByClient[]> {
  const res = (await queryConvex('proposalAnalytics:byClient' as any, {
    workspaceId,
    startDateMs: parseDateOnlyToMs(filters?.startDate),
    endDateMs: parseDateOnlyToMs(filters?.endDate, true),
    limit: 1000,
  })) as { byClient: ProposalAnalyticsByClient[] }

  return res.byClient
}

/**
 * Fetch raw proposal analytics events
 */
export async function fetchProposalAnalyticsEvents(
  workspaceId: string,
  filters?: ProposalAnalyticsFilters & { limit?: number },
): Promise<ProposalAnalyticsEvent[]> {
  const res = (await queryConvex('proposalAnalytics:listEvents' as any, {
    workspaceId,
    startDateMs: parseDateOnlyToMs(filters?.startDate),
    endDateMs: parseDateOnlyToMs(filters?.endDate, true),
    clientId: filters?.clientId ?? undefined,
    limit: filters?.limit,
  })) as AnalyticsEventRow[]

  return res.map((row) => ({
    id: row.legacyId,
    eventType: row.eventType as any,
    proposalId: row.proposalId,
    userId: row.userId,
    clientId: row.clientId ?? null,
    clientName: row.clientName ?? null,
    metadata: row.metadata ?? {},
    duration: row.duration,
    error: row.error,
    createdAt: new Date(row.createdAtMs).toISOString(),
  }))
}
