'use client'

import type { ChangeEvent } from 'react'

import Link from 'next/link'
import { Filter, Info, RefreshCw, Search, X } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatCurrency } from '@/lib/utils'

import type { MetricRecord } from './types'
import { PROVIDER_ICON_MAP, formatDisplayDate, formatProviderName } from './utils'

type ProviderOption = string

export function HeaderWithTooltip({ title, tooltip }: { title: string; tooltip: string }) {
  return <div className="flex items-center gap-1">{title}<TooltipProvider><Tooltip><TooltipTrigger><Info className="h-3 w-3 text-muted-foreground/70" /></TooltipTrigger><TooltipContent><p>{tooltip}</p></TooltipContent></Tooltip></TooltipProvider></div>
}

export function buildMetricsTableColumns(currency = 'USD'): ColumnDef<MetricRecord>[] {
  return [
    { accessorKey: 'date', header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />, cell: ({ row }) => <span className="whitespace-nowrap">{formatDisplayDate(row.getValue('date'))}</span> },
    { accessorKey: 'providerId', header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />, cell: ({ row }) => { const providerId = row.getValue('providerId') as string; const ProviderIcon = PROVIDER_ICON_MAP[providerId]; return <div className="flex items-center gap-2">{ProviderIcon ? <ProviderIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> : null}<span>{formatProviderName(providerId)}</span></div> }, filterFn: (row, id, value: string[]) => value.length === 0 || value.includes(row.getValue(id)) },
    { accessorKey: 'spend', header: () => <HeaderWithTooltip title="Spend" tooltip="Total amount spent on ads" />, cell: ({ row }) => formatCurrency(row.getValue('spend'), currency) },
    { accessorKey: 'impressions', header: () => <HeaderWithTooltip title="Impressions" tooltip="Number of times your ads were shown" />, cell: ({ row }) => (row.getValue('impressions') as number).toLocaleString() },
    { accessorKey: 'clicks', header: () => <HeaderWithTooltip title="Clicks" tooltip="Number of times your ads were clicked" />, cell: ({ row }) => (row.getValue('clicks') as number).toLocaleString() },
    { accessorKey: 'conversions', header: () => <HeaderWithTooltip title="Conversions" tooltip="Number of desired actions taken (e.g. purchases, signups)" />, cell: ({ row }) => (row.getValue('conversions') as number).toLocaleString() },
    { accessorKey: 'revenue', header: () => <HeaderWithTooltip title="Revenue" tooltip="Total revenue generated from ads" />, cell: ({ row }) => { const revenue = row.getValue('revenue') as number | null | undefined; return revenue != null ? formatCurrency(revenue, currency) : '—' } },
  ]
}

export function MetricsTableHeader({ description, metricsLoading, onRefresh, title }: { description: string; metricsLoading: boolean; onRefresh: () => void; title: string }) {
  return <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-lg">{title}</CardTitle><CardDescription>{description}</CardDescription></div><Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={metricsLoading} className="inline-flex items-center gap-2"><RefreshCw className={cn('h-4 w-4', metricsLoading && 'animate-spin')} />Refresh rows</Button></CardHeader>
}

export function MetricsTableFilters({ availableProviders, hasActiveFilters, onClearFilters, onSearchChange, searchQuery, selectedProviders, toggleProvider }: { availableProviders: ProviderOption[]; hasActiveFilters: boolean; onClearFilters: () => void; onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void; searchQuery: string; selectedProviders: string[]; toggleProvider: (providerId: string) => void }) {
  return <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by provider…" value={searchQuery} onChange={onSearchChange} className="h-10 pl-9" /></div><div className="flex items-center gap-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-10 gap-2 px-4"><Filter className="h-4 w-4" />Providers{selectedProviders.length > 0 ? <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">{selectedProviders.length}</Badge> : null}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuLabel>Filter by Provider</DropdownMenuLabel><DropdownMenuSeparator />{availableProviders.map((providerId) => { const ProviderIcon = PROVIDER_ICON_MAP[providerId]; return <DropdownMenuCheckboxItem key={providerId} checked={selectedProviders.includes(providerId)} onCheckedChange={() => toggleProvider(providerId)} className="cursor-pointer"><span className="flex items-center gap-2">{ProviderIcon ? <ProviderIcon className="h-4 w-4" /> : null}{formatProviderName(providerId)}</span></DropdownMenuCheckboxItem> })}</DropdownMenuContent></DropdownMenu>{hasActiveFilters ? <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-10 gap-1.5 px-3 text-muted-foreground hover:bg-muted/60"><X className="h-4 w-4" />Clear</Button> : null}</div></div>
}

export function MetricsTableBody({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, hasActiveFilters, initialMetricsLoading, metricError, onClearFilters, processedMetrics }: { columns: ColumnDef<MetricRecord>[]; emptyCtaHref: string; emptyCtaLabel: string; emptyMessage: string; filteredMetrics: MetricRecord[]; hasMetrics: boolean; hasActiveFilters: boolean; initialMetricsLoading: boolean; metricError: string | null; onClearFilters: () => void; processedMetrics: MetricRecord[] }) {
  if (hasActiveFilters && hasMetrics) {
    return <><p className="mb-4 text-sm text-muted-foreground">Showing {filteredMetrics.length} of {processedMetrics.length} rows</p>{renderMetricsTableState({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, initialMetricsLoading, metricError, onClearFilters })}</>
  }
  return renderMetricsTableState({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, initialMetricsLoading, metricError, onClearFilters })
}

function renderMetricsTableState({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, initialMetricsLoading, metricError, onClearFilters }: { columns: ColumnDef<MetricRecord>[]; emptyCtaHref: string; emptyCtaLabel: string; emptyMessage: string; filteredMetrics: MetricRecord[]; hasMetrics: boolean; initialMetricsLoading: boolean; metricError: string | null; onClearFilters: () => void }) {
  if (initialMetricsLoading) return <div className="space-y-2">{[0, 1, 2, 3, 4, 5].map((slot) => <Skeleton key={slot} className="h-10 w-full rounded" />)}</div>
  if (metricError) return <Alert variant="destructive"><AlertTitle>Unable to load metrics</AlertTitle><AlertDescription>{metricError}</AlertDescription></Alert>
  if (!hasMetrics) return <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground"><p>{emptyMessage}</p><Button asChild size="sm" variant="outline"><Link href={emptyCtaHref}>{emptyCtaLabel}</Link></Button></div>
  if (filteredMetrics.length === 0) return <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground"><p>No rows match your filters.</p><Button size="sm" variant="outline" onClick={onClearFilters}>Clear filters</Button></div>
  return <DataTable columns={columns} data={filteredMetrics} showPagination={false} maxHeight={320} stickyHeader enableVirtualization={filteredMetrics.length > 50} rowHeight={44} getRowId={(row) => row.id} />
}

export function MetricsTableLoadMore({ hasMetrics, loadMoreError, loadingMore, nextCursor, onLoadMore }: { hasMetrics: boolean; loadMoreError: string | null; loadingMore: boolean; nextCursor: string | null; onLoadMore: () => void }) {
  if (!(nextCursor && hasMetrics)) return null
  return <div className="mt-4 flex flex-col items-center gap-2">{loadMoreError ? <p className="text-xs text-destructive">{loadMoreError}</p> : null}<Button type="button" variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore} className="inline-flex items-center gap-2"><RefreshCw className={cn('h-4 w-4', loadingMore && 'animate-spin')} />{loadingMore ? 'Loading rows...' : 'Load more rows'}</Button></div>
}