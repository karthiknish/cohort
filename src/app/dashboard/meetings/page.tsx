'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { format } from 'date-fns'
import { CalendarPlus, CalendarDays, X } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme'
import { meetingIntegrationsApi, meetingsApi, usersApi } from '@/lib/convex-api'
import { cn, getWorkspaceId } from '@/lib/utils'

import { GoogleWorkspaceCard } from './components/google-workspace-card'
import { InSiteMeetingCard } from './components/in-site-meeting-card'
import { MeetingsHeader } from './components/meetings-header'
import { UpcomingMeetingsCard } from './components/upcoming-meetings-card'
import type { MeetingRecord, WorkspaceMember } from './types'
import {
  EMAIL_REGEX,
  TIME_OPTIONS,
  buildInSiteMeetingUrl,
  hasEmail,
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
        providerId: 'google-workspace',
        title: 'Weekly Growth Sync',
        description: 'Review pacing, creative tests, and SQL quality before the Q2 push.',
        startTimeMs: now.getTime() + 2 * hour,
        endTimeMs: now.getTime() + 2 * hour + 45 * 60 * 1000,
        timezone,
        calendarEventId: 'preview-gcal-1',
        status: 'scheduled',
        meetLink: 'https://meet.jit.si/cohorts-preview-growth-sync',
        attendeeEmails: ['alex@cohorts.ai', 'jordan@cohorts.ai', 'growth@techcorp.example'],
        notesSummary: null,
        transcriptText: null,
      },
    },
    {
      clientId: 'preview-startupxyz',
      meeting: {
        legacyId: 'preview-meeting-2',
        providerId: 'in-site',
        title: 'Launch War Room',
        description: 'Creator shortlist, teaser edits, and launch-week escalation plan.',
        startTimeMs: now.getTime() + day,
        endTimeMs: now.getTime() + day + 30 * 60 * 1000,
        timezone,
        calendarEventId: null,
        status: 'in_progress',
        meetLink: 'https://meet.jit.si/cohorts-preview-launch-war-room',
        attendeeEmails: ['priya@cohorts.ai', 'launch@startupxyz.example'],
        notesSummary: 'Key actions:\n- Lock creator roster by Friday\n- Approve 3 teaser cutdowns\n- QA waitlist onboarding flow before launch day',
        transcriptText: 'We agreed to prioritize creator deliverables, finalize the teaser cutdowns, and tighten the waitlist onboarding experience before launch week.',
      },
    },
    {
      clientId: 'preview-retail-store',
      meeting: {
        legacyId: 'preview-meeting-3',
        providerId: 'google-workspace',
        title: 'Retail Retention Review',
        description: 'Audit repeat purchase rate, spring promo cadence, and lifecycle email segmentation.',
        startTimeMs: now.getTime() + 2 * day + 3 * hour,
        endTimeMs: now.getTime() + 2 * day + 4 * hour,
        timezone,
        calendarEventId: 'preview-gcal-3',
        status: 'scheduled',
        meetLink: 'https://meet.jit.si/cohorts-preview-retail-retention-review',
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

export default function MeetingsPage() {
  const { user } = useAuth()
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
  const [activeInSiteMeeting, setActiveInSiteMeeting] = useState<MeetingRecord | null>(null)
  const [activeInSiteUrl, setActiveInSiteUrl] = useState<string | null>(null)
  const [quickMeetDialogOpen, setQuickMeetDialogOpen] = useState(false)
  const [quickMeetTitle, setQuickMeetTitle] = useState('Quick Meet')
  const [quickMeetDescription, setQuickMeetDescription] = useState('Instant in-site quick meeting')
  const [quickMeetDurationMinutes, setQuickMeetDurationMinutes] = useState('30')
  const [quickAttendeeInput, setQuickAttendeeInput] = useState('')
  const [quickAttendeeEmails, setQuickAttendeeEmails] = useState<string[]>([])
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
  const workspaceIdForRoom = workspaceId ?? 'preview-workspace'

  useEffect(() => {
    if (oauthHandledRef.current || typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const oauthSuccess = searchParams.get('oauth_success') === 'true'
    const oauthError = searchParams.get('oauth_error')
    const provider = searchParams.get('provider')
    const message = searchParams.get('message')

    if (!oauthSuccess && !oauthError) {
      oauthHandledRef.current = true
      return
    }

    if (provider === 'google-workspace') {
      if (oauthSuccess) {
        toast({
          title: 'Google Workspace connected',
          description: 'You can now schedule Google Meet meetings from this tab.',
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

  const upcomingMeetings = useMemo(
    () => (isPreviewMode ? previewMeetings : (meetings ?? [])),
    [isPreviewMode, meetings, previewMeetings]
  )

  const editingMeeting = useMemo(
    () => upcomingMeetings.find((meeting) => meeting.legacyId === editingMeetingId) ?? null,
    [upcomingMeetings, editingMeetingId]
  )

  const scheduleRequiresGoogleWorkspace = editingMeeting ? editingMeeting.providerId === 'google-workspace' : true
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
    setQuickMeetTitle('Quick Meet')
    setQuickMeetDescription('Instant in-site quick meeting')
    setQuickMeetDurationMinutes('30')
    setQuickAttendeeInput('')
    setQuickAttendeeEmails([])
  }

  const handleConnectGoogleWorkspace = () => {
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

    void fetch(
      `/api/integrations/google-workspace/oauth/url?redirect=${encodeURIComponent(redirect)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    )
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean
          data?: { url?: string }
          url?: string
          error?: string
        }

        let oauthUrl: string | undefined
        if (payload.data && typeof payload.data.url === 'string') {
          oauthUrl = payload.data.url
        } else if (typeof payload.url === 'string') {
          oauthUrl = payload.url
        }

        if (!response.ok || !oauthUrl) {
          toast({
            variant: 'destructive',
            title: 'Unable to connect Google Workspace',
            description:
              typeof payload.error === 'string'
                ? payload.error
                : 'Failed to start Google Workspace OAuth flow',
          })
          return
        }

        window.location.href = oauthUrl
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Unable to connect Google Workspace',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      })
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

  const openInSiteMeeting = (meeting: MeetingRecord) => {
    const url = buildInSiteMeetingUrl(workspaceIdForRoom, meeting)
    setActiveInSiteMeeting(meeting)
    setActiveInSiteUrl(url)
  }

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
        description: 'Quick Meet is disabled while sample meeting data is active.',
      })
      return
    }

    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot start quick meetings.',
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
            inSiteEmbedUrl?: string | null
          }
          meeting?: MeetingRecord
          inSiteEmbedUrl?: string | null
        }

        if (!response.ok || payload.success === false) {
          toast({
            variant: 'destructive',
            title: 'Quick meet failed',
            description: payload.error || 'Unable to start quick meet',
          })
          return
        }

        const meeting = payload.data?.meeting ?? payload.meeting
        const inSiteEmbedUrl = payload.data?.inSiteEmbedUrl ?? payload.inSiteEmbedUrl ??
          (meeting ? buildInSiteMeetingUrl(workspaceId, meeting) : null)

        if (!meeting) {
          toast({
            variant: 'destructive',
            title: 'Quick meet failed',
            description: 'Quick meet was created without a meeting record',
          })
          return
        }

        if (inSiteEmbedUrl) {
          setActiveInSiteMeeting(meeting)
          setActiveInSiteUrl(inSiteEmbedUrl)
          setQuickMeetDialogOpen(false)
          resetQuickMeetForm()
        } else {
          setActiveInSiteMeeting(null)
          setActiveInSiteUrl(null)
          toast({
            variant: 'destructive',
            title: 'Room link missing',
            description: 'Quick meet was created but no in-site room URL was returned.',
          })
          return
        }

        toast({
          title: 'Quick meet started',
          description: 'In-site meeting room is now open. Attendees were notified by email.',
        })
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Quick meet failed',
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

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Cancel meeting "${meeting.title}"?`)
      if (!confirmed) {
        return
      }
    }

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

        toast({
          title: 'Meeting cancelled',
          description: 'Attendees received a cancellation email.',
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
        title,
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

        if (isEditing) {
          toast({
            title: 'Meeting rescheduled',
            description: 'Updated details were saved and attendees were notified.',
          })
        } else {
          toast({
            title: 'Meeting scheduled',
            description: meetLink
              ? 'Invites were sent and your Google Meet link is ready.'
              : 'Meeting saved successfully.',
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

    const title = quickMeetTitle.trim().length > 0 ? quickMeetTitle.trim() : 'Quick Meet'
    const description = quickMeetDescription.trim().length > 0
      ? quickMeetDescription.trim()
      : null
    const typedAttendees = parseAttendeeInput(quickAttendeeInput)

    if (quickAttendeeInput.trim().length > 0 && typedAttendees.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid attendee email',
        description: 'Enter a valid email before starting the quick meet.',
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

  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <MeetingsHeader
        googleWorkspaceConnected={Boolean(resolvedGoogleWorkspaceStatus?.connected)}
        canSchedule={canSchedule}
        quickStarting={quickStarting}
        quickMeetDisabled={isPreviewMode}
        onStartQuickMeet={() => setQuickMeetDialogOpen(true)}
      />

      {isPreviewMode && (
        <Alert>
          <AlertTitle>Preview mode</AlertTitle>
          <AlertDescription>
            Meetings use sample data in preview mode. You can browse upcoming calls and open the in-site room, but scheduling and integration actions are disabled.
          </AlertDescription>
        </Alert>
      )}

      <Dialog
        open={quickMeetDialogOpen}
        onOpenChange={(open) => {
          if (quickStarting) return
          setQuickMeetDialogOpen(open)
          if (!open) {
            resetQuickMeetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start In-Site Quick Meet</DialogTitle>
            <DialogDescription>
              Add participants, launch the meeting in-app, and enable transcript-based AI notes.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmitQuickMeet}>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="quick-meet-title" className="text-sm font-medium">Title</label>
              <Input
                id="quick-meet-title"
                required
                value={quickMeetTitle}
                onChange={(event) => setQuickMeetTitle(event.target.value)}
                placeholder="Quick Meet"
                disabled={quickStarting}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="quick-meet-description" className="text-sm font-medium">Description</label>
              <Textarea
                id="quick-meet-description"
                rows={3}
                value={quickMeetDescription}
                onChange={(event) => setQuickMeetDescription(event.target.value)}
                placeholder="What this quick meet is for"
                disabled={quickStarting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quick-meet-duration" className="text-sm font-medium">Duration (minutes)</label>
              <Input
                id="quick-meet-duration"
                type="number"
                min={10}
                max={240}
                step={5}
                required
                value={quickMeetDurationMinutes}
                onChange={(event) => setQuickMeetDurationMinutes(event.target.value)}
                disabled={quickStarting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quick-meet-timezone" className="text-sm font-medium">Timezone</label>
              <Input
                id="quick-meet-timezone"
                required
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="America/New_York"
                disabled={quickStarting}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="quick-attendees-input" className="text-sm font-medium">Invite Users</label>
              <div className="rounded-md border border-input bg-background p-2">
                {quickAttendeeEmails.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {quickAttendeeEmails.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-1 pr-1">
                        {email}
                        <button
                          type="button"
                          onClick={() => removeQuickAttendee(email)}
                          disabled={quickStarting}
                          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mb-2 px-1 text-xs text-muted-foreground">
                    Add people by selecting users below or typing email addresses.
                  </p>
                )}

                <div className="flex gap-2">
                  <Input
                    id="quick-attendees-input"
                    value={quickAttendeeInput}
                    onChange={(event) => setQuickAttendeeInput(event.target.value)}
                    onKeyDown={handleQuickAttendeeKeyDown}
                    placeholder="Type name or email and press Enter"
                    disabled={quickStarting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={commitQuickAttendeeInput}
                    disabled={quickStarting || quickAttendeeInput.trim().length === 0}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {quickAttendeeSuggestions.length > 0 && (
                <div className="rounded-md border border-muted/60 bg-muted/20 p-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Suggested Platform Users
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickAttendeeSuggestions.map((member) => (
                      <Button
                        key={member.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addQuickSuggestedAttendee(member.email)}
                        disabled={quickStarting}
                        className="h-auto py-1.5 text-left"
                      >
                        <span className="flex flex-col items-start leading-tight">
                          <span className="text-xs font-medium">{member.name}</span>
                          <span className="text-[11px] text-muted-foreground">{member.email}</span>
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Use Enter, Tab, comma, or semicolon to add typed emails. Your own account is auto-added.
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Button type="submit" className={getButtonClasses('primary')} disabled={quickStarting}>
                  {quickStarting ? 'Starting...' : 'Start In-Site Quick Meet'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={getButtonClasses('outline')}
                  onClick={() => {
                    if (quickStarting) return
                    setQuickMeetDialogOpen(false)
                    resetQuickMeetForm()
                  }}
                  disabled={quickStarting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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

      {activeInSiteMeeting && activeInSiteUrl && (
        <InSiteMeetingCard
          key={activeInSiteMeeting.legacyId}
          meeting={activeInSiteMeeting}
          inSiteUrl={activeInSiteUrl}
          canRecord={canSchedule && !isPreviewMode}
          onClose={() => {
            setActiveInSiteMeeting(null)
            setActiveInSiteUrl(null)
          }}
        />
      )}

      <Card className="border-muted/70 bg-background shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-4 w-4" />
            {editingMeeting ? 'Reschedule Meeting' : 'Schedule Meeting'}
          </CardTitle>
          <CardDescription>
            {editingMeeting
              ? 'Update time, attendees, and details. Branded reschedule emails are sent automatically.'
              : 'Creates a Calendar invite, sends branded emails, and stores transcript-ready metadata.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduleRequiresGoogleWorkspace && !resolvedGoogleWorkspaceStatus?.connected && (
            <Alert className="mb-4">
              <AlertTitle>Google Workspace required</AlertTitle>
              <AlertDescription>
                Connect Google Workspace to create or reschedule calendar-backed meetings.
              </AlertDescription>
            </Alert>
          )}

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleScheduleMeeting}>
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="schedule-title" className="text-sm font-medium">Title</label>
              <Input
                id="schedule-title"
                required
                disabled={scheduleDisabled}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Weekly client strategy sync"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="schedule-description" className="text-sm font-medium">Description</label>
              <Textarea
                id="schedule-description"
                rows={3}
                disabled={scheduleDisabled}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Agenda, links, and expected outcomes"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="schedule-date" className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="schedule-date"
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !meetingDate && 'text-muted-foreground'
                    )}
                    disabled={scheduleDisabled}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {meetingDate ? format(meetingDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={meetingDate}
                    onSelect={setMeetingDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="schedule-start-time" className="text-sm font-medium">Start Time</label>
              <Select
                value={meetingTime}
                onValueChange={setMeetingTime}
                disabled={scheduleDisabled}
              >
                <SelectTrigger id="schedule-start-time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="schedule-duration" className="text-sm font-medium">Duration (minutes)</label>
              <Input
                id="schedule-duration"
                type="number"
                min={15}
                step={15}
                required
                disabled={scheduleDisabled}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="schedule-timezone" className="text-sm font-medium">Timezone</label>
              <Input
                id="schedule-timezone"
                required
                disabled={scheduleDisabled}
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="America/New_York"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="schedule-attendees-input" className="text-sm font-medium">Attendees</label>
              <div className="rounded-md border border-input bg-background p-2">
                {attendeeEmails.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attendeeEmails.map((email) => (
                      <Badge key={email} variant="secondary" className="gap-1 pr-1">
                        {email}
                        <button
                          type="button"
                          onClick={() => removeAttendee(email)}
                          disabled={scheduleDisabled}
                          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mb-2 px-1 text-xs text-muted-foreground">
                    Add people by selecting users below or typing email addresses.
                  </p>
                )}

                <div className="flex gap-2">
                  <Input
                    id="schedule-attendees-input"
                    disabled={scheduleDisabled}
                    value={attendeeInput}
                    onChange={(event) => setAttendeeInput(event.target.value)}
                    onKeyDown={handleAttendeeKeyDown}
                    placeholder="Type name or email and press Enter"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={commitAttendeeInput}
                    disabled={scheduleDisabled || attendeeInput.trim().length === 0}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {attendeeSuggestions.length > 0 && (
                <div className="rounded-md border border-muted/60 bg-muted/20 p-2">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Suggested Platform Users
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attendeeSuggestions.map((member) => (
                      <Button
                        key={member.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSuggestedAttendee(member.email)}
                        disabled={scheduleDisabled}
                        className="h-auto py-1.5 text-left"
                      >
                        <span className="flex flex-col items-start leading-tight">
                          <span className="text-xs font-medium">{member.name}</span>
                          <span className="text-[11px] text-muted-foreground">{member.email}</span>
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Use Enter, Tab, comma, or semicolon to add typed emails.
              </p>
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className={getButtonClasses('primary')}
                  disabled={scheduleDisabled}
                >
                  {scheduling
                    ? editingMeeting
                      ? 'Saving...'
                      : 'Scheduling...'
                    : editingMeeting
                      ? 'Save Reschedule'
                      : 'Schedule with Google Meet'}
                </Button>
                {editingMeeting && (
                  <Button
                    type="button"
                    variant="outline"
                    className={getButtonClasses('outline')}
                    onClick={resetScheduleForm}
                    disabled={scheduling}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <UpcomingMeetingsCard
        meetings={upcomingMeetings}
        canSchedule={canSchedule && !isPreviewMode}
        cancellingMeetingId={cancellingMeetingId}
        onOpenInSiteMeeting={openInSiteMeeting}
        onRescheduleMeeting={handleRescheduleMeeting}
        onCancelMeeting={(meeting) => {
          void handleCancelMeeting(meeting)
        }}
        onMarkCompleted={(legacyId) => {
          void handleMarkCompleted(legacyId)
        }}
      />
    </div>
  )
}
