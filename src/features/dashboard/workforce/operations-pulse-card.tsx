'use client'

import { useCallback } from 'react'
import { CalendarDays, Clock3, FileText, LoaderCircle } from 'lucide-react'

import { useUrlDrivenDialog } from '@/shared/hooks/use-url-driven-dialog'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

import { WorkforceStatusBadge } from './workforce-page-shell'
import { WorkforceDetailDialog, type WorkforceDetailFocus } from './workforce-detail-dialog'
import { WorkforceWidgetErrorBoundary } from './workforce-widget-error-boundary'
import { useWorkforceOverview } from './use-workforce-overview'

function PulseMetric({
  icon: Icon,
  label,
  value,
  helper,
  onOpen,
}: {
  icon: typeof Clock3
  label: string
  value: string
  helper: string
  onOpen: () => void
}) {
  return (
    <div className="rounded-2xl border border-muted/50 bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onOpen}
          aria-label={`Open ${label} details`}
        >
          <span className="text-sm font-medium text-primary" aria-hidden>
            Open
          </span>
        </Button>
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  )
}

function OperationsPulseCardContent() {
  const {
    isLoading,
    isPreviewMode,
    snapshot,
    isSeeding,
    seedAllModules,
  } = useWorkforceOverview()
  const { activeValue: dialogFocus, isOpen, openValue, onOpenChange } = useUrlDrivenDialog<WorkforceDetailFocus>({
    paramName: 'operations',
    allowedValues: ['time', 'scheduling', 'forms'],
  })
  const handleSeed = useCallback(() => {
    void seedAllModules()
  }, [seedAllModules])
  const handleOpenTime = useCallback(() => {
    openValue('time')
  }, [openValue])
  const handleOpenScheduling = useCallback(() => {
    openValue('scheduling')
  }, [openValue])
  const handleOpenForms = useCallback(() => {
    openValue('forms')
  }, [openValue])

  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Operations pulse</CardTitle>
            <WorkforceStatusBadge tone={isPreviewMode ? 'warning' : 'neutral'}>
              {isPreviewMode ? 'preview mode' : 'embedded'}
            </WorkforceStatusBadge>
          </div>
          <CardDescription>
            Time, coverage, and checklist health integrated into the main dashboard instead of living as primary nav tabs.
          </CardDescription>
        </div>
        {!snapshot.hasAnyData && !isPreviewMode ? (
          <Button type="button" onClick={handleSeed} disabled={isSeeding} className="gap-2">
            {isSeeding ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
            Seed operations data
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div
            className="grid gap-4 lg:grid-cols-3"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label="Loading operations summary"
          >
            {['pulse-1', 'pulse-2', 'pulse-3'].map((key) => (
              <div key={key} className="space-y-3 rounded-2xl border border-muted/50 bg-muted/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-full max-w-[220px]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <PulseMetric
              icon={Clock3}
              label="Attendance"
              value={snapshot.timeSummary.clockedInNow}
              helper={`${snapshot.timeSummary.pendingApprovals} approvals pending`}
              onOpen={handleOpenTime}
            />
            <PulseMetric
              icon={CalendarDays}
              label="Coverage"
              value={snapshot.schedulingSummary.openCoverageGaps}
              helper={`${snapshot.schedulingSummary.swapRequests} swaps waiting review`}
              onOpen={handleOpenScheduling}
            />
            <PulseMetric
              icon={FileText}
              label="Checklist health"
              value={snapshot.formsSummary.activeTemplates}
              helper={`${snapshot.formsSummary.followUpsNeeded} follow-ups still blocked`}
              onOpen={handleOpenForms}
            />
          </div>
        )}
      </CardContent>
      {dialogFocus ? (
        <WorkforceDetailDialog focus={dialogFocus} open={isOpen} onOpenChange={onOpenChange} />
      ) : null}
    </Card>
  )
}

export function OperationsPulseCard() {
  return (
    <WorkforceWidgetErrorBoundary
      title="Operations pulse unavailable"
      description="Workforce summary data could not load, so the main dashboard is showing the rest of the overview without this widget."
    >
      <OperationsPulseCardContent />
    </WorkforceWidgetErrorBoundary>
  )
}
