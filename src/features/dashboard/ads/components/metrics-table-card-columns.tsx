'use client'

import type { ColumnDef } from '@tanstack/react-table'

import { DataTableColumnHeader } from '@/shared/ui/data-table'
import { formatCurrency } from '@/lib/utils'

import type { MetricRecord } from './types'
import { PROVIDER_ICON_MAP, formatDisplayDate, formatProviderName } from './utils'
import { HeaderWithTooltip } from './metrics-table-card-sections'

export function buildMetricsTableColumns(currency = 'USD'): ColumnDef<MetricRecord>[] {
  return [
    { accessorKey: 'date', header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />, cell: ({ row }) => <span className="whitespace-nowrap">{formatDisplayDate(row.getValue('date'))}</span> },
    { accessorKey: 'providerId', header: ({ column }) => <DataTableColumnHeader column={column} title="Provider" />, cell: ({ row }) => { const providerId = row.getValue('providerId') as string; const ProviderIcon = PROVIDER_ICON_MAP[providerId]; return <div className="flex items-center gap-2">{ProviderIcon ? <ProviderIcon className="size-4 text-muted-foreground" aria-hidden="true" /> : null}<span>{formatProviderName(providerId)}</span></div> }, filterFn: (row, id, value: string[]) => value.length === 0 || value.includes(row.getValue(id)) },
    { accessorKey: 'spend', header: () => <HeaderWithTooltip title="Spend" tooltip="Total amount spent on ads" />, cell: ({ row }) => formatCurrency(row.getValue('spend'), currency) },
    { accessorKey: 'impressions', header: () => <HeaderWithTooltip title="Impressions" tooltip="Number of times your ads were shown" />, cell: ({ row }) => (row.getValue('impressions') as number).toLocaleString() },
    { accessorKey: 'clicks', header: () => <HeaderWithTooltip title="Clicks" tooltip="Number of times your ads were clicked" />, cell: ({ row }) => (row.getValue('clicks') as number).toLocaleString() },
    { accessorKey: 'conversions', header: () => <HeaderWithTooltip title="Conversions" tooltip="Number of desired actions taken (e.g. purchases, signups)" />, cell: ({ row }) => (row.getValue('conversions') as number).toLocaleString() },
    { accessorKey: 'revenue', header: () => <HeaderWithTooltip title="Revenue" tooltip="Total revenue generated from ads" />, cell: ({ row }) => { const revenue = row.getValue('revenue') as number | null | undefined; return revenue != null ? formatCurrency(revenue, currency) : '—' } },
  ]
}
