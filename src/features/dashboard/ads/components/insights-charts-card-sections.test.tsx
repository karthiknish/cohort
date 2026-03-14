import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/select', () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <div>{placeholder}</div>,
}))

import {
  InsightsChartsEmptyState,
  InsightsChartsHeader,
  InsightsChartsLoadingState,
  InsightsChartsTabs,
} from './insights-charts-card-sections'

describe('insights charts card sections', () => {
  it('renders the loading and empty shells', () => {
    const loadingMarkup = renderToStaticMarkup(<InsightsChartsLoadingState />)
    const emptyMarkup = renderToStaticMarkup(<InsightsChartsEmptyState />)

    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(emptyMarkup).toContain('Performance Insights')
    expect(emptyMarkup).toContain('Connect ad platforms and sync data')
  })

  it('renders the header and tab shells', () => {
    const headerMarkup = renderToStaticMarkup(
      <InsightsChartsHeader
        onSelectedProviderChange={vi.fn()}
        providers={[{ id: 'google', name: 'Google Ads' }, { id: 'meta', name: 'Meta Ads' }]}
        providersCount={2}
        selectedProvider="all"
      />,
    )

    const tabsMarkup = renderToStaticMarkup(
      <InsightsChartsTabs
        benchmarkChart={<div>Benchmark chart</div>}
        comparisonChart={<div>Comparison chart</div>}
        efficiencyChart={<div>Efficiency chart</div>}
        funnelChart={<div>Funnel chart</div>}
        trendsChart={<div>Trends chart</div>}
      />,
    )

    expect(headerMarkup).toContain('Visual analysis across 2 platforms')
    expect(headerMarkup).toContain('Select provider')
    expect(headerMarkup).toContain('All Platforms')
    expect(tabsMarkup).toContain('Comparison')
    expect(tabsMarkup).toContain('Efficiency')
    expect(tabsMarkup).toContain('Funnel')
    expect(tabsMarkup).toContain('Benchmarks')
  })
})