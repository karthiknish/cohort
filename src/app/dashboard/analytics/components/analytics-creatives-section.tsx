'use client'

import { RefreshCw, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface CreativeData {
    id: string
    name: string
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    date: string
}

interface AnalyticsCreativesSectionProps {
    creativeBreakdown: CreativeData[]
    isMetricsLoading: boolean
    metricsRefreshing: boolean
    initialMetricsLoading: boolean
    onRefreshMetrics: () => void
}

export function AnalyticsCreativesSection({
    creativeBreakdown,
    isMetricsLoading,
    metricsRefreshing,
    initialMetricsLoading,
    onRefreshMetrics,
}: AnalyticsCreativesSectionProps) {
    return (
        <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
            <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Meta creative performance</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground/60 leading-tight">Top-performing ads from Meta based on spend distribution</CardDescription>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onRefreshMetrics}
                        disabled={isMetricsLoading || metricsRefreshing}
                        className="group inline-flex items-center gap-2 rounded-xl border border-muted/30 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shadow-sm transition-all hover:bg-muted/5 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3 w-3 transition-transform duration-500 group-hover:rotate-180 ${metricsRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {initialMetricsLoading || (isMetricsLoading && creativeBreakdown.length === 0) ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="rounded-xl border border-muted/20 bg-muted/5 p-4">
                                    <Skeleton className="h-4 w-1/3 rounded-full" />
                                    <div className="mt-4 grid grid-cols-4 gap-4">
                                        {Array.from({ length: 4 }).map((__, metricIdx) => (
                                            <Skeleton key={metricIdx} className="h-4 w-full rounded-md" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : creativeBreakdown.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/20 text-muted-foreground/30 mb-4">
                            <Info className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground/60 italic max-w-sm">
                            No creative-level data identified. Ensure Meta syncs are configured with active creative insights.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px]">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur-md">
                                <tr className="border-b border-muted/20">
                                    <th className="py-4 pl-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Creative Asset</th>
                                    <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                        <div className="flex items-center gap-1.5">
                                            Spend
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="cursor-help">
                                                        <Info className="h-3 w-3 transition-colors hover:text-primary" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md p-2">
                                                        <p className="text-[10px] font-bold">Amount spent on this creative</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                    <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                        <div className="flex items-center gap-1.5">
                                            Clicks
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="cursor-help">
                                                        <Info className="h-3 w-3 transition-colors hover:text-primary" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md p-2">
                                                        <p className="text-[10px] font-bold">Total click volume</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                    <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                        <div className="flex items-center gap-1.5">
                                            Conv
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="cursor-help">
                                                        <Info className="h-3 w-3 transition-colors hover:text-primary" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md p-2">
                                                        <p className="text-[10px] font-bold">Attributed conversions</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                    <th className="py-4 pr-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                        <div className="flex items-center justify-end gap-1.5">
                                            Revenue
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger className="cursor-help">
                                                        <Info className="h-3 w-3 transition-colors hover:text-primary" />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="rounded-xl border-muted/40 shadow-lg backdrop-blur-md p-2">
                                                        <p className="text-[10px] font-bold">Gross revenue generated</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-muted/10">
                                {creativeBreakdown.map((creative) => (
                                    <tr key={`${creative.id}-${creative.date}`} className="group transition-colors hover:bg-muted/5">
                                        <td className="py-4 pl-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1">{creative.name}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{creative.date}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-bold text-foreground">{formatCurrency(creative.spend ?? 0)}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-bold text-foreground">{creative.clicks?.toLocaleString() ?? '—'}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-bold text-foreground">{creative.conversions?.toLocaleString() ?? '—'}</span>
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <span className="text-sm font-bold text-primary">{formatCurrency(creative.revenue ?? 0)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
