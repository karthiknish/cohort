import { renderToStaticMarkup } from 'react-dom/server'

import { Target } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import {
  CustomInsightsCardHeader,
  CustomInsightsEmptyState,
  CustomInsightsGrid,
  CustomInsightsLoadingState,
} from './custom-insights-card-sections'

describe('custom insights card sections', () => {
  it('renders the header, loading state, and empty state', () => {
    const headerMarkup = renderToStaticMarkup(<CustomInsightsCardHeader anomalyCount={2} />)
    const loadingMarkup = renderToStaticMarkup(<CustomInsightsLoadingState />)
    const emptyMarkup = renderToStaticMarkup(<CustomInsightsEmptyState />)

    expect(headerMarkup).toContain('Custom Insights')
    expect(headerMarkup).toContain('2 anomalies')
    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(emptyMarkup).toContain('No metrics data available to calculate insights.')
  })

  it('renders the KPI grid tiles', () => {
    const markup = renderToStaticMarkup(
      <CustomInsightsGrid
        items={[
          {
            label: 'CPA',
            value: 42,
            format: 'currency',
            icon: <Target className="h-4 w-4" />,
            trend: -0.12,
            benchmark: 20,
            invertTrend: true,
            theme: 'rose',
          },
        ]}
      />,
    )

    expect(markup).toContain('CPA')
    expect(markup).toContain('$42')
    expect(markup).toContain('12.0%')
    expect(markup).toContain('ring-amber-500/50')
  })
})