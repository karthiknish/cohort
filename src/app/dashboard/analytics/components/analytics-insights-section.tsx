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
            <Card className="overflow-hidden border-primary/30 bg-primary/5 shadow-sm transition-all hover:bg-primary/[0.07] hover:shadow-md">
                <CardHeader className="border-b border-primary/10 bg-primary/[0.03] py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                            <Lightbulb className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Algorithmic suggestions</CardTitle>
                            <CardDescription className="text-xs font-semibold text-primary/60 leading-tight">Optimizations identified based on your current performance</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialInsightsLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 2 }).map((_, idx) => (
                                <Skeleton key={idx} className="h-32 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : algorithmic.length === 0 ? (
                        <div className="rounded-xl border border-primary/10 bg-background/50 p-6 text-center">
                            <p className="text-sm font-medium text-muted-foreground/60 italic">No specific optimizations identified for the current data set.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {algorithmic.flatMap((group) =>
                                group.suggestions.map((suggestion, idx) => (
                                    <div
                                        key={`${group.providerId}-${idx}`}
                                        className={cn(
                                            "relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:shadow-md",
                                            suggestion.level === 'success' && "border-emerald-500/30 bg-emerald-500/5",
                                            suggestion.level === 'warning' && "border-amber-500/30 bg-amber-500/5",
                                            suggestion.level === 'critical' && "border-red-500/30 bg-red-500/5",
                                            suggestion.level === 'info' && "border-blue-500/30 bg-blue-500/5"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "flex h-6 w-6 items-center justify-center rounded-lg",
                                                        suggestion.level === 'success' && "bg-emerald-500/10 text-emerald-600",
                                                        suggestion.level === 'warning' && "bg-amber-500/10 text-amber-600",
                                                        suggestion.level === 'critical' && "bg-red-500/10 text-red-600",
                                                        suggestion.level === 'info' && "bg-blue-500/10 text-blue-600"
                                                    )}>
                                                        {suggestion.level === 'success' && <CircleCheck className="h-3.5 w-3.5" />}
                                                        {suggestion.level === 'warning' && <TriangleAlert className="h-3.5 w-3.5" />}
                                                        {suggestion.level === 'critical' && <TriangleAlert className="h-3.5 w-3.5" />}
                                                        {suggestion.level === 'info' && <Info className="h-3.5 w-3.5" />}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">
                                                        {group.providerId === 'global' ? 'Core Strategy' : PROVIDER_LABELS[group.providerId] ?? group.providerId}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold tracking-tight text-foreground">{suggestion.title}</h4>
                                                <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed">{suggestion.message}</p>
                                            </div>
                                            {suggestion.score && (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-background shadow-sm">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-black text-primary leading-none">{suggestion.score}</span>
                                                        <span className="text-[7px] font-bold uppercase tracking-tighter text-muted-foreground/50">Score</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-background/60 p-2.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-background/80">
                                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                                            <span className="line-clamp-1">{suggestion.suggestion}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI-Powered Insights Card */}
            <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
                <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">AI-Powered insights</CardTitle>
                        </div>
                        <button
                            type="button"
                            onClick={onRefreshInsights}
                            disabled={insightsLoading || insightsRefreshing}
                            className="group inline-flex items-center gap-2 rounded-xl border border-muted/30 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shadow-sm transition-all hover:bg-muted/5 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3 w-3 transition-transform duration-500 group-hover:rotate-180 ${insightsRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {insightsError && (
                        <Alert variant="destructive" className="rounded-xl border-red-500/20 bg-red-500/5">
                            <TriangleAlert className="h-4 w-4" />
                            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Insight generation failed</AlertTitle>
                            <AlertDescription className="text-xs font-medium opacity-80">{insightsError.message}</AlertDescription>
                        </Alert>
                    )}
                    {initialInsightsLoading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="rounded-xl border border-muted/20 bg-muted/5 p-4">
                                    <Skeleton className="h-3 w-24 rounded-full" />
                                    <Skeleton className="mt-4 h-16 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : insights.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-muted/40 p-10 text-center">
                            <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground/20" />
                            <p className="mt-4 text-sm font-medium text-muted-foreground/60 italic">Link a platform and run a sync to unlock AI takeaways.</p>
                        </div>
                    ) : (
                        insights.map((insight) => (
                            <div key={insight.providerId} className="group relative overflow-hidden rounded-xl border border-muted/30 bg-muted/5 p-5 transition-all hover:bg-muted/10">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 transition-all group-hover:bg-primary" />
                                <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>{PROVIDER_LABELS[insight.providerId] ?? insight.providerId}</span>
                                </div>
                                <p className="mt-3 text-sm font-medium text-muted-foreground/90 leading-relaxed whitespace-pre-wrap">{insight.summary}</p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </>
    )
}
