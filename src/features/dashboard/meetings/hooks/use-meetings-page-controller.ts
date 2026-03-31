'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { apiFetch } from '@/lib/api-client'
import { meetingIntegrationsApi, meetingsApi, usersApi } from '@/lib/convex-api'
import { notifyFailure } from '@/lib/notifications'
import { getWorkspaceId } from '@/lib/utils'

import { useMeetingAttendees } from './use-meeting-attendees'
import { describeNotificationSummary, pluralize, type MeetingNotificationSummary } from '../lib/notifications'
import {
  getPreviewGoogleWorkspaceStatus,
  getPreviewMeetingWorkspaceMembers,
  getPreviewMeetings,
} from '../lib/preview-data'
import type { MeetingRecord, WorkspaceMember } from '../types'
import {
  extractRoomNameFromMeetingLink,
  isMeetingPostProcessing,
  toTimeValue,
} from '../utils'

const MEETING_ACTION_TIMEOUT_MS = 20_000

type QuickMeetingResponse = {
  meeting?: MeetingRecord
  notificationSummary?: MeetingNotificationSummary
  data?: {
    meeting?: MeetingRecord
    notificationSummary?: MeetingNotificationSummary
  }
}

type CancelMeetingResponse = {
  notificationSummary?: MeetingNotificationSummary
  data?: {
    notificationSummary?: MeetingNotificationSummary
  }
}

type ScheduleMeetingResponse = {
  meeting?: {
    meetLink?: string | null
  }
  notificationSummary?: MeetingNotificationSummary
  data?: {
    meeting?: {
      meetLink?: string | null
    }
    notificationSummary?: MeetingNotificationSummary
  }
}

