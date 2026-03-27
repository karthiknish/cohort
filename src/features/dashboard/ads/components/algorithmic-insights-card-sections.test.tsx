import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import {
  AlgorithmicInsightsCompactCard,
  AlgorithmicInsightsEmptyCard,
  AlgorithmicInsightsFullCard,
  AlgorithmicInsightsLoadingCard,
} from './algorithmic-insights-card-sections'

const insight = {
  type: 'budget_optimization',
  level: 'warning' as const,
  title: 'Budget needs rebalancing',
  message: 'One platform is overspending relative to return.',
  suggestion: 'Move budget toward higher-ROAS campaigns.',
  score: 61,
}

const providerEfficiencyScores = { meta_ads: 31, google_ads: 44 }

describe('algorithmic insights card sections', () => {
  it('renders loading and empty cards', () => {
    const loadingMarkup = renderToStaticMarkup(<AlgorithmicInsightsLoadingCard title="AI-Powered Insights" compact={false} />)
    const emptyMarkup = renderToStaticMarkup(<AlgorithmicInsightsEmptyCard title="AI-Powered Insights" description="Algorithmic analysis" emptyMessage="Connect ad platforms and sync data." />)

    expect(loadingMarkup).toContain('Analyzing your performance data')
    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(emptyMarkup).toContain('AI-Powered Insights')
    expect(emptyMarkup).toContain('Connect ad platforms and sync data.')
  })

  it('renders the compact variant', () => {
    const onViewAll = vi.fn()
    const markup = renderToStaticMarkup(
      <AlgorithmicInsightsCompactCard
        criticalCount={0}
        displayedInsights={[insight]}
        globalEfficiencyScore={74}
        hasMoreInsights={true}
        insightsCount={3}
        onViewAll={onViewAll}
        title="AI-Powered Insights"
        warningCount={1}
      />,
    )

    expect(markup).toContain('1 action needed')
    expect(markup).toContain('Budget needs rebalancing')
    expect(markup).toContain('View all 3 insights')
    expect(markup).toContain('Efficiency Score: 74 out of 100')
  })

  it('renders the full variant', () => {
    const onViewAll = vi.fn()
    const markup = renderToStaticMarkup(
      <AlgorithmicInsightsFullCard
        criticalCount={1}
        description="Algorithmic analysis of ad performance"
        displayedInsights={[]}
        globalEfficiencyScore={38}
        hasMoreInsights={true}
        onViewAll={onViewAll}
        providerEfficiencyScores={providerEfficiencyScores}
        title="AI-Powered Insights"
      />,
    )

    expect(markup).toContain('1 critical')
    expect(markup).toContain('View all insights')
    expect(markup).toContain('Immediate attention recommended')
    expect(markup).toContain('Meta: 31%')
    expect(markup).toContain('Google: 44%')
    expect(markup).toContain('All systems nominal')
  })
})