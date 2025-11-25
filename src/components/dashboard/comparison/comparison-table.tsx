import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import { formatCpa, formatRoas } from '@/lib/dashboard-utils'
import type { ClientComparisonSummary } from '@/types/dashboard'

interface ComparisonTableProps {
  rows: ClientComparisonSummary[]
  loading: boolean
  hasSelection: boolean
}

export function ComparisonTable({ rows, loading, hasSelection }: ComparisonTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!hasSelection) {
    return <p className="text-sm text-muted-foreground">Select one or more workspaces to populate this table.</p>
  }

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No comparison data yet. Once revenue and ad metrics sync in, you&rsquo;ll see client-by-client stats here.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
            <th className="pb-3 pl-2 font-medium">Workspace</th>
            <th className="pb-3 font-medium">Revenue</th>
            <th className="pb-3 font-medium">Ad spend</th>
            <th className="pb-3 font-medium">
              <div className="flex items-center gap-1">
                ROAS
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Return on Ad Spend</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </th>
            <th className="pb-3 font-medium">
              <div className="flex items-center gap-1">
                CPA
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Cost Per Acquisition</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </th>
            <th className="pb-3 pr-2 font-medium">
              <div className="flex items-center gap-1">
                Outstanding
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total unpaid invoices</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {rows.map((row) => (
            <tr key={row.clientId} className="group transition-colors hover:bg-muted/50">
              <td className="py-3 pl-2">
                <p className="font-medium text-foreground">{row.clientName}</p>
                <p className="text-xs text-muted-foreground">{row.periodDays}-day window</p>
              </td>
              <td className="py-3 font-medium">{formatCurrency(row.totalRevenue, row.currency)}</td>
              <td className="py-3 text-muted-foreground">{formatCurrency(row.totalAdSpend, row.currency)}</td>
              <td className="py-3">
                <span className={cn(
                  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                  row.roas !== Number.POSITIVE_INFINITY && row.roas < 1
                    ? 'bg-rose-50 text-rose-700 ring-rose-600/20'
                    : row.roas > 2
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      : 'bg-gray-50 text-gray-600 ring-gray-500/10',
                )}>
                  {formatRoas(row.roas)}
                </span>
              </td>
              <td className="py-3 text-muted-foreground">{formatCpa(row.cpa, row.currency)}</td>
              <td className="py-3 pr-2 text-muted-foreground">{formatCurrency(row.outstanding, row.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

