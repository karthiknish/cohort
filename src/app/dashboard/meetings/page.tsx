'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { meetingIntegrationsApi, meetingsApi, usersApi } from '@/lib/convex-api'
import { getWorkspaceId } from '@/lib/utils'

import { GoogleWorkspaceCard } from './components/google-workspace-card'
import { MeetingRoomPage } from './components/in-site-meeting-card'
import { MeetingScheduleCard } from './components/meeting-schedule-card'
import { MeetingsHeader } from './components/meetings-header'
import { QuickMeetDialog } from './components/quick-meet-dialog'
import { UpcomingMeetingsCard } from './components/upcoming-meetings-card'
import type { MeetingRecord, WorkspaceMember } from './types'
import {
  EMAIL_REGEX,
  extractRoomNameFromMeetingLink,
  hasEmail,
  isMeetingPostProcessing,
  normalizeEmail,
  parseAttendeeInput,
  toTimeValue,
} from './utils'

function getPreviewMeetingWorkspaceMembers(): WorkspaceMember[] {
  return [
    { id: 'preview-member-1', name: 'Alex Morgan', email: 'alex@cohorts.ai', role: 'Account Manager' },
    { id: 'preview-member-2', name: 'Jordan Lee', email: 'jordan@cohorts.ai', role: 'Strategist' },
    { id: 'preview-member-3', name: 'Priya Patel', email: 'priya@cohorts.ai', role: 'Growth Lead' },
    { id: 'preview-member-4', name: 'Taylor Kim', email: 'taylor@cohorts.ai', role: 'Client Partner' },
    { id: 'preview-member-5', name: 'Sam Chen', email: 'sam@cohorts.ai', role: 'Performance Marketer' },
  ]
}

function getPreviewMeetings(clientId: string | null, timezone: string): MeetingRecord[] {
  const now = typeof window === 'undefined' ? new Date('2024-01-15T12:00:00.000Z') : new Date()
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  const meetings: Array<{ clientId: string; meeting: MeetingRecord }> = [
    {
      clientId: 'preview-tech-corp',
      meeting: {
        legacyId: 'preview-meeting-1',
        providerId: 'livekit',
        title: 'Weekly Growth Sync',
        description: 'Review pacing, creative tests, and SQL quality before the Q2 push.',
        startTimeMs: now.getTime() + 2 * hour,
        endTimeMs: now.getTime() + 2 * hour + 45 * 60 * 1000,
        timezone,
        calendarEventId: 'preview-gcal-1',
        status: 'scheduled',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-growth-sync',
        roomName: 'preview-growth-sync',
        attendeeEmails: ['alex@cohorts.ai', 'jordan@cohorts.ai', 'growth@techcorp.example'],
        notesSummary: null,
        transcriptText: null,
      },
    },
    {
      clientId: 'preview-startupxyz',
      meeting: {
        legacyId: 'preview-meeting-2',
        providerId: 'livekit',
        title: 'Launch War Room',
        description: 'Creator shortlist, teaser edits, and launch-week escalation plan.',
        startTimeMs: now.getTime() + day,
        endTimeMs: now.getTime() + day + 30 * 60 * 1000,
        timezone,
        calendarEventId: null,
        status: 'in_progress',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-launch-war-room',
        roomName: 'preview-launch-war-room',
        attendeeEmails: ['priya@cohorts.ai', 'launch@startupxyz.example'],
        notesSummary: 'Key actions:\n- Lock creator roster by Friday\n- Approve 3 teaser cutdowns\n- QA waitlist onboarding flow before launch day',
        transcriptText: 'We agreed to prioritize creator deliverables, finalize the teaser cutdowns, and tighten the waitlist onboarding experience before launch week.',
      },
    },
    {
      clientId: 'preview-retail-store',
      meeting: {
        legacyId: 'preview-meeting-3',
        providerId: 'livekit',
        title: 'Retail Retention Review',
        description: 'Audit repeat purchase rate, spring promo cadence, and lifecycle email segmentation.',
        startTimeMs: now.getTime() + 2 * day + 3 * hour,
        endTimeMs: now.getTime() + 2 * day + 4 * hour,
        timezone,
        calendarEventId: 'preview-gcal-3',
        status: 'scheduled',
        meetLink: 'https://app.cohorts.app/dashboard/meetings?room=preview-retail-retention-review',
        roomName: 'preview-retail-retention-review',
        attendeeEmails: ['taylor@cohorts.ai', 'marketing@retailstore.example'],
        notesSummary: null,
        transcriptText: null,
      },
    },
  ]

  if (!clientId) {
    return meetings.map((entry) => entry.meeting)
  }

  return meetings.filter((entry) => entry.clientId === clientId).map((entry) => entry.meeting)
}

