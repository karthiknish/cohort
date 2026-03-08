'use client'

import { useEffect } from 'react'

import {
  ControlBar,
  GridLayout,
  LayoutContextProvider,
  ParticipantTile,
  RoomAudioRenderer,
  useCreateLayoutContext,
  useTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { LoaderCircle, Maximize2, Minimize2, PictureInPicture2, Radio, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/hooks/use-voice-input'

import type { CaptureStatus } from './in-site-meeting-card.shared'
import { InSiteMeetingRoomChat } from './in-site-meeting-room-chat'

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

  return (
    <LayoutContextProvider value={layoutContext}>
      <div
        ref={roomViewportRef}
        className={cn(
          'meeting-room-livekit-theme flex flex-col overflow-hidden border border-border bg-card shadow-sm',
          compact ? 'min-h-[220px] rounded-[28px]' : 'min-h-[560px] rounded-[32px]',
        )}
      >
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur',
            compact ? 'px-3 py-2.5' : 'px-4 py-3',
          )}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Live room</p>
            <p className={cn('mt-1 font-medium text-foreground', compact ? 'text-xs' : 'text-sm')}>{meetingTitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isListening ? 'secondary' : 'outline'}>
              <Radio className="h-3 w-3" />
              {captureLabel}
            </Badge>
            <Badge variant={isSupported ? 'secondary' : 'outline'}>
              {isSupported ? 'Browser mic ready' : 'Browser mic unavailable'}
            </Badge>
          </div>
        </div>

        <div className={cn('min-h-0 flex-1 bg-background', compact ? 'p-2.5' : 'p-3 lg:p-4')}>
          {tracks.length > 0 ? (
            <div className="relative h-full">
              <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(251,113,133,0.18)] animate-pulse" />
                    {captureLabel}
                  </div>
                  <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/45 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur">
                    {autoSyncing || notesProcessingState === 'processing' || finalizingSession || transcriptProcessingState === 'processing' ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                    )}
                    {aiStatusLabel}
                  </div>
                </div>

                <div className="pointer-events-auto flex gap-2">
                  {pipSupported ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="border border-white/15 bg-slate-950/45 text-white hover:bg-slate-900/60"
                      onClick={onTogglePictureInPicture}
                    >
                      <PictureInPicture2 className="mr-2 h-3.5 w-3.5" />
                      {pipActive ? 'Exit PiP' : 'PiP'}
                    </Button>
                  ) : null}
                  {canMinimize ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="border border-white/15 bg-slate-950/45 text-white hover:bg-slate-900/60 md:hidden"
                      onClick={onToggleMinimize}
                    >
                      {isMinimized ? <Maximize2 className="mr-2 h-3.5 w-3.5" /> : <Minimize2 className="mr-2 h-3.5 w-3.5" />}
                      {isMinimized ? 'Expand' : 'Minimize'}
                    </Button>
                  ) : null}
                </div>
              </div>

              <GridLayout
                tracks={tracks}
                className={cn(
                  'h-full rounded-[26px] border border-border/80 bg-muted/20 p-2',
                  compact ? 'min-h-[150px]' : 'min-h-[420px]',
                )}
              >
                <ParticipantTile />
              </GridLayout>
	              <InSiteMeetingRoomChat compact={compact} />
            </div>
          ) : (
            <div
              className={cn(
                'relative flex h-full items-center justify-center rounded-[26px] border border-dashed border-border bg-muted/20 px-6 text-center',
                compact ? 'min-h-[150px]' : 'min-h-[420px]',
              )}
            >
              <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-50 shadow-sm backdrop-blur">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_0_4px_rgba(251,113,133,0.18)] animate-pulse" />
                  {captureLabel}
                </div>
                <div className="flex gap-2">
                  {pipSupported ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="border border-border/60 bg-background/95"
                      onClick={onTogglePictureInPicture}
                    >
                      <PictureInPicture2 className="mr-2 h-3.5 w-3.5" />
                      {pipActive ? 'Exit PiP' : 'PiP'}
                    </Button>
                  ) : null}
                  {canMinimize ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="border border-border/60 bg-background/95 md:hidden"
                      onClick={onToggleMinimize}
                    >
                      {isMinimized ? <Maximize2 className="mr-2 h-3.5 w-3.5" /> : <Minimize2 className="mr-2 h-3.5 w-3.5" />}
                      {isMinimized ? 'Expand' : 'Minimize'}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="max-w-md space-y-3">
                <p className="text-sm font-medium text-foreground">Camera tiles will appear here once someone joins with video.</p>
                <p className="text-sm text-muted-foreground">
                  You can still start the room, use audio-only mode, and capture transcript data for AI notes.
                </p>
              </div>
	              <InSiteMeetingRoomChat compact={compact} />
            </div>
          )}
        </div>

        <div className={cn('border-t border-border bg-card/95 backdrop-blur', compact ? 'px-2.5 py-2.5' : 'px-3 py-3')}>
          <ControlBar controls={{ chat: false, settings: true }} />
        </div>

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  )
}
