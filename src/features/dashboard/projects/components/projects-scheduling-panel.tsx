'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'

import { CoverageWarningBanner } from '@/features/dashboard/scheduling/coverage-warning-banner'
import { ScheduleBoard } from '@/features/dashboard/scheduling/schedule-board'
import { ShiftEditorDialog } from '@/features/dashboard/scheduling/shift-editor-dialog'
import { ShiftSwapPanel } from '@/features/dashboard/scheduling/shift-swap-panel'
import { useWorkforceOverview } from '@/features/dashboard/workforce/use-workforce-overview'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

function SchedulingStat({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-2xl border border-muted/50 bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
    </div>
  )
}

export function ProjectsSchedulingPanel() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const {
    isLoading,
    isPreviewMode,
    workspaceId,
    snapshot,
    isSeeding,
    isCreatingShift,
    seedAllModules,
    addCoverageShift,
  } = useWorkforceOverview()

  const isOpen = searchParams.get('operations') === 'scheduling'
  const hasSchedulingData = snapshot.schedulingShifts.length > 0

  const handleSeedModules = useCallback(() => {
    void seedAllModules()
  }, [seedAllModules])

  const handleCreateCoverageShift = useCallback(() => {
    void addCoverageShift()
  }, [addCoverageShift])

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('operations')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  if (!isOpen) {
    return null
  }

  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="text-lg">Scheduling and coverage</CardTitle>
          <CardDescription>
            Review staffing gaps and swaps without leaving the projects workspace.
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!snapshot.hasAnyData && !isPreviewMode ? (
            <Button onClick={handleSeedModules} disabled={isSeeding}>
              {isSeeding ? 'Seeding…' : 'Seed operations data'}
            </Button>
          ) : null}
          <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={handleClose}>
            <X className="h-4 w-4" />
            Hide scheduling
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isPreviewMode && !workspaceId ? (
          <div className="rounded-2xl border border-dashed border-muted/60 bg-muted/10 p-6">
            <p className="font-medium text-foreground">Workspace sign-in required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scheduling data needs an authenticated workspace before live coverage can load.
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-muted/60 bg-muted/10 p-6">
            <p className="font-medium text-foreground">Loading scheduling data</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pulling shifts, swaps, and coverage alerts into the projects tab.
            </p>
          </div>
        ) : null}

        {(isPreviewMode || hasSchedulingData) ? (
          <>
            <div className="grid gap-4 xl:grid-cols-4">
              <SchedulingStat
                label="Shifts this week"
                value={snapshot.schedulingSummary.shiftsThisWeek}
                helper="Coverage blocks visible in the embedded board"
              />
              <SchedulingStat
                label="Open gaps"
                value={snapshot.schedulingSummary.openCoverageGaps}
                helper="Needs assignment before delivery windows"
              />
              <SchedulingStat
                label="Swap requests"
                value={snapshot.schedulingSummary.swapRequests}
                helper="Owner review still pending"
              />
              <SchedulingStat
                label="Average block"
                value={`${snapshot.schedulingSummary.averageBlockHours}h`}
                helper="Current planning baseline"
              />
            </div>

            <CoverageWarningBanner alerts={snapshot.schedulingAlerts} />

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <ScheduleBoard shifts={snapshot.schedulingShifts} />
              <ShiftEditorDialog
                pending={isCreatingShift}
                onCreateShift={handleCreateCoverageShift}
              />
            </div>

            <ShiftSwapPanel swaps={snapshot.schedulingSwaps} />
          </>
        ) : null}

        {!isPreviewMode && workspaceId && !isLoading && !hasSchedulingData ? (
          <div className="rounded-2xl border border-dashed border-muted/60 bg-muted/10 p-6">
            <p className="font-medium text-foreground">No scheduling data yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Seed the operations module to add starter shifts and a swap request inside this tab.
            </p>
            <Button className="mt-4" onClick={handleSeedModules} disabled={isSeeding}>
              {isSeeding ? 'Seeding…' : 'Seed operations data'}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
