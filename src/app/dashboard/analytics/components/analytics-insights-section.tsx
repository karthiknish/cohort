'use client'

import { ArrowRight, CircleCheck, Info, Lightbulb, RefreshCw, TrendingUp, TriangleAlert } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { NoInsightsData, NoIntegrationConnected } from '@/components/ui/analytics-empty-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { normalizeInsightMarkdown } from '../lib/insight-utils'
import { PROVIDER_LABELS, type AlgorithmicInsight, type ProviderInsight } from '../hooks'

interface AnalyticsInsightsSectionProps {
    insights: ProviderInsight[]
    algorithmic: AlgorithmicInsight[]
    insightsError: Error | null | undefined
    insightsLoading: boolean
    insightsRefreshing: boolean
    initialInsightsLoading: boolean
    onRefreshInsights: () => void
}

function formatInsightProviderLabel(providerId: string) {
    if (providerId === 'global') return 'Overall Property'
    if (providerId === 'google_vs_facebook') return 'Cross-platform Comparison'
    return PROVIDER_LABELS[providerId] ?? providerId
}

function InsightMarkdown({ content }: { content: string }) {
    const normalized = normalizeInsightMarkdown(content)

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="space-y-3 text-sm text-muted-foreground/90"
            components={{
                p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="ml-5 list-disc space-y-1.5">{children}</ul>,
                ol: ({ children }) => <ol className="ml-5 list-decimal space-y-1.5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                h1: ({ children }) => <h4 className="text-sm font-semibold text-foreground">{children}</h4>,
                h2: ({ children }) => <h4 className="text-sm font-semibold text-foreground">{children}</h4>,
                h3: ({ children }) => <h5 className="text-sm font-semibold text-foreground">{children}</h5>,
                code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 text-[0.9em] text-foreground">{children}</code>,
            }}
            skipHtml
        >
            {normalized}
        </ReactMarkdown>
    )
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
            {/* Recommended Actions Card */}
            <Card className="overflow-hidden border-primary/30 bg-primary/5 shadow-sm transition-all hover:bg-primary/[0.07] hover:shadow-md">
                <CardHeader className="border-b border-primary/10 bg-primary/[0.03] py-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-sm">
                            <Lightbulb className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/80">Recommended next actions</CardTitle>
                            <CardDescription className="text-xs font-semibold text-primary/60 leading-tight">Rule-based observations generated from your synced analytics performance</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {initialInsightsLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {['algo-skeleton-1', 'algo-skeleton-2'].map((slotKey) => (
                                <Skeleton key={slotKey} className="h-32 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : algorithmic.length === 0 ? (
                        <NoInsightsData className="rounded-xl border-primary/10 bg-background/50" />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {algorithmic.flatMap((group) =>
                                group.suggestions.map((suggestion) => (
                                    <div
                                        key={`${group.providerId}-${suggestion.level}-${suggestion.title}`}
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
                                                        {formatInsightProviderLabel(group.providerId)}
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
                            <div>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">AI-powered insight brief</CardTitle>
                                <CardDescription className="mt-1 text-xs font-medium text-muted-foreground/60">Narrative analysis generated from the selected property&apos;s synced users, sessions, conversions, and revenue.</CardDescription>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onRefreshInsights}
                            disabled={insightsLoading || insightsRefreshing}
                            className="group inline-flex items-center gap-2 rounded-xl border border-muted/30 bg-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 shadow-sm transition-all hover:bg-muted/5 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
                        >
                            <RefreshCw className={`h-3 w-3 transition-transform duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none group-hover:rotate-180 ${insightsRefreshing ? 'animate-spin' : ''}`} />
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
                            {['insight-skeleton-1', 'insight-skeleton-2', 'insight-skeleton-3'].map((slotKey) => (
                                <div key={slotKey} className="rounded-xl border border-muted/20 bg-muted/5 p-4">
                                    <Skeleton className="h-3 w-24 rounded-full" />
                                    <Skeleton className="mt-4 h-16 w-full rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : insights.length === 0 ? (
                        <NoIntegrationConnected
                            platform="analytics property"
                            className="rounded-xl border border-dashed border-muted/40"
                        />
                    ) : (
                        insights.map((insight) => (
                            <div key={insight.providerId} className="group relative overflow-hidden rounded-xl border border-muted/30 bg-muted/5 p-5 transition-all hover:bg-muted/10">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 transition-all group-hover:bg-primary" />
                                <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    <span>{formatInsightProviderLabel(insight.providerId)}</span>
                                </div>
                                <div className="mt-3">
                                    <InsightMarkdown content={insight.summary} />
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </>
    )
}
