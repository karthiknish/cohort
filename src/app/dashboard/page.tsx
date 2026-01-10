'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState, Suspense } from 'react'
import {
  ArrowUpRight,
  Shield,
  Trophy,
} from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'
import { FadeIn } from '@/components/ui/animate-in'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivityWidget } from '@/components/activity/activity-widget'
import { DashboardFilterBar } from '@/components/dashboard/dashboard-filter-bar'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

// Lazy load heavy chart component for better initial page load
const PerformanceChart = dynamic(
  () => import('@/components/dashboard/performance-chart').then((m) => m.PerformanceChart),
  {
    loading: () => <Skeleton className="h-[350px] w-full rounded-lg" />,
    ssr: false,
  }
)

// New components
import { OnboardingCard } from '@/components/dashboard/onboarding-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TasksCard } from '@/components/dashboard/tasks-card'
import { ComparisonTable } from '@/components/dashboard/comparison/comparison-table'
import { ComparisonSummaryTile } from '@/components/dashboard/comparison/comparison-summary-tile'
import { ComparisonInsights } from '@/components/dashboard/comparison/comparison-insights'
import { AdInsightsWidget } from '@/components/dashboard/ad-insights-widget'
import { ClientProposalsCard } from './components/client-proposals-card'
import { ClientInvoicesCard } from './components/client-invoices-card'

// Types
import type { DashboardTaskItem } from '@/types/dashboard'
import { formatRoas } from '@/lib/dashboard-utils'

// Local page components and utilities
import { MiniTaskKanban } from './components'

// Extracted hooks and utilities
import { useDashboardData, useComparisonData } from './hooks'
import { useDashboardStats, buildChartData } from './utils/dashboard-calculations'

const DEFAULT_TASKS: DashboardTaskItem[] = [
  {
    id: 'default-task-1',
    title: 'Review Q3 performance report',
    dueLabel: 'Today',
    priority: 'high',
    clientName: 'Tech Corp',
  },
  {
    id: 'default-task-2',
    title: 'Create proposal for new client',
    dueLabel: 'Tomorrow',
    priority: 'medium',
    clientName: 'StartupXYZ',
  },
  {
    id: 'default-task-3',
    title: 'Optimize Google Ads campaigns',
    dueLabel: 'This week',
    priority: 'low',
    clientName: 'Retail Store',
  },
]

