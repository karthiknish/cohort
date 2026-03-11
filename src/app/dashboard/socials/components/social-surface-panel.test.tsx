import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import { SocialSurfacePanel } from './social-surface-panel'

vi.mock('@/app/dashboard/ads/components/algorithmic-insights-card', () => ({
  AlgorithmicInsightsCard: () => <div>Insights mock</div>,
}))

vi.mock('@/app/dashboard/ads/components/metrics-table-card', () => ({
  MetricsTableCard: () => <div>Metrics mock</div>,
}))

vi.mock('@/app/dashboard/ads/components/performance-summary-card', () => ({
  PerformanceSummaryCard: () => <div>Summary mock</div>,
}))

vi.mock('./socials-kpi-grid', () => ({
  SocialsKpiGrid: () => <div>KPI mock</div>,
}))

const baseProps = {
  surface: 'facebook' as const,
  items: [],
  itemsLoading: false,
  itemsError: null,
  kpis: [],
  providerSummaries: {},
  metrics: [],
  initialMetricsLoading: false,
  metricsLoading: false,
  metricError: null,
  nextCursor: null,
  loadingMore: false,
  loadMoreError: null,
  onRefresh: vi.fn(),
  onRetryItems: vi.fn(),
  onLoadMore: vi.fn(),
  onExport: vi.fn(),
  suggestions: {
    analysis: null,
    insights: [],
    providerInsights: {},
    budgetSuggestions: [],
    globalEfficiencyScore: 0,
    providerEfficiencyScores: {},
    hasCriticalInsights: false,
    hasWarningInsights: false,
    insightCounts: { success: 0, warning: 0, info: 0, critical: 0 },
  },
}

describe('SocialSurfacePanel', () => {
  it('renders distinct error and empty states for connected surfaces', () => {
    const errorMarkup = renderToStaticMarkup(
      <SocialSurfacePanel {...baseProps} itemsError="Meta actor fetch failed" />,
    )
    const emptyMarkup = renderToStaticMarkup(<SocialSurfacePanel {...baseProps} />)

    expect(errorMarkup).toContain('Unable to load connected surfaces')
    expect(errorMarkup).toContain('Meta actor fetch failed')
    expect(errorMarkup).toContain('Retry')
    expect(emptyMarkup).toContain('No facebook surfaces available yet')
  })
})