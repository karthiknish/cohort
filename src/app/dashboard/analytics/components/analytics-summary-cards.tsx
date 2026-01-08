'use client'

import { DollarSign, TrendingUp, Target, Users, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface AnalyticsSummaryCardsProps {
    totals: {
        spend: number
        revenue: number
        clicks: number
        conversions: number
    }
    averageRoaS: number
    conversionRate: number
    averageCpc: number
    isLoading: boolean
}

export function AnalyticsSummaryCards({
    totals,
    averageRoaS,
    conversionRate,
    averageCpc,
    isLoading,
}: AnalyticsSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Total spend</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Total amount spent across all selected platforms</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                        <DollarSign className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totals.spend)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Revenue</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-emerald-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Total revenue generated from ad campaigns</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/5 text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totals.revenue)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Average ROAS</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Return on Ad Spend (Revenue / Spend)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/5 text-blue-500">
                        <Target className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-9 w-20 rounded-lg" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">{averageRoaS.toFixed(2)}x</div>
                    )}
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Conversion rate</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-orange-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Percentage of clicks that resulted in a conversion</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/5 text-orange-500">
                        <Users className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-9 w-20 rounded-lg" />
                            <Skeleton className="h-4 w-28 rounded-lg" />
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-bold tracking-tight text-foreground">{conversionRate.toFixed(1)}%</div>
                            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/60">Avg CPC {formatCurrency(averageCpc)}</div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
