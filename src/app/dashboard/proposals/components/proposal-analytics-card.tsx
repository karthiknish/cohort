'use client'

import { useQuery } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'

import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { proposalAnalyticsApi } from '@/lib/convex-api'
import { getPreviewProposals } from '@/lib/preview-data'
import type {
  ProposalAnalyticsByClient,
  ProposalAnalyticsSummary,
  ProposalAnalyticsTimeSeriesPoint,
} from '@/types/proposal-analytics'
import {
  ProposalAnalyticsActivityChart,
  ProposalAnalyticsByClientCard,
  ProposalAnalyticsEmptyState,
  ProposalAnalyticsHeader,
  ProposalAnalyticsLoadingCard,
  ProposalAnalyticsSuccessRates,
  ProposalAnalyticsSummaryGrid,
} from './proposal-analytics-card-sections'

type TimeRange = '7d' | '30d' | '90d' | '365d' | 'all'

function getDateRange(range: TimeRange): { startDate: string; endDate: string } | undefined {
  if (range === 'all') return undefined

  const endDate = new Date()
  const startDate = new Date()

  switch (range) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
    case '365d':
      startDate.setDate(startDate.getDate() - 365)
      break
  }

  return {
    startDate: startDate.toISOString().split('T')[0] ?? startDate.toISOString(),
    endDate: endDate.toISOString().split('T')[0] ?? endDate.toISOString(),
  }
}

