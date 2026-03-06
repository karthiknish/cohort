'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { FadeIn } from '@/components/ui/animate-in'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'

// New components
import { OnboardingCard } from '@/components/dashboard/onboarding-card'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { DashboardMainColumn } from './components/dashboard-main-column'
import { DashboardRoleBanner } from './components/dashboard-role-banner'
import { DashboardSidebar } from './components/dashboard-sidebar'

// Types
import type { DashboardTaskItem } from '@/types/dashboard'

// Extracted hooks and utilities
import {
  useDashboardData,
  useComparisonData,
  useIntegrationStatusSummary,
  useDashboardStats
} from './hooks'
import { buildChartData } from './utils/dashboard-calculations'
import { useRenderLog } from '@/lib/debug-utils'

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

  const [rawComparisonClientIds, setRawComparisonClientIds] = useState<string[]>(() => (selectedClientId ? [selectedClientId] : []))
  const [comparisonPeriodDays, setComparisonPeriodDays] = useState(30)

  const canCompareAcrossClients = user?.role === 'admin'

  const comparisonClientIds = useMemo(() => {
    const validSelectedIds = rawComparisonClientIds.filter((id) => clients.some((client) => client.id === id))

    if (canCompareAcrossClients) {
      if (validSelectedIds.length > 0) {
        return validSelectedIds
      }
      return selectedClientId ? [selectedClientId] : []
    }

    return selectedClientId ? [selectedClientId] : []
  }, [canCompareAcrossClients, clients, rawComparisonClientIds, selectedClientId])

  const handleComparisonClientChange = useCallback((nextClientIds: string[]) => {
    setRawComparisonClientIds(nextClientIds)
  }, [])

  useRenderLog('DashboardPage', {
    selectedClientId,
    clientsCount: clients?.length ?? 0,
    comparisonClientIds,
  })

  // Debug: Track re-renders and their causes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString()
      console.log(`[DashboardPage] Render at ${timestamp}`, {
        selectedClientId,
        clientsCount: clients?.length ?? 0,
        canCompare: canCompareAcrossClients,
        comparisonClientIdsLength: comparisonClientIds.length
      })
    }
  })

  // Dashboard data hook
  const dashboardOptions = useMemo(() => ({ selectedClientId: selectedClientId ?? null }), [selectedClientId])
  const {
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
  } = useDashboardData(dashboardOptions)

  const integrationScopeClientIds = useMemo(() => {
    if (user?.role === 'admin' && comparisonClientIds.length > 0) return comparisonClientIds
    if (selectedClientId) return [selectedClientId]
    return [] as string[]
  }, [comparisonClientIds, selectedClientId, user?.role])

  const { summary: integrationSummary, loading: integrationsLoading } = useIntegrationStatusSummary({
    clientIds: integrationScopeClientIds,
  })

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
  const { primaryStats, orderedStats } = useDashboardStats({
    metrics,
    taskSummary,
    userRole: user?.role,
  })

  const statsLoading = metricsLoading || tasksLoading

  const errorStates = useMemo(
    () => [
      metricsError && { id: 'metrics', title: 'Ad metrics unavailable', message: metricsError },
      tasksError && { id: 'tasks', title: 'Tasks unavailable', message: tasksError },
    ].filter((entry): entry is { id: string; title: string; message: string } => Boolean(entry)),
    [metricsError, tasksError],
  )

  const chartData = useMemo(() => buildChartData(metrics), [metrics])

  // Calculate provider summaries for ad insights widget
  const providerSummaries = useMemo(() => {
    if (metrics.length === 0) return undefined

    const summaries: Record<string, { spend: number; impressions: number; clicks: number; conversions: number; revenue: number }> = {}
    metrics.forEach((m) => {
      const aggregate =
        summaries[m.providerId] ?? { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }

      aggregate.spend += m.spend
      aggregate.impressions += m.impressions
      aggregate.clicks += m.clicks
      aggregate.conversions += m.conversions
      aggregate.revenue += m.revenue ?? 0

      summaries[m.providerId] = aggregate
    })
    return Object.keys(summaries).length > 0 ? summaries : undefined
  }, [metrics])

  const isNewUser = useMemo(() => {
    if (!user?.createdAt) return false
    const created = new Date(user.createdAt)
    const now = new Date()
    return (now.getTime() - created.getTime()) < 24 * 60 * 60 * 1000
  }, [user])

  const showOnboarding = !statsLoading && isNewUser && !selectedClientId && metrics.length === 0

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
  }, [resolvedTasks, selectedClient])

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

        <DashboardRoleBanner userRole={user?.role} userDisplayName={user?.name} />

        <div id="tour-stats-cards">
          <StatsCards
            stats={orderedStats}
            primaryCount={Math.max(1, primaryStats.length || Math.min(4, orderedStats.length))}
            loading={statsLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <DashboardMainColumn
            userRole={user?.role}
            clients={clients}
            canCompareAcrossClients={canCompareAcrossClients}
            comparisonClientIds={comparisonClientIds}
            onComparisonClientChange={handleComparisonClientChange}
            comparisonPeriodDays={comparisonPeriodDays}
            onComparisonPeriodChange={setComparisonPeriodDays}
            comparisonHasSelection={comparisonHasSelection}
            comparisonError={comparisonError}
            comparisonLoading={comparisonLoading}
            comparisonSummaries={comparisonSummaries}
            comparisonAggregate={comparisonAggregate}
            comparisonTargets={comparisonTargets}
            chartData={chartData}
            statsLoading={statsLoading}
            proposals={proposals}
            proposalsLoading={proposalsLoading}
            proposalsError={proposalsError}
          />

          <DashboardSidebar
            userRole={user?.role}
            selectedClient={selectedClient}
            metrics={metrics}
            metricsLoading={metricsLoading}
            taskSummary={taskSummary}
            tasksLoading={tasksLoading}
            proposals={proposals}
            proposalsLoading={proposalsLoading}
            integrationSummary={integrationSummary}
            integrationsLoading={integrationsLoading}
            lastRefreshed={lastRefreshed}
            rawTasks={rawTasks}
            filteredUpcomingTasks={filteredUpcomingTasks}
            providerSummaries={providerSummaries}
            comparisonError={comparisonError}
            comparisonHasSelection={comparisonHasSelection}
            comparisonLoading={comparisonLoading}
            comparisonSummaries={comparisonSummaries}
            comparisonInsights={comparisonInsights}
            comparisonAggregate={comparisonAggregate}
            comparisonTargets={comparisonTargets}
            comparisonPeriodDays={comparisonPeriodDays}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
