'use client'

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { format } from 'date-fns'
import { CalendarPlus, CalendarDays, X } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
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

export default function MeetingsPage() {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
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
  const [oauthHandled, setOauthHandled] = useState(false)

  const meetings = useQuery(
    meetingsApi.list,
    workspaceId
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
    workspaceId
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
    workspaceId
      ? {
          workspaceId,
          limit: 200,
        }
      : 'skip'
  ) as WorkspaceMember[] | undefined

  const platformUsers = useQuery(
    usersApi.listAllUsers,
    workspaceId
      ? {
          limit: 500,
        }
      : 'skip'
  ) as WorkspaceMember[] | undefined

  const disconnectGoogleWorkspace = useMutation(meetingIntegrationsApi.deleteGoogleWorkspaceIntegration)
  const updateMeetingStatus = useMutation(meetingsApi.updateStatus)

  useEffect(() => {
    if (oauthHandled || typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)
    const oauthSuccess = searchParams.get('oauth_success') === 'true'
    const oauthError = searchParams.get('oauth_error')
    const provider = searchParams.get('provider')
    const message = searchParams.get('message')

    if (!oauthSuccess && !oauthError) {
      setOauthHandled(true)
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

    setOauthHandled(true)
  }, [oauthHandled, toast])

  const upcomingMeetings = useMemo(() => meetings ?? [], [meetings])

  const editingMeeting = useMemo(
    () => upcomingMeetings.find((meeting) => meeting.legacyId === editingMeetingId) ?? null,
    [upcomingMeetings, editingMeetingId]
  )

  const scheduleRequiresGoogleWorkspace = editingMeeting ? editingMeeting.providerId === 'google-workspace' : true
  const scheduleDisabled = !canSchedule || scheduling || (scheduleRequiresGoogleWorkspace && !googleWorkspaceStatus?.connected)

  const attendeeSuggestions = useMemo(() => {
    const workspaceList = workspaceMembers ?? []
    const platformList = platformUsers ?? []

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

    const query = attendeeInput.trim().toLowerCase()
    const selected = new Set(attendeeEmails.map((email) => normalizeEmail(email)))

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
  }, [workspaceMembers, platformUsers, attendeeInput, attendeeEmails])

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

  const handleConnectGoogleWorkspace = async () => {
    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot connect Google Workspace integrations.',
      })
      return
    }

    if (typeof window === 'undefined') return

    try {
      const redirect = `${window.location.pathname}${window.location.search}`
      const response = await fetch(
        `/api/integrations/google-workspace/oauth/url?redirect=${encodeURIComponent(redirect)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        data?: { url?: string }
        url?: string
        error?: string
      }

      const url = payload.data?.url ?? payload.url

      if (!response.ok || !url) {
        throw new Error(payload.error || 'Failed to start Google Workspace OAuth flow')
      }

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
    const url = buildInSiteMeetingUrl(workspaceId, meeting)
    setActiveInSiteMeeting(meeting)
    setActiveInSiteUrl(url)
  }

  const handleStartQuickMeet = async () => {
    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot start quick meetings.',
      })
      return
    }

    setQuickStarting(true)

    try {
      const response = await fetch('/api/meetings/quick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Quick Meet',
          durationMinutes: 30,
          attendeeEmails,
          timezone,
          clientId: selectedClientId ?? null,
        }),
      })

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
        throw new Error(payload.error || 'Unable to start quick meet')
      }

      const meeting = payload.data?.meeting ?? payload.meeting
      const inSiteEmbedUrl = payload.data?.inSiteEmbedUrl ?? payload.inSiteEmbedUrl
      const quickMeetUrl = meeting?.meetLink ?? null

      if (!meeting) {
        throw new Error('Quick meet was created without a meeting record')
      }

      if (inSiteEmbedUrl) {
        setActiveInSiteMeeting(meeting)
        setActiveInSiteUrl(inSiteEmbedUrl)
      } else {
        setActiveInSiteMeeting(null)
        setActiveInSiteUrl(null)
      }

      if (quickMeetUrl && typeof window !== 'undefined') {
        window.open(quickMeetUrl, '_blank', 'noopener,noreferrer')
      }

      toast({
        title: 'Quick meet started',
        description: quickMeetUrl
          ? 'Google Meet opened in a new tab and invites were sent.'
          : 'Quick meeting created successfully.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Quick meet failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setQuickStarting(false)
    }
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

  const handleCancelMeeting = async (meeting: MeetingRecord) => {
    if (!canSchedule) {
      toast({
        variant: 'destructive',
        title: 'Read-only access',
        description: 'Client users cannot cancel meetings.',
      })
      return
    }

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Cancel meeting \"${meeting.title}\"?`)
      if (!confirmed) {
        return
      }
    }

    setCancellingMeetingId(meeting.legacyId)

    try {
      const response = await fetch('/api/meetings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          legacyId: meeting.legacyId,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
      }

      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || 'Unable to cancel meeting')
      }

      if (editingMeetingId === meeting.legacyId) {
        resetScheduleForm()
      }

      toast({
        title: 'Meeting cancelled',
        description: 'Attendees received a cancellation email.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cancel failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setCancellingMeetingId(null)
    }
  }

  const handleScheduleMeeting = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

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

    try {
      const isEditing = Boolean(editingMeeting)
      const endpoint = isEditing ? '/api/meetings/reschedule' : '/api/meetings/schedule'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          legacyId: editingMeeting?.legacyId,
          title,
          description: description.trim().length > 0 ? description.trim() : null,
          startTimeMs,
          endTimeMs,
          timezone,
          attendeeEmails,
          clientId: selectedClientId ?? null,
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        error?: string
        data?: {
          meeting?: { meetLink?: string | null }
        }
      }

      if (!response.ok || payload.success === false) {
        throw new Error(payload.error || 'Unable to schedule meeting')
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
    } catch (error) {
      toast({
        variant: 'destructive',
        title: editingMeeting ? 'Reschedule failed' : 'Schedule failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setScheduling(false)
    }
  }

  const handleMarkCompleted = async (legacyId: string) => {
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
        googleWorkspaceConnected={Boolean(googleWorkspaceStatus?.connected)}
        canSchedule={canSchedule}
        quickStarting={quickStarting}
        quickMeetDisabled={!googleWorkspaceStatus?.connected}
        onStartQuickMeet={() => void handleStartQuickMeet()}
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
        connected={Boolean(googleWorkspaceStatus?.connected)}
        canSchedule={canSchedule}
        onConnect={() => void handleConnectGoogleWorkspace()}
        onDisconnect={() => void handleDisconnectGoogleWorkspace()}
      />

      {activeInSiteMeeting && activeInSiteUrl && (
        <InSiteMeetingCard
          meeting={activeInSiteMeeting}
          inSiteUrl={activeInSiteUrl}
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
          {scheduleRequiresGoogleWorkspace && !googleWorkspaceStatus?.connected && (
            <Alert className="mb-4">
              <AlertTitle>Google Workspace required</AlertTitle>
              <AlertDescription>
                Connect Google Workspace to create or reschedule calendar-backed meetings.
              </AlertDescription>
            </Alert>
          )}

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleScheduleMeeting}>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                required
                disabled={scheduleDisabled}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Weekly client strategy sync"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                rows={3}
                disabled={scheduleDisabled}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Agenda, links, and expected outcomes"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
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
              <label className="text-sm font-medium">Start Time</label>
              <Select
                value={meetingTime}
                onValueChange={setMeetingTime}
                disabled={scheduleDisabled}
              >
                <SelectTrigger>
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
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
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
              <label className="text-sm font-medium">Timezone</label>
              <Input
                required
                disabled={scheduleDisabled}
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="America/New_York"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Attendees</label>
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
        canSchedule={canSchedule}
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
