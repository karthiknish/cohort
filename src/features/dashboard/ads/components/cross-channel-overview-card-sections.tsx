'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { Download, Filter, Info, X } from 'lucide-react'

import { FadeInItem, FadeInStagger } from '@/shared/ui/animate-in'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'

import { PerformanceChart } from '@/features/dashboard/home/components/performance-chart'

import type { MetricRecord, SummaryCard } from './types'
import { DateRangePicker, type DateRange } from './date-range-picker'
import { PROVIDER_ICON_MAP, formatProviderName } from './utils'

function ProviderFilterOption({
  providerId,
  selectedProviders,
  onToggleProvider,
}: {
  providerId: string
  selectedProviders: string[]
  onToggleProvider: (providerId: string) => void
}) {
  const ProviderIcon = PROVIDER_ICON_MAP[providerId]
  const handleCheckedChange = useCallback(() => {
    onToggleProvider(providerId)
  }, [onToggleProvider, providerId])

  return (
    <DropdownMenuCheckboxItem
      checked={selectedProviders.includes(providerId)}
      onCheckedChange={handleCheckedChange}
    >
      <span className="flex items-center gap-2">
        {ProviderIcon ? <ProviderIcon className="h-4 w-4" /> : null}
        {formatProviderName(providerId)}
      </span>
    </DropdownMenuCheckboxItem>
  )
}

function SelectedProviderChip({
  providerId,
  onToggleProvider,
}: {
  providerId: string
  onToggleProvider: (providerId: string) => void
}) {
  const handleRemove = useCallback(() => {
    onToggleProvider(providerId)
  }, [onToggleProvider, providerId])

  return (
    <Badge key={providerId} variant="secondary" className="gap-1">
      {formatProviderName(providerId)}
      <button
        type="button"
        onClick={handleRemove}
        className="ml-1 hover:text-foreground"
        aria-label={`Remove ${formatProviderName(providerId)} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

export function CrossChannelOverviewHeader({ availableProviders, dateRange, hasMetricData, hasProviderFilter, onDateRangeChange, onExport, onToggleProvider, selectedProviders, serverAggregated }: { availableProviders: string[]; dateRange: DateRange; hasMetricData: boolean; hasProviderFilter: boolean; onDateRangeChange: (range: DateRange) => void; onExport: () => void; onToggleProvider: (providerId: string) => void; selectedProviders: string[]; serverAggregated: boolean }) {
  return <CardHeader className="flex flex-col gap-1"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-lg">Cross-channel overview</CardTitle><CardDescription>Key performance indicators from the latest successful sync.</CardDescription></div>{serverAggregated ? <Badge variant="secondary" className="self-start">Server aggregated</Badge> : null}<div className="flex flex-wrap items-center gap-2">{availableProviders.length > 0 ? <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" />Providers{hasProviderFilter ? <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">{selectedProviders.length}</Badge> : null}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuLabel>Filter by Provider</DropdownMenuLabel><DropdownMenuSeparator />{availableProviders.map((providerId) => <ProviderFilterOption key={providerId} providerId={providerId} selectedProviders={selectedProviders} onToggleProvider={onToggleProvider} />)}</DropdownMenuContent></DropdownMenu> : null}<DateRangePicker value={dateRange} onChange={onDateRangeChange} /><Button variant="outline" size="icon" onClick={onExport} disabled={!hasMetricData} aria-label="Export metrics as CSV"><Download className="h-4 w-4" /></Button></div></div>{hasProviderFilter ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Showing:</span>{selectedProviders.map((providerId) => <SelectedProviderChip key={providerId} providerId={providerId} onToggleProvider={onToggleProvider} />)}</div> : null}</CardHeader>
}

export function CrossChannelOverviewLoadingState() {
  return <CardContent className="space-y-6"><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((slot) => <Skeleton key={slot} className="h-24 w-full rounded-lg" />)}</div></CardContent>
}

export function CrossChannelOverviewEmptyState() {
  return <CardContent className="space-y-6"><div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground"><p>Connect an ad platform and run a sync to view aggregate performance.</p><Button asChild size="sm" variant="outline"><Link href="#connect-ad-platforms">Connect an account</Link></Button></div></CardContent>
}

function SummaryCardTile({ card }: { card: SummaryCard }) {
  return <FadeInItem><Card className="border-muted/70 bg-background shadow-sm"><CardContent className="space-y-2 p-5"><div className="flex items-center justify-between"><p className="text-xs font-medium uppercase text-muted-foreground">{card.label}</p><TooltipProvider><Tooltip><TooltipTrigger aria-label={`Metric information: ${card.helper}`}><Info className="h-3 w-3 text-muted-foreground/70" /></TooltipTrigger><TooltipContent><p>{card.helper}</p></TooltipContent></Tooltip></TooltipProvider></div><p className="text-2xl font-semibold text-foreground">{card.value}</p><p className="text-xs text-muted-foreground">{card.helper}</p></CardContent></Card></FadeInItem>
}

export function CrossChannelOverviewContent({ currency, metrics, metricsLoading, summaryCards }: { currency?: string; metrics: MetricRecord[]; metricsLoading: boolean; summaryCards: SummaryCard[] }) {
  return <CardContent className="space-y-6"><FadeInStagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{summaryCards.map((card) => <SummaryCardTile key={card.id} card={card} />)}</FadeInStagger><div className="h-[300px] w-full"><PerformanceChart metrics={metrics} loading={metricsLoading} currency={currency} /></div></CardContent>
}