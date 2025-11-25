/**
 * Proposal Analytics Types
 * Track proposal generation success rates, performance metrics, and usage patterns
 */

export type ProposalEventType =
  | 'draft_created'
  | 'draft_updated'
  | 'ai_generation_started'
  | 'ai_generation_completed'
  | 'ai_generation_failed'
  | 'deck_generation_started'
  | 'deck_generation_completed'
  | 'deck_generation_failed'
  | 'proposal_submitted'
  | 'proposal_sent'
  | 'proposal_viewed'
  | 'proposal_downloaded'

export interface ProposalAnalyticsEvent {
  id: string
  eventType: ProposalEventType
  proposalId: string
  userId: string
  clientId?: string | null
  clientName?: string | null
  metadata?: Record<string, unknown>
  duration?: number | null // milliseconds for generation events
  error?: string | null
  createdAt: string
}

export interface ProposalAnalyticsSummary {
  totalDrafts: number
  totalSubmitted: number
  totalSent: number
  aiGenerationsAttempted: number
  aiGenerationsSucceeded: number
  aiGenerationsFailed: number
  deckGenerationsAttempted: number
  deckGenerationsSucceeded: number
  deckGenerationsFailed: number
  averageAiGenerationTime: number | null // milliseconds
  averageDeckGenerationTime: number | null
  successRate: number // percentage
  deckSuccessRate: number
}

export interface ProposalAnalyticsTimeSeriesPoint {
  date: string // ISO date string (YYYY-MM-DD)
  draftsCreated: number
  proposalsSubmitted: number
  aiGenerations: number
  aiFailures: number
  deckGenerations: number
  deckFailures: number
}

export interface ProposalAnalyticsByClient {
  clientId: string
  clientName: string
  proposalCount: number
  submittedCount: number
  sentCount: number
  lastProposalAt: string | null
}

export interface ProposalAnalyticsInput {
  eventType: ProposalEventType
  proposalId: string
  clientId?: string | null
  clientName?: string | null
  metadata?: Record<string, unknown>
  duration?: number | null
  error?: string | null
}

export interface ProposalAnalyticsFilters {
  startDate?: string
  endDate?: string
  clientId?: string
  eventType?: ProposalEventType
}
