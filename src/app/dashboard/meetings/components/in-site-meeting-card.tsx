'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, CalendarDays, Clock3, Copy, LoaderCircle, Radio, Users, Video } from 'lucide-react'
import {
  ControlBar,
  GridLayout,
  LayoutContextProvider,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useCreateLayoutContext,
  useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

import type { MeetingProcessingState, MeetingRecord } from '../types'
import {
  buildFallbackRoomName,
  extractRoomNameFromMeetingLink,
  formatLocalDateTime,
  formatMeetingTitleFromRoomName,
  normalizeMeetingProcessingState,
} from '../utils'

type MeetingRoomPageProps = {
  meeting: MeetingRecord
  onClose: () => void
  canRecord?: boolean
  onMeetingUpdated?: (meeting: MeetingRecord) => void
  fallbackRoomName?: string | null
}

type TranscriptMode = 'save-transcript' | 'save-transcript-and-generate-notes' | 'save-notes' | 'finalize-post-meeting'

type TranscriptActionResult = {
  meeting?: MeetingRecord
  transcriptSaved?: boolean
  notesGenerated?: boolean
  notesSaved?: boolean
  summary?: string | null
  model?: string | null
  notesReason?: 'ai_not_configured' | 'generation_failed' | null
  transcriptTruncatedForNotes?: boolean
}

type LiveKitJoinPayload = {
  token: string
  serverUrl: string
  roomName: string
  meetLink?: string | null
  meeting?: MeetingRecord
  migration?: {
    created: boolean
    calendarSyncWarning: string | null
  }
}

type CaptureStatus = {
  supported: boolean
  listening: boolean
  error: string | null
}

type LiveRoomCanvasProps = {
  meetingTitle: string
  layoutContext: ReturnType<typeof useCreateLayoutContext>
  autoCaptureEnabled: boolean
  onAppendTranscript: (snippet: string) => void
  onInterimTranscriptChange: (transcript: string) => void
  onCaptureStatusChange: (status: CaptureStatus) => void
}

type MeetingOperationsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  joinConfig: LiveKitJoinPayload | null
  captureStatus: CaptureStatus
  meetingAttendeeEmails: string[]
  meetingRoomName: string
  meetingTimezone: string
  transcriptSource: string | null
  transcriptSavedAt: number | null
  transcriptProcessingState: MeetingProcessingState
  transcriptProcessingError: string | null
  notesUpdatedAt: number | null
  notesModel: string | null
  notesProcessingState: MeetingProcessingState
  notesProcessingError: string | null
  markCompleted: boolean
  autoSyncing: boolean
  finalizingSession: boolean
  interimTranscript: string
  summaryPreview: string | null
  notesReason: 'ai_not_configured' | 'generation_failed' | null
  transcriptTruncatedForNotes: boolean
  transcriptLength: number
  canGenerateNotes: boolean
  generatingNotes: boolean
  onGenerateNotes: () => void
}

function formatSyncLabel(timestamp: number | null, timezone: string, emptyLabel: string): string {
  if (!timestamp) {
    return emptyLabel
  }

  return `Updated ${formatLocalDateTime(timestamp, timezone)}`
}

function shouldRetryAutoCapture(error: string | null): boolean {
  if (!error) {
    return true
  }

  const normalized = error.toLowerCase()
  return !(
    normalized.includes('denied') ||
    normalized.includes('not supported') ||
    normalized.includes('no microphone') ||
    normalized.includes('service not available')
  )
}

