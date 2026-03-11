'use client'

import { useEffect } from 'react'

import { useTracks, type useCreateLayoutContext } from '@livekit/components-react'
import { Track } from 'livekit-client'

import { useVoiceInput } from '@/hooks/use-voice-input'

import type { CaptureStatus } from './in-site-meeting-card.shared'
import {
  LiveRoomCanvasShell,
  LiveRoomCanvasViewport,
} from './in-site-meeting-live-room-canvas-sections'

type LiveRoomCanvasProps = {
  meetingTitle: string
  layoutContext: ReturnType<typeof useCreateLayoutContext>
  autoCaptureEnabled: boolean
  compact?: boolean
  pipSupported: boolean
  pipActive: boolean
  canMinimize: boolean
  isMinimized: boolean
  autoSyncing: boolean
  finalizingSession: boolean
  transcriptProcessingState: 'idle' | 'processing' | 'failed'
  notesProcessingState: 'idle' | 'processing' | 'failed'
  notesProcessingError: string | null
  transcriptProcessingError: string | null
  summaryPreview: string | null
  onTogglePictureInPicture: () => void
  onToggleMinimize: () => void
  roomViewportRef: (node: HTMLDivElement | null) => void
  onAppendTranscript: (snippet: string) => void
  onInterimTranscriptChange: (transcript: string) => void
  onCaptureStatusChange: (status: CaptureStatus) => void
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

export function InSiteMeetingLiveRoomCanvas(props: LiveRoomCanvasProps) {
  const {
    meetingTitle,
    layoutContext,
    autoCaptureEnabled,
    compact = false,
    pipSupported,
    pipActive,
    canMinimize,
    isMinimized,
    autoSyncing,
    finalizingSession,
    transcriptProcessingState,
    notesProcessingState,
    notesProcessingError,
    transcriptProcessingError,
    summaryPreview,
    onTogglePictureInPicture,
    onToggleMinimize,
    roomViewportRef,
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

  const captureLabel = isListening ? 'Recording live' : 'Capture armed'
  const aiStatusLabel = autoSyncing || notesProcessingState === 'processing'
    ? 'AI notes syncing'
    : finalizingSession || transcriptProcessingState === 'processing'
      ? 'Finalizing transcript'
      : notesProcessingError || transcriptProcessingError
        ? 'Automation needs attention'
        : summaryPreview
          ? 'AI summary ready'
          : 'Listening for transcript'
  const shouldUseAssertiveLiveRegion = Boolean(notesProcessingError || transcriptProcessingError)

  return (
    <LiveRoomCanvasShell
      aiStatusLabel={aiStatusLabel}
      captureLabel={captureLabel}
      compact={compact}
      isSupported={isSupported}
      layoutContext={layoutContext}
      meetingTitle={meetingTitle}
      roomViewportRef={roomViewportRef}
      shouldUseAssertiveLiveRegion={shouldUseAssertiveLiveRegion}
    >
      <LiveRoomCanvasViewport
        aiStatusLabel={aiStatusLabel}
        autoSyncing={autoSyncing}
        canMinimize={canMinimize}
        captureLabel={captureLabel}
        compact={compact}
        finalizingSession={finalizingSession}
        isMinimized={isMinimized}
        notesProcessingState={notesProcessingState}
        onToggleMinimize={onToggleMinimize}
        onTogglePictureInPicture={onTogglePictureInPicture}
        pipActive={pipActive}
        pipSupported={pipSupported}
        tracks={tracks}
        transcriptProcessingState={transcriptProcessingState}
      />
    </LiveRoomCanvasShell>
  )
}
