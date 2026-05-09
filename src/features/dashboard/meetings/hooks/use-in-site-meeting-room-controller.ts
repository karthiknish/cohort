'use client'

import { useCreateLayoutContext } from '@/shared/ui/livekit'
import { useCallback, useEffect, useRef, useState } from 'react'

import { logError } from '@/lib/convex-errors'
import { useToast } from '@/shared/ui/use-toast'

import type {
  CaptureStatus,
  LiveKitJoinPayload,
  MeetingRoomPageProps,
  TranscriptActionResult,
  TranscriptMode,
} from '../components/in-site-meeting-card.shared'
import type { MeetingRecord } from '../types'
import {
  buildFallbackRoomName,
  extractRoomNameFromMeetingLink,
  formatMeetingTitleFromRoomName,
  normalizeMeetingProcessingState,
} from '../utils'

export function useInSiteMeetingRoomController(props: MeetingRoomPageProps) {
  const { meeting, onClose, canRecord = true, onMeetingUpdated, fallbackRoomName } = props
  const { toast } = useToast()
  const liveRoomLayoutContext = useCreateLayoutContext()
  const [transcriptDraft, setTranscriptDraft] = useState(meeting.transcriptText ?? '')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [markCompleted, setMarkCompleted] = useState(meeting.status === 'completed')
  const [transcriptSavedAt, setTranscriptSavedAt] = useState<number | null>(meeting.transcriptUpdatedAtMs ?? null)
  const [transcriptSource, setTranscriptSource] = useState(meeting.transcriptSource ?? null)
  const [transcriptProcessingState, setTranscriptProcessingState] = useState(normalizeMeetingProcessingState(meeting.transcriptProcessingState))
  const [transcriptProcessingError, setTranscriptProcessingError] = useState<string | null>(meeting.transcriptProcessingError ?? null)
  const [notesUpdatedAt, setNotesUpdatedAt] = useState<number | null>(meeting.notesUpdatedAtMs ?? null)
  const [notesModel, setNotesModel] = useState(meeting.notesModel ?? null)
  const [summaryPreview, setSummaryPreview] = useState(meeting.notesSummary ?? null)
  const [notesProcessingState, setNotesProcessingState] = useState(normalizeMeetingProcessingState(meeting.notesProcessingState))
  const [notesProcessingError, setNotesProcessingError] = useState<string | null>(meeting.notesProcessingError ?? null)
  const [notesReason, setNotesReason] = useState<'ai_not_configured' | 'generation_failed' | null>(null)
  const [transcriptTruncatedForNotes, setTranscriptTruncatedForNotes] = useState(false)
  const [operationsOpen, setOperationsOpen] = useState(false)
  const [generatingNotes, setGeneratingNotes] = useState(false)
  const [finalizingSession, setFinalizingSession] = useState(false)
  const [retryingPostCallProcessing, setRetryingPostCallProcessing] = useState(false)
  const [joinConfig, setJoinConfig] = useState<LiveKitJoinPayload | null>(null)
  const [joiningRoom, setJoiningRoom] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)
  const [pipActive, setPipActive] = useState(false)
  const autoCaptureEnabled = true
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>({
    supported: false,
    listening: false,
    error: null,
  })
  const [autoSyncing, setAutoSyncing] = useState(false)
  const [lastAutoSyncAt, setLastAutoSyncAt] = useState<number | null>(meeting.transcriptUpdatedAtMs ?? null)
  const lastAutoSyncedTranscriptRef = useRef('')
  const settingsDrivenOpenRef = useRef(false)
  const finalizationInFlightRef = useRef(false)
  const roomViewportRef = useRef<HTMLDivElement | null>(null)

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
  const roomPinnedToMobileTray = Boolean(joinConfig && isMobileViewport && isMinimized)
  const canMinimizeRoom = Boolean(joinConfig && isMobileViewport)
  const hasTranscriptPendingSync = normalizedTranscript.length >= 20 && normalizedTranscript !== lastAutoSyncedTranscriptRef.current

  const setRoomViewportElement = useCallback((node: HTMLDivElement | null) => {
    roomViewportRef.current = node
  }, [])

  const getRoomVideoElement = useCallback((): HTMLVideoElement | null => {
    const root = roomViewportRef.current
    if (!root) {
      return null
    }

    const videos = Array.from(root.querySelectorAll('video'))
    return videos.find((video) => video.readyState >= 2) ?? videos[0] ?? null
  }, [])

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
    setLastAutoSyncAt(updatedMeeting.transcriptUpdatedAtMs ?? null)
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
    overrides?: { transcriptText?: string; notesSummary?: string; source?: string; markCompleted?: boolean; keepalive?: boolean },
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
          }),
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
          }),
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

  const handleRetryPostCallProcessing = useCallback(async () => {
    if (!canPersist) {
      toast({
        variant: 'destructive',
        title: 'Post-call retry unavailable',
        description: 'This meeting cannot persist transcript updates in the current environment.',
      })
      return
    }

    if (normalizedTranscript.length < 20) {
      toast({
        variant: 'destructive',
        title: 'Transcript too short',
        description: 'Capture a little more conversation before retrying post-call processing.',
      })
      return
    }

    if (finalizationInFlightRef.current) {
      return
    }

    finalizationInFlightRef.current = true
    setRetryingPostCallProcessing(true)
    setMarkCompleted(true)
    setFinalizingSession(true)
    setNotesReason(null)
    setTranscriptSource((current) => current ?? 'livekit-browser-voice')
    setTranscriptProcessingState('processing')
    setTranscriptProcessingError(null)
    setNotesProcessingState('processing')
    setNotesProcessingError(null)
    setOperationsOpen(true)

    onMeetingUpdated?.(
      buildMeetingSnapshot({
        status: 'completed',
        transcriptSource: transcriptSource ?? 'livekit-browser-voice',
        transcriptProcessingState: 'processing',
        transcriptProcessingError: null,
        notesProcessingState: 'processing',
        notesProcessingError: null,
      }),
    )

    try {
      const result = await submitTranscriptAction('finalize-post-meeting', {
        transcriptText: normalizedTranscript,
        source: transcriptSource ?? 'livekit-browser-voice',
        markCompleted: true,
      })

      lastAutoSyncedTranscriptRef.current = normalizedTranscript
      applyTranscriptActionResult(result)
      toast({
        title: 'Post-call processing retried',
        description: 'Transcript finalization and AI notes generation are running again.',
      })
    } catch (error) {
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
        }),
      )
      toast({
        variant: 'destructive',
        title: 'Post-call retry failed',
        description: message,
      })
    } finally {
      setRetryingPostCallProcessing(false)
      finalizationInFlightRef.current = false
    }
  }, [
    applyTranscriptActionResult,
    buildMeetingSnapshot,
    canPersist,
    normalizedTranscript,
    onMeetingUpdated,
    submitTranscriptAction,
    toast,
    transcriptSource,
  ])

  const togglePictureInPicture = useCallback(async () => {
    if (!joinConfig) {
      toast({
        variant: 'destructive',
        title: 'Join the room first',
        description: 'Picture in Picture becomes available once the LiveKit room is active.',
      })
      return
    }

    const video = getRoomVideoElement()
    if (!video) {
      toast({
        variant: 'destructive',
        title: 'Video unavailable',
        description: 'Turn on camera or wait for a participant video tile before entering Picture in Picture.',
      })
      return
    }

    const webkitVideo = video as HTMLVideoElement & {
      webkitSetPresentationMode?: (mode: 'inline' | 'picture-in-picture' | 'fullscreen') => void
      webkitSupportsPresentationMode?: (mode: 'inline' | 'picture-in-picture' | 'fullscreen') => boolean
      webkitPresentationMode?: 'inline' | 'picture-in-picture' | 'fullscreen'
    }

    try {
      if (typeof document !== 'undefined' && document.pictureInPictureElement && document.exitPictureInPicture) {
        await document.exitPictureInPicture()
        setPipActive(false)
        return
      }

      if (typeof video.requestPictureInPicture === 'function') {
        await video.requestPictureInPicture()
        setPipActive(true)
        return
      }

      if (
        typeof webkitVideo.webkitSetPresentationMode === 'function' &&
        typeof webkitVideo.webkitSupportsPresentationMode === 'function' &&
        webkitVideo.webkitSupportsPresentationMode('picture-in-picture')
      ) {
        const nextMode = webkitVideo.webkitPresentationMode === 'picture-in-picture' ? 'inline' : 'picture-in-picture'
        webkitVideo.webkitSetPresentationMode(nextMode)
        setPipActive(nextMode === 'picture-in-picture')
        return
      }

      throw new Error('Picture in Picture is not supported in this browser.')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Picture in Picture unavailable',
        description: error instanceof Error ? error.message : 'This browser could not enter Picture in Picture mode.',
      })
    }
  }, [getRoomVideoElement, joinConfig, toast])

  const toggleMinimizedRoom = useCallback(() => {
    if (!canMinimizeRoom) {
      return
    }

    setIsMinimized((current) => !current)
  }, [canMinimizeRoom])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia('(max-width: 767px)')
    const updateViewport = () => {
      setIsMobileViewport(media.matches)
    }

    updateViewport()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateViewport)
      return () => {
        media.removeEventListener('change', updateViewport)
      }
    }

    media.addListener(updateViewport)
    return () => {
      media.removeListener(updateViewport)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const supported =
      document.pictureInPictureEnabled ||
      (typeof HTMLVideoElement !== 'undefined' && 'webkitSetPresentationMode' in HTMLVideoElement.prototype)

    setPipSupported(Boolean(supported))
  }, [])

  useEffect(() => {
    if (joinConfig) {
      return
    }

    setIsMinimized(false)

    if (typeof document !== 'undefined' && document.pictureInPictureElement && document.exitPictureInPicture) {
      void document.exitPictureInPicture().catch(() => undefined)
    }

    setPipActive(false)
  }, [joinConfig])

  useEffect(() => {
    if (isMobileViewport) {
      return
    }

    setIsMinimized(false)
  }, [isMobileViewport])

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

  const performAutoSync = useCallback((transcript: string) => {
    setAutoSyncing(true)

    const mode: TranscriptMode =
      transcript.length >= 80 ? 'save-transcript-and-generate-notes' : 'save-transcript'

    void submitTranscriptAction(mode, {
      transcriptText: transcript,
      source: 'livekit-browser-voice',
    })
      .then((data) => {
        lastAutoSyncedTranscriptRef.current = transcript
        setLastAutoSyncAt(Date.now())
        applyTranscriptActionResult(data)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Room automation sync failed'
        logError(error, 'useInSiteMeetingRoomController:autoSyncTranscript')

        if (mode === 'save-transcript-and-generate-notes') {
          setNotesReason('generation_failed')
          setNotesProcessingState('failed')
          setNotesProcessingError(message)
        } else {
          setTranscriptProcessingError(message)
        }
      })
      .finally(() => {
        setAutoSyncing(false)
      })
  }, [applyTranscriptActionResult, submitTranscriptAction])

  useEffect(() => {
    if (!joinConfig || !canPersist || normalizedTranscript.length < 20) {
      return
    }

    if (normalizedTranscript === lastAutoSyncedTranscriptRef.current) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      performAutoSync(normalizedTranscript)
    }, 10_000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [canPersist, joinConfig, normalizedTranscript, performAutoSync])

  return {
    liveRoomLayoutContext,
    appendTranscriptSnippet,
    interimTranscript,
    setInterimTranscript,
    markCompleted,
    transcriptSavedAt,
    transcriptSource,
    transcriptProcessingState,
    transcriptProcessingError,
    notesUpdatedAt,
    notesModel,
    summaryPreview,
    notesProcessingState,
    notesProcessingError,
    notesReason,
    transcriptTruncatedForNotes,
    operationsOpen,
    setJoinError,
    generatingNotes,
    finalizingSession,
    retryingPostCallProcessing,
    joinConfig,
    setJoinConfig,
    joiningRoom,
    joinError,
    autoCaptureEnabled,
    captureStatus,
    setCaptureStatus,
    autoSyncing,
    lastAutoSyncAt,
    meetingStatus,
    meetingTimezone,
    meetingDescription,
    meetingLink,
    meetingRoomName,
    meetingTitle,
    meetingAttendeeEmails,
    isPreviewMeeting,
    hasJoinReference,
    inlineJoinError,
    roomActionLabel,
    normalizedTranscript,
    canPersist,
    canGenerateNotes,
    hasTranscriptPendingSync,
    roomPinnedToMobileTray,
    canMinimizeRoom,
    isMinimized,
    setIsMinimized,
    isMobileViewport,
    pipSupported,
    pipActive,
    setRoomViewportElement,
    togglePictureInPicture,
    toggleMinimizedRoom,
    handleJoinRoom,
    finalizeMeetingAfterRoomExit,
    handleGenerateNotes,
    handleRetryPostCallProcessing,
    handleOperationsOpenChange,
  }
}