function LiveRoomCanvas(props: LiveRoomCanvasProps) {
  const {
    meetingTitle,
    layoutContext,
    autoCaptureEnabled,
    onAppendTranscript,
    onInterimTranscriptChange,
    onCaptureStatusChange,
  } = props

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  const {
    isSupported,
    isListening,
    startListening,
    stopListening,
    transcript,
    error,
  } = useVoiceInput({
    continuous: true,
    silenceTimeout: 12,
    maxDuration: 55,
    onResult: onAppendTranscript,
  })

  useEffect(() => {
    onCaptureStatusChange({
      supported: isSupported,
      listening: isListening,
      error,
    })
  }, [error, isListening, isSupported, onCaptureStatusChange])

  useEffect(() => {
    onInterimTranscriptChange(transcript.trim())
  }, [onInterimTranscriptChange, transcript])

  useEffect(() => {
    if (!autoCaptureEnabled) {
      onInterimTranscriptChange('')
      if (isListening) {
        stopListening()
      }
      return
    }

    if (!isSupported || isListening || !shouldRetryAutoCapture(error)) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      startListening()
    }, 900)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [autoCaptureEnabled, error, isListening, isSupported, onInterimTranscriptChange, startListening, stopListening])

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return (
    <LayoutContextProvider value={layoutContext}>
      <div className="meeting-room-livekit-theme flex min-h-[560px] flex-col overflow-hidden rounded-[32px] border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Live room</p>
            <p className="mt-1 text-sm font-medium text-foreground">{meetingTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isListening ? 'secondary' : 'outline'}>
              <Radio className="h-3 w-3" />
              {isListening ? 'Capture live' : 'Capture idle'}
            </Badge>
            <Badge variant={isSupported ? 'secondary' : 'outline'}>
              {isSupported ? 'Browser mic ready' : 'Browser mic unavailable'}
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-background p-3 lg:p-4">
          {tracks.length > 0 ? (
            <GridLayout
              tracks={tracks}
              className="h-full min-h-[420px] rounded-[26px] border border-border/80 bg-muted/20 p-2"
            >
              <ParticipantTile />
            </GridLayout>
          ) : (
            <div className="flex h-full min-h-[420px] items-center justify-center rounded-[26px] border border-dashed border-border bg-muted/20 px-6 text-center">
              <div className="max-w-md space-y-3">
                <p className="text-sm font-medium text-foreground">Camera tiles will appear here once someone joins with video.</p>
                <p className="text-sm text-muted-foreground">
                  You can still start the room, use audio-only mode, and capture transcript data for AI notes.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card/95 px-3 py-3 backdrop-blur">
          <ControlBar controls={{ chat: false, settings: true }} />
        </div>

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  )
}

function MeetingOperationsSheet(props: MeetingOperationsSheetProps) {
  const {
    open,
    onOpenChange,
    joinConfig,
    captureStatus,
    meetingAttendeeEmails,
    meetingRoomName,
    meetingTimezone,
    transcriptSource,
    transcriptSavedAt,
    transcriptProcessingState,
    transcriptProcessingError,
    notesUpdatedAt,
    notesModel,
    notesProcessingState,
    notesProcessingError,
    markCompleted,
    autoSyncing,
    finalizingSession,
    interimTranscript,
    summaryPreview,
    notesReason,
    transcriptTruncatedForNotes,
    transcriptLength,
    canGenerateNotes,
    generatingNotes,
    onGenerateNotes,
  } = props

  const transcriptStatus = transcriptProcessingState === 'processing'
    ? 'Finalizing transcript now'
    : transcriptProcessingState === 'failed'
      ? 'Transcript finalization needs attention'
      : formatSyncLabel(transcriptSavedAt, meetingTimezone, 'Waiting for first capture sync')

  const summaryStatus = notesProcessingState === 'processing' || generatingNotes
    ? 'Generating summary now'
    : notesProcessingState === 'failed'
      ? 'AI notes generation needs attention'
    : notesReason === 'ai_not_configured'
      ? 'AI note generation is unavailable in this environment'
      : notesReason === 'generation_failed'
        ? 'Last summary generation attempt failed'
        : formatSyncLabel(notesUpdatedAt, meetingTimezone, 'Waiting for transcript before summary')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Room sidebar</SheetTitle>
          <SheetDescription>
            Capture state, attendees, automation, and AI notes for this room.
          </SheetDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">{meetingRoomName}</Badge>
            <Badge variant={joinConfig ? 'secondary' : 'outline'}>
              {joinConfig ? 'Room live' : 'Waiting to join'}
            </Badge>
          </div>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Capture status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={joinConfig ? 'secondary' : 'outline'}>{joinConfig ? 'In room' : 'Ready to join'}</Badge>
              <Badge variant={captureStatus.listening ? 'secondary' : 'outline'}>
                {captureStatus.listening ? 'Listening' : 'Not listening'}
              </Badge>
              {transcriptSource ? <Badge variant="outline">{transcriptSource}</Badge> : null}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {captureStatus.supported
                ? 'Browser speech capture is available for automatic transcript collection.'
                : 'Browser speech capture is unavailable in this browser. Transcript sync will stay idle until capture is available.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">People invited</p>
            <div className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              {meetingAttendeeEmails.length} attendee{meetingAttendeeEmails.length === 1 ? '' : 's'}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {meetingAttendeeEmails.length > 0 ? (
                meetingAttendeeEmails.slice(0, 8).map((email) => (
                  <Badge key={email} variant="outline" className="max-w-full break-all whitespace-normal text-left">
                    {email}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No attendees listed on this meeting yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Automation</p>
            <p className="mt-3 text-sm text-foreground">
              {finalizingSession || transcriptProcessingState === 'processing' || notesProcessingState === 'processing'
                ? 'The meeting has ended. Final transcript and AI notes are being wrapped up now.'
                : 'Capture and meeting summary stay in the background while the room is running.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={joinConfig ? 'secondary' : 'outline'}>
                {joinConfig ? 'Room live' : 'Waiting to join'}
              </Badge>
              {autoSyncing ? <Badge variant="outline">Syncing now</Badge> : null}
              {transcriptProcessingState === 'processing' ? <Badge variant="info">Transcript finalizing</Badge> : null}
              {notesProcessingState === 'processing' ? <Badge variant="info">AI notes generating</Badge> : null}
              {markCompleted ? <Badge variant="outline">Marked completed</Badge> : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card px-3 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Speech sync</p>
              <p className="mt-2 text-sm text-foreground">{transcriptStatus}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">{transcriptLength} chars</Badge>
                {transcriptSource ? <Badge variant="outline">{transcriptSource}</Badge> : null}
                {transcriptProcessingState === 'processing' ? <Badge variant="info">Finalizing</Badge> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card px-3 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Summary sync</p>
              <p className="mt-2 text-sm text-foreground">{summaryStatus}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {notesModel ? <Badge variant="outline">{notesModel}</Badge> : null}
                {transcriptTruncatedForNotes ? <Badge variant="outline">Transcript truncated</Badge> : null}
              </div>
            </div>
          </div>

          {captureStatus.error ? (
            <Alert>
              <AlertTitle>Capture warning</AlertTitle>
              <AlertDescription>{captureStatus.error}</AlertDescription>
            </Alert>
          ) : null}

          {transcriptProcessingError ? (
            <Alert className="border-destructive/40 bg-destructive/5">
              <AlertTitle>Transcript finalization failed</AlertTitle>
              <AlertDescription>{transcriptProcessingError}</AlertDescription>
            </Alert>
          ) : null}

          {notesReason === 'generation_failed' ? (
            <Alert className="border-destructive/40 bg-destructive/5">
              <AlertTitle>AI summary failed</AlertTitle>
              <AlertDescription>
                The last notes generation request failed. Try again after a little more transcript is captured.
              </AlertDescription>
            </Alert>
          ) : null}

          {notesProcessingError ? (
            <Alert className="border-destructive/40 bg-destructive/5">
              <AlertTitle>AI notes generation failed</AlertTitle>
              <AlertDescription>{notesProcessingError}</AlertDescription>
            </Alert>
          ) : null}

          {notesReason === 'ai_not_configured' ? (
            <Alert>
              <AlertTitle>AI summary unavailable</AlertTitle>
              <AlertDescription>
                Gemini is not configured for meeting notes in this environment.
              </AlertDescription>
            </Alert>
          ) : null}

          {summaryPreview ? (
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Latest AI summary</p>
                {canGenerateNotes ? (
                  <Button type="button" size="sm" variant="outline" onClick={onGenerateNotes} disabled={generatingNotes || notesProcessingState === 'processing'}>
                    {generatingNotes || notesProcessingState === 'processing' ? 'Refreshing...' : 'Refresh summary'}
                  </Button>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{summaryPreview}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">AI summary</p>
                  <p className="mt-2 text-sm text-foreground">
                    {notesProcessingState === 'processing'
                      ? 'The meeting ended and AI notes generation is already running.'
                      : transcriptLength >= 20
                      ? 'Generate a meeting summary now, or let it generate automatically when the room ends.'
                      : 'Speak for a bit first so the transcript has enough content for AI notes.'}
                  </p>
                </div>
                {canGenerateNotes ? (
                  <Button type="button" size="sm" variant="outline" onClick={onGenerateNotes} disabled={generatingNotes || notesProcessingState === 'processing'}>
                    {generatingNotes || notesProcessingState === 'processing' ? 'Generating...' : 'Generate notes'}
                  </Button>
                ) : null}
              </div>
            </div>
          )}

          {interimTranscript ? (
            <div className="rounded-2xl border border-border bg-muted/30 px-3 py-3 text-xs text-foreground">
              Live capture: {interimTranscript}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function MeetingRoomPage(props: MeetingRoomPageProps) {
  const { meeting, onClose, canRecord = true, onMeetingUpdated, fallbackRoomName } = props
  const { toast } = useToast()
  const liveRoomLayoutContext = useCreateLayoutContext()
  const [transcriptDraft, setTranscriptDraft] = useState(meeting.transcriptText ?? '')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [markCompleted, setMarkCompleted] = useState(meeting.status === 'completed')
  const [transcriptSavedAt, setTranscriptSavedAt] = useState<number | null>(meeting.transcriptUpdatedAtMs ?? null)
  const [transcriptSource, setTranscriptSource] = useState(meeting.transcriptSource ?? null)
  const [transcriptProcessingState, setTranscriptProcessingState] = useState<MeetingProcessingState>(
    normalizeMeetingProcessingState(meeting.transcriptProcessingState)
  )
  const [transcriptProcessingError, setTranscriptProcessingError] = useState<string | null>(meeting.transcriptProcessingError ?? null)
  const [notesUpdatedAt, setNotesUpdatedAt] = useState<number | null>(meeting.notesUpdatedAtMs ?? null)
  const [notesModel, setNotesModel] = useState(meeting.notesModel ?? null)
  const [summaryPreview, setSummaryPreview] = useState(meeting.notesSummary ?? null)
  const [notesProcessingState, setNotesProcessingState] = useState<MeetingProcessingState>(
    normalizeMeetingProcessingState(meeting.notesProcessingState)
  )
  const [notesProcessingError, setNotesProcessingError] = useState<string | null>(meeting.notesProcessingError ?? null)
  const [notesReason, setNotesReason] = useState<'ai_not_configured' | 'generation_failed' | null>(null)
  const [transcriptTruncatedForNotes, setTranscriptTruncatedForNotes] = useState(false)
  const [operationsOpen, setOperationsOpen] = useState(false)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const [finalizingSession, setFinalizingSession] = useState(false)
  const [joinConfig, setJoinConfig] = useState<LiveKitJoinPayload | null>(null)
  const [joiningRoom, setJoiningRoom] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const autoCaptureEnabled = true
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>({
    supported: false,
    listening: false,
    error: null,
  })
  const [autoSyncing, setAutoSyncing] = useState(false)
  const lastAutoSyncedTranscriptRef = useRef('')
  const settingsDrivenOpenRef = useRef(false)
  const finalizationInFlightRef = useRef(false)

  const meetingLegacyId = typeof meeting.legacyId === 'string' ? meeting.legacyId : ''
  const meetingCalendarEventId =
    typeof meeting.calendarEventId === 'string' && meeting.calendarEventId.trim().length > 0 ? meeting.calendarEventId : null
  const meetingStatus = typeof meeting.status === 'string' && meeting.status.length > 0 ? meeting.status : 'scheduled'
  const meetingTimezone = typeof meeting.timezone === 'string' && meeting.timezone.trim().length > 0 ? meeting.timezone : 'UTC'
  const meetingDescription =
    typeof meeting.description === 'string' && meeting.description.trim().length > 0 ? meeting.description : null
  const meetingLink = typeof meeting.meetLink === 'string' && meeting.meetLink.length > 0 ? meeting.meetLink : null
  const persistedMeetingRoomName =
    (typeof meeting.roomName === 'string' && meeting.roomName.trim().length > 0 ? meeting.roomName.trim() : null) ??
    extractRoomNameFromMeetingLink(meetingLink) ??
    (typeof fallbackRoomName === 'string' && fallbackRoomName.trim().length > 0 ? fallbackRoomName.trim() : null)
  const meetingRoomName = persistedMeetingRoomName ?? buildFallbackRoomName({
    title: meeting.title,
    startTimeMs: meeting.startTimeMs,
    endTimeMs: meeting.endTimeMs,
  })
  const meetingTitle =
    typeof meeting.title === 'string' && meeting.title.trim().length > 0
      ? meeting.title.trim()
      : formatMeetingTitleFromRoomName(meetingRoomName) ?? 'Meeting room'
  const meetingAttendeeEmails = Array.isArray(meeting.attendeeEmails) ? meeting.attendeeEmails : []
  const isPreviewMeeting = meetingLegacyId.startsWith('preview-')
  const hasJoinReference = Boolean(meetingLegacyId || meetingCalendarEventId || meetingRoomName)
  const inlineJoinError = !isPreviewMeeting && !hasJoinReference
    ? 'This meeting record is missing its room reference. Refresh and reopen the room.'
    : joinError
  const roomActionLabel = joiningRoom
    ? 'Joining...'
    : isPreviewMeeting
      ? 'Preview only'
      : persistedMeetingRoomName
        ? 'Join room'
        : 'Start meet'

  const normalizedTranscript = transcriptDraft.trim()
  const canPersist = canRecord && !isPreviewMeeting && meetingLegacyId.length > 0
  const canGenerateNotes = canPersist && normalizedTranscript.length >= 20
  const settingsWidgetOpen = Boolean(liveRoomLayoutContext.widget.state?.showSettings)

  const appendTranscriptSnippet = useCallback((snippet: string) => {
    const normalized = snippet.trim()
    if (!normalized) {
      return
    }

    setTranscriptDraft((current) => {
      const base = current.trim()
      if (!base) {
        return normalized
      }
      if (base.endsWith(normalized)) {
        return current
      }
      return `${base}\n${normalized}`
    })
  }, [])

  const buildMeetingSnapshot = useCallback((overrides: Partial<MeetingRecord> = {}): MeetingRecord => ({
    ...meeting,
    transcriptText: transcriptDraft,
    transcriptUpdatedAtMs: transcriptSavedAt,
    transcriptSource,
    transcriptProcessingState,
    transcriptProcessingError,
    notesSummary: summaryPreview,
    notesUpdatedAtMs: notesUpdatedAt,
    notesModel,
    notesProcessingState,
    notesProcessingError,
    status: markCompleted ? 'completed' : meeting.status,
    ...overrides,
  }), [
    markCompleted,
    meeting,
    notesModel,
    notesProcessingError,
    notesProcessingState,
    notesUpdatedAt,
    summaryPreview,
    transcriptDraft,
    transcriptProcessingError,
    transcriptProcessingState,
    transcriptSavedAt,
    transcriptSource,
  ])

  const syncMeetingState = useCallback((updatedMeeting: MeetingRecord, options: { syncTranscript: boolean; syncNotes: boolean }) => {
    onMeetingUpdated?.(updatedMeeting)
    setMarkCompleted(updatedMeeting.status === 'completed')

    if (options.syncTranscript) {
      setTranscriptDraft(updatedMeeting.transcriptText ?? '')
      lastAutoSyncedTranscriptRef.current = updatedMeeting.transcriptText?.trim() ?? ''
    }

    setTranscriptSavedAt(updatedMeeting.transcriptUpdatedAtMs ?? null)
    setTranscriptSource(updatedMeeting.transcriptSource ?? null)
    setTranscriptProcessingState(normalizeMeetingProcessingState(updatedMeeting.transcriptProcessingState))
    setTranscriptProcessingError(updatedMeeting.transcriptProcessingError ?? null)
    setNotesUpdatedAt(updatedMeeting.notesUpdatedAtMs ?? null)
    setNotesModel(updatedMeeting.notesModel ?? null)
    setSummaryPreview(updatedMeeting.notesSummary ?? null)
    setNotesProcessingState(normalizeMeetingProcessingState(updatedMeeting.notesProcessingState))
    setNotesProcessingError(updatedMeeting.notesProcessingError ?? null)
    setFinalizingSession(
      normalizeMeetingProcessingState(updatedMeeting.transcriptProcessingState) === 'processing' ||
        normalizeMeetingProcessingState(updatedMeeting.notesProcessingState) === 'processing'
    )

    if (updatedMeeting.notesSummary) {
      setNotesReason(null)
    }
  }, [onMeetingUpdated])

  const applyTranscriptActionResult = useCallback((result: TranscriptActionResult) => {
    setNotesReason(result.notesReason ?? null)
    setTranscriptTruncatedForNotes(Boolean(result.transcriptTruncatedForNotes))

    if (result.notesReason !== 'generation_failed') {
      setNotesProcessingError(null)
    }

    if (typeof result.summary === 'string') {
      setSummaryPreview(result.summary)
    }

    if (result.model !== undefined) {
      setNotesModel(result.model ?? null)
    }

    if (result.meeting) {
      syncMeetingState(result.meeting, { syncTranscript: true, syncNotes: true })
    }

    if (!result.meeting) {
      setFinalizingSession(false)
    }
  }, [syncMeetingState])

  const submitTranscriptAction = useCallback(async (
    mode: TranscriptMode,
    overrides?: { transcriptText?: string; notesSummary?: string; source?: string; markCompleted?: boolean; keepalive?: boolean }
  ) => {
    if (!meetingLegacyId) {
      throw new Error('This meeting record is missing an ID. Refresh and reopen the room.')
    }

    const response = await fetch('/api/meetings/transcript', {
      method: 'POST',
      keepalive: overrides?.keepalive,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        legacyId: meetingLegacyId,
        mode,
        markCompleted: overrides?.markCompleted ?? markCompleted,
        source: overrides?.source ?? 'in-site-voice',
        transcriptText: overrides?.transcriptText,
        notesSummary: overrides?.notesSummary,
      }),
    })

    const payload = (await response.json().catch(() => ({}))) as {
      success?: boolean
      error?: string
      data?: TranscriptActionResult
    }

    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || 'Meeting update failed')
    }

    return (payload.data ?? {}) as TranscriptActionResult
  }, [markCompleted, meetingLegacyId])

  const handleJoinRoom = useCallback(() => {
    if (isPreviewMeeting) {
      toast({
        title: 'Preview room',
        description: 'Live media is disabled in preview mode, but the workspace layout is available for review.',
      })
      return
    }

    if (!hasJoinReference) {
      setJoinError('This meeting record is missing its room reference. Refresh and reopen the room.')
      return
    }

    setJoiningRoom(true)
    setJoinError(null)

    void fetch('/api/meetings/livekit/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        legacyId: meetingLegacyId || undefined,
        calendarEventId: meetingCalendarEventId ?? undefined,
        roomName: meetingRoomName || undefined,
      }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean
          error?: string
          data?: LiveKitJoinPayload
        }

        if (!response.ok || payload.success === false || !payload.data) {
          throw new Error(payload.error || 'Unable to join the meeting room')
        }

        if (payload.data.meeting) {
          syncMeetingState(payload.data.meeting, { syncTranscript: false, syncNotes: false })
        }

        if (payload.data.migration?.created) {
          toast({
            title: 'Native room prepared',
            description:
              payload.data.migration.calendarSyncWarning ??
              'This legacy meeting was upgraded to a Cohorts room automatically.',
          })
        }

        setJoinConfig(payload.data)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unable to join the meeting room'
        setJoinError(message)
      })
      .finally(() => {
        setJoiningRoom(false)
      })
  }, [hasJoinReference, isPreviewMeeting, meetingCalendarEventId, meetingLegacyId, meetingRoomName, syncMeetingState, toast])

  const finalizeMeetingAfterRoomExit = useCallback((closeAfterKickoff: boolean) => {
    if (!canPersist || finalizationInFlightRef.current) {
      if (closeAfterKickoff) {
        onClose()
      }
      return
    }

    finalizationInFlightRef.current = true

    const hasEnoughTranscript = normalizedTranscript.length >= 20
    const optimisticMeeting = buildMeetingSnapshot({
      status: 'completed',
      transcriptText: normalizedTranscript || transcriptDraft,
      transcriptSource: 'livekit-browser-voice',
      transcriptProcessingState: hasEnoughTranscript ? 'processing' : 'idle',
      transcriptProcessingError: null,
      notesProcessingState: hasEnoughTranscript ? 'processing' : 'idle',
      notesProcessingError: null,
    })

    setMarkCompleted(true)
    setFinalizingSession(hasEnoughTranscript)
    setTranscriptSource('livekit-browser-voice')
    setTranscriptProcessingState(hasEnoughTranscript ? 'processing' : 'idle')
    setTranscriptProcessingError(null)
    setNotesProcessingState(hasEnoughTranscript ? 'processing' : 'idle')
    setNotesProcessingError(null)
    setOperationsOpen(true)
    onMeetingUpdated?.(optimisticMeeting)

    const finalizePromise = submitTranscriptAction('finalize-post-meeting', {
      transcriptText: normalizedTranscript,
      source: 'livekit-browser-voice',
      markCompleted: true,
      keepalive: closeAfterKickoff,
    })

    if (closeAfterKickoff) {
      setJoinConfig(null)
      setInterimTranscript('')
      onClose()

      void finalizePromise.catch((error) => {
        const message = error instanceof Error ? error.message : 'Meeting finalization failed'
        onMeetingUpdated?.(
          buildMeetingSnapshot({
            status: 'completed',
            transcriptProcessingState: 'failed',
            transcriptProcessingError: message,
            notesProcessingState: 'failed',
            notesProcessingError: 'AI notes could not be generated because post-call finalization failed.',
          })
        )
      }).finally(() => {
        finalizationInFlightRef.current = false
      })

      return
    }

    void finalizePromise
      .then((result) => {
        lastAutoSyncedTranscriptRef.current = normalizedTranscript
        applyTranscriptActionResult(result)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Meeting finalization failed'
        setTranscriptProcessingState('failed')
        setTranscriptProcessingError(message)
        setNotesProcessingState('failed')
        setNotesProcessingError('AI notes could not be generated because post-call finalization failed.')
        setFinalizingSession(false)
        onMeetingUpdated?.(
          buildMeetingSnapshot({
            status: 'completed',
            transcriptProcessingState: 'failed',
            transcriptProcessingError: message,
            notesProcessingState: 'failed',
            notesProcessingError: 'AI notes could not be generated because post-call finalization failed.',
          })
        )
      })
      .finally(() => {
        finalizationInFlightRef.current = false
      })
  }, [
    applyTranscriptActionResult,
    buildMeetingSnapshot,
    canPersist,
    normalizedTranscript,
    onClose,
    onMeetingUpdated,
    submitTranscriptAction,
    transcriptDraft,
  ])

  const handleGenerateNotes = useCallback(async () => {
    if (!canGenerateNotes) {
      toast({
        variant: 'destructive',
        title: 'Transcript too short',
        description: 'Capture a bit more conversation before generating AI meeting notes.',
      })
      return
    }

    setGeneratingNotes(true)
    setNotesProcessingState('processing')
    setNotesProcessingError(null)

    try {
      const result = await submitTranscriptAction('save-transcript-and-generate-notes', {
        transcriptText: normalizedTranscript,
        source: 'livekit-browser-voice',
      })

      lastAutoSyncedTranscriptRef.current = normalizedTranscript
      applyTranscriptActionResult(result)

      if (result.notesGenerated) {
        toast({
          title: 'AI summary updated',
          description: 'The room sidebar now reflects the latest generated summary.',
        })
      } else if (result.notesReason === 'ai_not_configured') {
        toast({
          variant: 'destructive',
          title: 'AI notes unavailable',
          description: 'Gemini is not configured for meeting note generation in this environment.',
        })
      } else if (result.notesReason === 'generation_failed') {
        toast({
          variant: 'destructive',
          title: 'AI summary failed',
          description: 'The request completed, but note generation failed. Try again after more transcript is captured.',
        })
      }
    } catch (error) {
      setNotesProcessingState('failed')
      setNotesProcessingError(error instanceof Error ? error.message : 'Unknown error')
      toast({
        variant: 'destructive',
        title: 'AI summary failed',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setGeneratingNotes(false)
    }
  }, [applyTranscriptActionResult, canGenerateNotes, normalizedTranscript, submitTranscriptAction, toast])

  useEffect(() => {
    if (settingsWidgetOpen) {
      settingsDrivenOpenRef.current = true
      setOperationsOpen(true)
      return
    }

    if (settingsDrivenOpenRef.current) {
      settingsDrivenOpenRef.current = false
      setOperationsOpen(false)
    }
  }, [settingsWidgetOpen])

  const handleOperationsOpenChange = useCallback((open: boolean) => {
    setOperationsOpen(open)

    if (!open && settingsWidgetOpen) {
      settingsDrivenOpenRef.current = false
      liveRoomLayoutContext.widget.dispatch?.({ msg: 'toggle_settings' })
    }
  }, [liveRoomLayoutContext.widget, settingsWidgetOpen])

  useEffect(() => {
    if (!joinConfig || !canPersist || normalizedTranscript.length < 80) {
      return
    }

    if (normalizedTranscript === lastAutoSyncedTranscriptRef.current) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setAutoSyncing(true)

      void submitTranscriptAction('save-transcript-and-generate-notes', {
        transcriptText: normalizedTranscript,
        source: 'livekit-browser-voice',
      })
        .then((data) => {
          lastAutoSyncedTranscriptRef.current = normalizedTranscript
          applyTranscriptActionResult(data)
        })
        .catch((error) => {
          console.error('[meetings/livekit] Auto-sync failed', error)
          setNotesReason('generation_failed')
        })
        .finally(() => {
          setAutoSyncing(false)
        })
    }, 18000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [applyTranscriptActionResult, canPersist, joinConfig, normalizedTranscript, submitTranscriptAction])

  const meetingShell = (
    <>
      <div className="flex flex-col gap-5 px-5 py-5 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <CalendarDays className="mr-1 h-3 w-3" />
                {formatLocalDateTime(meeting.startTimeMs, meetingTimezone)}
              </Badge>
              <Badge variant="outline">
                <Clock3 className="mr-1 h-3 w-3" />
                Ends {formatLocalDateTime(meeting.endTimeMs, meetingTimezone)}
              </Badge>
              <Badge variant="secondary">{meetingStatus.replace('_', ' ')}</Badge>
            </div>
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Cohorts room</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight lg:text-[2.75rem]">{meetingTitle}</h2>
            </div>
            {meetingDescription ? (
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{meetingDescription}</p>
            ) : null}
          </div>

          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setOperationsOpen(true)}>
              Room sidebar
            </Button>
            {meetingLink ? (
              <Button
                type="button"
                variant="outline"
                className="min-w-[152px]"
                onClick={() => {
                  if (typeof navigator === 'undefined' || !meetingLink) {
                    return
                  }

                  void navigator.clipboard.writeText(meetingLink)
                  toast({
                    title: 'Room link copied',
                    description: 'Share the Cohorts room URL with attendees who need direct access.',
                  })
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </Button>
            ) : null}
          </div>
        </div>

        <div className="min-h-[420px]">
          {joinConfig ? (
            <LiveKitRoom
              token={joinConfig.token}
              serverUrl={joinConfig.serverUrl}
              connect
              audio
              video
              onDisconnected={() => {
                setJoinConfig(null)
                setInterimTranscript('')
                finalizeMeetingAfterRoomExit(false)
              }}
              onError={(error) => {
                setJoinError(error.message)
              }}
              className="h-full"
            >
              <LiveRoomCanvas
                meetingTitle={meetingTitle}
                layoutContext={liveRoomLayoutContext}
                autoCaptureEnabled={autoCaptureEnabled && canPersist}
                onAppendTranscript={appendTranscriptSnippet}
                onInterimTranscriptChange={setInterimTranscript}
                onCaptureStatusChange={setCaptureStatus}
              />
            </LiveKitRoom>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-border bg-card p-6 shadow-sm lg:min-h-[560px] lg:p-8">
              <div className="max-w-3xl space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary">
                  <Video className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Native meeting workspace</p>
                  <h3 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight lg:text-5xl">
                    Run the call here, keep notes in sync automatically.
                  </h3>
                  <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
                    This room is backed by LiveKit for in-site audio and video, while Google Workspace continues to handle the calendar invite and reminders.
                  </p>
                </div>

                <div className="grid gap-3 text-left md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Call surface</p>
                    <p className="mt-2 text-sm text-foreground">Join without leaving Cohorts and keep the meeting context visible.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Auto transcript</p>
                    <p className="mt-2 text-sm text-foreground">Browser voice capture starts automatically once you join the room.</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">AI summary</p>
                    <p className="mt-2 text-sm text-foreground">Open the room sidebar for note generation status and the latest summary.</p>
                  </div>
                </div>

                {inlineJoinError ? (
                  <Alert className="border-destructive/40 bg-destructive/5 text-left">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{hasJoinReference ? 'Unable to join the room' : 'Room unavailable'}</AlertTitle>
                    <AlertDescription>{inlineJoinError}</AlertDescription>
                  </Alert>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {joinConfig && joinError ? (
          <Alert className="border-destructive/40 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Room connection warning</AlertTitle>
            <AlertDescription>{joinError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Room tools</p>
            <p className="mt-1 text-sm text-foreground">
              {finalizingSession || transcriptProcessingState === 'processing' || notesProcessingState === 'processing'
                ? 'The meeting ended. We’re finalizing the transcript and generating AI notes now.'
                : 'Open the sidebar for capture status, attendees, and AI summary state.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {transcriptProcessingState === 'processing' ? (
                <Badge variant="info">
                  <LoaderCircle className="mr-1 h-3 w-3 animate-spin" />
                  Finalizing transcript
                </Badge>
              ) : null}
              {notesProcessingState === 'processing' ? (
                <Badge variant="info">
                  <LoaderCircle className="mr-1 h-3 w-3 animate-spin" />
                  Generating AI notes
                </Badge>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setOperationsOpen(true)}>
              Open sidebar
            </Button>
            {!joinConfig ? (
              <Button
                type="button"
                className={cn(getButtonClasses('primary'), 'min-w-[168px]')}
                disabled={joiningRoom || isPreviewMeeting || !hasJoinReference}
                onClick={handleJoinRoom}
              >
                {joiningRoom ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
                {roomActionLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <MeetingOperationsSheet
        open={operationsOpen}
        onOpenChange={handleOperationsOpenChange}
        joinConfig={joinConfig}
        captureStatus={captureStatus}
        meetingAttendeeEmails={meetingAttendeeEmails}
        meetingRoomName={meetingRoomName}
        meetingTimezone={meetingTimezone}
        transcriptSource={transcriptSource}
        transcriptSavedAt={transcriptSavedAt}
        transcriptProcessingState={transcriptProcessingState}
        transcriptProcessingError={transcriptProcessingError}
        notesUpdatedAt={notesUpdatedAt}
        notesModel={notesModel}
        notesProcessingState={notesProcessingState}
        notesProcessingError={notesProcessingError}
        markCompleted={markCompleted}
        autoSyncing={autoSyncing}
        finalizingSession={finalizingSession}
        interimTranscript={interimTranscript}
        summaryPreview={summaryPreview}
        notesReason={notesReason}
        transcriptTruncatedForNotes={transcriptTruncatedForNotes}
        transcriptLength={normalizedTranscript.length}
        canGenerateNotes={canGenerateNotes}
        generatingNotes={generatingNotes}
        onGenerateNotes={handleGenerateNotes}
      />
    </>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-border bg-card px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Meetings</p>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meeting room</h1>
            <p className="text-sm text-muted-foreground">
              Native LiveKit room inside Cohorts with automatic transcript capture and Google Calendar scheduling.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (joinConfig) {
              finalizeMeetingAfterRoomExit(true)
              return
            }

            onClose()
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to meetings
        </Button>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-border/80 bg-background shadow-sm">
        {meetingShell}
      </div>
    </div>
  )
}
