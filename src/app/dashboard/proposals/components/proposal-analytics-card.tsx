'use client'

import { useCallback, useEffect, useState, useMemo } from 'react'
import {
  BarChart3,
  CircleCheck,
  Clock,
  FileText,
  LoaderCircle,
  RefreshCw,
  Send,
  TrendingUp,
  CircleX,
  TriangleAlert,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useQuery } from 'convex/react'
import { proposalAnalyticsApi } from '@/lib/convex-api'
import type {
  ProposalAnalyticsSummary,
  ProposalAnalyticsTimeSeriesPoint,
  ProposalAnalyticsByClient,
} from '@/types/proposal-analytics'

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
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
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
  const { toast } = useToast()

  const workspaceId = user?.agencyId ?? null

  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [refreshing, setRefreshing] = useState(false)

  const dateRange = useMemo(() => getDateRange(timeRange), [timeRange])
  const startDateMs = useMemo(() => {
    if (!dateRange?.startDate) return undefined
    const d = new Date(dateRange.startDate)
    return Number.isNaN(d.getTime()) ? undefined : d.getTime()
  }, [dateRange?.startDate])
  const endDateMs = useMemo(() => {
    if (!dateRange?.endDate) return undefined
    const d = new Date(dateRange.endDate)
    if (Number.isNaN(d.getTime())) return undefined
    d.setHours(23, 59, 59, 999)
    return d.getTime()
  }, [dateRange?.endDate])

  const summaryRes = useQuery(
    proposalAnalyticsApi.summarize,
    workspaceId ? { workspaceId, startDateMs, endDateMs, limit: 1000 } : 'skip',
  )
  const timeSeriesRes = useQuery(
    proposalAnalyticsApi.timeSeries,
    workspaceId ? { workspaceId, startDateMs, endDateMs, limit: 1000 } : 'skip',
  )
  const byClientRes = useQuery(
    proposalAnalyticsApi.byClient,
    workspaceId ? { workspaceId, startDateMs, endDateMs, limit: 1000 } : 'skip',
  )

  const summary = (summaryRes as any)?.summary as ProposalAnalyticsSummary | undefined
  const timeSeries = ((timeSeriesRes as any)?.timeseries ?? []) as ProposalAnalyticsTimeSeriesPoint[]
  const byClient = ((byClientRes as any)?.byClient ?? []) as ProposalAnalyticsByClient[]

  const loading = summaryRes === undefined || timeSeriesRes === undefined || byClientRes === undefined

  useEffect(() => {
    if (!loading) setRefreshing(false)
  }, [loading])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    toast({ title: 'Refreshing…', description: 'Analytics will update automatically.' })
  }, [toast])

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
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Proposal Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track proposal generation success rates and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalDrafts}</p>
                  <p className="text-xs text-muted-foreground">Drafts Created</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <CircleCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalSubmitted}</p>
                  <p className="text-xs text-muted-foreground">Proposals Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                  <Send className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.totalSent}</p>
                  <p className="text-xs text-muted-foreground">Proposals Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatDuration(summary.averageAiGenerationTime)}</p>
                  <p className="text-xs text-muted-foreground">Avg. AI Generation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Rates */}
      {summary && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI Generation Success Rate</CardTitle>
              <CardDescription>
                {summary.aiGenerationsSucceeded} of {summary.aiGenerationsAttempted} generations successful
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">
                  {formatPercentage(summary.successRate)}
                </span>
                {summary.aiGenerationsFailed > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <CircleX className="h-3 w-3" />
                    {summary.aiGenerationsFailed} failed
                  </Badge>
                )}
              </div>
              <Progress value={summary.successRate} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CircleCheck className="h-3 w-3 text-green-500" />
                  {summary.aiGenerationsSucceeded} succeeded
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(summary.averageAiGenerationTime)} avg
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Deck Generation Success Rate</CardTitle>
              <CardDescription>
                {summary.deckGenerationsSucceeded} of {summary.deckGenerationsAttempted} deck generations successful
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-primary">
                  {formatPercentage(summary.deckSuccessRate)}
                </span>
                {summary.deckGenerationsFailed > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <CircleX className="h-3 w-3" />
                    {summary.deckGenerationsFailed} failed
                  </Badge>
                )}
              </div>
              <Progress value={summary.deckSuccessRate} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CircleCheck className="h-3 w-3 text-green-500" />
                  {summary.deckGenerationsSucceeded} succeeded
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(summary.averageDeckGenerationTime)} avg
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Chart (Simple bar visualization) */}
      {chartData && chartData.points.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Generation Activity
            </CardTitle>
            <CardDescription>
              AI and deck generations over the last {chartData.points.length} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-32 items-end gap-1">
              {chartData.points.map((point, idx) => {
                const totalGenerations = point.aiGenerations + point.deckGenerations
                const totalFailures = point.aiFailures + point.deckFailures
                const height = (totalGenerations / chartData.maxGenerations) * 100
                const failureHeight = totalFailures > 0 ? Math.min((totalFailures / totalGenerations) * height, height) : 0

                return (
                  <div
                    key={point.date}
                    className="flex-1 flex flex-col justify-end"
                    title={`${point.date}: ${totalGenerations} generations, ${totalFailures} failures`}
                  >
                    <div
                      className="relative w-full rounded-t bg-primary/20 transition-all hover:bg-primary/30"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      {failureHeight > 0 && (
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-t bg-destructive/50"
                          style={{ height: `${failureHeight}%` }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{chartData.points[0]?.date}</span>
              <span>{chartData.points[chartData.points.length - 1]?.date}</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/40" />
                Generations ({chartData.totalGenerations})
              </span>
              {chartData.totalFailures > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive/50" />
                  Failures ({chartData.totalFailures})
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* By Client */}
      {byClient.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Proposals by Client
            </CardTitle>
            <CardDescription>
              Top {Math.min(byClient.length, 10)} clients by proposal count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byClient.slice(0, 10).map((client) => (
                <div
                  key={client.clientId}
                  className="flex items-center justify-between rounded-md border border-muted/40 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{client.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      Last proposal: {client.lastProposalAt ? new Date(client.lastProposalAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{client.proposalCount} drafts</Badge>
                    {client.submittedCount > 0 && (
                      <Badge variant="secondary">{client.submittedCount} submitted</Badge>
                    )}
                    {client.sentCount > 0 && (
                      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                        {client.sentCount} sent
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {summary && summary.totalDrafts === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-muted/30 p-4">
              <TriangleAlert className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Analytics Data</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Start creating proposals to see analytics data here. Track AI generation success rates,
              deck creation performance, and more.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
