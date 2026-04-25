'use client'

import { useCallback, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Clock3, ShieldCheck, TimerReset, Users } from 'lucide-react'

import {
  getPreviewCoverageAlerts,
  getPreviewTimeSessions,
  getPreviewTimeSummary,
} from '@/lib/preview-data'
import { workforceApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { WORKFORCE_ROUTE_MAP } from '@/lib/workforce-routes'
import { WorkforcePageShell } from '@/features/dashboard/workforce/workforce-page-shell'
import type { CoverageAlert } from '@/types/workforce'
import { EmptyState, ModulePageLoadingPlaceholder } from '@/features/dashboard/home/components/dashboard-page-header'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'

import { ClockHistoryPanel } from './clock-history-panel'
import { ClockSessionMap } from './clock-session-map'
import { TimeClockCard } from './time-clock-card'
import { TimesheetTable } from './timesheet-table'

export default function TimePage() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const workspaceId = user?.agencyId ?? null
  const route = WORKFORCE_ROUTE_MAP.time
  const timeDashboard = useQuery(
    workforceApi.getTimeDashboard,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  )
  const seedTimeModule = useMutation(workforceApi.seedTimeModule)
  const clockAction = useMutation(workforceApi.clockAction)
  const submitTimeSessionReview = useMutation(workforceApi.submitTimeSessionReview)
  const [pendingAction, setPendingAction] = useState<'clockIn' | 'startBreak' | 'clockOut' | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null)

  const summary = isPreviewMode ? getPreviewTimeSummary() : timeDashboard?.summary
  const sessions = isPreviewMode ? getPreviewTimeSessions() : (timeDashboard?.sessions ?? [])
  const alerts: CoverageAlert[] = isPreviewMode ? getPreviewCoverageAlerts() : (timeDashboard?.alerts ?? [])
  const activeSession = isPreviewMode
    ? getPreviewTimeSessions().find((session) => session.status === 'clocked-in' || session.status === 'on-break') ?? null
    : (timeDashboard?.activeSession ?? null)
  const isLoading = !isPreviewMode && workspaceId !== null && timeDashboard === undefined
  const hasLiveData = Boolean(summary && sessions.length > 0)
  const isClockInBlocked = !activeSession && alerts.some((alert) => alert.severity === 'critical')
  const clockInBlockedReason = isClockInBlocked
    ? 'Clock-in is temporarily locked until critical time approvals are resolved.'
    : undefined
  const canReviewTime =
    !isPreviewMode &&
    (user?.role === 'admin' || user?.role === 'team') &&
    Boolean(workspaceId)

  const handleSeed = useCallback(async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to seed operational time data.', variant: 'destructive' })
      return
    }

    setIsSeeding(true)
    try {
      const result = await seedTimeModule({ workspaceId })
      toast({
        title: result.inserted > 0 ? 'Time module seeded' : 'Time module already seeded',
        description: result.inserted > 0 ? 'Sample sessions were written to Convex for this workspace.' : 'This workspace already has time sessions.',
      })
    } catch (error) {
      logError(error, 'time-page:seed')
      toast({ title: 'Unable to seed time module', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsSeeding(false)
    }
  }, [seedTimeModule, toast, workspaceId])

  const handleClockAction = useCallback(async (action: 'clockIn' | 'startBreak' | 'clockOut') => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to update time sessions.', variant: 'destructive' })
      return
    }

    setPendingAction(action)
    try {
      const result = await clockAction({
        workspaceId,
        action,
        project: 'Agency operations',
        locationLabel: 'HQ · Bengaluru',
      })
      toast({
        title: action === 'clockOut' ? 'Clocked out' : action === 'startBreak' ? 'Break started' : 'Clocked in',
        description: `Session ${result.legacyId} is now ${result.status}.`,
      })
    } catch (error) {
      logError(error, `time-page:${action}`)
      toast({ title: 'Unable to update clock state', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setPendingAction(null)
    }
  }, [clockAction, toast, workspaceId])

  const handleClockIn = useCallback(() => {
    void handleClockAction('clockIn')
  }, [handleClockAction])

  const handleStartBreak = useCallback(() => {
    void handleClockAction('startBreak')
  }, [handleClockAction])

  const handleClockOut = useCallback(() => {
    void handleClockAction('clockOut')
  }, [handleClockAction])

  const handleTimeReview = useCallback(
    async (sessionId: string, decision: 'approve' | 'reject' | 'flag') => {
      if (!workspaceId) return
      setPendingReviewId(sessionId)
      try {
        await submitTimeSessionReview({ workspaceId, sessionLegacyId: sessionId, decision })
        toast({
          title: decision === 'approve' ? 'Session approved' : decision === 'reject' ? 'Session rejected' : 'Session flagged',
        })
      } catch (error) {
        logError(error, 'time-page:review')
        toast({ title: 'Review failed', description: asErrorMessage(error), variant: 'destructive' })
      } finally {
        setPendingReviewId(null)
      }
    },
    [submitTimeSessionReview, toast, workspaceId],
  )

  return (
    <WorkforcePageShell
      routeId={route.id}
      title={route.title}
      description={route.description}
      icon={route.icon}
      badgeLabel="Live"
      stats={[
        { label: 'Clocked in now', value: summary?.clockedInNow ?? '0', description: 'Live sessions across active delivery pods', icon: Users, variant: 'success' },
        { label: 'Hours this week', value: summary?.hoursThisWeek ?? '0.0', description: isPreviewMode ? 'Preview total for internal ops reporting' : 'Realtime total for the current workspace week', icon: Clock3 },
        { label: 'Pending approvals', value: summary?.pendingApprovals ?? '0', description: 'Sessions waiting for manager review', icon: ShieldCheck, variant: 'warning' },
        { label: 'Flagged sessions', value: summary?.flaggedSessions ?? '0', description: 'Location or duration issues to inspect', icon: TimerReset, variant: 'destructive' },
      ]}
    >
      {!isPreviewMode && !workspaceId ? (
        <EmptyState
          icon={route.icon}
          title="Workspace sign-in required"
          description="Time tracking is wired to Convex and needs an authenticated workspace before querying live sessions."
        />
      ) : null}

      {isLoading ? (
        <ModulePageLoadingPlaceholder message="Loading time sessions and attendance data from your workspace." />
      ) : null}

      {!isPreviewMode && workspaceId && !isLoading && !hasLiveData ? (
        <EmptyState
          icon={route.icon}
          title="No live time sessions yet"
          description="Seed the time module to create starter sessions and validate the live Convex flow."
          onAction={handleSeed}
          actionLabel={isSeeding ? 'Seeding...' : 'Seed time module'}
          actionDisabled={isSeeding}
        />
      ) : null}

      {(isPreviewMode || hasLiveData) ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <TimeClockCard
              activeSession={activeSession}
              pendingAction={pendingAction}
              isClockInBlocked={isClockInBlocked}
              clockInBlockedReason={clockInBlockedReason}
              onClockIn={handleClockIn}
              onStartBreak={handleStartBreak}
              onClockOut={handleClockOut}
            />
            <ClockSessionMap sessions={sessions} />
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <TimesheetTable
              sessions={sessions}
              canReview={canReviewTime}
              pendingSessionId={pendingReviewId}
              onReview={canReviewTime ? handleTimeReview : undefined}
            />
            <ClockHistoryPanel alerts={alerts} />
          </div>
        </>
      ) : null}
    </WorkforcePageShell>
  )
}