export function useMeetingsPageController() {
  const { user, startGoogleWorkspaceOauth } = useAuth()
  const { selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const workspaceId = getWorkspaceId(user)
  const canSchedule = user?.role === 'admin' || user?.role === 'team'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetingDate, setMeetingDate] = useState<Date | undefined>(undefined)
  const [meetingTime, setMeetingTime] = useState('09:00')
  const [durationMinutes, setDurationMinutes] = useState('30')
  const [timezone, setTimezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [scheduling, setScheduling] = useState(false)
  const [quickStarting, setQuickStarting] = useState(false)
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null)
  const [cancellingMeetingId, setCancellingMeetingId] = useState<string | null>(null)
  const [cancelDialogMeeting, setCancelDialogMeeting] = useState<MeetingRecord | null>(null)
  const [activeInSiteMeeting, setActiveInSiteMeeting] = useState<MeetingRecord | null>(null)
  const [meetingOverrides, setMeetingOverrides] = useState<Record<string, MeetingRecord>>({})
  const [quickMeetDialogOpen, setQuickMeetDialogOpen] = useState(false)
  const [quickMeetTitle, setQuickMeetTitle] = useState('Instant Cohorts Room')
  const [quickMeetDescription, setQuickMeetDescription] = useState('Native Cohorts meeting launched from the dashboard')
  const [quickMeetDurationMinutes, setQuickMeetDurationMinutes] = useState('30')
  const [sharedRoomName, setSharedRoomName] = useState<string | null>(null)
  const oauthHandledRef = useRef(false)

  const meetings = useQuery(
    meetingsApi.list,
    workspaceId && !isPreviewMode
      ? {
          workspaceId,
          clientId: selectedClientId ?? null,
          includePast: false,
          limit: 30,
        }
      : 'skip',
  ) as MeetingRecord[] | undefined

  const googleWorkspaceStatus = useQuery(
    meetingIntegrationsApi.getGoogleWorkspaceStatus,
    workspaceId && !isPreviewMode
      ? { workspaceId }
      : 'skip',
  ) as { connected: boolean; linkedAtMs: number | null; scopes: string[] } | undefined
  const googleWorkspaceStatusLoading = Boolean(workspaceId) && !isPreviewMode && googleWorkspaceStatus === undefined
  const upcomingMeetingsLoading = Boolean(workspaceId) && !isPreviewMode && meetings === undefined

  const workspaceMembers = useQuery(
    usersApi.listWorkspaceMembers,
    workspaceId && !isPreviewMode
      ? { workspaceId, limit: 200 }
      : 'skip',
  ) as WorkspaceMember[] | undefined

  const platformUsers = useQuery(
    usersApi.listAllUsers,
    workspaceId && !isPreviewMode
      ? { limit: 500 }
      : 'skip',
  ) as WorkspaceMember[] | undefined

  const disconnectGoogleWorkspace = useMutation(meetingIntegrationsApi.deleteGoogleWorkspaceIntegration)
  const updateMeetingStatus = useMutation(meetingsApi.updateStatus)

  const sharedRoomMeeting = useQuery(
    meetingsApi.getByRoomName,
    workspaceId && sharedRoomName && !isPreviewMode
      ? { workspaceId, roomName: sharedRoomName }
      : 'skip',
  ) as MeetingRecord | undefined

  const previewTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [])
  const previewMeetings = useMemo(
    () => getPreviewMeetings(selectedClientId ?? null, previewTimezone),
    [previewTimezone, selectedClientId],
  )
  const resolvedGoogleWorkspaceStatus = isPreviewMode ? getPreviewGoogleWorkspaceStatus() : googleWorkspaceStatus
  const resolvedWorkspaceMembers = useMemo(
    () => (isPreviewMode ? getPreviewMeetingWorkspaceMembers() : (workspaceMembers ?? [])),
    [isPreviewMode, workspaceMembers],
  )
  const resolvedPlatformUsers = useMemo(
    () => (isPreviewMode ? getPreviewMeetingWorkspaceMembers() : (platformUsers ?? [])),
    [isPreviewMode, platformUsers],
  )
  const meetingAttendees = useMeetingAttendees({
    workspaceMembers: resolvedWorkspaceMembers,
    platformUsers: resolvedPlatformUsers,
    organizerId: user?.id ?? null,
    organizerEmail: user?.email ?? null,
  })
  const scheduleAttendees = meetingAttendees.schedule
  const quickAttendees = meetingAttendees.quick

  useEffect(() => {
    if (oauthHandledRef.current || typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const oauthSuccess = searchParams.get('oauth_success') === 'true'
    const oauthError = searchParams.get('oauth_error')
    const provider = searchParams.get('provider')
    const message = searchParams.get('message')
    const roomParam = searchParams.get('room')

    setSharedRoomName(roomParam && roomParam.trim().length > 0 ? roomParam.trim() : null)

    if (!oauthSuccess && !oauthError) {
      oauthHandledRef.current = true
      return
    }

    if (provider === 'google-workspace') {
      if (oauthSuccess) {
        toast({
          title: 'Google Workspace connected',
          description: 'You can now schedule calendar-backed Cohorts meeting rooms from this tab.',
        })
      } else {
        notifyFailure({ title: 'Google Workspace connection failed', message: message || 'Please retry the OAuth flow.' })
      }
    }

    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('oauth_success')
    newUrl.searchParams.delete('oauth_error')
    newUrl.searchParams.delete('provider')
    newUrl.searchParams.delete('message')
    window.history.replaceState({}, '', newUrl.toString())

    oauthHandledRef.current = true
  }, [toast])

  const upcomingMeetings = useMemo(() => {
    const sourceMeetings = isPreviewMode ? previewMeetings : (meetings ?? [])
    const mergedMeetings = sourceMeetings.map((meeting) => meetingOverrides[meeting.legacyId] ?? meeting)
    const knownMeetingIds = new Set(mergedMeetings.map((meeting) => meeting.legacyId))

    for (const override of Object.values(meetingOverrides)) {
      if (!knownMeetingIds.has(override.legacyId) && isMeetingPostProcessing(override)) {
        mergedMeetings.unshift(override)
      }
    }

    return mergedMeetings
  }, [isPreviewMode, meetingOverrides, meetings, previewMeetings])

  const editingMeeting = useMemo(
    () => upcomingMeetings.find((meeting) => meeting.legacyId === editingMeetingId) ?? null,
    [editingMeetingId, upcomingMeetings],
  )

  const scheduleRequiresGoogleWorkspace = editingMeeting ? Boolean(editingMeeting.calendarEventId) : true
  const scheduleDisabled = isPreviewMode || !canSchedule || scheduling || googleWorkspaceStatusLoading || (scheduleRequiresGoogleWorkspace && !resolvedGoogleWorkspaceStatus?.connected)

  const scheduleAttendeeDraft = scheduleAttendees.resolveSubmission()
  const quickAttendeeDraft = quickAttendees.resolveSubmission()

  const resetQuickMeetForm = useCallback(() => {
    setQuickMeetTitle('Instant Cohorts Room')
    setQuickMeetDescription('Native Cohorts meeting launched from the dashboard')
    setQuickMeetDurationMinutes('30')
    quickAttendees.reset()
  }, [quickAttendees])

  const setRoomUrlState = useCallback((roomName: string | null) => {
    if (typeof window === 'undefined') return

    const nextUrl = new URL(window.location.href)
    if (roomName) {
      nextUrl.searchParams.set('room', roomName)
    } else {
      nextUrl.searchParams.delete('room')
    }
    window.history.replaceState({}, '', nextUrl.toString())
    setSharedRoomName(roomName)
  }, [])

  const handleConnectGoogleWorkspace = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Workspace actions are disabled while sample meeting data is active.' })
      return
    }

    if (!canSchedule) {
      notifyFailure({ title: 'Read-only access', message: 'Client users cannot connect Google Workspace integrations.' })
      return
    }

    if (typeof window === 'undefined') return
    const redirect = `${window.location.pathname}${window.location.search}`

    try {
      const { url } = await startGoogleWorkspaceOauth(redirect)
      window.location.href = url
    } catch (error) {
      notifyFailure({ title: 'Unable to connect Google Workspace', error })
    }
  }, [canSchedule, isPreviewMode, startGoogleWorkspaceOauth, toast])

  const handleDisconnectGoogleWorkspace = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Google Workspace actions are disabled while sample meeting data is active.' })
      return
    }

    if (!canSchedule) {
      notifyFailure({ title: 'Read-only access', message: 'Client users cannot disconnect Google Workspace integrations.' })
      return
    }

    if (!workspaceId) return

    try {
      await disconnectGoogleWorkspace({ workspaceId })
      toast({ title: 'Google Workspace disconnected', description: 'Meeting scheduling is disabled until you reconnect.' })
    } catch (error) {
      notifyFailure({ title: 'Disconnect failed', error })
    }
  }, [canSchedule, disconnectGoogleWorkspace, isPreviewMode, toast, workspaceId])

  const resetScheduleForm = useCallback(() => {
    setTitle('')
    setDescription('')
    scheduleAttendees.reset()
    setDurationMinutes('30')
    setEditingMeetingId(null)
  }, [scheduleAttendees])

  const handleMeetingUpdated = useCallback((updatedMeeting: MeetingRecord) => {
    setMeetingOverrides((current) => ({ ...current, [updatedMeeting.legacyId]: updatedMeeting }))
    setActiveInSiteMeeting((current) => (current?.legacyId === updatedMeeting.legacyId ? updatedMeeting : current))
    setRoomUrlState(updatedMeeting.roomName ?? extractRoomNameFromMeetingLink(updatedMeeting.meetLink))
  }, [setRoomUrlState])

  const resolveMeetingRecord = useCallback((meeting: MeetingRecord | null) => {
    if (!meeting) return null

    const pool = sharedRoomMeeting ? [sharedRoomMeeting, ...upcomingMeetings] : upcomingMeetings
    const legacyId = typeof meeting.legacyId === 'string' && meeting.legacyId.trim().length > 0 ? meeting.legacyId : null
    if (legacyId) return pool.find((candidate) => candidate.legacyId === legacyId) ?? meeting

    const calendarEventId = typeof meeting.calendarEventId === 'string' && meeting.calendarEventId.trim().length > 0 ? meeting.calendarEventId : null
    if (calendarEventId) return pool.find((candidate) => candidate.calendarEventId === calendarEventId) ?? meeting

    const roomName =
      (typeof meeting.roomName === 'string' && meeting.roomName.trim().length > 0 ? meeting.roomName : null)
      ?? extractRoomNameFromMeetingLink(meeting.meetLink)
    if (roomName) return pool.find((candidate) => candidate.roomName === roomName) ?? meeting

    const meetLink = typeof meeting.meetLink === 'string' && meeting.meetLink.trim().length > 0 ? meeting.meetLink : null
    if (meetLink) return pool.find((candidate) => candidate.meetLink === meetLink) ?? meeting

    const normalizedTitle = typeof meeting.title === 'string' ? meeting.title.trim() : ''
    const startTimeMs = Number.isFinite(meeting.startTimeMs) ? meeting.startTimeMs : null
    const endTimeMs = Number.isFinite(meeting.endTimeMs) ? meeting.endTimeMs : null
    if (normalizedTitle && startTimeMs && endTimeMs) {
      return pool.find((candidate) => (
        candidate.title === normalizedTitle && candidate.startTimeMs === startTimeMs && candidate.endTimeMs === endTimeMs
      )) ?? meeting
    }

    return meeting
  }, [sharedRoomMeeting, upcomingMeetings])

  const resolvedActiveInSiteMeeting = useMemo(
    () => resolveMeetingRecord(activeInSiteMeeting),
    [activeInSiteMeeting, resolveMeetingRecord],
  )

  const openInSiteMeeting = useCallback((meeting: MeetingRecord) => {
    const resolvedMeeting = resolveMeetingRecord(meeting)
    setActiveInSiteMeeting(resolvedMeeting)
    setRoomUrlState(resolvedMeeting?.roomName ?? extractRoomNameFromMeetingLink(resolvedMeeting?.meetLink))
  }, [resolveMeetingRecord, setRoomUrlState])

  const closeMeetingRoom = useCallback(() => {
    setActiveInSiteMeeting(null)
    setRoomUrlState(null)
  }, [setRoomUrlState])

  useEffect(() => {
    if (!sharedRoomName) return
    const nextMeeting = sharedRoomMeeting ?? upcomingMeetings.find((meeting) => meeting.roomName === sharedRoomName) ?? null
    if (!nextMeeting) return
    setActiveInSiteMeeting((current) => (current?.legacyId === nextMeeting.legacyId ? current : nextMeeting))
  }, [sharedRoomMeeting, sharedRoomName, upcomingMeetings])

  const handleStartQuickMeet = useCallback((options: {
    title: string
    description: string | null
    durationMinutes: number
    attendeeEmails: string[]
    timezone: string
  }) => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Meeting launch is disabled while sample data is active.' })
      return
    }

    if (!canSchedule) {
      notifyFailure({ title: 'Read-only access', message: 'Client users cannot start meetings.' })
      return
    }

    if (options.attendeeEmails.length === 0) {
      notifyFailure({ title: 'Add a participant', message: 'Add at least one participant before starting a room.' })
      return
    }

    if (!resolvedGoogleWorkspaceStatus?.connected) {
      notifyFailure({ title: 'Google Workspace required', message: 'Connect Google Workspace before starting a meeting room.' })
      return
    }

    setQuickStarting(true)
    const quickMeetClientId = selectedClientId === undefined ? null : selectedClientId

    void apiFetch<QuickMeetingResponse>('/api/meetings/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...options, clientId: quickMeetClientId }),
      timeoutMs: MEETING_ACTION_TIMEOUT_MS,
    })
      .then((payload) => {
        const meeting = payload.data?.meeting ?? payload.meeting
        const notificationSummary = payload.data?.notificationSummary ?? payload.notificationSummary
        if (!meeting) {
          notifyFailure({ title: 'Meeting launch failed', message: 'The room started without a meeting record.' })
          return
        }

        handleMeetingUpdated(meeting)
        setActiveInSiteMeeting(meeting)
        setRoomUrlState(meeting.roomName ?? null)
        setQuickMeetDialogOpen(false)
        resetQuickMeetForm()

        toast({
          title: 'Meeting room started',
          description: describeNotificationSummary(notificationSummary, {
            none: 'Your Cohorts room is ready. No invite emails were sent.',
            allSent: (sent, skipped) => {
              const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
              return `Your Cohorts room is ready. ${pluralize(sent, 'invite email')} sent.${skippedText}`
            },
            partial: (sent, failed, skipped) => {
              const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
              return `Your Cohorts room is ready. ${pluralize(sent, 'invite email')} sent and ${pluralize(failed, 'email delivery', 'email deliveries')} failed.${skippedText}`
            },
            failed: (failed, skipped) => {
              const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} were skipped.` : ''
              return `Your Cohorts room is ready, but ${pluralize(failed, 'invite email delivery', 'invite email deliveries')} failed.${skippedText}`
            },
          }),
        })
      })
      .catch((error) => {
        notifyFailure({ title: 'Meeting launch failed', error, fallbackMessage: 'Unable to start meeting room.' })
      })
      .finally(() => {
        setQuickStarting(false)
      })
  }, [canSchedule, handleMeetingUpdated, isPreviewMode, resetQuickMeetForm, resolvedGoogleWorkspaceStatus?.connected, selectedClientId, setRoomUrlState, toast])

  const handleRescheduleMeeting = useCallback((meeting: MeetingRecord) => {
    setEditingMeetingId(meeting.legacyId)
    setTitle(meeting.title)
    setDescription(meeting.description ?? '')
    setMeetingDate(new Date(meeting.startTimeMs))
    setMeetingTime(toTimeValue(meeting.startTimeMs))
    setDurationMinutes(String(Math.max(15, Math.round((meeting.endTimeMs - meeting.startTimeMs) / 60_000))))
    setTimezone(meeting.timezone)
    scheduleAttendees.setInput('')
    scheduleAttendees.setEmails(meeting.attendeeEmails)
  }, [scheduleAttendees])

  const handleCancelMeeting = useCallback((meeting: MeetingRecord) => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: `"${meeting.title}" is sample data and cannot be updated.` })
      return
    }

    if (!canSchedule) {
      notifyFailure({ title: 'Read-only access', message: 'Client users cannot cancel meetings.' })
      return
    }

    setCancelDialogMeeting(meeting)
  }, [canSchedule, isPreviewMode, toast])

  const handleConfirmCancelMeeting = useCallback(() => {
    const meeting = cancelDialogMeeting
    if (!meeting) return

    setCancellingMeetingId(meeting.legacyId)
    void apiFetch<CancelMeetingResponse>('/api/meetings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legacyId: meeting.legacyId }),
      timeoutMs: MEETING_ACTION_TIMEOUT_MS,
    })
      .then((payload) => {
        if (editingMeetingId === meeting.legacyId) {
          resetScheduleForm()
        }
        setCancelDialogMeeting(null)

        toast({
          title: 'Meeting cancelled',
          description: describeNotificationSummary(payload.data?.notificationSummary, {
            none: 'Meeting cancelled. No cancellation emails were sent.',
            allSent: (sent, skipped) => {
              const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
              return `Meeting cancelled. ${pluralize(sent, 'cancellation email')} sent.${skippedText}`
            },
            partial: (sent, failed, skipped) => {
              const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
              return `Meeting cancelled. ${pluralize(sent, 'cancellation email')} sent and ${pluralize(failed, 'email delivery', 'email deliveries')} failed.${skippedText}`
            },
            failed: (failed, skipped) => {
              const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} were skipped.` : ''
              return `Meeting cancelled, but ${pluralize(failed, 'cancellation email delivery', 'cancellation email deliveries')} failed.${skippedText}`
            },
          }),
        })
      })
      .catch((error) => {
        notifyFailure({ title: 'Cancel failed', error, fallbackMessage: 'Unable to cancel meeting.' })
      })
      .finally(() => {
        setCancellingMeetingId(null)
      })
  }, [cancelDialogMeeting, editingMeetingId, resetScheduleForm, toast])

  const handleScheduleMeeting = useCallback((event: { preventDefault(): void }) => {
    event.preventDefault()
    const { attendeeEmails, hasPendingInvalidInput, hasParticipants } = scheduleAttendeeDraft

    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Scheduling is disabled while sample meeting data is active.' })
      return
    }
    if (!canSchedule) {
      notifyFailure({ title: 'Read-only access', message: 'Client users can view meetings but cannot schedule them.' })
      return
    }
    if (hasPendingInvalidInput) {
      notifyFailure({ title: 'Invalid attendee email', message: 'Enter a valid email before scheduling the meeting.' })
      return
    }
    if (!hasParticipants) {
      notifyFailure({ title: 'Add a participant', message: 'Add at least one participant before scheduling a meeting.' })
      return
    }
    if (!meetingDate) {
      notifyFailure({ title: 'Missing date', message: 'Choose a meeting date before scheduling.' })
      return
    }

    const [hoursRaw, minutesRaw] = meetingTime.split(':')
    const parsedHours = Number(hoursRaw)
    const parsedMinutes = Number(minutesRaw)
    const start = new Date(meetingDate)
    start.setHours(parsedHours, parsedMinutes, 0, 0)
    const duration = Number(durationMinutes)
    const normalizedTitle = title.replace(/\s+/g, ' ').trim()

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(duration) || duration <= 0 || !Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) {
      notifyFailure({ title: 'Invalid schedule', message: 'Please provide a valid start time and duration.' })
      return
    }

    const startTimeMs = start.getTime()
    const endTimeMs = startTimeMs + duration * 60_000
    const now = Date.now()

    if (normalizedTitle.length < 3) {
      notifyFailure({ title: 'Title too short', message: 'Meeting titles should be at least 3 characters long.' })
      return
    }
    if (normalizedTitle.length > 120) {
      notifyFailure({ title: 'Title too long', message: 'Meeting titles must stay within 120 characters.' })
      return
    }
    if (startTimeMs < now + 5 * 60_000) {
      notifyFailure({ title: 'Start time too soon', message: 'Schedule meetings at least 5 minutes in advance.' })
      return
    }
    if (startTimeMs > now + 365 * 24 * 60 * 60 * 1000) {
      notifyFailure({ title: 'Start time too far away', message: 'Meetings cannot be scheduled more than 12 months ahead.' })
      return
    }
    if (endTimeMs - startTimeMs < 10 * 60_000 || endTimeMs - startTimeMs > 8 * 60 * 60 * 1000) {
      notifyFailure({ title: 'Invalid duration', message: 'Meetings must be between 10 minutes and 8 hours long.' })
      return
    }
    if (editingMeeting?.status === 'cancelled') {
      notifyFailure({ title: 'Cannot edit cancelled meeting', message: 'Create a new meeting instead.' })
      return
    }

    setScheduling(true)
    const isEditing = Boolean(editingMeeting)
    const endpoint = isEditing ? '/api/meetings/reschedule' : '/api/meetings/schedule'
    const legacyId = editingMeeting ? editingMeeting.legacyId : undefined
    const trimmedDescription = description.trim()
    const payloadDescription = trimmedDescription.length > 0 ? trimmedDescription : null
    const schedulingClientId = selectedClientId === undefined ? null : selectedClientId

    void apiFetch<ScheduleMeetingResponse>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        legacyId,
        title: normalizedTitle,
        description: payloadDescription,
        startTimeMs,
        endTimeMs,
        timezone,
        attendeeEmails,
        clientId: schedulingClientId,
      }),
      timeoutMs: MEETING_ACTION_TIMEOUT_MS,
    })
      .then((payload) => {
        const meetLink = payload.data?.meeting?.meetLink ?? payload.meeting?.meetLink
        const notificationSummary = payload.data?.notificationSummary ?? payload.notificationSummary

        if (isEditing) {
          toast({
            title: 'Meeting rescheduled',
            description: describeNotificationSummary(notificationSummary, {
              none: 'Updated details were saved. No reschedule emails were sent.',
              allSent: (sent, skipped) => {
                const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
                return `Updated details were saved and ${pluralize(sent, 'reschedule email')} sent.${skippedText}`
              },
              partial: (sent, failed, skipped) => {
                const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
                return `Updated details were saved. ${pluralize(sent, 'reschedule email')} sent and ${pluralize(failed, 'email delivery', 'email deliveries')} failed.${skippedText}`
              },
              failed: (failed, skipped) => {
                const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} were skipped.` : ''
                return `Updated details were saved, but ${pluralize(failed, 'reschedule email delivery', 'reschedule email deliveries')} failed.${skippedText}`
              },
            }),
          })
        } else {
          toast({
            title: 'Meeting scheduled',
            description: describeNotificationSummary(notificationSummary, {
              none: meetLink
                ? 'Meeting saved and your room link is ready. No invite emails were sent.'
                : 'Meeting saved successfully. No invite emails were sent.',
              allSent: (sent, skipped) => {
                const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
                const linkText = meetLink ? ' Your room link is ready.' : ''
                return `${pluralize(sent, 'invite email')} sent.${linkText}${skippedText}`
              },
              partial: (sent, failed, skipped) => {
                const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} skipped.` : ''
                const linkText = meetLink ? ' Your room link is ready.' : ''
                return `${pluralize(sent, 'invite email')} sent and ${pluralize(failed, 'email delivery', 'email deliveries')} failed.${linkText}${skippedText}`
              },
              failed: (failed, skipped) => {
                const skippedText = skipped > 0 ? ` ${pluralize(skipped, 'recipient')} were skipped.` : ''
                const linkText = meetLink ? ' Your room link is ready.' : ''
                return `Meeting saved, but ${pluralize(failed, 'invite email delivery', 'invite email deliveries')} failed.${linkText}${skippedText}`
              },
            }),
          })
        }

        resetScheduleForm()
      })
      .catch((error) => {
        notifyFailure({
          title: isEditing ? 'Reschedule failed' : 'Schedule failed',
          error,
          fallbackMessage: 'Unable to schedule meeting.',
        })
      })
      .finally(() => {
        setScheduling(false)
      })
  }, [
    canSchedule,
    description,
    durationMinutes,
    editingMeeting,
    isPreviewMode,
    meetingDate,
    meetingTime,
    resetScheduleForm,
    scheduleAttendeeDraft,
    selectedClientId,
    timezone,
    title,
    toast,
  ])

  const handleSubmitQuickMeet = useCallback((event: { preventDefault(): void }) => {
    event.preventDefault()
    const { attendeeEmails, hasPendingInvalidInput, hasParticipants } = quickAttendeeDraft
    const duration = Number(quickMeetDurationMinutes)

    if (!Number.isFinite(duration) || duration < 10 || duration > 240) {
      notifyFailure({ title: 'Invalid duration', message: 'Quick meet duration must be between 10 and 240 minutes.' })
      return
    }
    if (hasPendingInvalidInput) {
      notifyFailure({ title: 'Invalid attendee email', message: 'Enter a valid email before starting the room.' })
      return
    }
    if (!hasParticipants) {
      notifyFailure({ title: 'Add a participant', message: 'Add at least one participant before starting a room.' })
      return
    }

    const normalizedTitle = quickMeetTitle.trim().length > 0 ? quickMeetTitle.trim() : 'Instant Cohorts Room'
    const normalizedDescription = quickMeetDescription.trim().length > 0 ? quickMeetDescription.trim() : null

    void handleStartQuickMeet({
      title: normalizedTitle,
      description: normalizedDescription,
      durationMinutes: Math.floor(duration),
      attendeeEmails,
      timezone,
    })
  }, [handleStartQuickMeet, quickAttendeeDraft, quickMeetDescription, quickMeetDurationMinutes, quickMeetTitle, timezone])

  const handleMarkCompleted = useCallback(async (legacyId: string) => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Sample meeting statuses cannot be updated.' })
      return
    }

    if (!workspaceId || !canSchedule) return

    try {
      await updateMeetingStatus({ workspaceId, legacyId, status: 'completed' })
      setMeetingOverrides((current) => {
        const existingMeeting = current[legacyId] ?? upcomingMeetings.find((meeting) => meeting.legacyId === legacyId)
        if (!existingMeeting) return current
        return { ...current, [legacyId]: { ...existingMeeting, status: 'completed' } }
      })
      setActiveInSiteMeeting((current) => (current?.legacyId === legacyId ? { ...current, status: 'completed' } : current))
      toast({ title: 'Meeting updated', description: 'Status marked as completed.' })
    } catch (error) {
      notifyFailure({ title: 'Status update failed', error })
    }
  }, [canSchedule, isPreviewMode, toast, upcomingMeetings, updateMeetingStatus, workspaceId])

  return {
    isPreviewMode,
    canSchedule,
    scheduling,
    quickStarting,
    cancellingMeetingId,
    cancelDialogMeeting,
    resolvedGoogleWorkspaceStatus,
    googleWorkspaceStatusLoading,
    resolvedActiveInSiteMeeting,
    editingMeeting,
    sharedRoomName,
    title,
    description,
    meetingDate,
    meetingTime,
    durationMinutes,
    timezone,
    quickMeetDialogOpen,
    quickMeetTitle,
    quickMeetDescription,
    quickMeetDurationMinutes,
    scheduleAttendees,
    quickAttendees,
    scheduleAttendeeDraft,
    quickAttendeeDraft,
    scheduleRequiresGoogleWorkspace,
    scheduleDisabled,
    upcomingMeetings,
    upcomingMeetingsLoading,
    setTitle,
    setDescription,
    setMeetingDate,
    setMeetingTime,
    setDurationMinutes,
    setTimezone,
    setQuickMeetDialogOpen,
    setQuickMeetTitle,
    setQuickMeetDescription,
    setQuickMeetDurationMinutes,
    setCancelDialogMeeting,
    closeMeetingRoom,
    resetQuickMeetForm,
    resetScheduleForm,
    handleMeetingUpdated,
    handleConnectGoogleWorkspace,
    handleDisconnectGoogleWorkspace,
    handleSubmitQuickMeet,
    handleScheduleMeeting,
    handleRescheduleMeeting,
    handleCancelMeeting,
    handleConfirmCancelMeeting,
    handleMarkCompleted,
    openInSiteMeeting,
  }
}