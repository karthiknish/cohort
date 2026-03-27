import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import { PerformanceSummaryCard } from './performance-summary-card'

const emptyProviderSummaries = {}

const metaAdsProviderSummary = {
  meta_ads: { spend: 1234, impressions: 12000, clicks: 345, conversions: 12 },
}

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

describe('performance summary card', () => {
  it('renders the empty state copy', () => {
    const markup = renderToStaticMarkup(
      <PerformanceSummaryCard
        providerSummaries={emptyProviderSummaries}
        hasMetrics={false}
        initialMetricsLoading={false}
        metricsLoading={false}
        metricError={null}
        onRefresh={vi.fn()}
        onExport={vi.fn()}
      />,
    )

    expect(markup).toContain('Ad performance summary')
    expect(markup).toContain('No synced performance data yet.')
    expect(markup).toContain('Run first sync')
  })

  it('renders provider summary metrics', () => {
    const markup = renderToStaticMarkup(
      <PerformanceSummaryCard
        providerSummaries={metaAdsProviderSummary}
        currency="GBP"
        hasMetrics={true}
        initialMetricsLoading={false}
        metricsLoading={false}
        metricError={null}
        onRefresh={vi.fn()}
        onExport={vi.fn()}
      />,
    )

    expect(markup).toContain('Meta')
    expect(markup).toContain('£1,234')
    expect(markup).toContain('12,000')
    expect(markup).toContain('345')
    expect(markup).toContain('12')
  })
})