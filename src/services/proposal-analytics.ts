import { apiFetch } from '@/lib/api-client'
import type {
  ProposalEventType,
  ProposalAnalyticsEvent,
  ProposalAnalyticsSummary,
  ProposalAnalyticsTimeSeriesPoint,
  ProposalAnalyticsByClient,
  ProposalAnalyticsInput,
  ProposalAnalyticsFilters,
} from '@/types/proposal-analytics'

/**
 * Track a proposal analytics event
 */
export async function trackProposalEvent(input: ProposalAnalyticsInput): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/api/proposal-analytics', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

/**
 * Track draft creation event
 */
export async function trackDraftCreated(
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  duration: number,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  error: string,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  duration: number,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  error: string,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  proposalId: string,
  clientId?: string | null,
  clientName?: string | null
): Promise<void> {
  await trackProposalEvent({
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
  filters?: ProposalAnalyticsFilters
): Promise<ProposalAnalyticsSummary> {
  const params = new URLSearchParams({ view: 'summary' })
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  if (filters?.clientId) params.set('clientId', filters.clientId)

  const data = await apiFetch<{ summary: ProposalAnalyticsSummary }>(`/api/proposal-analytics?${params}`)
  return data.summary
}

/**
 * Fetch proposal analytics time series
 */
export async function fetchProposalAnalyticsTimeSeries(
  filters?: ProposalAnalyticsFilters
): Promise<ProposalAnalyticsTimeSeriesPoint[]> {
  const params = new URLSearchParams({ view: 'timeseries' })
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  if (filters?.clientId) params.set('clientId', filters.clientId)

  const data = await apiFetch<{ timeseries: ProposalAnalyticsTimeSeriesPoint[] }>(`/api/proposal-analytics?${params}`)
  return data.timeseries
}

/**
 * Fetch proposal analytics by client
 */
export async function fetchProposalAnalyticsByClient(
  filters?: ProposalAnalyticsFilters
): Promise<ProposalAnalyticsByClient[]> {
  const params = new URLSearchParams({ view: 'by-client' })
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)

  const data = await apiFetch<{ byClient: ProposalAnalyticsByClient[] }>(`/api/proposal-analytics?${params}`)
  return data.byClient
}

/**
 * Fetch raw proposal analytics events
 */
export async function fetchProposalAnalyticsEvents(
  filters?: ProposalAnalyticsFilters & { limit?: number }
): Promise<ProposalAnalyticsEvent[]> {
  const params = new URLSearchParams({ view: 'events' })
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  if (filters?.clientId) params.set('clientId', filters.clientId)
  if (filters?.limit) params.set('limit', filters.limit.toString())

  const data = await apiFetch<{ events: ProposalAnalyticsEvent[] }>(`/api/proposal-analytics?${params}`)
  return data.events
}
