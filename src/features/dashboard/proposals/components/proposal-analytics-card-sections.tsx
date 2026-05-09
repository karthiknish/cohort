'use client'

import {
  BarChart3,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  LoaderCircle,
  RefreshCw,
  Send,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Progress } from '@/shared/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import type {
  ProposalAnalyticsByClient,
  ProposalAnalyticsSummary,
  ProposalAnalyticsTimeSeriesPoint,
} from '@/types/proposal-analytics'

type TimeRange = '7d' | '30d' | '90d' | '365d' | 'all'

type ChartData = {
  maxGenerations: number
  totalFailures: number
  totalGenerations: number
  points: ProposalAnalyticsTimeSeriesPoint[]
}

type SummaryStatIconKey = 'drafts' | 'submitted' | 'sent' | 'average'

function SummaryStatCard({ iconKey, label, toneClassName, value }: { iconKey: SummaryStatIconKey; label: string; toneClassName: string; value: string | number }) {
  const icon =
    iconKey === 'drafts' ? <FileText className="h-5 w-5 text-primary" /> :
    iconKey === 'submitted' ? <CircleCheck className="h-5 w-5 text-success" /> :
    iconKey === 'sent' ? <Send className="h-5 w-5 text-info" /> :
    <Clock className="h-5 w-5 text-warning" />

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClassName}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProposalAnalyticsChartBar({
  point,
  maxGenerations,
}: {
  point: ProposalAnalyticsTimeSeriesPoint
  maxGenerations: number
}) {
  const totalGenerations = point.aiGenerations + point.deckGenerations
  const totalFailures = point.aiFailures + point.deckFailures
  const height = (totalGenerations / maxGenerations) * 100
  const failureHeight = totalFailures > 0 && totalGenerations > 0 ? Math.min((totalFailures / totalGenerations) * height, height) : 0

  const barStyle = useMemo(() => ({ height: `${Math.max(height, 4)}%` }), [height])
  const failureStyle = useMemo(() => ({ height: `${failureHeight}%` }), [failureHeight])

  return (
    <div className="flex flex-1 flex-col justify-end" title={`${point.date}: ${totalGenerations} generations, ${totalFailures} failures`}>
      <div className="relative w-full rounded-t bg-accent/20 motion-chromatic hover:bg-accent/30" style={barStyle}>
        {failureHeight > 0 ? <div className="absolute inset-x-0 bottom-0 rounded-t bg-destructive/50" style={failureStyle} /> : null}
      </div>
    </div>
  )
}

function SuccessRateCard({
  averageDuration,
  description,
  failedCount,
  succeededCount,
  title,
  value,
}: {
  averageDuration: string
  description: string
  failedCount: number
  succeededCount: number
  title: string
  value: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-primary">{value}</span>
          {failedCount > 0 ? (
            <Badge variant="destructive" className="gap-1">
              <CircleX className="h-3 w-3" />
              {failedCount} failed
            </Badge>
          ) : null}
        </div>
        <Progress value={Number.parseFloat(value)} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CircleCheck className="h-3 w-3 text-success" />
            {succeededCount} succeeded
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {averageDuration} avg
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProposalAnalyticsLoadingCard() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

export function ProposalAnalyticsHeader({
  loading,
  onRefresh,
  onTimeRangeChange,
  timeRange,
}: {
  loading: boolean
  onRefresh: () => void
  onTimeRangeChange: (value: TimeRange) => void
  timeRange: TimeRange
}) {
  const handleTimeRangeChange = useCallback((value: string) => {
    onTimeRangeChange(value as TimeRange)
  }, [onTimeRangeChange])

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold">Proposal Analytics</h2>
        <p className="text-sm text-muted-foreground">Track proposal generation success rates and performance</p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
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
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} aria-label="Refresh proposal analytics">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  )
}

export function ProposalAnalyticsSummaryGrid({ summary, formatDuration }: { summary: ProposalAnalyticsSummary; formatDuration: (ms: number | null) => string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryStatCard iconKey="drafts" label="Drafts Created" toneClassName="bg-accent/10" value={summary.totalDrafts} />
      <SummaryStatCard iconKey="submitted" label="Proposals Submitted" toneClassName="bg-success/10" value={summary.totalSubmitted} />
      <SummaryStatCard iconKey="sent" label="Proposals Sent" toneClassName="bg-info/10" value={summary.totalSent} />
      <SummaryStatCard iconKey="average" label="Avg. AI Generation" toneClassName="bg-warning/10" value={formatDuration(summary.averageAiGenerationTime)} />
    </div>
  )
}

export function ProposalAnalyticsSuccessRates({
  formatDuration,
  formatPercentage,
  summary,
}: {
  formatDuration: (ms: number | null) => string
  formatPercentage: (value: number) => string
  summary: ProposalAnalyticsSummary
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SuccessRateCard
        averageDuration={formatDuration(summary.averageAiGenerationTime)}
        description={`${summary.aiGenerationsSucceeded} of ${summary.aiGenerationsAttempted} generations successful`}
        failedCount={summary.aiGenerationsFailed}
        succeededCount={summary.aiGenerationsSucceeded}
        title="AI Generation Success Rate"
        value={formatPercentage(summary.successRate)}
      />
      <SuccessRateCard
        averageDuration={formatDuration(summary.averageDeckGenerationTime)}
        description={`${summary.deckGenerationsSucceeded} of ${summary.deckGenerationsAttempted} deck generations successful`}
        failedCount={summary.deckGenerationsFailed}
        succeededCount={summary.deckGenerationsSucceeded}
        title="Deck Generation Success Rate"
        value={formatPercentage(summary.deckSuccessRate)}
      />
    </div>
  )
}

export function ProposalAnalyticsActivityChart({ chartData }: { chartData: ChartData }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Generation Activity
        </CardTitle>
        <CardDescription>AI and deck generations over the last {chartData.points.length} days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 items-end gap-1">
          {chartData.points.map((point) => (
            <ProposalAnalyticsChartBar key={point.date} point={point} maxGenerations={chartData.maxGenerations} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{chartData.points[0]?.date}</span>
          <span>{chartData.points[chartData.points.length - 1]?.date}</span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent/40" />
            Generations ({chartData.totalGenerations})
          </span>
          {chartData.totalFailures > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-destructive/50" />
              Failures ({chartData.totalFailures})
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProposalAnalyticsByClientCard({ byClient }: { byClient: ProposalAnalyticsByClient[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Proposals by Client
        </CardTitle>
        <CardDescription>Top {Math.min(byClient.length, 10)} clients by proposal count</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {byClient.slice(0, 10).map((client) => (
            <div key={client.clientId} className="flex items-center justify-between rounded-md border border-muted/40 px-3 py-2">
              <div>
                <p className="text-sm font-medium">{client.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  Last proposal:{' '}
                  {client.lastProposalAt ? (
                    <time dateTime={client.lastProposalAt} suppressHydrationWarning>
                      {new Date(client.lastProposalAt).toLocaleDateString()}
                    </time>
                  ) : 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{client.proposalCount} drafts</Badge>
                {client.submittedCount > 0 ? <Badge variant="secondary">{client.submittedCount} submitted</Badge> : null}
                {client.sentCount > 0 ? <Badge className="bg-success/10 text-success hover:bg-success/20">{client.sentCount} sent</Badge> : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ProposalAnalyticsEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted/30 p-4">
          <TriangleAlert className="h-8 w-8 text-warning/60" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No Analytics Data</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Start creating proposals to see analytics data here. Track AI generation success rates, deck creation performance, and more.
        </p>
      </CardContent>
    </Card>
  )
}
