'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { workforceApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import {
  getPreviewCoverageAlerts,
  getPreviewChecklistSubmissions,
  getPreviewChecklistTemplates,
  getPreviewShiftSwaps,
  getPreviewShifts,
  getPreviewTimeSessions,
  getPreviewTimeSummary,
} from '@/lib/preview-data'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useToast } from '@/shared/ui/use-toast'

export function useWorkforceOverview() {
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const workspaceId = user?.agencyId ?? null

  const timeDashboard = useQuery(
    workforceApi.getTimeDashboard,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  )
  const schedulingDashboard = useQuery(
    workforceApi.getSchedulingDashboard,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  )
  const formsDashboard = useQuery(
    workforceApi.getFormsDashboard,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  )

  const seedTimeModule = useMutation(workforceApi.seedTimeModule)
  const seedSchedulingModule = useMutation(workforceApi.seedSchedulingModule)
  const seedFormsModule = useMutation(workforceApi.seedFormsModule)
  const clockAction = useMutation(workforceApi.clockAction)
  const createCoverageShift = useMutation(workforceApi.createCoverageShift)
  const createChecklistTemplate = useMutation(workforceApi.createChecklistTemplate)

  const [pendingClockAction, setPendingClockAction] = useState<'clockIn' | 'startBreak' | 'clockOut' | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isCreatingShift, setIsCreatingShift] = useState(false)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)

  const previewTimeSessions = getPreviewTimeSessions()
  const previewCoverageAlerts = getPreviewCoverageAlerts()
  const previewShifts = getPreviewShifts()
  const previewTemplates = getPreviewChecklistTemplates()
  const previewSubmissions = getPreviewChecklistSubmissions()
  const previewSwaps = getPreviewShiftSwaps()

  const snapshot = useMemo(() => {
    if (isPreviewMode) {
      const activeSession = previewTimeSessions.find((session) => session.status === 'clocked-in' || session.status === 'on-break') ?? null

      return {
        timeSummary: getPreviewTimeSummary(),
        schedulingSummary: {
          shiftsThisWeek: String(previewShifts.length),
          openCoverageGaps: String(previewShifts.filter((shift) => shift.status === 'open').length),
          swapRequests: String(previewSwaps.length),
          averageBlockHours: '4.5',
        },
        formsSummary: {
          activeTemplates: String(previewTemplates.length),
          submissionQuality: '91%',
          followUpsNeeded: String(previewSubmissions.filter((submission) => submission.status === 'needs-follow-up').length),
          automationReady: '4',
        },
        schedulingAlerts: previewCoverageAlerts,
        schedulingShifts: previewShifts,
        schedulingSwaps: previewSwaps,
        activeSession,
        hasAnyData: true,
      }
    }

    return {
      timeSummary: timeDashboard?.summary ?? {
        clockedInNow: '0',
        hoursThisWeek: '0.0',
        pendingApprovals: '0',
        flaggedSessions: '0',
      },
      schedulingSummary: schedulingDashboard?.summary ?? {
        shiftsThisWeek: '0',
        openCoverageGaps: '0',
        swapRequests: '0',
        averageBlockHours: '0.0',
      },
      formsSummary: formsDashboard?.summary ?? {
        activeTemplates: '0',
        submissionQuality: '0%',
        followUpsNeeded: '0',
        automationReady: '0',
      },
      schedulingAlerts: schedulingDashboard?.alerts ?? [],
      schedulingShifts: schedulingDashboard?.shifts ?? [],
      schedulingSwaps: schedulingDashboard?.swaps ?? [],
      activeSession: timeDashboard?.activeSession ?? null,
      hasAnyData: Boolean(
        (timeDashboard?.sessions.length ?? 0) > 0 ||
        (schedulingDashboard?.shifts.length ?? 0) > 0 ||
        (formsDashboard?.templates.length ?? 0) > 0,
      ),
    }
  }, [
    formsDashboard?.summary,
    formsDashboard?.templates.length,
    isPreviewMode,
    previewCoverageAlerts,
    previewShifts,
    previewSubmissions,
    previewSwaps,
    previewTemplates,
    previewTimeSessions,
    schedulingDashboard?.alerts,
    schedulingDashboard?.shifts,
    schedulingDashboard?.summary,
    schedulingDashboard?.swaps,
    timeDashboard?.activeSession,
    timeDashboard?.sessions.length,
    timeDashboard?.summary,
  ])

  const isLoading = !isPreviewMode && workspaceId !== null && (
    timeDashboard === undefined ||
    schedulingDashboard === undefined ||
    formsDashboard === undefined
  )

  const seedAllModules = async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to seed operations data.', variant: 'destructive' })
      return
    }

    setIsSeeding(true)
    try {
      const [timeResult, schedulingResult, formsResult] = await Promise.all([
        seedTimeModule({ workspaceId }),
        seedSchedulingModule({ workspaceId }),
        seedFormsModule({ workspaceId }),
      ])

      const inserted = timeResult.inserted + schedulingResult.inserted + formsResult.inserted
      toast({
        title: inserted > 0 ? 'Operations data seeded' : 'Operations data already exists',
        description: inserted > 0
          ? 'Time, scheduling, and checklist starter records were saved to Convex.'
          : 'This workspace already has operations data.',
      })
    } catch (error) {
      logError(error, 'workforce-overview:seed-all')
      toast({ title: 'Unable to seed operations data', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsSeeding(false)
    }
  }

  const runClockAction = async (action: 'clockIn' | 'startBreak' | 'clockOut') => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to update time sessions.', variant: 'destructive' })
      return
    }

    setPendingClockAction(action)
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
      logError(error, `workforce-overview:${action}`)
      toast({ title: 'Unable to update clock state', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setPendingClockAction(null)
    }
  }

  const addCoverageShift = async () => {
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
      logError(error, 'workforce-overview:create-shift')
      toast({ title: 'Unable to create shift', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsCreatingShift(false)
    }
  }

  const addChecklistTemplate = async () => {
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to create a checklist template.', variant: 'destructive' })
      return
    }

    setIsCreatingTemplate(true)
    try {
      const result = await createChecklistTemplate({
        workspaceId,
        title: 'Launch review checklist',
        category: 'Operations',
        frequency: 'Weekly',
      })
      toast({ title: 'Checklist template created', description: `Template ${result.legacyId} was saved to Convex.` })
    } catch (error) {
      logError(error, 'workforce-overview:create-template')
      toast({ title: 'Unable to create template', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setIsCreatingTemplate(false)
    }
  }

  return {
    isPreviewMode,
    workspaceId,
    isLoading,
    snapshot,
    pendingClockAction,
    isSeeding,
    isCreatingShift,
    isCreatingTemplate,
    seedAllModules,
    runClockAction,
    addCoverageShift,
    addChecklistTemplate,
  }
}
