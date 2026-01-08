'use client'

import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface AnalyticsMetricCardsProps {
    mer: number
    aov: number
    rpc: number
    roi: number
    isLoading: boolean
}

export function AnalyticsMetricCards({
    mer,
    aov,
    rpc,
    roi,
    isLoading,
}: AnalyticsMetricCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-muted/40 bg-background/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">MER (Blended ROAS)</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Marketing Efficiency Ratio: Total Revenue / Total Spend</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-6 w-16" />
                    ) : (
                        <div className="text-xl font-semibold">{mer.toFixed(2)}x</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/40 bg-background/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Avg. Order Value (AOV)</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Average revenue generated per conversion</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-6 w-20" />
                    ) : (
                        <div className="text-xl font-semibold">{formatCurrency(aov)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/40 bg-background/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Revenue Per Click (RPC)</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Average revenue generated for every click</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-6 w-16" />
                    ) : (
                        <div className="text-xl font-semibold">{formatCurrency(rpc)}</div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-muted/40 bg-background/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-xs font-medium text-muted-foreground">Return on Investment (ROI)</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground/50" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Percentage of profit relative to spend: ((Rev - Spend) / Spend) * 100</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-6 w-16" />
                    ) : (
                        <div className={cn(
                            "text-xl font-semibold",
                            roi >= 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                            {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