function getPreviewGoogleWorkspaceStatus() {
  const linkedAt = typeof window === 'undefined' ? new Date('2024-01-10T10:00:00.000Z') : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  return {
    connected: true,
    linkedAtMs: linkedAt.getTime(),
    scopes: ['calendar.events', 'meetings.space.created'],
  }
}

type MeetingNotificationSummary = {
  attempted: number
  sent: number
  failed: number
  skipped: number
}

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

function describeNotificationSummary(
  summary: MeetingNotificationSummary | undefined,
  builder: {
    none: string
    allSent: (sent: number, skipped: number) => string
    partial: (sent: number, failed: number, skipped: number) => string
    failed: (failed: number, skipped: number) => string
  }
): string {
  if (!summary || summary.attempted === 0) {
    return builder.none
  }

  if (summary.failed === 0) {
    return builder.allSent(summary.sent, summary.skipped)
  }

  if (summary.sent === 0) {
    return builder.failed(summary.failed, summary.skipped)
  }

  return builder.partial(summary.sent, summary.failed, summary.skipped)
}

export default function MeetingsPage() {
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
  const [attendeeInput, setAttendeeInput] = useState('')
  const [attendeeEmails, setAttendeeEmails] = useState<string[]>([])
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
  const [quickAttendeeInput, setQuickAttendeeInput] = useState('')
  const [quickAttendeeEmails, setQuickAttendeeEmails] = useState<string[]>([])
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
      : 'skip'
  ) as MeetingRecord[] | undefined

  const googleWorkspaceStatus = useQuery(
    meetingIntegrationsApi.getGoogleWorkspaceStatus,
    workspaceId && !isPreviewMode
      ? {
          workspaceId,
        }
      : 'skip'
  ) as
    | {
        connected: boolean
        linkedAtMs: number | null
        scopes: string[]
      }
    | undefined

  const workspaceMembers = useQuery(
    usersApi.listWorkspaceMembers,
    workspaceId && !isPreviewMode
      ? {
          workspaceId,
          limit: 200,
        }
      : 'skip'
  ) as WorkspaceMember[] | undefined

  const platformUsers = useQuery(
    usersApi.listAllUsers,
    workspaceId && !isPreviewMode
      ? {
          limit: 500,
        }
      : 'skip'
  ) as WorkspaceMember[] | undefined

  const disconnectGoogleWorkspace = useMutation(meetingIntegrationsApi.deleteGoogleWorkspaceIntegration)
  const updateMeetingStatus = useMutation(meetingsApi.updateStatus)
  const sharedRoomMeeting = useQuery(
    meetingsApi.getByRoomName,
    workspaceId && sharedRoomName && !isPreviewMode
      ? {
          workspaceId,
          roomName: sharedRoomName,
        }
      : 'skip'
  ) as MeetingRecord | undefined
  const previewTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', [])
  const previewMeetings = useMemo(
    () => getPreviewMeetings(selectedClientId ?? null, previewTimezone),
    [previewTimezone, selectedClientId]
  )
  const resolvedGoogleWorkspaceStatus = isPreviewMode ? getPreviewGoogleWorkspaceStatus() : googleWorkspaceStatus
  const resolvedWorkspaceMembers = useMemo(
    () => (isPreviewMode ? getPreviewMeetingWorkspaceMembers() : (workspaceMembers ?? [])),
    [isPreviewMode, workspaceMembers]
  )
  const resolvedPlatformUsers = useMemo(
    () => (isPreviewMode ? getPreviewMeetingWorkspaceMembers() : (platformUsers ?? [])),
    [isPreviewMode, platformUsers]
  )
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
        toast({
          variant: 'destructive',
          title: 'Google Workspace connection failed',
          description: message || 'Please retry the OAuth flow.',
        })
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
    [upcomingMeetings, editingMeetingId]
  )

  const scheduleRequiresGoogleWorkspace = editingMeeting ? Boolean(editingMeeting.calendarEventId) : true
  const scheduleDisabled = isPreviewMode || !canSchedule || scheduling || (scheduleRequiresGoogleWorkspace && !resolvedGoogleWorkspaceStatus?.connected)

  const getAttendeeSuggestions = useCallback((queryValue: string, selectedEmails: string[]) => {
    const workspaceList = resolvedWorkspaceMembers
    const platformList = resolvedPlatformUsers

    const mergedByEmail = new Map<string, WorkspaceMember>()
    for (const member of [...workspaceList, ...platformList]) {
      if (!hasEmail(member)) continue

      const key = normalizeEmail(member.email)
      if (!mergedByEmail.has(key)) {
        mergedByEmail.set(key, member)
      }
    }

    const members = Array.from(mergedByEmail.values())
    if (members.length === 0) {
      return []
    }

    const query = queryValue.trim().toLowerCase()
    const selected = new Set(selectedEmails.map((email) => normalizeEmail(email)))

    return members
      .filter(hasEmail)
      .filter((member) => !selected.has(normalizeEmail(member.email)))
      .filter((member) => {
        if (!query) return true
        return (
          member.name.toLowerCase().includes(query) ||
          (member.email ?? '').toLowerCase().includes(query)
        )
      })
      .slice(0, 8)
  }, [resolvedPlatformUsers, resolvedWorkspaceMembers])

  const attendeeSuggestions = useMemo(
    () => getAttendeeSuggestions(attendeeInput, attendeeEmails),
    [attendeeEmails, attendeeInput, getAttendeeSuggestions]
  )

  const quickAttendeeSuggestions = useMemo(
    () => getAttendeeSuggestions(quickAttendeeInput, quickAttendeeEmails),
    [getAttendeeSuggestions, quickAttendeeEmails, quickAttendeeInput]
  )

  const addAttendees = (entries: string[]) => {
    if (entries.length === 0) return

    setAttendeeEmails((current) => {
      const normalizedCurrent = current.map((email) => normalizeEmail(email))
      const merged = [...normalizedCurrent]

      for (const entry of entries) {
        const email = normalizeEmail(entry)
        if (!EMAIL_REGEX.test(email) || merged.includes(email)) {
          continue
        }
        merged.push(email)
      }

      return merged
    })
  }

  const commitAttendeeInput = () => {
    const parsed = parseAttendeeInput(attendeeInput)

    if (parsed.length === 0 && attendeeInput.trim().length > 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid attendee email',
        description: 'Enter a valid email or choose a teammate from suggestions.',
      })
      return
    }

    addAttendees(parsed)
    setAttendeeInput('')
  }

  const removeAttendee = (email: string) => {
    setAttendeeEmails((current) => current.filter((value) => value !== email))
  }

  const handleAttendeeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      const firstSuggestion = attendeeSuggestions[0]

      if (firstSuggestion && attendeeInput.trim().length > 0) {
        event.preventDefault()
        addSuggestedAttendee(firstSuggestion.email)
        return
      }

      event.preventDefault()
      commitAttendeeInput()
      return
    }

    if (event.key === ',' || event.key === ';') {
      event.preventDefault()
      commitAttendeeInput()
    }
  }

  const addSuggestedAttendee = (email: string) => {
    addAttendees([email])
    setAttendeeInput('')
  }

  const addQuickAttendees = (entries: string[]) => {
    if (entries.length === 0) return

    setQuickAttendeeEmails((current) => {
      const normalizedCurrent = current.map((email) => normalizeEmail(email))
      const merged = [...normalizedCurrent]

      for (const entry of entries) {
        const email = normalizeEmail(entry)
        if (!EMAIL_REGEX.test(email) || merged.includes(email)) {
          continue
        }
        merged.push(email)
      }

      return merged
    })
  }

  const commitQuickAttendeeInput = () => {
    const parsed = parseAttendeeInput(quickAttendeeInput)

    if (parsed.length === 0 && quickAttendeeInput.trim().length > 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid attendee email',
        description: 'Enter a valid email or choose a teammate from suggestions.',
      })
      return
    }

    addQuickAttendees(parsed)
    setQuickAttendeeInput('')
  }

  const removeQuickAttendee = (email: string) => {
    setQuickAttendeeEmails((current) => current.filter((value) => value !== email))
  }

  const addQuickSuggestedAttendee = (email: string) => {
    addQuickAttendees([email])
    setQuickAttendeeInput('')
  }

  const handleQuickAttendeeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      const firstSuggestion = quickAttendeeSuggestions[0]

      if (firstSuggestion && quickAttendeeInput.trim().length > 0) {
        event.preventDefault()
        addQuickSuggestedAttendee(firstSuggestion.email)
        return
      }

      event.preventDefault()
      commitQuickAttendeeInput()
      return
    }

    if (event.key === ',' || event.key === ';') {
      event.preventDefault()
      commitQuickAttendeeInput()
    }
  }

  const resetQuickMeetForm = () => {
    setQuickMeetTitle('Instant Cohorts Room')
    setQuickMeetDescription('Native Cohorts meeting launched from the dashboard')
    setQuickMeetDurationMinutes('30')
    setQuickAttendeeInput('')
    setQuickAttendeeEmails([])
  }

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

  const handleConnectGoogleWorkspace = async () => {
    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: 'Google Workspace actions are disabled while sample meeting data is active.',
      })
      return
    }

    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot connect Google Workspace integrations.',
      })
      return
    }

    if (typeof window === 'undefined') return

    const redirect = `${window.location.pathname}${window.location.search}`

    try {
      const { url } = await startGoogleWorkspaceOauth(redirect)
      window.location.href = url
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Unable to connect Google Workspace',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handleDisconnectGoogleWorkspace = async () => {
    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: 'Google Workspace actions are disabled while sample meeting data is active.',
      })
      return
    }

    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot disconnect Google Workspace integrations.',
      })
      return
    }

    if (!workspaceId) return

    try {
      await disconnectGoogleWorkspace({ workspaceId })
      toast({
        title: 'Google Workspace disconnected',
        description: 'Meeting scheduling is disabled until you reconnect.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Disconnect failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const resetScheduleForm = () => {
    setTitle('')
    setDescription('')
    setAttendeeInput('')
    setAttendeeEmails([])
    setDurationMinutes('30')
    setEditingMeetingId(null)
  }

  const handleMeetingUpdated = useCallback((updatedMeeting: MeetingRecord) => {
    setMeetingOverrides((current) => ({
      ...current,
      [updatedMeeting.legacyId]: updatedMeeting,
    }))
    setActiveInSiteMeeting((current) => (current?.legacyId === updatedMeeting.legacyId ? updatedMeeting : current))
    setRoomUrlState(updatedMeeting.roomName ?? extractRoomNameFromMeetingLink(updatedMeeting.meetLink))
  }, [setRoomUrlState])

  const resolveMeetingRecord = useCallback((meeting: MeetingRecord | null) => {
    if (!meeting) {
      return null
    }

    const pool = sharedRoomMeeting ? [sharedRoomMeeting, ...upcomingMeetings] : upcomingMeetings

    const legacyId = typeof meeting.legacyId === 'string' && meeting.legacyId.trim().length > 0 ? meeting.legacyId : null
    if (legacyId) {
      return pool.find((candidate) => candidate.legacyId === legacyId) ?? meeting
    }

    const calendarEventId =
      typeof meeting.calendarEventId === 'string' && meeting.calendarEventId.trim().length > 0 ? meeting.calendarEventId : null
    if (calendarEventId) {
      return pool.find((candidate) => candidate.calendarEventId === calendarEventId) ?? meeting
    }

    const roomName =
      (typeof meeting.roomName === 'string' && meeting.roomName.trim().length > 0 ? meeting.roomName : null)
      ?? extractRoomNameFromMeetingLink(meeting.meetLink)
    if (roomName) {
      return pool.find((candidate) => candidate.roomName === roomName) ?? meeting
    }

    const meetLink = typeof meeting.meetLink === 'string' && meeting.meetLink.trim().length > 0 ? meeting.meetLink : null
    if (meetLink) {
      return pool.find((candidate) => candidate.meetLink === meetLink) ?? meeting
    }

    const title = typeof meeting.title === 'string' ? meeting.title.trim() : ''
    const startTimeMs = Number.isFinite(meeting.startTimeMs) ? meeting.startTimeMs : null
    const endTimeMs = Number.isFinite(meeting.endTimeMs) ? meeting.endTimeMs : null
    if (title && startTimeMs && endTimeMs) {
      return (
        pool.find(
          (candidate) =>
            candidate.title === title && candidate.startTimeMs === startTimeMs && candidate.endTimeMs === endTimeMs
        ) ?? meeting
      )
    }

    return meeting
  }, [sharedRoomMeeting, upcomingMeetings])

  const resolvedActiveInSiteMeeting = useMemo(
    () => resolveMeetingRecord(activeInSiteMeeting),
    [activeInSiteMeeting, resolveMeetingRecord]
  )

  const openInSiteMeeting = useCallback((meeting: MeetingRecord) => {
    const resolvedMeeting = resolveMeetingRecord(meeting)
    setActiveInSiteMeeting(resolvedMeeting)
    setRoomUrlState(
      resolvedMeeting?.roomName ?? extractRoomNameFromMeetingLink(resolvedMeeting?.meetLink)
    )
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

  const handleStartQuickMeet = (options: {
    title: string
    description: string | null
    durationMinutes: number
    attendeeEmails: string[]
    timezone: string
  }) => {
    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: 'Meeting launch is disabled while sample data is active.',
      })
      return
    }

    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot start meetings.',
      })
      return
    }

    if (!resolvedGoogleWorkspaceStatus?.connected) {
      toast({
        variant: 'destructive',
        title: 'Google Workspace required',
        description: 'Connect Google Workspace before starting a meeting room.',
      })
      return
    }

    setQuickStarting(true)
    const quickMeetClientId = selectedClientId === undefined ? null : selectedClientId

    void fetch('/api/meetings/quick', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: options.title,
        description: options.description,
        durationMinutes: options.durationMinutes,
        attendeeEmails: options.attendeeEmails,
        timezone: options.timezone,
        clientId: quickMeetClientId,
      }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
          data?: {
            meeting?: MeetingRecord
            notificationSummary?: MeetingNotificationSummary
          }
          meeting?: MeetingRecord
          notificationSummary?: MeetingNotificationSummary
        }

        if (!response.ok || payload.success === false) {
          toast({
            variant: 'destructive',
            title: 'Meeting launch failed',
            description: payload.error || 'Unable to start meeting room',
          })
          return
        }

        const meeting = payload.data?.meeting ?? payload.meeting
        const notificationSummary = payload.data?.notificationSummary ?? payload.notificationSummary

        if (!meeting) {
          toast({
            variant: 'destructive',
            title: 'Meeting launch failed',
            description: 'The room started without a meeting record',
          })
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
        toast({
          variant: 'destructive',
          title: 'Meeting launch failed',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      })
      .finally(() => {
        setQuickStarting(false)
      })
  }

  const handleRescheduleMeeting = (meeting: MeetingRecord) => {
    setEditingMeetingId(meeting.legacyId)
    setTitle(meeting.title)
    setDescription(meeting.description ?? '')
    setMeetingDate(new Date(meeting.startTimeMs))
    setMeetingTime(toTimeValue(meeting.startTimeMs))
    setDurationMinutes(String(Math.max(15, Math.round((meeting.endTimeMs - meeting.startTimeMs) / 60_000))))
    setTimezone(meeting.timezone)
    setAttendeeInput('')
    setAttendeeEmails(meeting.attendeeEmails)
  }

  const handleCancelMeeting = (meeting: MeetingRecord) => {
    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: `"${meeting.title}" is sample data and cannot be updated.`,
      })
      return
    }

    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot cancel meetings.',
      })
      return
    }

    setCancelDialogMeeting(meeting)
  }

  const handleConfirmCancelMeeting = () => {
    const meeting = cancelDialogMeeting
    if (!meeting) return

    setCancellingMeetingId(meeting.legacyId)

    void fetch('/api/meetings/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        legacyId: meeting.legacyId,
      }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
          data?: {
            notificationSummary?: MeetingNotificationSummary
          }
        }

        if (!response.ok || payload.success === false) {
          toast({
            variant: 'destructive',
            title: 'Cancel failed',
            description: payload.error || 'Unable to cancel meeting',
          })
          return
        }

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
        toast({
          variant: 'destructive',
          title: 'Cancel failed',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      })
      .finally(() => {
        setCancellingMeetingId(null)
      })
  }

  const handleScheduleMeeting = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: 'Scheduling is disabled while sample meeting data is active.',
      })
      return
    }

    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users can view meetings but cannot schedule them.',
      })
      return
    }

    if (!meetingDate) {
      toast({
        variant: 'destructive',
        title: 'Missing date',
        description: 'Choose a meeting date before scheduling.',
      })
      return
    }

    const [hoursRaw, minutesRaw] = meetingTime.split(':')
    const parsedHours = Number(hoursRaw)
    const parsedMinutes = Number(minutesRaw)

    const start = new Date(meetingDate)
    start.setHours(parsedHours, parsedMinutes, 0, 0)
    const duration = Number(durationMinutes)
    const normalizedTitle = title.replace(/\s+/g, ' ').trim()

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(duration) ||
      duration <= 0 ||
      !Number.isFinite(parsedHours) ||
      !Number.isFinite(parsedMinutes)
    ) {
      toast({
        variant: 'destructive',
        title: 'Invalid schedule',
        description: 'Please provide a valid start time and duration.',
      })
      return
    }

    const startTimeMs = start.getTime()
    const endTimeMs = startTimeMs + duration * 60_000
    const now = Date.now()

    if (normalizedTitle.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Title too short',
        description: 'Meeting titles should be at least 3 characters long.',
      })
      return
    }

    if (normalizedTitle.length > 120) {
      toast({
        variant: 'destructive',
        title: 'Title too long',
        description: 'Meeting titles must stay within 120 characters.',
      })
      return
    }

    if (startTimeMs < now + 5 * 60_000) {
      toast({
        variant: 'destructive',
        title: 'Start time too soon',
        description: 'Schedule meetings at least 5 minutes in advance.',
      })
      return
    }

    if (startTimeMs > now + 365 * 24 * 60 * 60 * 1000) {
      toast({
        variant: 'destructive',
        title: 'Start time too far away',
        description: 'Meetings cannot be scheduled more than 12 months ahead.',
      })
      return
    }

    if (endTimeMs - startTimeMs < 10 * 60_000 || endTimeMs - startTimeMs > 8 * 60 * 60 * 1000) {
      toast({
        variant: 'destructive',
        title: 'Invalid duration',
        description: 'Meetings must be between 10 minutes and 8 hours long.',
      })
      return
    }

    if (editingMeeting?.status === 'cancelled') {
      toast({
        variant: 'destructive',
        title: 'Cannot edit cancelled meeting',
        description: 'Create a new meeting instead.',
      })
      return
    }

    setScheduling(true)

    const isEditing = Boolean(editingMeeting)
    const endpoint = isEditing ? '/api/meetings/reschedule' : '/api/meetings/schedule'
    const legacyId = editingMeeting ? editingMeeting.legacyId : undefined
    const trimmedDescription = description.trim()
    const payloadDescription = trimmedDescription.length > 0 ? trimmedDescription : null
    const schedulingClientId = selectedClientId === undefined ? null : selectedClientId

    void fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
          data?: {
            meeting?: { meetLink?: string | null }
            notificationSummary?: MeetingNotificationSummary
          }
        }

        if (!response.ok || payload.success === false) {
          toast({
            variant: 'destructive',
            title: isEditing ? 'Reschedule failed' : 'Schedule failed',
            description: payload.error || 'Unable to schedule meeting',
          })
          return
        }

        const meetLink = payload.data?.meeting?.meetLink
        const notificationSummary = payload.data?.notificationSummary

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
        toast({
          variant: 'destructive',
          title: isEditing ? 'Reschedule failed' : 'Schedule failed',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      })
      .finally(() => {
        setScheduling(false)
      })
  }

  const handleSubmitQuickMeet = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const duration = Number(quickMeetDurationMinutes)
    if (!Number.isFinite(duration) || duration < 10 || duration > 240) {
      toast({
        variant: 'destructive',
        title: 'Invalid duration',
        description: 'Quick meet duration must be between 10 and 240 minutes.',
      })
      return
    }

    const title = quickMeetTitle.trim().length > 0 ? quickMeetTitle.trim() : 'Instant Cohorts Room'
    const description = quickMeetDescription.trim().length > 0
      ? quickMeetDescription.trim()
      : null
    const typedAttendees = parseAttendeeInput(quickAttendeeInput)

    if (quickAttendeeInput.trim().length > 0 && typedAttendees.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid attendee email',
        description: 'Enter a valid email before starting the room.',
      })
      return
    }

    const attendeeEmails = Array.from(
      new Set([...quickAttendeeEmails, ...typedAttendees.map((email) => normalizeEmail(email))])
    )

    void handleStartQuickMeet({
      title,
      description,
      durationMinutes: Math.floor(duration),
      attendeeEmails,
      timezone,
    })
  }

  const handleMarkCompleted = async (legacyId: string) => {
    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: 'Sample meeting statuses cannot be updated.',
      })
      return
    }

    if (!workspaceId || !canSchedule) return

    try {
      await updateMeetingStatus({
        workspaceId,
        legacyId,
        status: 'completed',
      })
      setMeetingOverrides((current) => {
        const existingMeeting = current[legacyId] ?? upcomingMeetings.find((meeting) => meeting.legacyId === legacyId)
        if (!existingMeeting) {
          return current
        }

        return {
          ...current,
          [legacyId]: {
            ...existingMeeting,
            status: 'completed',
          },
        }
      })
      setActiveInSiteMeeting((current) => (current?.legacyId === legacyId ? { ...current, status: 'completed' } : current))
      toast({
        title: 'Meeting updated',
        description: 'Status marked as completed.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Status update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  if (resolvedActiveInSiteMeeting) {
    return (
      <div className={DASHBOARD_THEME.layout.container}>
        <MeetingRoomPage
          key={[
            resolvedActiveInSiteMeeting.legacyId,
            resolvedActiveInSiteMeeting.calendarEventId,
            resolvedActiveInSiteMeeting.roomName,
            sharedRoomName,
          ]
            .filter(Boolean)
            .join(':') || 'active-meeting'}
          meeting={resolvedActiveInSiteMeeting}
          canRecord={canSchedule && !isPreviewMode}
          onMeetingUpdated={handleMeetingUpdated}
          fallbackRoomName={sharedRoomName}
          onClose={closeMeetingRoom}
        />
      </div>
    )
  }

  if (sharedRoomName) {
    return (
      <div className={DASHBOARD_THEME.layout.container}>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-border bg-card px-5 py-4 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Meetings</p>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meeting room</h1>
              <p className="text-sm text-muted-foreground">Resolving room workspace for {sharedRoomName}.</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={closeMeetingRoom}>
            Back to meetings
          </Button>
        </div>
        <Alert>
          <AlertTitle>Loading room</AlertTitle>
          <AlertDescription>Preparing the in-site meeting workspace.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <MeetingsHeader
        googleWorkspaceConnected={Boolean(resolvedGoogleWorkspaceStatus?.connected)}
        canSchedule={canSchedule}
        quickStarting={quickStarting}
        quickMeetDisabled={isPreviewMode || !resolvedGoogleWorkspaceStatus?.connected}
        onStartQuickMeet={() => setQuickMeetDialogOpen(true)}
      />

      {isPreviewMode && (
        <Alert>
          <AlertTitle>Preview mode</AlertTitle>
          <AlertDescription>
            Meetings use sample data in preview mode. You can browse upcoming calls and open the native room workspace, but scheduling and integration actions are disabled.
          </AlertDescription>
        </Alert>
      )}

      <QuickMeetDialog
        open={quickMeetDialogOpen}
        quickStarting={quickStarting}
        title={quickMeetTitle}
        description={quickMeetDescription}
        durationMinutes={quickMeetDurationMinutes}
        timezone={timezone}
        attendeeInput={quickAttendeeInput}
        attendeeEmails={quickAttendeeEmails}
        attendeeSuggestions={quickAttendeeSuggestions}
        onOpenChange={(open) => {
          if (quickStarting) return
          setQuickMeetDialogOpen(open)
          if (!open) {
            resetQuickMeetForm()
          }
        }}
        onCancel={() => {
          if (quickStarting) return
          setQuickMeetDialogOpen(false)
          resetQuickMeetForm()
        }}
        onSubmit={handleSubmitQuickMeet}
        onTitleChange={setQuickMeetTitle}
        onDescriptionChange={setQuickMeetDescription}
        onDurationMinutesChange={setQuickMeetDurationMinutes}
        onTimezoneChange={setTimezone}
        onAttendeeInputChange={setQuickAttendeeInput}
        onAttendeeKeyDown={handleQuickAttendeeKeyDown}
        onCommitAttendeeInput={commitQuickAttendeeInput}
        onRemoveAttendee={removeQuickAttendee}
        onAddSuggestedAttendee={addQuickSuggestedAttendee}
      />

      {!canSchedule && (
        <Alert>
          <AlertTitle>Read-only access</AlertTitle>
          <AlertDescription>
            Client users can join and review meetings, but scheduling is restricted to admin and team members.
          </AlertDescription>
        </Alert>
      )}

      <GoogleWorkspaceCard
        connected={Boolean(resolvedGoogleWorkspaceStatus?.connected)}
        canSchedule={canSchedule && !isPreviewMode}
        onConnect={() => void handleConnectGoogleWorkspace()}
        onDisconnect={() => void handleDisconnectGoogleWorkspace()}
      />

      <AlertDialog
        open={Boolean(cancelDialogMeeting)}
        onOpenChange={(open) => {
          if (!open && !cancellingMeetingId) {
            setCancelDialogMeeting(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel meeting</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelDialogMeeting
                ? `Cancel "${cancelDialogMeeting.title}" and send cancellation updates to invited attendees.`
                : 'Cancel this meeting and notify invited attendees.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(cancellingMeetingId)}>Keep meeting</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancelMeeting}
              disabled={Boolean(cancellingMeetingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancellingMeetingId ? 'Cancelling...' : 'Cancel meeting'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MeetingScheduleCard
        editingMeeting={editingMeeting}
        meetingDate={meetingDate}
        meetingTime={meetingTime}
        durationMinutes={durationMinutes}
        timezone={timezone}
        title={title}
        description={description}
        attendeeInput={attendeeInput}
        attendeeEmails={attendeeEmails}
        attendeeSuggestions={attendeeSuggestions}
        scheduleRequiresGoogleWorkspace={scheduleRequiresGoogleWorkspace}
        googleWorkspaceConnected={Boolean(resolvedGoogleWorkspaceStatus?.connected)}
        scheduleDisabled={scheduleDisabled}
        scheduling={scheduling}
        onMeetingDateChange={setMeetingDate}
        onMeetingTimeChange={setMeetingTime}
        onDurationMinutesChange={setDurationMinutes}
        onTimezoneChange={setTimezone}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onAttendeeInputChange={setAttendeeInput}
        onAttendeeKeyDown={handleAttendeeKeyDown}
        onCommitAttendeeInput={commitAttendeeInput}
        onRemoveAttendee={removeAttendee}
        onAddSuggestedAttendee={addSuggestedAttendee}
        onReset={resetScheduleForm}
        onSubmit={handleScheduleMeeting}
      />

      <UpcomingMeetingsCard
        meetings={upcomingMeetings}
        canSchedule={canSchedule && !isPreviewMode}
        cancellingMeetingId={cancellingMeetingId}
        onOpenInSiteMeeting={openInSiteMeeting}
        onRescheduleMeeting={handleRescheduleMeeting}
        onCancelMeeting={(meeting) => {
          handleCancelMeeting(meeting)
        }}
        onMarkCompleted={(legacyId) => {
          void handleMarkCompleted(legacyId)
        }}
      />
    </div>
  )
}
