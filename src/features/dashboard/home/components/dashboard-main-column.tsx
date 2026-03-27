'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ArrowUpRight } from 'lucide-react'

import { ActivityWidget } from '@/features/dashboard/activity/activity-widget'
import { ComparisonSummaryTile } from '@/features/dashboard/home/components/comparison/comparison-summary-tile'
import { ComparisonTable } from '@/features/dashboard/home/components/comparison/comparison-table'
import { DashboardFilterBar } from '@/features/dashboard/home/components/dashboard-filter-bar'
import { FadeIn } from '@/shared/ui/animate-in'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { formatRoas } from '@/lib/dashboard-utils'

import type { ClientRecord } from '@/types/clients'
import type { ClientComparisonSummary } from '@/types/dashboard'
import type { ProposalDraft } from '@/types/proposals'

import type { ComparisonAggregate } from '../hooks'
import { ClientProposalsCard } from './client-proposals-card'

const PerformanceChart = dynamic(
  () => import('@/features/dashboard/home/components/performance-chart').then((module) => module.PerformanceChart),
  {
    loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />,
    ssr: false,
  }
)

const activityFallback = <Skeleton className="h-[400px] w-full" />

type DashboardMainColumnProps = {
  userRole?: string | null
  clients: ClientRecord[]
  canCompareAcrossClients: boolean
  comparisonClientIds: string[]
  onComparisonClientChange: (nextClientIds: string[]) => void
  comparisonPeriodDays: number
  onComparisonPeriodChange: (periodDays: number) => void
  comparisonHasSelection: boolean
  comparisonError: string | null
  comparisonLoading: boolean
  comparisonSummaries: ClientComparisonSummary[]
  comparisonAggregate: ComparisonAggregate | null
  comparisonTargets: string[]
  chartData: Array<{ date: string; revenue: number; spend: number }>
  statsLoading: boolean
  proposals: ProposalDraft[]
  proposalsLoading: boolean
  proposalsError: string | null
}

export function DashboardMainColumn({
  userRole,
  clients,
  canCompareAcrossClients,
  comparisonClientIds,
  onComparisonClientChange,
  comparisonPeriodDays,
  onComparisonPeriodChange,
  comparisonHasSelection,
  comparisonError,
  comparisonLoading,
  comparisonSummaries,
  comparisonAggregate,
  comparisonTargets,
  chartData,
  statsLoading,
  proposals,
  proposalsLoading,
  proposalsError,
}: DashboardMainColumnProps) {
  return (
    <div className="space-y-6 lg:col-span-2">
      <FadeIn id="tour-performance-chart">
        <PerformanceChart metrics={chartData} loading={statsLoading} />
      </FadeIn>

      {userRole !== 'client' && (
        <FadeIn>
          <div className="space-y-4">
            <DashboardFilterBar
              clients={clients}
              selectedClientIds={comparisonClientIds}
              onClientChange={onComparisonClientChange}
              periodDays={comparisonPeriodDays}
              onPeriodChange={onComparisonPeriodChange}
              canCompare={Boolean(canCompareAcrossClients)}
            />

            {comparisonHasSelection && !comparisonError && (comparisonLoading || comparisonSummaries.length > 0) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {comparisonLoading || !comparisonAggregate ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : (
                  <>
                    <ComparisonSummaryTile
                      label="Combined revenue"
                      value={comparisonAggregate.currency ? formatCurrency(comparisonAggregate.totalRevenue, comparisonAggregate.currency) : '—'}
                      helper={comparisonAggregate.mixedCurrencies
                        ? 'Totals unavailable for mixed currencies'
                        : `${comparisonAggregate.selectionCount} workspace${comparisonAggregate.selectionCount > 1 ? 's' : ''}`}
                      tooltip="Total revenue across all selected workspaces"
                    />
                    <ComparisonSummaryTile
                      label="Ad spend"
                      value={comparisonAggregate.currency ? formatCurrency(comparisonAggregate.totalAdSpend, comparisonAggregate.currency) : '—'}
                      helper={comparisonAggregate.mixedCurrencies ? 'Align currencies to compare spend' : 'Same selection window'}
                      tooltip="Total ad spend across all selected workspaces"
                    />
                    <ComparisonSummaryTile
                      label="Conversions"
                      value={comparisonAggregate.totalConversions.toLocaleString('en-US')}
                      helper="Combined conversions across selected workspaces"
                      tooltip="Total conversion events during the selected period"
                    />
                    <ComparisonSummaryTile
                      label="Weighted ROAS"
                      value={comparisonAggregate.mixedCurrencies || comparisonAggregate.avgRoas === null ? '—' : formatRoas(comparisonAggregate.avgRoas)}
                      helper={comparisonAggregate.mixedCurrencies ? 'Unavailable for mixed currencies' : 'Revenue ÷ ad spend across selection'}
                      tooltip="Average ROAS weighted by ad spend"
                    />
                  </>
                )}
              </div>
            )}

            {comparisonError ? (
              <Alert variant="destructive">
                <AlertTitle>Comparison data unavailable</AlertTitle>
                <AlertDescription>{comparisonError}</AlertDescription>
              </Alert>
            ) : (
              <Card className="shadow-sm">
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base">Workspace comparison</CardTitle>
                    <CardDescription>
                      {comparisonHasSelection
                        ? `Tracking ${comparisonTargets.length} workspace${comparisonTargets.length > 1 ? 's' : ''} over the last ${comparisonPeriodDays} days.`
                        : 'Pick at least one workspace to start comparing performance.'}
                    </CardDescription>
                  </div>
                  {!canCompareAcrossClients && (
                    <Badge variant="secondary" className="text-xs">Admin view only</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <ComparisonTable rows={comparisonSummaries} loading={comparisonLoading} hasSelection={comparisonHasSelection} />
                </CardContent>
              </Card>
            )}
          </div>
        </FadeIn>
      )}

      {userRole === 'client' && (
        <FadeIn>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Your Projects</CardTitle>
                  <CardDescription>Track progress on your active projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      View your project updates, deliverables, and timelines in the Projects section.
                    </div>
                    <Link href="/dashboard/projects">
                      <Button variant="outline" size="sm">
                        View All Projects <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <ClientProposalsCard proposals={proposals} loading={proposalsLoading} />
            </div>

            <Suspense fallback={activityFallback}>
              <ActivityWidget />
            </Suspense>

            {proposalsError && (
              <Alert variant="destructive">
                <AlertTitle>Proposals unavailable</AlertTitle>
                <AlertDescription>{proposalsError}</AlertDescription>
              </Alert>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  )
}