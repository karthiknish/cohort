'use client';
import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Link } from '@/shared/ui/link';
import { Filter, RefreshCw, Search, X } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { DataTableColumnHeader, VirtualizedDataTable } from '@/shared/ui/data-table';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { MetricHint } from '@/shared/ui/hover-preview';
import { cn, formatCurrency } from '@/lib/utils';
import type { MetricRecord } from './types';
import { PROVIDER_ICON_MAP, formatDisplayDate, formatProviderName } from './utils';
function ProviderFilterOption({ providerId, selectedProviders, toggleProvider, }: {
    providerId: string;
    selectedProviders: string[];
    toggleProvider: (providerId: string) => void;
}) {
    const ProviderIcon = PROVIDER_ICON_MAP[providerId];
    const handleCheckedChange = () => {
        toggleProvider(providerId);
    };
    return (<DropdownMenuCheckboxItem key={providerId} checked={selectedProviders.includes(providerId)} onCheckedChange={handleCheckedChange} className="cursor-pointer">
      <span className="flex items-center gap-2">
        {ProviderIcon ? <ProviderIcon className="size-4"/> : null}
        {formatProviderName(providerId)}
      </span>
    </DropdownMenuCheckboxItem>);
}
type ProviderOption = string;
export function HeaderWithTooltip({ title, tooltip }: {
    title: string;
    tooltip: string;
}) {
    return (<div className="flex items-center gap-1">
      {title}
      <MetricHint description={tooltip} label={`About ${title}`} className="text-muted-foreground/70"/>
    </div>);
}
export function MetricsTableHeader({ description, metricsLoading, onRefresh, title }: {
    description: string;
    metricsLoading: boolean;
    onRefresh: () => void;
    title: string;
}) {
    return <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-lg">{title}</CardTitle><CardDescription>{description}</CardDescription></div><Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={metricsLoading} className="inline-flex items-center gap-2"><RefreshCw className={cn('size-4', metricsLoading && 'animate-spin')}/>Refresh rows</Button></CardHeader>;
}
export function MetricsTableFilters({ availableProviders, hasActiveFilters, onClearFilters, onSearchChange, searchQuery, selectedProviders, toggleProvider }: {
    availableProviders: ProviderOption[];
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
    searchQuery: string;
    selectedProviders: string[];
    toggleProvider: (providerId: string) => void;
}) {
    return <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input placeholder="Search by provider…" value={searchQuery} onChange={onSearchChange} className="h-10 pl-9"/></div><div className="flex items-center gap-3"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-10 gap-2 px-4"><Filter className="size-4"/>Providers{selectedProviders.length > 0 ? <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">{selectedProviders.length}</Badge> : null}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48"><DropdownMenuLabel>Filter by Provider</DropdownMenuLabel><DropdownMenuSeparator />{availableProviders.map((providerId) => <ProviderFilterOption key={providerId} providerId={providerId} selectedProviders={selectedProviders} toggleProvider={toggleProvider}/>)}</DropdownMenuContent></DropdownMenu>{hasActiveFilters ? <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-10 gap-1.5 px-3 text-muted-foreground hover:bg-muted/60 hover:text-foreground"><X className="size-4"/>Clear</Button> : null}</div></div>;
}
export function MetricsTableBody({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, hasActiveFilters, initialMetricsLoading, metricError, onClearFilters, processedMetrics }: {
    columns: ColumnDef<MetricRecord>[];
    emptyCtaHref: string;
    emptyCtaLabel: string;
    emptyMessage: string;
    filteredMetrics: MetricRecord[];
    hasMetrics: boolean;
    hasActiveFilters: boolean;
    initialMetricsLoading: boolean;
    metricError: string | null;
    onClearFilters: () => void;
    processedMetrics: MetricRecord[];
}) {
    if (hasActiveFilters && hasMetrics) {
        return <><p className="mb-4 text-sm text-muted-foreground">Showing {filteredMetrics.length} of {processedMetrics.length} rows</p><MetricsTableState columns={columns} emptyCtaHref={emptyCtaHref} emptyCtaLabel={emptyCtaLabel} emptyMessage={emptyMessage} filteredMetrics={filteredMetrics} hasMetrics={hasMetrics} initialMetricsLoading={initialMetricsLoading} metricError={metricError} onClearFilters={onClearFilters}/></>;
    }
    return <MetricsTableState columns={columns} emptyCtaHref={emptyCtaHref} emptyCtaLabel={emptyCtaLabel} emptyMessage={emptyMessage} filteredMetrics={filteredMetrics} hasMetrics={hasMetrics} initialMetricsLoading={initialMetricsLoading} metricError={metricError} onClearFilters={onClearFilters}/>;
}
function MetricsTableState({ columns, emptyCtaHref, emptyCtaLabel, emptyMessage, filteredMetrics, hasMetrics, initialMetricsLoading, metricError, onClearFilters }: {
    columns: ColumnDef<MetricRecord>[];
    emptyCtaHref: string;
    emptyCtaLabel: string;
    emptyMessage: string;
    filteredMetrics: MetricRecord[];
    hasMetrics: boolean;
    initialMetricsLoading: boolean;
    metricError: string | null;
    onClearFilters: () => void;
}) {
    const getRowId = (row: MetricRecord) => row.id;
    if (initialMetricsLoading)
        return <div className="space-y-2">{[0, 1, 2, 3, 4, 5].map((slot) => <Skeleton key={slot} className="h-10 w-full rounded"/>)}</div>;
    if (metricError)
        return <Alert variant="destructive"><AlertTitle>Unable to load metrics</AlertTitle><AlertDescription>{metricError}</AlertDescription></Alert>;
    if (!hasMetrics)
        return <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground"><p>{emptyMessage}</p><Button asChild size="sm" variant="outline"><Link href={emptyCtaHref}>{emptyCtaLabel}</Link></Button></div>;
    if (filteredMetrics.length === 0)
        return <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted/60 p-10 text-center text-sm text-muted-foreground"><p>No rows match your filters.</p><Button size="sm" variant="outline" onClick={onClearFilters}>Clear filters</Button></div>;
    return <VirtualizedDataTable columns={columns} data={filteredMetrics} maxHeight={320} stickyHeader rowHeight={44} getRowId={getRowId}/>;
}
export function MetricsTableLoadMore({ hasMetrics, loadMoreError, loadingMore, nextCursor, onLoadMore }: {
    hasMetrics: boolean;
    loadMoreError: string | null;
    loadingMore: boolean;
    nextCursor: string | null;
    onLoadMore: () => void;
}) {
    if (!(nextCursor && hasMetrics))
        return null;
    return <div className="mt-4 flex flex-col items-center gap-2">{loadMoreError ? <p className="text-xs text-destructive">{loadMoreError}</p> : null}<Button type="button" variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore} className="inline-flex items-center gap-2"><RefreshCw className={cn('size-4', loadingMore && 'animate-spin')}/>{loadingMore ? 'Loading rows...' : 'Load more rows'}</Button></div>;
}
