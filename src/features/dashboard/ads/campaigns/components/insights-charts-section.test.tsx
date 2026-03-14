import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { InsightsChartsSection } from './insights-charts-section'

vi.mock('@/features/dashboard/home/components/performance-chart', () => ({
  PerformanceChart: ({ currency }: { currency?: string }) => <div>performance-chart:{currency}</div>,
}))

describe('InsightsChartsSection', () => {
  it('passes the selected currency through to the overview chart', () => {
    const markup = renderToStaticMarkup(
      <InsightsChartsSection
        chartMetrics={[]}
        engagementChartData={[]}
        conversionsChartData={[]}
        reachChartData={[]}
        insightsLoading={false}
        currency="GBP"
      />,
    )

    expect(markup).toContain('performance-chart:GBP')
    expect(markup).toContain('No engagement data available')
  })
})