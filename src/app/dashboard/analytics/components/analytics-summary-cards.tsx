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
            <Card className="border-muted/60 bg-background">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">Total spend</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/70" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Total amount spent across all selected platforms</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-7 w-24" />
                    ) : (
                        <div className="text-2xl font-semibold">{formatCurrency(totals.spend)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/60 bg-background">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/70" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Total revenue generated from ad campaigns</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-7 w-24" />
                    ) : (
                        <div className="text-2xl font-semibold">{formatCurrency(totals.revenue)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/60 bg-background">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">Average ROAS</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/70" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Return on Ad Spend (Revenue / Spend)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-7 w-20" />
                    ) : (
                        <div className="text-2xl font-semibold">{averageRoaS.toFixed(2)}x</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/60 bg-background">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">Conversion rate</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/70" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Percentage of clicks that resulted in a conversion</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-1">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-4 w-28" />
                        </>
                    ) : (
                        <>
                            <div className="text-2xl font-semibold">{conversionRate.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">Avg CPC {formatCurrency(averageCpc)}</div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
