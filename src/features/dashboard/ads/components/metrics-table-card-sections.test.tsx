import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/data-table', () => ({
  DataTable: ({ data }: { data: Array<{ providerId: string }> }) => <div>rows:{data.length}:{data[0]?.providerId}</div>,
  DataTableColumnHeader: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuCheckboxItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <div>separator</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import {
  MetricsTableBody,
  MetricsTableFilters,
  MetricsTableHeader,
  MetricsTableLoadMore,
  buildMetricsTableColumns,
} from './metrics-table-card-sections'

const rows = [
  { id: '1', date: '2024-01-01', providerId: 'google_ads', spend: 120, impressions: 1000, clicks: 45, conversions: 4, revenue: 380 },
]

describe('metrics table card sections', () => {
  it('renders the header and filters', () => {
    const headerMarkup = renderToStaticMarkup(<MetricsTableHeader description="Recent normalized records" metricsLoading={false} onRefresh={vi.fn()} title="Latest synced rows" />)
    const filtersMarkup = renderToStaticMarkup(
      <MetricsTableFilters availableProviders={['google_ads']} hasActiveFilters={true} onClearFilters={vi.fn()} onSearchChange={vi.fn()} searchQuery="google" selectedProviders={['google_ads']} toggleProvider={vi.fn()} />,
    )

    expect(headerMarkup).toContain('Latest synced rows')
    expect(headerMarkup).toContain('Refresh rows')
    expect(filtersMarkup).toContain('Search by provider')
    expect(filtersMarkup).toContain('Filter by Provider')
    expect(filtersMarkup).toContain('Google')
    expect(filtersMarkup).toContain('Clear')
  })

  it('renders table body states', () => {
    const loadingMarkup = renderToStaticMarkup(
      <MetricsTableBody columns={buildMetricsTableColumns()} emptyCtaHref="#connect" emptyCtaLabel="Start a sync" emptyMessage="No data yet." filteredMetrics={[]} hasMetrics={true} hasActiveFilters={false} initialMetricsLoading={true} metricError={null} onClearFilters={vi.fn()} processedMetrics={rows} />,
    )
    const emptyMarkup = renderToStaticMarkup(
      <MetricsTableBody columns={buildMetricsTableColumns()} emptyCtaHref="#connect" emptyCtaLabel="Start a sync" emptyMessage="No data yet." filteredMetrics={[]} hasMetrics={false} hasActiveFilters={false} initialMetricsLoading={false} metricError={null} onClearFilters={vi.fn()} processedMetrics={[]} />,
    )
    const tableMarkup = renderToStaticMarkup(
      <MetricsTableBody columns={buildMetricsTableColumns()} emptyCtaHref="#connect" emptyCtaLabel="Start a sync" emptyMessage="No data yet." filteredMetrics={rows} hasMetrics={true} hasActiveFilters={true} initialMetricsLoading={false} metricError={null} onClearFilters={vi.fn()} processedMetrics={rows} />,
    )

    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(emptyMarkup).toContain('No data yet.')
    expect(emptyMarkup).toContain('Start a sync')
    expect(tableMarkup).toContain('Showing 1 of 1 rows')
    expect(tableMarkup).toContain('rows:1:google_ads')
  })

  it('renders the load more footer and errors', () => {
    const markup = renderToStaticMarkup(
      <MetricsTableLoadMore hasMetrics={true} loadMoreError="Retry later" loadingMore={false} nextCursor="cursor-1" onLoadMore={vi.fn()} />,
    )

    expect(markup).toContain('Retry later')
    expect(markup).toContain('Load more rows')
  })
})