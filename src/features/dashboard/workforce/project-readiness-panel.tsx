'use client'

import { useCallback } from 'react'

import { CalendarDays, Clock3, FileCheck2, LoaderCircle, Plus, ShieldCheck } from 'lucide-react'

import { useUrlDrivenDialog } from '@/shared/hooks/use-url-driven-dialog'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import { WorkforceDetailDialog, type WorkforceDetailFocus } from './workforce-detail-dialog'
import { WorkforceStatusBadge } from './workforce-page-shell'
import { WorkforceWidgetErrorBoundary } from './workforce-widget-error-boundary'
import { useWorkforceOverview } from './use-workforce-overview'

function ReadinessStat({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Clock3
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-muted/50 bg-background p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{helper}</p>
    </div>
  )
}

function ProjectReadinessPanelContent() {
  const {
    isLoading,
    isPreviewMode,
    snapshot,
    isCreatingShift,
    isCreatingTemplate,
    isSeeding,
    seedAllModules,
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
  const handleOpenFormsDetail = useCallback(() => {
    openValue('forms')
  }, [openValue])
  const handleAddCoverageShift = useCallback(() => {
    void addCoverageShift()
  }, [addCoverageShift])
  const handleAddChecklistTemplate = useCallback(() => {
    void addChecklistTemplate()
  }, [addChecklistTemplate])

  return (
    <Card className="border-accent/15 shadow-sm">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Delivery readiness</CardTitle>
            <WorkforceStatusBadge tone={snapshot.schedulingSummary.openCoverageGaps === '0' ? 'success' : 'warning'}>
              {snapshot.schedulingSummary.openCoverageGaps === '0' ? 'covered' : 'attention needed'}
            </WorkforceStatusBadge>
          </div>
          <CardDescription>
            Fold operational readiness into project management so launch planning stays attached to the delivery backlog.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!snapshot.hasAnyData && !isPreviewMode ? (
            <Button onClick={handleSeed} disabled={isSeeding}>
              {isSeeding ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Seed operations data
            </Button>
          ) : null}
          <Button variant="outline" onClick={handleOpenFormsDetail}>
            Open readiness detail
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-4">
          <ReadinessStat
            icon={Clock3}
            label="Clocked in now"
            value={snapshot.timeSummary.clockedInNow}
            helper={`${snapshot.timeSummary.pendingApprovals} approvals waiting before payroll handoff`}
          />
          <ReadinessStat
            icon={CalendarDays}
            label="Open coverage gaps"
            value={snapshot.schedulingSummary.openCoverageGaps}
            helper={`${snapshot.schedulingSummary.swapRequests} swap requests still need an owner decision`}
          />
          <ReadinessStat
            icon={FileCheck2}
            label="Active templates"
            value={snapshot.formsSummary.activeTemplates}
            helper={`${snapshot.formsSummary.followUpsNeeded} checklist submissions still need evidence`}
          />
          <ReadinessStat
            icon={ShieldCheck}
            label="Submission quality"
            value={snapshot.formsSummary.submissionQuality}
            helper="Use checklist completion quality as a launch-readiness proxy."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleAddCoverageShift}
            disabled={isLoading || isCreatingShift}
          >
            {isCreatingShift ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add coverage shift
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleAddChecklistTemplate}
            disabled={isLoading || isCreatingTemplate}
          >
            {isCreatingTemplate ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add readiness checklist
          </Button>
        </div>
      </CardContent>
      {dialogFocus ? (
        <WorkforceDetailDialog focus={dialogFocus} open={isOpen} onOpenChange={onOpenChange} />
      ) : null}
    </Card>
  )
}

export function ProjectReadinessPanel() {
  return (
    <WorkforceWidgetErrorBoundary
      title="Delivery readiness unavailable"
      description="Project readiness data could not load, so the project workspace is continuing without the workforce summary panel."
    >
      <ProjectReadinessPanelContent />
    </WorkforceWidgetErrorBoundary>
  )
}