function formatDuration(ms: number | null): string {
  if (ms === null) return 'N/A'
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function ProposalAnalyticsCard() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const workspaceId = user?.agencyId ?? null

  const [timeRange, setTimeRange] = useState<TimeRange>('30d')

  const dateRange = useMemo(() => getDateRange(timeRange), [timeRange])
  const startDateMs = useMemo(() => {
    if (!dateRange?.startDate) return undefined
    const d = new Date(dateRange.startDate)
    return Number.isNaN(d.getTime()) ? undefined : d.getTime()
  }, [dateRange])
  const endDateMs = useMemo(() => {
    if (!dateRange?.endDate) return undefined
    const d = new Date(dateRange.endDate)
    if (Number.isNaN(d.getTime())) return undefined
    d.setHours(23, 59, 59, 999)
    return d.getTime()
  }, [dateRange])

  const summaryRes = useQuery(
    proposalAnalyticsApi.summarize,
    !isPreviewMode && workspaceId ? { workspaceId, startDateMs, endDateMs, limit: 1000 } : 'skip',
  )
  const timeSeriesRes = useQuery(
    proposalAnalyticsApi.timeSeries,
    !isPreviewMode && workspaceId ? { workspaceId, startDateMs, endDateMs, limit: 1000 } : 'skip',
  )
  const byClientRes = useQuery(
    proposalAnalyticsApi.byClient,
    !isPreviewMode && workspaceId ? { workspaceId, startDateMs, endDateMs, limit: 1000 } : 'skip',
  )

  const previewProposals = useMemo(() => getPreviewProposals(null), [])

  const previewSummary = useMemo<ProposalAnalyticsSummary>(() => ({
    totalDrafts: previewProposals.length,
    totalSubmitted: previewProposals.filter((proposal) => proposal.status === 'ready' || proposal.status === 'sent').length,
    totalSent: previewProposals.filter((proposal) => proposal.status === 'sent').length,
    aiGenerationsAttempted: 12,
    aiGenerationsSucceeded: 11,
    aiGenerationsFailed: 1,
    deckGenerationsAttempted: 9,
    deckGenerationsSucceeded: 8,
    deckGenerationsFailed: 1,
    averageAiGenerationTime: 24_000,
    averageDeckGenerationTime: 71_000,
    successRate: (11 / 12) * 100,
    deckSuccessRate: (8 / 9) * 100,
  }), [previewProposals])

  const previewTimeSeries = useMemo<ProposalAnalyticsTimeSeriesPoint[]>(() => {
    const points: ProposalAnalyticsTimeSeriesPoint[] = []

    for (let offset = 13; offset >= 0; offset -= 1) {
      const date = isoDateDaysAgo(offset)
      const matching = previewProposals.filter((proposal) => (proposal.createdAt ?? '').startsWith(date))

      points.push({
        date,
        draftsCreated: matching.length,
        proposalsSubmitted: matching.filter((proposal) => proposal.status === 'ready' || proposal.status === 'sent').length,
        aiGenerations: matching.length > 0 ? matching.length + 1 : 0,
        aiFailures: offset === 6 ? 1 : 0,
        deckGenerations: matching.filter((proposal) => proposal.presentationDeck).length,
        deckFailures: offset === 4 ? 1 : 0,
      })
    }

    return points
  }, [previewProposals])

  const previewByClient = useMemo<ProposalAnalyticsByClient[]>(() => {
    const grouped = new Map<string, ProposalAnalyticsByClient>()

    previewProposals.forEach((proposal) => {
      const clientKey = proposal.clientId ?? 'unknown-client'
      const current = grouped.get(clientKey)

      if (!current) {
        grouped.set(clientKey, {
          clientId: clientKey,
          clientName: proposal.clientName ?? 'Unknown client',
          proposalCount: 1,
          submittedCount: proposal.status === 'ready' || proposal.status === 'sent' ? 1 : 0,
          sentCount: proposal.status === 'sent' ? 1 : 0,
          lastProposalAt: proposal.updatedAt ?? proposal.createdAt ?? null,
        })
        return
      }

      current.proposalCount += 1
      if (proposal.status === 'ready' || proposal.status === 'sent') {
        current.submittedCount += 1
      }
      if (proposal.status === 'sent') {
        current.sentCount += 1
      }
      if (!current.lastProposalAt || (proposal.updatedAt && proposal.updatedAt > current.lastProposalAt)) {
        current.lastProposalAt = proposal.updatedAt ?? proposal.createdAt ?? current.lastProposalAt
      }
    })

    return Array.from(grouped.values()).sort((left, right) => right.proposalCount - left.proposalCount)
  }, [previewProposals])

  const summary = isPreviewMode
    ? previewSummary
    : (summaryRes as { summary?: ProposalAnalyticsSummary } | undefined)?.summary
  const timeSeries = useMemo(
    () => isPreviewMode
      ? previewTimeSeries
      : (timeSeriesRes as { timeseries?: ProposalAnalyticsTimeSeriesPoint[] } | undefined)?.timeseries ?? [],
    [isPreviewMode, previewTimeSeries, timeSeriesRes]
  )
  const byClient = isPreviewMode
    ? previewByClient
    : (byClientRes as { byClient?: ProposalAnalyticsByClient[] } | undefined)?.byClient ?? []

  const loading = isPreviewMode ? false : summaryRes === undefined || timeSeriesRes === undefined || byClientRes === undefined

  const handleRefresh = useCallback(() => {
    toast({
      title: isPreviewMode ? 'Preview data refreshed' : 'Refreshing…',
      description: isPreviewMode ? 'Showing sample proposal analytics.' : 'Analytics will update automatically.',
    })
  }, [isPreviewMode, toast])

  // Calculate simple chart data from time series
  const chartData = useMemo(() => {
    if (timeSeries.length === 0) return null

    const maxGenerations = Math.max(...timeSeries.map((p) => p.aiGenerations + p.deckGenerations), 1)
    const totalGenerations = timeSeries.reduce((sum, p) => sum + p.aiGenerations + p.deckGenerations, 0)
    const totalFailures = timeSeries.reduce((sum, p) => sum + p.aiFailures + p.deckFailures, 0)

    return {
      maxGenerations,
      totalGenerations,
      totalFailures,
      points: timeSeries.slice(-14), // Last 14 days for chart
    }
  }, [timeSeries])

  if (loading) {
    return <ProposalAnalyticsLoadingCard />
  }

  return (
    <div className="space-y-6">
      <ProposalAnalyticsHeader loading={loading} onRefresh={handleRefresh} onTimeRangeChange={setTimeRange} timeRange={timeRange} />

      {summary ? <ProposalAnalyticsSummaryGrid summary={summary} formatDuration={formatDuration} /> : null}

      {summary ? <ProposalAnalyticsSuccessRates summary={summary} formatDuration={formatDuration} formatPercentage={formatPercentage} /> : null}

      {chartData && chartData.points.length > 0 ? <ProposalAnalyticsActivityChart chartData={chartData} /> : null}

      {byClient.length > 0 ? <ProposalAnalyticsByClientCard byClient={byClient} /> : null}

      {summary && summary.totalDrafts === 0 ? <ProposalAnalyticsEmptyState /> : null}
    </div>
  )
}

function isoDateDaysAgo(daysAgo: number): string {
  const now = typeof window === 'undefined' ? new Date('2024-01-15T12:00:00.000Z') : new Date()
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0] ?? now.toISOString().split('T')[0] ?? now.toISOString()
}
