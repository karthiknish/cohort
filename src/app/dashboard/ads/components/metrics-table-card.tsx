'use client'

import { memo, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

import {
  MetricsTableBody,
  MetricsTableFilters,
  MetricsTableHeader,
  MetricsTableLoadMore,
  buildMetricsTableColumns,
} from './metrics-table-card-sections'

import type { MetricRecord } from './types'
import { formatProviderName } from './utils'

interface MetricsTableCardProps {
  processedMetrics: MetricRecord[]
  hasMetrics: boolean
  initialMetricsLoading: boolean
  metricsLoading: boolean
  metricError: string | null
  nextCursor: string | null
  loadingMore: boolean
  loadMoreError: string | null
  onRefresh: () => void
  onLoadMore: () => void
  title?: string
  description?: string
  emptyMessage?: string
  emptyCtaLabel?: string
  emptyCtaHref?: string
}

function MetricsTableCardComponent({
  processedMetrics,
  hasMetrics,
  initialMetricsLoading,
  metricsLoading,
  metricError,
  nextCursor,
  loadingMore,
  loadMoreError,
  onRefresh,
  onLoadMore,
  title = 'Latest synced rows',
  description = 'Recent normalized records across all connected ad platforms.',
  emptyMessage = 'No data yet. Once a sync completes, your most recent rows will appear here.',
  emptyCtaLabel = 'Start a sync',
  emptyCtaHref = '#connect-ad-platforms',
}: MetricsTableCardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  // Get unique providers from the data
  const availableProviders = useMemo(() => {
    const providers = new Set(processedMetrics.map((m) => m.providerId))
    return Array.from(providers).sort()
  }, [processedMetrics])

  // Filter metrics based on search and provider selection
  const filteredMetrics = useMemo(() => {
    return processedMetrics.filter((metric) => {
      const providerName = formatProviderName(metric.providerId).toLowerCase()
      const matchesSearch = !searchQuery || providerName.includes(searchQuery.toLowerCase())
      const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(metric.providerId)
      return matchesSearch && matchesProvider
    })
  }, [processedMetrics, searchQuery, selectedProviders])

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((p) => p !== providerId)
        : [...prev, providerId]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedProviders([])
  }

  const hasActiveFilters = searchQuery.length > 0 || selectedProviders.length > 0

  const columns = useMemo(() => buildMetricsTableColumns(), [])

  return (
    <Card className="shadow-sm">
      <MetricsTableHeader description={description} metricsLoading={metricsLoading} onRefresh={onRefresh} title={title} />
      <CardContent>
        {hasMetrics && !initialMetricsLoading ? <MetricsTableFilters availableProviders={availableProviders} hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} onSearchChange={(event) => setSearchQuery(event.target.value)} searchQuery={searchQuery} selectedProviders={selectedProviders} toggleProvider={toggleProvider} /> : null}
        <MetricsTableBody columns={columns} emptyCtaHref={emptyCtaHref} emptyCtaLabel={emptyCtaLabel} emptyMessage={emptyMessage} filteredMetrics={filteredMetrics} hasMetrics={hasMetrics} hasActiveFilters={hasActiveFilters} initialMetricsLoading={initialMetricsLoading} metricError={metricError} onClearFilters={clearFilters} processedMetrics={processedMetrics} />
        <MetricsTableLoadMore hasMetrics={hasMetrics} loadMoreError={loadMoreError} loadingMore={loadingMore} nextCursor={nextCursor} onLoadMore={onLoadMore} />
      </CardContent>
    </Card>
  )
}

export const MetricsTableCard = memo(MetricsTableCardComponent)
