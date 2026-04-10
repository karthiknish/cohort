'use client'

import { useCallback } from 'react'
import { CalendarDays, Clock3, FileText, LoaderCircle, PauseCircle, PlayCircle, Plus } from 'lucide-react'

import { useUrlDrivenDialog } from '@/shared/hooks/use-url-driven-dialog'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { WorkforceDetailDialog, type WorkforceDetailFocus } from './workforce-detail-dialog'
import { WorkforceStatusBadge } from './workforce-page-shell'
import { WorkforceWidgetErrorBoundary } from './workforce-widget-error-boundary'
import { useWorkforceOverview } from './use-workforce-overview'

function TaskOperationsPanelContent() {
  const {
    isLoading,
    isPreviewMode,
    snapshot,
    pendingClockAction,
    isCreatingShift,
    isCreatingTemplate,
    isSeeding,
    seedAllModules,
    runClockAction,
    addCoverageShift,
    addChecklistTemplate,
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
  const handleClockIn = useCallback(() => {
    void runClockAction('clockIn')
  }, [runClockAction])
  const handleStartBreak = useCallback(() => {
    void runClockAction('startBreak')
  }, [runClockAction])
  const handleClockOut = useCallback(() => {
    void runClockAction('clockOut')
  }, [runClockAction])
  const handleCreateCoverageShift = useCallback(() => {
    void addCoverageShift()
  }, [addCoverageShift])
  const handleCreateChecklistTemplate = useCallback(() => {
    void addChecklistTemplate()
  }, [addChecklistTemplate])

  return (
    <Card className="border-primary/15 bg-card">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Execution controls</CardTitle>
            <WorkforceStatusBadge tone={snapshot.activeSession ? 'success' : 'neutral'}>
              {snapshot.activeSession ? snapshot.activeSession.status.replace('-', ' ') : 'not clocked in'}
            </WorkforceStatusBadge>
          </div>
          <CardDescription>
            Bring time, coverage, and checklists into task execution instead of pushing them into separate workspace tabs.
          </CardDescription>
        </div>
        {!snapshot.hasAnyData && !isPreviewMode ? (
          <Button onClick={handleSeed} disabled={isSeeding}>
            {isSeeding ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Seed operations data
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-muted/50 bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock3 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Time state</p>
                <p className="text-sm text-muted-foreground">
                  {snapshot.activeSession
                    ? `${snapshot.activeSession.personName} • ${snapshot.activeSession.project}`
                    : 'Start an ops session while working through tasks'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary" onClick={handleOpenTime}>
              Open
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {snapshot.activeSession ? (
              <>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={handleStartBreak}
                  disabled={isLoading || pendingClockAction !== null || snapshot.activeSession.status === 'on-break'}
                >
                  {pendingClockAction === 'startBreak' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
                  Start break
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={handleClockOut}
                  disabled={isLoading || pendingClockAction !== null}
                >
                  {pendingClockAction === 'clockOut' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                  Clock out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="gap-2"
                onClick={handleClockIn}
                disabled={isLoading || pendingClockAction !== null}
              >
                {pendingClockAction === 'clockIn' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Clock in
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-muted/50 bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarDays className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Coverage gaps</p>
                <p className="text-sm text-muted-foreground">
                  {snapshot.schedulingSummary.openCoverageGaps} open blocks • {snapshot.schedulingSummary.swapRequests} swaps pending
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary" onClick={handleOpenScheduling}>
              Open
            </Button>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleCreateCoverageShift}
              disabled={isLoading || isCreatingShift}
            >
              {isCreatingShift ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create coverage shift
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-muted/50 bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Checklist readiness</p>
                <p className="text-sm text-muted-foreground">
                  {snapshot.formsSummary.activeTemplates} templates • {snapshot.formsSummary.followUpsNeeded} follow-ups blocked
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary" onClick={handleOpenForms}>
              Open
            </Button>
          </div>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={handleCreateChecklistTemplate}
              disabled={isLoading || isCreatingTemplate}
            >
              {isCreatingTemplate ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create checklist template
            </Button>
          </div>
        </div>
      </CardContent>
      {dialogFocus ? (
        <WorkforceDetailDialog focus={dialogFocus} open={isOpen} onOpenChange={onOpenChange} />
      ) : null}
    </Card>
  )
}

export function TaskOperationsPanel() {
  return (
    <WorkforceWidgetErrorBoundary
      title="Execution controls unavailable"
      description="Workforce controls could not load, so task management stays available without the operations sidebar."
    >
      <TaskOperationsPanelContent />
    </WorkforceWidgetErrorBoundary>
  )
}
