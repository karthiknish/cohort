'use client'

import { AlertCircle, Facebook, Instagram, Sparkles } from 'lucide-react'
import { SiFacebook, SiInstagram } from 'react-icons/si'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, NetworkErrorEmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { AlgorithmicInsightsCard } from '@/app/dashboard/ads/components/algorithmic-insights-card'
import { MetricsTableCard } from '@/app/dashboard/ads/components/metrics-table-card'
import { PerformanceSummaryCard } from '@/app/dashboard/ads/components/performance-summary-card'
import { SocialsKpiGrid } from './socials-kpi-grid'
import type { ProviderSummary, MetricRecord } from '@/app/dashboard/ads/components/types'
import type { UseAlgorithmicInsightsReturn } from '@/app/dashboard/ads/hooks/use-algorithmic-insights'
import type { SocialsSurfaceStatus } from './socials-state'

type SocialSurfacePanelProps = {
  surface: 'facebook' | 'instagram'
  items: Array<{ id: string; name: string; subtitle: string }>
  surfaceStatus: SocialsSurfaceStatus
  itemsLoading: boolean
  itemsError: string | null
  emptyStateDescription: string
  kpis: Array<{ id: string; label: string; value: string; detail: string }>
  providerSummaries: Record<string, ProviderSummary>
  metrics: MetricRecord[]
  initialMetricsLoading: boolean
  metricsLoading: boolean
  metricError: string | null
  nextCursor: string | null
  loadingMore: boolean
  loadMoreError: string | null
  onRefresh: () => void
  onRetryItems: () => void
  onLoadMore: () => void
  onExport: () => void
  suggestions: UseAlgorithmicInsightsReturn
}

const SURFACE_COPY = {
  facebook: {
    title: 'Facebook',
    icon: SiFacebook,
    accentIcon: Facebook,
    listTitle: 'Connected Facebook Pages',
    listDescription: 'Pages available from the connected Meta workspace.',
    emptySurfaceMessage: 'No Facebook Pages have been surfaced from the current Meta login yet.',
    insightTitle: 'AI Facebook Suggestions',
    insightDescription: 'Recommendations framed for Facebook delivery and audience response.',
    summaryTitle: 'Facebook performance summary',
    summaryDescription: 'Performance rows reported by Meta with a Facebook publisher platform breakdown.',
    rowsTitle: 'Latest Facebook insight rows',
    rowsDescription: 'Recent synced Meta rows tagged to Facebook placements and delivery.',
  },
  instagram: {
    title: 'Instagram',
    icon: SiInstagram,
    accentIcon: Instagram,
    listTitle: 'Connected Instagram Profiles',
    listDescription: 'Business profiles linked through the current Meta workspace.',
    emptySurfaceMessage: 'No Instagram business profiles have been surfaced from the current Meta login yet.',
    insightTitle: 'AI Instagram Suggestions',
    insightDescription: 'Recommendations framed for Instagram creative response and placement efficiency.',
    summaryTitle: 'Instagram performance summary',
    summaryDescription: 'Performance rows reported by Meta with an Instagram publisher platform breakdown.',
    rowsTitle: 'Latest Instagram insight rows',
    rowsDescription: 'Recent synced Meta rows tagged to Instagram placements and delivery.',
  },
} as const

