'use client'

import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'

interface AnalyticsMetricCardsProps {
    avgUsersPerDay: number
    avgSessionsPerDay: number
    revenuePerSession: number
    sessionsPerUser: number
    conversionRate: number
    isLoading: boolean
}

export function AnalyticsMetricCards({
    avgUsersPerDay,
    avgSessionsPerDay,
    revenuePerSession,
    sessionsPerUser,
    conversionRate,
    isLoading,
}: AnalyticsMetricCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-muted/30 bg-muted/5 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-muted/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Avg users / day</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Average daily users across the selected date range</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-7 w-16 rounded-lg" />
                    ) : (
                        <div className="text-xl font-bold tracking-tight text-foreground">{avgUsersPerDay.toFixed(1)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/30 bg-muted/5 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-muted/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Avg sessions / day</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Average daily session volume for the selected range</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-7 w-20 rounded-lg" />
                    ) : (
                        <div className="text-xl font-bold tracking-tight text-foreground">{avgSessionsPerDay.toFixed(1)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/30 bg-muted/5 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-muted/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Revenue / session</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Average revenue generated for each session</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-7 w-16 rounded-lg" />
                    ) : (
                        <div className="text-xl font-bold tracking-tight text-foreground">{formatCurrency(revenuePerSession)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/30 bg-muted/5 shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-muted/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Sessions / user</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/40 transition-colors hover:text-primary" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs">Average number of sessions generated by each user</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <>
                            <Skeleton className="h-7 w-16 rounded-lg" />
                            <Skeleton className="mt-2 h-4 w-20 rounded-lg" />
                        </>
                    ) : (
                        <>
                            <div className="text-xl font-bold tracking-tight text-foreground">{sessionsPerUser.toFixed(2)}x</div>
                            <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/60">Conv rate {conversionRate.toFixed(1)}%</div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