export default function DashboardPage() {
  const { clients, selectedClient, selectedClientId } = useClientContext()
  const { user } = useAuth()

  const [comparisonClientIds, setComparisonClientIds] = useState<string[]>(() => (selectedClientId ? [selectedClientId] : []))
  const [comparisonPeriodDays, setComparisonPeriodDays] = useState(30)

  const canCompareAcrossClients = user?.role === 'admin'

  // Sync comparison client IDs with available clients
  useEffect(() => {
    setComparisonClientIds((current) => {
      if (clients.length === 0) {
        return []
      }
      const validIds = current.filter((id) => clients.some((client) => client.id === id))
      if (validIds.length === current.length && (current.length > 0 || !selectedClientId)) {
        return current
      }
      if (validIds.length === 0 && selectedClientId) {
        return [selectedClientId]
      }
      return validIds
    })
  }, [clients, selectedClientId])

  // Restrict comparison to single client for non-admins
  useEffect(() => {
    if (canCompareAcrossClients) {
      return
    }
    setComparisonClientIds((current) => {
      if (selectedClientId) {
        if (current.length === 1 && current[0] === selectedClientId) {
          return current
        }
        return [selectedClientId]
      }
      return current.length > 1 ? current.slice(0, 1) : current
    })
  }, [canCompareAcrossClients, selectedClientId])

  // Dashboard data hook
  const {
    financeSummary,
    financeLoading,
    financeError,
    metrics,
    metricsLoading,
    metricsError,
    taskItems,
    rawTasks,
    taskSummary,
    tasksLoading,
    tasksError,
    proposals,
    proposalsLoading,
    proposalsError,
    lastRefreshed,
    handleRefresh,
    isRefreshing,
  } = useDashboardData({ selectedClientId: selectedClientId ?? null })

  // Comparison data hook
  const {
    comparisonSummaries,
    comparisonLoading,
    comparisonError,
    comparisonInsights,
    comparisonAggregate,
    comparisonTargets,
    comparisonHasSelection,
  } = useComparisonData({
    clients,
    selectedClientId: selectedClientId ?? null,
    comparisonClientIds,
    comparisonPeriodDays,
  })

  // Stats calculations
  const { primaryStats, secondaryStats, orderedStats } = useDashboardStats({
    financeSummary,
    metrics,
    taskSummary,
    userRole: user?.role,
  })

  const statsLoading = financeLoading || metricsLoading || tasksLoading

  const errorStates = useMemo(
    () => [
      financeError && { id: 'finance', title: 'Finance data unavailable', message: financeError },
      metricsError && { id: 'metrics', title: 'Ad metrics unavailable', message: metricsError },
      tasksError && { id: 'tasks', title: 'Tasks unavailable', message: tasksError },
    ].filter((entry): entry is { id: string; title: string; message: string } => Boolean(entry)),
    [financeError, metricsError, tasksError],
  )

  const chartData = useMemo(() => buildChartData(metrics, financeSummary), [metrics, financeSummary])

  // Calculate provider summaries for ad insights widget
  const providerSummaries = useMemo(() => {
    if (metrics.length === 0) return undefined
    
    const summaries: Record<string, { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }> = {}
    metrics.forEach((m) => {
      if (!summaries[m.providerId]) {
        summaries[m.providerId] = { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
      }
      summaries[m.providerId].spend += m.spend
      summaries[m.providerId].impressions += m.impressions
      summaries[m.providerId].clicks += m.clicks
      summaries[m.providerId].conversions += m.conversions
      summaries[m.providerId].revenue += m.revenue ?? 0
    })
    return Object.keys(summaries).length > 0 ? summaries : undefined
  }, [metrics])

  const isNewUser = useMemo(() => {
    if (!user?.createdAt) return false
    const created = new Date(user.createdAt)
    const now = new Date()
    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000
  }, [user?.createdAt])

  const showOnboarding = !statsLoading && isNewUser && !selectedClientId && metrics.length === 0 && !financeSummary

  const resolvedTasks = useMemo(() => {
    if (taskItems.length > 0) return taskItems
    if (tasksError) return DEFAULT_TASKS
    return []
  }, [taskItems, tasksError])

  const filteredUpcomingTasks = useMemo(() => {
    if (resolvedTasks.length === 0) return resolvedTasks
    if (!selectedClient?.name) return resolvedTasks.slice(0, 5)
    const needle = selectedClient.name.toLowerCase()
    const matches = resolvedTasks.filter((task) => task.clientName.toLowerCase().includes(needle))
    const scoped = matches.length > 0 ? matches : resolvedTasks
    return scoped.slice(0, 5)
  }, [resolvedTasks, selectedClient?.name])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {errorStates.map((error) => (
          <FadeIn key={error.id}>
            <Alert variant="destructive">
              <AlertTitle>{error.title}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </FadeIn>
        ))}

        <FadeIn>
          <DashboardHeader
            userDisplayName={user?.name}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            lastRefreshed={lastRefreshed}
          />
        </FadeIn>

        {showOnboarding && (
          <FadeIn>
            <OnboardingCard />
          </FadeIn>
        )}

        {/* Role-specific welcome messages */}
        {user?.role === 'admin' && (
          <FadeIn>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Admin Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    You have full access to all workspaces, team management, and administrative functions.
                  </p>
                </div>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                    Admin Panel <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {user?.role === 'client' && (
          <FadeIn>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Trophy className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">Welcome, {user?.name?.split(' ')[0] || 'Client'}!</p>
                  <p className="text-sm text-green-700">
                    View your project progress, proposals, and collaborate with your team.
                  </p>
                </div>
                <Link href="/dashboard/collaboration">
                  <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                    Messages <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        <div id="tour-stats-cards">
          <StatsCards
            stats={orderedStats}
            primaryCount={Math.max(1, primaryStats.length || Math.min(4, orderedStats.length))}
            loading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <FadeIn id="tour-performance-chart">
              <PerformanceChart metrics={chartData} loading={statsLoading} />
            </FadeIn>

            {/* Comparison section - Admin and Team only */}
            {user?.role !== 'client' && (
              <FadeIn>
                <div className="space-y-4">
                  <DashboardFilterBar
                    clients={clients}
                    selectedClientIds={comparisonClientIds}
                    onClientChange={setComparisonClientIds}
                    periodDays={comparisonPeriodDays}
                    onPeriodChange={setComparisonPeriodDays}
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
                            label="Outstanding"
                            value={comparisonAggregate.currency ? formatCurrency(comparisonAggregate.totalOutstanding, comparisonAggregate.currency) : '—'}
                            helper={comparisonAggregate.mixedCurrencies ? 'Totals hidden (mixed currencies)' : 'Open invoices + retainers'}
                            tooltip="Total unpaid invoices and retainers"
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

            {/* Client-specific: Project progress overview */}
            {user?.role === 'client' && (
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

                    <ClientInvoicesCard
                      financeSummary={financeSummary}
                      loading={financeLoading}
                      error={financeError}
                    />
                  </div>

                  {/* Client-focused: recent updates in-context */}
                  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
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

          <div className="space-y-6">
            <FadeIn>
              <QuickActions compact />
            </FadeIn>

            <FadeIn>
              <MiniTaskKanban tasks={rawTasks} loading={tasksLoading} />
            </FadeIn>

            {/* Ad Insights Widget - Show for Admin/Team with ad metrics */}
            {user?.role !== 'client' && (
              <FadeIn>
                <AdInsightsWidget
                  providerSummaries={providerSummaries}
                  loading={metricsLoading}
                  showEmpty={false}
                />
              </FadeIn>
            )}

            {/* Comparison insights - Admin/Team only */}
            {user?.role !== 'client' && !comparisonError && comparisonHasSelection && (comparisonLoading || comparisonSummaries.length > 0) && (
              <FadeIn>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base">Workspace highlights</CardTitle>
                    <CardDescription>Auto-generated callouts based on the selected period.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ComparisonInsights insights={comparisonInsights} loading={comparisonLoading} />
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            <FadeIn>
              <TasksCard tasks={filteredUpcomingTasks} loading={tasksLoading} />
            </FadeIn>

            {user?.role !== 'client' && (
              <FadeIn>
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                  <ActivityWidget />
                </Suspense>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
