'use client'

import { Activity, DollarSign, Info, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/shared/ui/tooltip'
import { formatCurrency } from '@/lib/utils'

interface AnalyticsSummaryCardsProps {
    totals: {
        users: number
        sessions: number
        revenue: number
        conversions: number
    }
    conversionRate: number
    isLoading: boolean
}

export function AnalyticsSummaryCards({
    totals,
    conversionRate,
    isLoading,
}: AnalyticsSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm motion-chromatic hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Total users</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Total users captured in Google Analytics for the selected period</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
                        <Users className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">{totals.users.toLocaleString()}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm motion-chromatic hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-success/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Sessions</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-success" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Total sessions recorded for the selected date range</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/5 text-success">
                        <Activity className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-9 w-24 rounded-lg" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">{totals.sessions.toLocaleString()}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm motion-chromatic hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-info/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Conversions</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-info" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Completed conversions imported from Google Analytics</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/5 text-info">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-9 w-20 rounded-lg" />
                    ) : (
                        <div className="text-2xl font-bold tracking-tight text-foreground">{totals.conversions.toLocaleString()}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-muted/40 bg-background shadow-sm motion-chromatic hover:shadow-md">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning/80" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">Revenue</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50 transition-colors hover:text-warning" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Revenue reported by Google Analytics for the selected period</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/5 text-warning">
                        <DollarSign className="h-4 w-4" />
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
                            <div className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(totals.revenue)}</div>
                            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/60">Conv rate {conversionRate.toFixed(1)}%</div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
