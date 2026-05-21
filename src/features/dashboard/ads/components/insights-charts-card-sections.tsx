'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { MotionCard } from '@/shared/ui/motion-primitives'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { cn } from '@/lib/utils'

import type { InsightsTabId } from './insights-chart-utils'
import { AdsChartShell } from './ads-chart-primitives'

type ProviderOption = { id: string; name: string }

const TAB_LABELS: Record<InsightsTabId, string> = {
  comparison: 'Comparison',
  efficiency: 'Efficiency',
  trends: 'Trends',
  funnel: 'Funnel',
  benchmarks: 'Benchmarks',
}

function ChartSkeleton() {
  return <Skeleton className="h-[280px] w-full rounded-lg" />
}

export function InsightsPanelEmpty({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <AdsChartShell>
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-4 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/40" aria-hidden />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Button asChild size="sm" variant="outline">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </div>
    </AdsChartShell>
  )
}

export function InsightsChartPanel({
  children,
  description,
  title,
  value,
}: {
  children: React.ReactNode
  description: string
  title: string
  value: string
}) {
  return (
    <TabsContent value={value} className="mt-4 focus-visible:outline-none">
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </TabsContent>
  )
}

export function InsightsChartsLoadingState() {
  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CardHeader className="border-b border-border/50 pb-5">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Skeleton className="h-9 w-full rounded-xl" />
        <ChartSkeleton />
      </CardContent>
    </MotionCard>
  )
}

export function InsightsChartsEmptyState({ hasConnections = false }: { hasConnections?: boolean }) {
  return (
    <MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CardHeader className="border-b border-border/50 pb-5">
        <p className={ADS_PAGE_THEME.sectionEyebrow}>Visual analysis</p>
        <CardTitle className="text-lg font-semibold tracking-tight">Performance insights</CardTitle>
        <CardDescription className="max-w-xl text-pretty leading-relaxed">
          Comparison, funnel, and benchmark charts from synced delivery data.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <InsightsPanelEmpty
          title={hasConnections ? 'Waiting for synced metrics' : 'Connect ad platforms first'}
          description={
            hasConnections
              ? 'Your accounts are linked. Run a sync for the selected date range, then charts and funnel analysis will appear here.'
              : 'Connect Google, Meta, LinkedIn, or TikTok above, then sync to unlock comparison, funnel, and benchmark charts.'
          }
          actionHref="#connect-ad-platforms"
          actionLabel={hasConnections ? 'Run sync' : 'Connect account'}
        />
      </CardContent>
    </MotionCard>
  )
}

export function InsightsChartsHeader({
  onSelectedProviderChange,
  providers,
  providersCount,
  selectedProvider,
}: {
  onSelectedProviderChange: (value: string) => void
  providers: ProviderOption[]
  providersCount: number
  selectedProvider: string
}) {
  return (
    <CardHeader className="border-b border-border/50 pb-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className={ADS_PAGE_THEME.sectionEyebrow}>Visual analysis</p>
          <CardTitle className="text-lg font-semibold tracking-tight">Performance insights</CardTitle>
          <CardDescription className="max-w-xl text-pretty leading-relaxed">
            Charts across {providersCount} platform{providersCount !== 1 ? 's' : ''} — switch tabs for
            comparison, efficiency, trends, funnel, and benchmarks.
          </CardDescription>
        </div>
        {providers.length > 1 ? (
          <Select value={selectedProvider} onValueChange={onSelectedProviderChange}>
            <SelectTrigger className="w-full rounded-xl border-border/70 sm:w-45">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
    </CardHeader>
  )
}

export function InsightsChartsTabs({
  activeTab,
  onTabChange,
  tabAvailability,
  children,
}: {
  activeTab: InsightsTabId
  onTabChange: (tab: InsightsTabId) => void
  tabAvailability: Record<InsightsTabId, boolean>
  children: React.ReactNode
}) {
  const tabs = Object.keys(TAB_LABELS) as InsightsTabId[]

  const handleTabChange = useCallback(
    (value: string) => onTabChange(value as InsightsTabId),
    [onTabChange],
  )

  return (
    <CardContent className="pt-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl bg-muted/40 p-1 sm:grid sm:grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                'min-w-[4.5rem] flex-1 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm',
                !tabAvailability[tab] && 'opacity-70',
              )}
            >
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </CardContent>
  )
}
