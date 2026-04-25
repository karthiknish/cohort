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
  const claimOpenShift = useMutation(workforceApi.claimOpenShift)
  const createShiftSwapRequest = useMutation(workforceApi.createShiftSwapRequest)
  const reviewShiftSwapRequest = useMutation(workforceApi.reviewShiftSwapRequest)
  const setMyAvailability = useMutation(workforceApi.setMyAvailability)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isCreatingShift, setIsCreatingShift] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [claimingShiftId, setClaimingShiftId] = useState<string | null>(null)
  const [pendingSwapId, setPendingSwapId] = useState<string | null>(null)
  const canReview = !isPreviewMode && (user?.role === 'admin' || user?.role === 'team') && Boolean(workspaceId)

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

  const handleCreateShift = useCallback(
    async (form: { title: string; team: string; locationLabel: string; notes: string; timeLabel: string }) => {
      if (!workspaceId) {
        toast({ title: 'Workspace required', description: 'Sign in to create a coverage shift.', variant: 'destructive' })
        return
      }

      setIsCreatingShift(true)
      try {
        const result = await createCoverageShift({
          workspaceId,
          title: form.title,
          team: form.team,
          locationLabel: form.locationLabel,
          notes: form.notes,
          timeLabel: form.timeLabel,
        })
        toast({ title: 'Coverage shift created', description: `Shift ${result.legacyId} was added to the live schedule.` })
      } catch (error) {
        logError(error, 'scheduling-page:create-shift')
        toast({ title: 'Unable to create shift', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setIsCreatingShift(false)
      }
    },
    [createCoverageShift, toast, workspaceId],
  )

  const handleBlockNext8h = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Availability blocks are not saved in preview.' })
      return
    }
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to set availability.', variant: 'destructive' })
      return
    }
    setIsBlocking(true)
    const start = Date.now()
    try {
      await setMyAvailability({
        workspaceId,
        startMs: start,
        endMs: start + 8 * 60 * 60_000,
        kind: 'unavailable',
        label: 'Unavailable (dashboard block)',
      })
      toast({ title: 'Availability saved', description: 'Next 8h marked unavailable for you. Check shifts that overlap this window.' })
    } catch (error) {
      logError(error, 'scheduling-page:availability')
      toast({ title: 'Unable to save', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsBlocking(false)
    }
  }, [isPreviewMode, setMyAvailability, toast, workspaceId])

  const handleRequestSwap = useCallback(
    (shiftId: string) => {
      if (isPreviewMode) {
        toast({ title: 'Preview', description: 'Swap requests are simulated in preview mode.' })
        return
      }
      if (!workspaceId) {
        return
      }
      const to = window.prompt('Who should cover? (name)')
      if (!to?.trim()) return
      void (async () => {
        try {
          await createShiftSwapRequest({ workspaceId, shiftLegacyId: shiftId, requestedTo: to.trim() })
          toast({ title: 'Swap requested', description: 'Managers can approve or dismiss from the queue below.' })
        } catch (error) {
          logError(error, 'scheduling-page:request-swap')
          toast({ title: 'Request failed', description: asErrorMessage(error), variant: 'destructive' })
        }
      })()
    },
    [createShiftSwapRequest, isPreviewMode, toast, workspaceId],
  )

  const runSwapReview = useCallback(
    async (swapId: string, decision: 'approved' | 'blocked') => {
      if (!workspaceId) return
      setPendingSwapId(swapId)
      try {
        await reviewShiftSwapRequest({ workspaceId, swapLegacyId: swapId, decision })
        toast({ title: decision === 'approved' ? 'Swap approved' : 'Swap dismissed' })
      } catch (error) {
        logError(error, 'scheduling-page:review-swap')
        toast({ title: 'Review failed', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setPendingSwapId(null)
      }
    },
    [reviewShiftSwapRequest, toast, workspaceId],
  )

  const handleClaimShift = useCallback(
    async (shiftId: string) => {
      if (isPreviewMode) {
        setClaimingShiftId(shiftId)
        try {
          await new Promise((resolve) => setTimeout(resolve, 400))
          toast({
            title: 'Shift claimed',
            description: 'Preview: open shifts are simulated.',
          })
        } finally {
          setClaimingShiftId(null)
        }
        return
      }
      if (!workspaceId) {
        toast({ title: 'Workspace required', description: 'Sign in to claim a shift.', variant: 'destructive' })
        return
      }
      setClaimingShiftId(shiftId)
      try {
        await claimOpenShift({ workspaceId, shiftLegacyId: shiftId })
        toast({
          title: 'Shift claimed',
          description: 'You are now listed on this coverage block.',
        })
      } catch (error) {
        logError(error, 'scheduling-page:claim-shift')
        toast({ title: 'Unable to claim shift', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setClaimingShiftId(null)
      }
    },
    [claimOpenShift, isPreviewMode, toast, workspaceId],
  )

  return (
    <WorkforcePageShell
      routeId={route.id}
      title={route.title}
      description={route.description}
      icon={route.icon}
      badgeLabel="Live"
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
              onRequestSwap={handleRequestSwap}
              claimingShiftId={claimingShiftId}
            />
            <ShiftEditorDialog
              pending={isCreatingShift}
              onCreateShift={handleCreateShift}
              onBlockNext8h={!isPreviewMode && workspaceId ? handleBlockNext8h : undefined}
              blockPending={isBlocking}
            />
          </div>
          <ShiftSwapPanel
            swaps={swaps}
            canReview={canReview}
            pendingSwapId={pendingSwapId}
            onApprove={canReview ? (id) => void runSwapReview(id, 'approved') : undefined}
            onBlock={canReview ? (id) => void runSwapReview(id, 'blocked') : undefined}
          />
        </>
      ) : null}
    </WorkforcePageShell>
  )
}
