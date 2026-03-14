import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/tabs', () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { ComparisonViewCardShell, ComparisonViewLoadingCard } from './comparison-view-card-sections'

const periodComparison = {
  current: { spend: 1200, impressions: 50000, clicks: 1400, conversions: 80, revenue: 3400, ctr: 0.028, roas: 2.83 },
  previous: { spend: 1000, impressions: 45000, clicks: 1200, conversions: 60, revenue: 2600, ctr: 0.026, roas: 2.6 },
  delta: { spend: 200, impressions: 5000, clicks: 200, conversions: 20, revenue: 800, ctr: 0.002, roas: 0.23 },
  deltaPercent: { spend: 20, impressions: 11.1, clicks: 16.7, conversions: 33.3, revenue: 30.8, ctr: 7.7, roas: 8.8 },
}

describe('comparison view card sections', () => {
  it('renders the loading shell', () => {
    const markup = renderToStaticMarkup(<ComparisonViewLoadingCard />)
    expect(markup).toContain('Comparison View')
    expect(markup).toContain('skeleton-shimmer')
  })

  it('renders empty comparison states', () => {
    const markup = renderToStaticMarkup(
      <ComparisonViewCardShell onTabChange={vi.fn()} periodComparison={null} providerComparison={[]} selectedTab="period" />,
    )

    expect(markup).toContain('Period')
    expect(markup).toContain('Platform')
    expect(markup).toContain('Not enough data for period comparison')
    expect(markup).toContain('No provider data available for comparison.')
  })

  it('renders populated period and provider comparisons', () => {
    const markup = renderToStaticMarkup(
      <ComparisonViewCardShell
        currency="GBP"
        onTabChange={vi.fn()}
        periodComparison={periodComparison}
        providerComparison={[{ providerId: 'google_ads', metrics: { spend: 650, ctr: 0.031, roas: 3.4, cpa: 18.2, conversions: 42 } }]}
        selectedTab="platform"
      />,
    )

    expect(markup).toContain('Spend')
    expect(markup).toContain('£1,000')
    expect(markup).toContain('Google')
    expect(markup).toContain('£650')
    expect(markup).toContain('3.40')
  })
})