export function SocialSurfacePanel({
  surface,
  items,
  surfaceStatus,
  itemsLoading,
  itemsError,
  emptyStateDescription,
  kpis,
  providerSummaries,
  metrics,
  initialMetricsLoading,
  metricsLoading,
  metricError,
  nextCursor,
  loadingMore,
  loadMoreError,
  onRefresh,
  onRetryItems,
  onLoadMore,
  onExport,
  suggestions,
}: SocialSurfacePanelProps) {
  const copy = SURFACE_COPY[surface]
  const SurfaceIcon = copy.icon
  const AccentIcon = copy.accentIcon
  const surfaceStatusLabel = itemsLoading
    ? 'Loading surfaces…'
    : surfaceStatus === 'source_required'
      ? 'Source needed'
      : surfaceStatus === 'error'
        ? 'Retry needed'
        : surfaceStatus === 'ready'
          ? `${items.length} connected`
          : surfaceStatus === 'disconnected'
            ? 'Meta not connected'
            : 'Waiting for surfaces'

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardHeader className="border-b border-muted/40 bg-muted/[0.03]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-primary">
                <SurfaceIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{copy.listTitle}</CardTitle>
                <CardDescription>{copy.listDescription}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs">
              {surfaceStatusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 p-6 md:grid-cols-2 xl:grid-cols-3">
          {itemsError ? (
            <div className="md:col-span-2 xl:col-span-3">
              <NetworkErrorEmptyState
                variant="card"
                title="Unable to load connected surfaces"
                description={itemsError}
                action={{ label: 'Retry', onClick: onRetryItems }}
              />
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="rounded-3xl border border-muted/50 bg-background p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <AccentIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
              </div>
            ))
          ) : itemsLoading ? (
            <div className="grid gap-3 md:col-span-2 md:grid-cols-2 xl:col-span-3 xl:grid-cols-3">
              {[0, 1, 2].map((slot) => <Skeleton key={slot} className="h-24 w-full rounded-3xl" />)}
            </div>
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                icon={Sparkles}
                title={surfaceStatus === 'source_required' ? `Choose a Meta source to load ${copy.title.toLowerCase()} surfaces` : `No ${copy.title.toLowerCase()} surfaces available yet`}
                description={emptyStateDescription}
                action={surfaceStatus !== 'source_required' && surfaceStatus !== 'disconnected' ? { label: 'Retry discovery', onClick: onRetryItems } : undefined}
                variant="card"
                className="rounded-3xl"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Surface data follows Meta publisher platform rows</AlertTitle>
        <AlertDescription>
          This tab now filters on Meta&apos;s `publisher_platform` breakdown. Older synced rows may still appear
          empty until the next refresh writes platform-aware metrics into storage.
        </AlertDescription>
      </Alert>

      <SocialsKpiGrid items={kpis} />

      <AlgorithmicInsightsCard
        insights={suggestions.insights}
        globalEfficiencyScore={suggestions.globalEfficiencyScore}
        providerEfficiencyScores={suggestions.providerEfficiencyScores}
        loading={metricsLoading}
        maxInsights={6}
        title={copy.insightTitle}
        description={copy.insightDescription}
        emptyMessage={`Connect ${copy.title} surfaces and complete an initial sync to generate AI recommendations.`}
      />

      <PerformanceSummaryCard
        providerSummaries={providerSummaries}
        hasMetrics={metrics.length > 0}
        initialMetricsLoading={initialMetricsLoading}
        metricsLoading={metricsLoading}
        metricError={metricError}
        onRefresh={onRefresh}
        onExport={onExport}
        title={copy.summaryTitle}
        description={copy.summaryDescription}
        emptyMessage={`No synced ${copy.title.toLowerCase()} performance yet. Connect Meta and complete the first sync to populate this summary.`}
        emptyCtaLabel={`Connect ${copy.title} surfaces`}
        emptyCtaHref="#social-surfaces-setup"
      />

      <MetricsTableCard
        processedMetrics={metrics}
        hasMetrics={metrics.length > 0}
        initialMetricsLoading={initialMetricsLoading}
        metricsLoading={metricsLoading}
        metricError={metricError}
        nextCursor={nextCursor}
        loadingMore={loadingMore}
        loadMoreError={loadMoreError}
        onRefresh={onRefresh}
        onLoadMore={onLoadMore}
        title={copy.rowsTitle}
        description={copy.rowsDescription}
        emptyMessage={`No ${copy.title.toLowerCase()} rows yet. Connect Meta and complete the first sync to populate this surface view.`}
        emptyCtaLabel={`Connect ${copy.title} surfaces`}
        emptyCtaHref="#social-surfaces-setup"
      />
    </div>
  )
}
