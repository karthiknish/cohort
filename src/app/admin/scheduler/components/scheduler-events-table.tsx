"use client"

import { Loader2, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

import { SchedulerEvent, SchedulerEventsState } from './use-scheduler-events'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) {
    return 'Unknown'
  }
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.round(diffMs / (60 * 1000))
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ago`
}

function formatDuration(ms: number | null): string {
  if (ms === null || Number.isNaN(ms)) {
    return '—'
  }
  if (ms < 1000) {
    return `${ms}ms`
  }
  const seconds = ms / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  if (minutes < 60) {
    return `${minutes}m ${Math.round(remainder)}s`
  }
  const hours = Math.floor(minutes / 60)
  const remainderMinutes = minutes % 60
  return `${hours}h ${remainderMinutes}m`
}

function severityVariant(severity: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity) {
    case 'critical':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'info':
    default:
      return 'outline'
  }
}

function statusSummary(event: SchedulerEvent): string {
  const parts: string[] = []
  parts.push(`${event.processedJobs} processed`)
  if (event.failedJobs > 0) {
    parts.push(`${event.failedJobs} failed`)
  }
  if (event.hadQueuedJobs && event.processedJobs === 0) {
    parts.push('stalled queue')
  }
  return parts.join(' · ')
}

type SchedulerEventsTableProps = {
  state: SchedulerEventsState
}

export function SchedulerEventsTable({ state }: SchedulerEventsTableProps) {
  const { toast } = useToast()
  const {
    events,
    hasEvents,
    isLoading,
    isRefreshing,
    isEndReached,
    errorMessage,
    fetchMore,
    refresh,
    filters,
    updateFilters,
    uniqueSeverities,
    uniqueSources,
  } = state

  useEffect(() => {
    if (errorMessage) {
      toast({
        title: 'Scheduler error',
        description: errorMessage,
        variant: 'destructive',
      })
    }
  }, [errorMessage, toast])

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Scheduler events</h2>
            <p className="text-sm text-muted-foreground">Latest cron and worker runs with processing stats.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={filters.severity ?? 'all'}
              onValueChange={(value) => updateFilters({ severity: value === 'all' ? undefined : value, source: filters.source })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                {uniqueSeverities.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {severity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.source ?? 'all'}
              onValueChange={(value) => updateFilters({ severity: filters.severity, source: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {uniqueSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" size="sm" variant="outline" onClick={() => {
              toast({ title: 'Refreshing events', description: 'Checking for new scheduler activity...' })
              refresh()
            }} disabled={isRefreshing}>
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        {isLoading && !hasEvents ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm">Loading scheduler activity…</span>
          </div>
        ) : errorMessage ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : !hasEvents ? (
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-muted/60 text-sm text-muted-foreground">
            No scheduler activity recorded yet.
          </div>
        ) : (
          <ScrollArea className="max-h-[520px]">
            <table className="w-full table-auto border-separate border-spacing-y-2 text-left text-sm">
              <thead className="sticky top-0 bg-background">
                <tr>
                  <th className="px-3 py-2 font-medium text-muted-foreground">When</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Source</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Operation</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Summary</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Duration</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Severity</th>
                  <th className="px-3 py-2 font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="rounded-md bg-muted/30 align-top text-xs text-foreground">
                    <td className="px-3 py-2 font-medium text-foreground">{formatRelativeTime(event.createdAt)}</td>
                    <td className="px-3 py-2 capitalize">{event.source}</td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-foreground">{event.operation ?? '—'}</span>
                      {event.errors.length > 0 ? (
                        <div className="mt-1 text-xs text-destructive">{event.errors[0]}</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-foreground">{statusSummary(event)}</td>
                    <td className="px-3 py-2 text-foreground">{formatDuration(event.durationMs)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={severityVariant(event.severity)}>{event.severity}</Badge>
                    </td>
                    <td className="px-3 py-2">
                        {event.notes ? <p className="max-w-[240px] truncate text-muted-foreground">{event.notes}</p> : '—'}
                        {event.hadQueuedJobs && event.inspectedQueuedJobs ? (
                        <p className="text-muted-foreground">Queued observed: {event.inspectedQueuedJobs}</p>
                      ) : null}
                        {event.providerFailureThresholds.length > 0 ? (
                          <p className="max-w-[260px] text-xs text-muted-foreground">
                            {event.providerFailureThresholds
                              .map((entry) => `${entry.providerId}: ${entry.failedJobs}/${entry.threshold ?? 'default'}`)
                              .join(', ')}
                          </p>
                        ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}

        {hasEvents && !isEndReached && (
          <div className="flex justify-center">
            <Button type="button" size="sm" variant="ghost" onClick={fetchMore} disabled={isRefreshing}>
              {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isRefreshing ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
