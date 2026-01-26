'use client'

import { memo, useMemo, useState } from 'react'
import Link from 'next/link'
import { Info, RefreshCw, Search, Filter, X } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { formatCurrency, cn } from '@/lib/utils'

import type { MetricRecord } from './types'
import { PROVIDER_ICON_MAP, formatDisplayDate, formatProviderName } from './utils'

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
}

// Column header with tooltip helper
function HeaderWithTooltip({ title, tooltip }: { title: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1">
      {title}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-3 w-3 text-muted-foreground/70" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
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

  // Define columns for TanStack Table
  const columns: ColumnDef<MetricRecord>[] = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDisplayDate(row.getValue('date'))}
          </span>
        ),
      },
      {
        accessorKey: 'providerId',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Provider" />
        ),
        cell: ({ row }) => {
          const providerId = row.getValue('providerId') as string
          const ProviderIcon = PROVIDER_ICON_MAP[providerId]
          return (
            <div className="flex items-center gap-2">
              {ProviderIcon ? (
                <ProviderIcon
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : null}
              <span>{formatProviderName(providerId)}</span>
            </div>
          )
        },
        filterFn: (row, id, value: string[]) => {
          return value.length === 0 || value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'spend',
        header: () => (
          <HeaderWithTooltip title="Spend" tooltip="Total amount spent on ads" />
        ),
        cell: ({ row }) => formatCurrency(row.getValue('spend')),
      },
      {
        accessorKey: 'impressions',
        header: () => (
          <HeaderWithTooltip title="Impressions" tooltip="Number of times your ads were shown" />
        ),
        cell: ({ row }) => (row.getValue('impressions') as number).toLocaleString(),
      },
      {
        accessorKey: 'clicks',
        header: () => (
          <HeaderWithTooltip title="Clicks" tooltip="Number of times your ads were clicked" />
        ),
        cell: ({ row }) => (row.getValue('clicks') as number).toLocaleString(),
      },
      {
        accessorKey: 'conversions',
        header: () => (
          <HeaderWithTooltip title="Conversions" tooltip="Number of desired actions taken (e.g. purchases, signups)" />
        ),
        cell: ({ row }) => (row.getValue('conversions') as number).toLocaleString(),
      },
      {
        accessorKey: 'revenue',
        header: () => (
          <HeaderWithTooltip title="Revenue" tooltip="Total revenue generated from ads" />
        ),
        cell: ({ row }) => {
          const revenue = row.getValue('revenue') as number | null | undefined
          return revenue != null ? formatCurrency(revenue) : '—'
        },
      },
    ],
    []
  )

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Latest synced rows</CardTitle>
          <CardDescription>
            Recent normalized records across all connected ad platforms.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={metricsLoading}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} />{' '}
          Refresh rows
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        {hasMetrics && !initialMetricsLoading && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-10 px-4">
                    <Filter className="h-4 w-4" />
                    Providers
                    {selectedProviders.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {selectedProviders.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter by Provider</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableProviders.map((providerId) => {
                    const ProviderIcon = PROVIDER_ICON_MAP[providerId]
                    return (
                      <DropdownMenuCheckboxItem
                        key={providerId}
                        checked={selectedProviders.includes(providerId)}
                        onCheckedChange={() => toggleProvider(providerId)}
                        className="cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          {ProviderIcon && <ProviderIcon className="h-4 w-4" />}
                          {formatProviderName(providerId)}
                        </span>
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground h-10 px-3 hover:bg-muted/60">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Results count when filtering */}
        {hasActiveFilters && hasMetrics && (
          <p className="mb-4 text-sm text-muted-foreground">
            Showing {filteredMetrics.length} of {processedMetrics.length} rows
          </p>
        )}

        {initialMetricsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded" />
            ))}
          </div>
        ) : metricError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load metrics</AlertTitle>
            <AlertDescription>{metricError}</AlertDescription>
          </Alert>
        ) : !hasMetrics ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
            <p>No data yet. Once a sync completes, your most recent rows will appear here.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="#connect-ad-platforms">Start a sync</Link>
            </Button>
          </div>
        ) : filteredMetrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
            <p>No rows match your filters.</p>
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredMetrics}
            showPagination={false}
            maxHeight={320}
            stickyHeader
            enableVirtualization={filteredMetrics.length > 50}
            rowHeight={44}
            getRowId={(row) => row.id}
          />
        )}
        
        {nextCursor && hasMetrics && (
          <div className="mt-4 flex flex-col items-center gap-2">
            {loadMoreError && <p className="text-xs text-destructive">{loadMoreError}</p>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', loadingMore && 'animate-spin')} />
              {loadingMore ? 'Loading rows...' : 'Load more rows'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const MetricsTableCard = memo(MetricsTableCardComponent)
