import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import {
  ProposalAnalyticsActivityChart,
  ProposalAnalyticsByClientCard,
  ProposalAnalyticsEmptyState,
  ProposalAnalyticsHeader,
  ProposalAnalyticsLoadingCard,
  ProposalAnalyticsSuccessRates,
  ProposalAnalyticsSummaryGrid,
} from './proposal-analytics-card-sections'

const formatDuration = (milliseconds: number) => `${milliseconds}ms`

const formatPercentage = (value: number) => `${value}%`

const summary = {
  totalDrafts: 12,
  totalSubmitted: 8,
  totalSent: 5,
  aiGenerationsAttempted: 10,
  aiGenerationsSucceeded: 9,
  aiGenerationsFailed: 1,
  deckGenerationsAttempted: 8,
  deckGenerationsSucceeded: 7,
  deckGenerationsFailed: 1,
  averageAiGenerationTime: 24000,
  averageDeckGenerationTime: 71000,
  successRate: 90,
  deckSuccessRate: 87.5,
}

const chartData = {
  maxGenerations: 5,
  totalFailures: 1,
  totalGenerations: 6,
  points: [{ date: '2026-03-11', draftsCreated: 1, proposalsSubmitted: 1, aiGenerations: 3, aiFailures: 1, deckGenerations: 1, deckFailures: 0 }],
}

const byClient = [{ clientId: '1', clientName: 'Acme', proposalCount: 4, submittedCount: 2, sentCount: 1, lastProposalAt: '2026-03-11T12:00:00.000Z' }]

describe('proposal analytics card sections', () => {
  it('renders loading/header/summary/success sections', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalAnalyticsLoadingCard />
        <ProposalAnalyticsHeader loading={false} onRefresh={vi.fn()} onTimeRangeChange={vi.fn()} timeRange="30d" />
        <ProposalAnalyticsSummaryGrid summary={summary} formatDuration={formatDuration} />
        <ProposalAnalyticsSuccessRates summary={summary} formatDuration={formatDuration} formatPercentage={formatPercentage} />
      </>,
    )

    expect(markup).toContain('Proposal Analytics')
    expect(markup).toContain('Drafts Created')
    expect(markup).toContain('AI Generation Success Rate')
    expect(markup).toContain('Deck Generation Success Rate')
  })

  it('renders chart, by-client list, and empty state', () => {
    const markup = renderToStaticMarkup(
      <>
        <ProposalAnalyticsActivityChart
          chartData={chartData}
        />
        <ProposalAnalyticsByClientCard byClient={byClient} />
        <ProposalAnalyticsEmptyState />
      </>,
    )

    expect(markup).toContain('Generation Activity')
    expect(markup).toContain('Proposals by Client')
    expect(markup).toContain('Acme')
    expect(markup).toContain('No Analytics Data')
  })
})