import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/dashboard/performance-chart', () => ({
  PerformanceChart: ({ currency, metrics }: { currency?: string; metrics: Array<{ providerId: string }> }) => <div>chart:{currency}:{metrics.length}:{metrics[0]?.providerId}</div>,
}))

vi.mock('@/components/ui/animate-in', () => ({
  FadeInItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FadeInStagger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div>separator</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('./date-range-picker', () => ({
  DateRangePicker: () => <div>date-range-picker</div>,
}))

import {
  CrossChannelOverviewContent,
  CrossChannelOverviewEmptyState,
  CrossChannelOverviewHeader,
  CrossChannelOverviewLoadingState,
} from './cross-channel-overview-card-sections'

describe('cross channel overview card sections', () => {
  it('renders the header controls and filter chips', () => {
    const markup = renderToStaticMarkup(
      <CrossChannelOverviewHeader availableProviders={['google_ads']} dateRange={{ from: '2024-01-01', to: '2024-01-31' }} hasMetricData={true} hasProviderFilter={true} onDateRangeChange={vi.fn()} onExport={vi.fn()} onToggleProvider={vi.fn()} selectedProviders={['google_ads']} serverAggregated={true} />,
    )

    expect(markup).toContain('Cross-channel overview')
    expect(markup).toContain('Server aggregated')
    expect(markup).toContain('Filter by Provider')
    expect(markup).toContain('Google')
    expect(markup).toContain('Showing:')
    expect(markup).toContain('date-range-picker')
  })

  it('renders the loading and empty states', () => {
    const loadingMarkup = renderToStaticMarkup(<CrossChannelOverviewLoadingState />)
    const emptyMarkup = renderToStaticMarkup(<CrossChannelOverviewEmptyState />)

    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(emptyMarkup).toContain('Connect an ad platform and run a sync')
    expect(emptyMarkup).toContain('Connect an account')
  })

  it('renders summary cards and the chart', () => {
    const markup = renderToStaticMarkup(
      <CrossChannelOverviewContent currency="GBP" metrics={[{ id: '1', providerId: 'google_ads', date: '2024-01-01', spend: 120, impressions: 1000, clicks: 45, conversions: 4, revenue: 380 }]} metricsLoading={false} summaryCards={[{ id: 'spend', label: 'Total Spend', value: '£120', helper: 'All selected platforms combined' }]} />,
    )

    expect(markup).toContain('Total Spend')
    expect(markup).toContain('£120')
    expect(markup).toContain('All selected platforms combined')
    expect(markup).toContain('chart:GBP:1:google_ads')
  })
})