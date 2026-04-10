'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { AlertTriangle, CalendarDays, Clock3, RefreshCw } from 'lucide-react'

import {
  getPreviewCoverageAlerts,
  getPreviewShifts,
  getPreviewShiftSwaps,
} from '@/lib/preview-data'
import { workforceApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { WORKFORCE_ROUTE_MAP } from '@/lib/workforce-routes'
import { WorkforcePageShell } from '@/features/dashboard/workforce/workforce-page-shell'
import { EmptyState, ModulePageLoadingPlaceholder } from '@/features/dashboard/home/components/dashboard-page-header'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'

import { CoverageWarningBanner } from './coverage-warning-banner'
import { ScheduleBoard } from './schedule-board'
import { ShiftEditorDialog } from './shift-editor-dialog'
import { ShiftSwapPanel } from './shift-swap-panel'

export default function SchedulingPage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const workspaceId = user?.agencyId ?? null
  const route = WORKFORCE_ROUTE_MAP.scheduling
  const schedulingDashboard = useQuery(
    workforceApi.getSchedulingDashboard,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  )
  const seedSchedulingModule = useMutation(workforceApi.seedSchedulingModule)
  const createCoverageShift = useMutation(workforceApi.createCoverageShift)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isCreatingShift, setIsCreatingShift] = useState(false)
  const [claimingShiftId, setClaimingShiftId] = useState<string | null>(null)

  const alerts = isPreviewMode ? getPreviewCoverageAlerts() : (schedulingDashboard?.alerts ?? [])
  const shifts = isPreviewMode ? getPreviewShifts() : (schedulingDashboard?.shifts ?? [])
  const swaps = isPreviewMode ? getPreviewShiftSwaps() : (schedulingDashboard?.swaps ?? [])
  const summary = isPreviewMode
    ? {
        shiftsThisWeek: String(getPreviewShifts().length),
        openCoverageGaps: '2',
        swapRequests: String(getPreviewShiftSwaps().length),
        averageBlockHours: '4.5',
      }
    : schedulingDashboard?.summary
  const isLoading = !isPreviewMode && workspaceId !== null && schedulingDashboard === undefined
  const hasLiveData = Boolean(summary && shifts.length > 0)

  const handleSeed = useCallback(async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to seed scheduling data.', variant: 'destructive' })
      return
    }

    setIsSeeding(true)
    try {
      const result = await seedSchedulingModule({ workspaceId })
      toast({
        title: result.inserted > 0 ? 'Scheduling module seeded' : 'Scheduling already configured',
        description: result.inserted > 0 ? 'Starter shifts and a swap request were written to Convex.' : 'This workspace already has scheduling records.',
      })
    } catch (error) {
      logError(error, 'scheduling-page:seed')
      toast({ title: 'Unable to seed scheduling module', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsSeeding(false)
    }
  }, [seedSchedulingModule, toast, workspaceId])

  const handleCreateShift = useCallback(async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to create a coverage shift.', variant: 'destructive' })
      return
    }

    setIsCreatingShift(true)
    try {
      const result = await createCoverageShift({
        workspaceId,
        title: 'Client escalation desk',
        team: 'Client success',
      })
      toast({ title: 'Coverage shift created', description: `Shift ${result.legacyId} was added to the live schedule.` })
    } catch (error) {
      logError(error, 'scheduling-page:create-shift')
      toast({ title: 'Unable to create shift', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsCreatingShift(false)
    }
  }, [createCoverageShift, toast, workspaceId])

  const handleCreateShiftClick = useCallback(() => {
    void handleCreateShift()
  }, [handleCreateShift])

  const handleClaimShift = useCallback(async (shiftId: string) => {
    setClaimingShiftId(shiftId)
    try {
      await new Promise((resolve) => setTimeout(resolve, 450))
      toast({
        title: 'Shift claimed',
        description: 'You are now the primary owner for this open coverage block.',
      })
    } finally {
      setClaimingShiftId(null)
    }
  }, [toast])

  return (
    <WorkforcePageShell
      routeId={route.id}
      title={route.title}
      description={route.description}
      icon={route.icon}
      badgeLabel="P0 module"
      stats={[
        { label: 'Shifts this week', value: summary?.shiftsThisWeek ?? '0', description: 'Coverage blocks configured across active pods', icon: CalendarDays },
        { label: 'Open coverage gaps', value: summary?.openCoverageGaps ?? '0', description: 'Needs staffing before review week begins', icon: AlertTriangle, variant: 'warning' },
        { label: 'Swap requests', value: summary?.swapRequests ?? '0', description: 'Requests that need owner action', icon: RefreshCw },
        { label: 'Average block', value: summary ? `${summary.averageBlockHours}h` : '0.0h', description: 'Current planning baseline for internal coverage', icon: Clock3 },
      ]}
      ctaHref="/dashboard/time"
      ctaLabel="Connect to time and attendance"
    >
      {!isPreviewMode && !workspaceId ? (
        <EmptyState
          icon={route.icon}
          title="Workspace sign-in required"
          description="Scheduling is now backed by Convex and needs an authenticated workspace to query shifts."
        />
      ) : null}

      {isLoading ? (
        <ModulePageLoadingPlaceholder message="Loading weekly shifts, swaps, and coverage alerts from your workspace." />
      ) : null}

      {!isPreviewMode && workspaceId && !isLoading && !hasLiveData ? (
        <EmptyState
          icon={route.icon}
          title="No live shifts yet"
          description="Seed the scheduling module to create baseline coverage blocks and a swap request."
          onAction={handleSeed}
          actionLabel={isSeeding ? 'Seeding...' : 'Seed scheduling module'}
          actionDisabled={isSeeding}
        />
      ) : null}

      {(isPreviewMode || hasLiveData) ? (
        <>
          <CoverageWarningBanner alerts={alerts} />
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ScheduleBoard
              shifts={shifts}
              onClaimShift={handleClaimShift}
              claimingShiftId={claimingShiftId}
            />
            <ShiftEditorDialog pending={isCreatingShift} onCreateShift={handleCreateShiftClick} />
          </div>
          <ShiftSwapPanel swaps={swaps} />
        </>
      ) : null}
    </WorkforcePageShell>
  )
}
