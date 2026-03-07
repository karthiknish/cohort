'use client'

import { AdInsightsWidget } from '@/components/dashboard/ad-insights-widget'
import { ComparisonInsights } from '@/components/dashboard/comparison/comparison-insights'
import { PlatformComparisonSummaryCard } from '@/components/dashboard/platform-comparison-summary-card'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { TasksCard } from '@/components/dashboard/tasks-card'
import { WorkspaceTrendsCard } from '@/components/dashboard/workspace-trends-card'
import { FadeIn } from '@/components/ui/animate-in'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { ClientRecord } from '@/types/clients'
import type { ClientComparisonSummary, ComparisonInsight, DashboardTaskItem, MetricRecord } from '@/types/dashboard'
import type { ProposalDraft } from '@/types/proposals'
import type { TaskRecord } from '@/types/tasks'

import type { TaskSummary } from '../components'
import type { ComparisonAggregate, IntegrationStatusSummary } from '../hooks'
import { ClientAiSummaryCard } from './client-ai-summary-card'
import { MiniTaskKanban } from './mini-task-kanban'

type ProviderSummaryMap = Record<string, {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}>

type DashboardSidebarProps = {
  userRole?: string | null
  selectedClient: ClientRecord | null
  metrics: MetricRecord[]
  metricsLoading: boolean
  taskSummary: TaskSummary
  tasksLoading: boolean
  proposals: ProposalDraft[]
  proposalsLoading: boolean
  integrationSummary: IntegrationStatusSummary
  integrationsLoading: boolean
  lastRefreshed: Date
  rawTasks: TaskRecord[]
  filteredUpcomingTasks: DashboardTaskItem[]
  providerSummaries?: ProviderSummaryMap
  comparisonError: string | null
  comparisonHasSelection: boolean
  comparisonLoading: boolean
  comparisonSummaries: ClientComparisonSummary[]
  comparisonInsights: ComparisonInsight[]
  comparisonAggregate: ComparisonAggregate | null
  comparisonTargets: string[]
  comparisonPeriodDays: number
}

export function DashboardSidebar({
  userRole,
  selectedClient,
  metrics,
  metricsLoading,
  taskSummary,
  tasksLoading,
  proposals,
  proposalsLoading,
  integrationSummary,
  integrationsLoading,
  lastRefreshed,
  rawTasks,
  filteredUpcomingTasks,
  providerSummaries,
  comparisonError,
  comparisonHasSelection,
  comparisonLoading,
  comparisonSummaries,
  comparisonInsights,
  comparisonAggregate,
  comparisonTargets,
  comparisonPeriodDays,
}: DashboardSidebarProps) {
  return (
    <div className="space-y-6">
      <FadeIn>
        <ClientAiSummaryCard
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
        />
      </FadeIn>

      <FadeIn>
        <PlatformComparisonSummaryCard metrics={metrics} isLoading={metricsLoading} />
      </FadeIn>

      <FadeIn>
        <QuickActions compact />
      </FadeIn>

      <FadeIn>
        <MiniTaskKanban tasks={rawTasks} loading={tasksLoading} />
      </FadeIn>

      {userRole !== 'client' && (
        <FadeIn>
          <AdInsightsWidget
            providerSummaries={providerSummaries}
            loading={metricsLoading}
            showEmpty={false}
          />
        </FadeIn>
      )}

      {userRole === 'admin' && !comparisonError && comparisonTargets.length > 1 && comparisonAggregate && (
        <FadeIn>
          <WorkspaceTrendsCard
            summaries={comparisonSummaries}
            periodDays={comparisonPeriodDays}
            mixedCurrencies={comparisonAggregate.mixedCurrencies}
          />
        </FadeIn>
      )}

      {userRole !== 'client' && !comparisonError && comparisonHasSelection && (comparisonLoading || comparisonSummaries.length > 0) && (
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
    </div>
  )
}