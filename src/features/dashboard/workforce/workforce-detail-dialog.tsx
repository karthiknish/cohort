'use client'

import { useCallback } from 'react'
import { Clock3, FileText, CalendarDays, LoaderCircle, PauseCircle, PlayCircle, Plus } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

import { WorkforceStatusBadge } from './workforce-page-shell'
import { useWorkforceOverview } from './use-workforce-overview'

export type WorkforceDetailFocus = 'time' | 'scheduling' | 'forms'

interface WorkforceDetailDialogProps {
  focus: WorkforceDetailFocus
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkforceDetailDialog({ focus, open, onOpenChange }: WorkforceDetailDialogProps) {
  const {
    isLoading,
    snapshot,
    pendingClockAction,
    isCreatingShift,
    isCreatingTemplate,
    runClockAction,
    addCoverageShift,
    addChecklistTemplate,
  } = useWorkforceOverview()

  const config = {
    time: {
      icon: Clock3,
      title: 'Time and attendance',
      description: 'Run time actions without leaving the current workflow surface.',
    },
    scheduling: {
      icon: CalendarDays,
      title: 'Scheduling and coverage',
      description: 'Resolve staffing gaps and shift coverage in place.',
    },
    forms: {
      icon: FileText,
      title: 'Forms and checklists',
      description: 'Manage checklist readiness without navigating to a dedicated module page.',
    },
  }[focus]
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <config.icon className="h-5 w-5 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        {focus === 'time' ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {snapshot.activeSession?.personName ?? 'No active session'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {snapshot.activeSession
                      ? `${snapshot.activeSession.project} • ${snapshot.activeSession.locationLabel}`
                      : 'Clock in to start an operations session from this workspace.'}
                  </p>
                </div>
                <WorkforceStatusBadge tone={snapshot.activeSession ? 'success' : 'neutral'}>
                  {snapshot.activeSession ? snapshot.activeSession.status.replace('-', ' ') : 'idle'}
                </WorkforceStatusBadge>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricBox label="Clocked in now" value={snapshot.timeSummary.clockedInNow} />
              <MetricBox label="Hours this week" value={snapshot.timeSummary.hoursThisWeek} />
              <MetricBox label="Pending approvals" value={snapshot.timeSummary.pendingApprovals} />
            </div>
            <div className="flex flex-wrap gap-2">
              {snapshot.activeSession ? (
                <>
                  <Button
                    className="gap-2"
                    onClick={handleStartBreak}
                    disabled={isLoading || pendingClockAction !== null || snapshot.activeSession.status === 'on-break'}
                  >
                    {pendingClockAction === 'startBreak' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
                    Start break
                  </Button>
                  <Button
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
        ) : null}

        {focus === 'scheduling' ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricBox label="Shifts this week" value={snapshot.schedulingSummary.shiftsThisWeek} />
              <MetricBox label="Open coverage gaps" value={snapshot.schedulingSummary.openCoverageGaps} />
              <MetricBox label="Swap requests" value={snapshot.schedulingSummary.swapRequests} />
            </div>
            <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
              <p className="font-medium text-foreground">Coverage baseline</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Average shift block is {snapshot.schedulingSummary.averageBlockHours}h. Add an open coverage block here when the delivery plan changes.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleCreateCoverageShift}
              disabled={isLoading || isCreatingShift}
            >
              {isCreatingShift ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create coverage shift
            </Button>
          </div>
        ) : null}

        {focus === 'forms' ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricBox label="Active templates" value={snapshot.formsSummary.activeTemplates} />
              <MetricBox label="Submission quality" value={snapshot.formsSummary.submissionQuality} />
              <MetricBox label="Follow-ups needed" value={snapshot.formsSummary.followUpsNeeded} />
            </div>
            <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
              <p className="font-medium text-foreground">Checklist automation</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {snapshot.formsSummary.automationReady} fields are ready for repeatable operational workflows. Create another template inline when a delivery process needs a repeatable checklist.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleCreateChecklistTemplate}
              disabled={isLoading || isCreatingTemplate}
            >
              {isCreatingTemplate ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create checklist template
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-muted/50 bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}
