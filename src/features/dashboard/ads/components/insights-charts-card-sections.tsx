'use client'

import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
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
    <Card className="shadow-sm">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-9 w-full rounded-lg" />
        <ChartSkeleton />
      </CardContent>
    </Card>
  )
}

export function InsightsChartsEmptyState({ hasConnections = false }: { hasConnections?: boolean }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Performance Insights</CardTitle>
        <CardDescription>Visual analysis of your ad performance</CardDescription>
      </CardHeader>
      <CardContent>
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
    </Card>
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
    <CardHeader>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg">Performance Insights</CardTitle>
          <CardDescription>
            Visual analysis across {providersCount} platform{providersCount !== 1 ? 's' : ''}
          </CardDescription>
        </div>
        {providers.length > 1 ? (
          <Select value={selectedProvider} onValueChange={onSelectedProviderChange}>
            <SelectTrigger className="w-full sm:w-45">
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

  return (
    <CardContent>
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as InsightsTabId)} className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/50 p-1 sm:grid sm:grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className={cn(
                'min-w-[4.5rem] flex-1 text-xs sm:text-sm',
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
