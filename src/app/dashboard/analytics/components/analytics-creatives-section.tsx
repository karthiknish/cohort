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
        <Card className="border-muted/60 bg-background">
            <CardHeader>
                <CardTitle>Meta creative highlights</CardTitle>
                <CardDescription className="flex items-center justify-between gap-4">
                    <span>Top-performing creatives from Meta Ads (based on spend)</span>
                    <button
                        type="button"
                        onClick={onRefreshMetrics}
                        disabled={isMetricsLoading || metricsRefreshing}
                        className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${metricsRefreshing ? 'animate-spin' : ''}`} />
                        Refresh creatives
                    </button>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {initialMetricsLoading || (isMetricsLoading && creativeBreakdown.length === 0) ? (
                    <div className="rounded border border-dashed border-muted/60 p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="rounded border border-muted/40 p-4">
                                    <Skeleton className="h-4 w-56" />
                                    <div className="mt-3 grid grid-cols-4 gap-3">
                                        {Array.from({ length: 4 }).map((__, metricIdx) => (
                                            <Skeleton key={metricIdx} className="h-4 w-full" />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : creativeBreakdown.length === 0 ? (
                    <div className="rounded border border-dashed border-muted/60 p-6 text-center text-sm text-muted-foreground">
                        No creative-level data yet. Ensure Meta syncs are configured with creative insights.
                    </div>
                ) : (
                    <ScrollArea className="h-72">
                        <table className="w-full table-fixed text-left text-sm">
                            <thead className="sticky top-0 bg-background">
                                <tr className="border-b border-muted/60 text-xs uppercase text-muted-foreground">
                                    <th className="py-2 pr-4 font-medium">Creative</th>
                                    <th className="py-2 pr-4 font-medium">
                                        <div className="flex items-center gap-1">
                                            Spend
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="h-3 w-3 text-muted-foreground/70" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Amount spent on this creative</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        <div className="flex items-center gap-1">
                                            Clicks
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="h-3 w-3 text-muted-foreground/70" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Number of clicks on this creative</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        <div className="flex items-center gap-1">
                                            Conversions
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="h-3 w-3 text-muted-foreground/70" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Number of conversions from this creative</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                    <th className="py-2 pr-4 font-medium">
                                        <div className="flex items-center gap-1">
                                            Revenue
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Info className="h-3 w-3 text-muted-foreground/70" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Revenue generated by this creative</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {creativeBreakdown.map((creative) => (
                                    <tr key={`${creative.id}-${creative.date}`} className="border-b border-muted/40">
                                        <td className="py-2 pr-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground line-clamp-1">{creative.name}</span>
                                                <span className="text-xs text-muted-foreground">{creative.date}</span>
                                            </div>
                                        </td>
                                        <td className="py-2 pr-4">{formatCurrency(creative.spend ?? 0)}</td>
                                        <td className="py-2 pr-4">{creative.clicks?.toLocaleString() ?? '—'}</td>
                                        <td className="py-2 pr-4">{creative.conversions?.toLocaleString() ?? '—'}</td>
                                        <td className="py-2">{formatCurrency(creative.revenue ?? 0)}</td>
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
