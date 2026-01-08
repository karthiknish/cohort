'use client'

import { TrendingUp, RefreshCw, Info, Lightbulb, TriangleAlert, CircleCheck, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProviderInsight, AlgorithmicInsight } from '../hooks'
import { PROVIDER_LABELS } from '../hooks'

interface AnalyticsInsightsSectionProps {
    insights: ProviderInsight[]
    algorithmic: AlgorithmicInsight[]
    insightsError: Error | null | undefined
    insightsLoading: boolean
    insightsRefreshing: boolean
    initialInsightsLoading: boolean
    onRefreshInsights: () => void
}

export function AnalyticsInsightsSection({
    insights,
    algorithmic,
    insightsError,
    insightsLoading,
    insightsRefreshing,
    initialInsightsLoading,
    onRefreshInsights,
}: AnalyticsInsightsSectionProps) {
    return (
        <>
            {/* Algorithmic Suggestions Card */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Algorithmic suggestions
                    </CardTitle>
                    <CardDescription>Data-driven optimizations based on your current ad performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {initialInsightsLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 2 }).map((_, idx) => (
                                <Skeleton key={idx} className="h-32 w-full" />
                            ))}
                        </div>
                    ) : algorithmic.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No specific optimizations identified for the current data set.</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {algorithmic.flatMap((group) =>
                                group.suggestions.map((suggestion, idx) => (
                                    <div
                                        key={`${group.providerId}-${idx}`}
                                        className={cn(
                                            "relative overflow-hidden rounded-lg border p-4 shadow-sm transition-all hover:shadow-md",
                                            suggestion.level === 'success' && "border-emerald-200 bg-emerald-50/50",
                                            suggestion.level === 'warning' && "border-amber-200 bg-amber-50/50",
                                            suggestion.level === 'critical' && "border-red-200 bg-red-50/50",
                                            suggestion.level === 'info' && "border-blue-200 bg-blue-50/50"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {suggestion.level === 'success' && <CircleCheck className="h-4 w-4 text-emerald-600" />}
                                                    {suggestion.level === 'warning' && <TriangleAlert className="h-4 w-4 text-amber-600" />}
                                                    {suggestion.level === 'critical' && <TriangleAlert className="h-4 w-4 text-red-600" />}
                                                    {suggestion.level === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                        {group.providerId === 'global' ? 'Strategy' : PROVIDER_LABELS[group.providerId] ?? group.providerId}
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-foreground">{suggestion.title}</h4>
                                                <p className="text-sm text-muted-foreground">{suggestion.message}</p>
                                            </div>
                                            {suggestion.score && (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-background text-xs font-bold text-primary">
                                                    {suggestion.score}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 rounded-md bg-background/80 p-2 text-sm font-medium text-foreground shadow-inner">
                                            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                                            <span>{suggestion.suggestion}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI-Powered Insights Card */}
            <Card className="border-muted/60 bg-background">
                <CardHeader>
                    <CardTitle>AI-powered insights</CardTitle>
                    <div className="mt-1 flex items-center justify-between gap-4">
                        <CardDescription>Platform-specific takeaways generated by our AI assistant</CardDescription>
                        <button
                            type="button"
                            onClick={onRefreshInsights}
                            disabled={insightsLoading || insightsRefreshing}
                            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:bg-muted disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3.5 w-3.5 ${insightsRefreshing ? 'animate-spin' : ''}`} />
                            Refresh insights
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {insightsError && (
                        <Alert variant="destructive">
                            <AlertTitle>Insight generation failed</AlertTitle>
                            <AlertDescription>{insightsError.message}</AlertDescription>
                        </Alert>
                    )}
                    {initialInsightsLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="rounded-md border border-muted/60 bg-muted/10 p-4">
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="mt-3 h-14 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : insights.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Link a platform and run a sync to unlock insights.</p>
                    ) : (
                        insights.map((insight) => (
                            <div key={insight.providerId} className="rounded-md border border-muted/60 bg-muted/20 p-4">
                                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{PROVIDER_LABELS[insight.providerId] ?? insight.providerId}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{insight.summary}</p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </>
    )
}
