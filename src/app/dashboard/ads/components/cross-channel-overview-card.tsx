'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Download, Info, Filter, X } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Skeleton } from '@/components/ui/skeleton'
import { PerformanceChart } from '@/components/dashboard/performance-chart'
import { FadeInItem, FadeInStagger } from '@/components/ui/animate-in'
import { formatCurrency } from '@/lib/utils'

import type { MetricRecord, SummaryCard } from './types'
import { DateRangePicker, type DateRange } from './date-range-picker'
import { PROVIDER_ICON_MAP, formatProviderName } from './utils'

interface CrossChannelOverviewCardProps {
  processedMetrics: MetricRecord[]
  hasMetricData: boolean
  initialMetricsLoading: boolean
  metricsLoading: boolean
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onExport: () => void
}

export function CrossChannelOverviewCard({
  processedMetrics,
  hasMetricData,
  initialMetricsLoading,
  metricsLoading,
  dateRange,
  onDateRangeChange,
  onExport,
}: CrossChannelOverviewCardProps) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  // Get unique providers from the data
  const availableProviders = useMemo(() => {
    const providers = new Set(processedMetrics.map((m) => m.providerId))
    return Array.from(providers).sort()
  }, [processedMetrics])

  // Filter metrics by selected providers
  const filteredMetrics = useMemo(() => {
    if (selectedProviders.length === 0) return processedMetrics
    return processedMetrics.filter((m) => selectedProviders.includes(m.providerId))
  }, [processedMetrics, selectedProviders])

  // Calculate summary cards from filtered metrics
  const summaryCards: SummaryCard[] = useMemo(() => {
    const totals = filteredMetrics.reduce(
      (acc, m) => {
        acc.spend += m.spend
        acc.impressions += m.impressions
        acc.clicks += m.clicks
        acc.conversions += m.conversions
        acc.revenue += m.revenue ?? 0
        return acc
      },
      { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
    )

    const hasData = filteredMetrics.length > 0
    const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
    const roas = totals.spend > 0 ? totals.revenue / totals.spend : 0

    return [
      {
        id: 'spend',
        label: 'Total Spend',
        value: formatCurrency(totals.spend),
        helper: hasData ? 'All selected platforms combined' : 'Connect a platform to populate',
      },
      {
        id: 'impressions',
        label: 'Impressions',
        value: totals.impressions > 0 ? totals.impressions.toLocaleString() : '—',
        helper: hasData ? 'Total times ads were served' : 'Awaiting your first sync',
      },
      {
        id: 'avg-cpc',
        label: 'Avg CPC',
        value: totals.clicks > 0 ? formatCurrency(averageCpc) : '—',
        helper: totals.clicks > 0 ? 'What each click cost on average' : 'Need click data to calculate',
      },
      {
        id: 'roas',
        label: 'ROAS',
        value: roas > 0 ? `${roas.toFixed(2)}x` : '—',
        helper: roas > 0 ? 'Revenue ÷ spend (higher is better)' : 'Needs revenue and spend data',
      },
    ]
  }, [filteredMetrics])

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((p) => p !== providerId)
        : [...prev, providerId]
    )
  }

  const clearProviderFilter = () => {
    setSelectedProviders([])
  }

  const hasProviderFilter = selectedProviders.length > 0

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Cross-channel overview</CardTitle>
            <CardDescription>
              Key performance indicators from the latest successful sync.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Provider Filter */}
            {availableProviders.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Providers
                    {hasProviderFilter && (
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
                      >
                        <span className="flex items-center gap-2">
                          {ProviderIcon && <ProviderIcon className="h-4 w-4" />}
                          {formatProviderName(providerId)}
                        </span>
                      </DropdownMenuCheckboxItem>
                    )
                  })}
                  {hasProviderFilter && (
                    <>
                      <DropdownMenuSeparator />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearProviderFilter}
                        className="w-full justify-start gap-1 text-muted-foreground"
                      >
                        <X className="h-4 w-4" />
                        Clear filter
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Date Range Picker */}
            <DateRangePicker
              value={dateRange}
              onChange={onDateRangeChange}
            />

            {/* Export Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onExport}
              disabled={!hasMetricData}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active filter indicator */}
        {hasProviderFilter && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing:</span>
            {selectedProviders.map((providerId) => (
              <Badge key={providerId} variant="secondary" className="gap-1">
                {formatProviderName(providerId)}
                <button
                  onClick={() => toggleProvider(providerId)}
                  className="ml-1 hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {initialMetricsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : !hasMetricData ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground">
            <p>Connect an ad platform and run a sync to view aggregate performance.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="#connect-ad-platforms">Connect an account</Link>
            </Button>
          </div>
        ) : (
          <>
            <FadeInStagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <FadeInItem key={card.id}>
                  <Card className="border-muted/70 bg-background shadow-sm">
                    <CardContent className="space-y-2 p-5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          {card.label}
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground/70" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{card.helper}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                      <p className="text-xs text-muted-foreground">{card.helper}</p>
                    </CardContent>
                  </Card>
                </FadeInItem>
              ))}
            </FadeInStagger>

            <div className="h-[350px] w-full">
              <PerformanceChart metrics={filteredMetrics} loading={metricsLoading} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
