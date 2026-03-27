'use client'

import { useCallback } from 'react'
import { LiveKitRoom } from '@/shared/ui/livekit'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Clock3,
  Copy,
  LoaderCircle,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Video,
} from 'lucide-react'
import type { ComponentProps } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

import type { MeetingProcessingState } from '../types'
import { formatLocalDateTime } from '../utils'
import { MeetingAutomationPipeline } from './meeting-automation-pipeline'
import { InSiteMeetingLiveRoomCanvas } from './in-site-meeting-live-room-canvas'

type MeetingRoomCanvasProps = ComponentProps<typeof InSiteMeetingLiveRoomCanvas>
type JoinConfig = {
  token: string
  serverUrl: string
}

export function MeetingRoomPageHeader({
  joinConfigPresent,
  onBack,
}: {
  joinConfigPresent: boolean
  onBack: () => void
}) {
  return (
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
      <Button type="button" variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {joinConfigPresent ? 'Leave room' : 'Back to meetings'}
      </Button>
    </div>
  )
}

export function MeetingRoomHeroSection({
  meetingStatus,
  meetingTitle,
  meetingDescription,
  meetingStartTimeMs,
  meetingEndTimeMs,
  meetingTimezone,
  joinConfigPresent,
  isMobileViewport,
  pipSupported,
  pipActive,
  canMinimizeRoom,
  isMinimized,
  meetingLink,
  onOpenSidebar,
  onTogglePictureInPicture,
  onToggleMinimize,
  onCopyLink,
}: {
  meetingStatus: string
  meetingTitle: string
  meetingDescription: string | null
  meetingStartTimeMs: number
  meetingEndTimeMs: number
  meetingTimezone: string
  joinConfigPresent: boolean
  isMobileViewport: boolean
  pipSupported: boolean
  pipActive: boolean
  canMinimizeRoom: boolean
  isMinimized: boolean
  meetingLink: string | null
  onOpenSidebar: () => void
  onTogglePictureInPicture: () => void
  onToggleMinimize: () => void
  onCopyLink: () => void
}) {
  const roomModeMessage = isMinimized
    ? 'Mobile tray is active. Restore the full room whenever you want to return to the main call view.'
    : pipActive
      ? 'Picture in Picture is active so the call can stay visible while you browse the workspace.'
      : joinConfigPresent && !pipSupported
        ? 'This browser keeps the room embedded in Cohorts because Picture in Picture is unavailable here.'
        : canMinimizeRoom
          ? 'Minimize the room into the mobile tray to keep the call pinned while you review notes.'
          : joinConfigPresent
            ? 'The room is live in Cohorts. Picture in Picture and the mobile tray are available when supported.'
            : 'Join the room to unlock PiP and mobile tray controls.'

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <CalendarDays className="mr-1 h-3 w-3" />
            {formatLocalDateTime(meetingStartTimeMs, meetingTimezone)}
          </Badge>
          <Badge variant="outline">
            <Clock3 className="mr-1 h-3 w-3" />
            Ends {formatLocalDateTime(meetingEndTimeMs, meetingTimezone)}
          </Badge>
          <Badge variant="secondary">{meetingStatus.replace('_', ' ')}</Badge>
          <Badge variant={joinConfigPresent ? 'secondary' : 'outline'}>{joinConfigPresent ? 'Room live' : 'Waiting to join'}</Badge>
          {joinConfigPresent ? <Badge variant={pipActive ? 'secondary' : 'outline'}>{pipActive ? 'PiP active' : pipSupported ? 'PiP available' : 'PiP unavailable'}</Badge> : null}
          {joinConfigPresent ? <Badge variant={isMinimized ? 'secondary' : 'outline'}>{isMinimized ? 'Mobile tray active' : isMobileViewport ? 'Mobile tray available' : 'Mobile tray on mobile'}</Badge> : null}
        </div>
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Cohorts room</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight lg:text-[2.75rem]">{meetingTitle}</h2>
        </div>
        {meetingDescription ? <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{meetingDescription}</p> : null}
        <p className="max-w-2xl text-sm text-muted-foreground">{roomModeMessage}</p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
        <Button type="button" variant="outline" onClick={onOpenSidebar}>
          Room sidebar
        </Button>
        {joinConfigPresent ? (
          <Button type="button" variant="outline" onClick={onTogglePictureInPicture} disabled={!pipSupported} title={pipSupported ? undefined : 'Picture in Picture is unavailable in this browser'}>
            <PictureInPicture2 className="mr-2 h-4 w-4" />
            {pipActive ? 'Exit PiP' : pipSupported ? 'Enter PiP' : 'PiP unavailable'}
          </Button>
        ) : null}
        {joinConfigPresent && canMinimizeRoom ? (
          <Button type="button" variant="outline" className="md:hidden" onClick={onToggleMinimize}>
            {isMinimized ? <Maximize2 className="mr-2 h-4 w-4" /> : <Minimize2 className="mr-2 h-4 w-4" />}
            {isMinimized ? 'Restore room' : 'Send to tray'}
          </Button>
        ) : null}
        {meetingLink ? (
          <Button type="button" variant="outline" className="min-w-[152px]" onClick={onCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>
        ) : null}
        </div>
        {joinConfigPresent ? <p className="text-xs text-muted-foreground sm:max-w-xs sm:text-right">{isMinimized ? 'The call is pinned to the bottom tray and will keep running while you review meeting details.' : pipActive ? 'Picture in Picture is active. Use the browser mini-player or Exit PiP to return to the full room view.' : !pipSupported ? 'Picture in Picture is unavailable in this browser, so the call will remain embedded inside Cohorts.' : canMinimizeRoom ? 'On mobile, you can send the room to the tray without leaving the call.' : 'Use PiP or the room sidebar to keep the meeting visible while you multitask.'}</p> : null}
      </div>
    </div>
  )
}

export function MeetingRoomEmptyState({
  inlineJoinError,
  hasJoinReference,
}: {
  inlineJoinError: string | null
  hasJoinReference: boolean
}) {
  return (
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
            <p className="mt-2 text-sm text-foreground">Transcript is persisted automatically, then AI notes start regenerating once enough meeting context has been captured.</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">PiP + mobile tray</p>
            <p className="mt-2 text-sm text-foreground">Pop the room into Picture in Picture or pin it into a minimized mobile tray without dropping the call.</p>
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
  )
}

export function MeetingRoomCanvasSection({
  autoCaptureEnabled,
  autoSyncing,
  canMinimize,
  finalizingSession,
  hasJoinReference,
  inlineJoinError,
  isMinimized,
  joinConfig,
  joinError,
  layoutContext,
  meetingTitle,
  notesProcessingError,
  notesProcessingState,
  onAppendTranscript,
  onCaptureStatusChange,
  onDisconnected,
  onError,
  onInterimTranscriptChange,
  onToggleMinimize,
  onTogglePictureInPicture,
  pipActive,
  pipSupported,
  roomPinnedToMobileTray,
  roomViewportRef,
  summaryPreview,
  transcriptProcessingError,
  transcriptProcessingState,
}: MeetingRoomCanvasProps & {
  hasJoinReference: boolean
  inlineJoinError: string | null
  joinConfig: JoinConfig | null
  joinError: string | null
  onDisconnected: () => void
  onError: (message: string) => void
  roomPinnedToMobileTray: boolean
}) {
  const handleLiveKitError = useCallback((error: { message: string }) => {
    onError(error.message)
  }, [onError])

  return (
    <div className={cn('relative', roomPinnedToMobileTray ? 'min-h-[168px]' : 'min-h-[420px]')}>
      {joinConfig ? (
        <>
          {roomPinnedToMobileTray ? (
            <div className="rounded-[28px] border border-dashed border-border bg-muted/20 p-5 shadow-sm md:hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Room minimized</p>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">The call is still running in Cohorts.</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Mobile tray active</Badge>
                    <Badge variant={pipActive ? 'secondary' : 'outline'}>{pipActive ? 'PiP active' : pipSupported ? 'PiP available' : 'PiP unavailable'}</Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Keep browsing the meeting details while the room stays pinned to the bottom of the screen. Restore the room anytime without dropping the call.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={onToggleMinimize}>
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Restore
                </Button>
              </div>
            </div>
          ) : null}

          <LiveKitRoom
            token={joinConfig.token}
            serverUrl={joinConfig.serverUrl}
            connect
            audio
            video
            onDisconnected={onDisconnected}
            onError={handleLiveKitError}
            className={cn(
              roomPinnedToMobileTray
                ? 'fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto w-auto max-w-[calc(100vw-2rem)] md:hidden'
                : 'h-full',
            )}
          >
            <InSiteMeetingLiveRoomCanvas
              meetingTitle={meetingTitle}
              layoutContext={layoutContext}
              autoCaptureEnabled={autoCaptureEnabled}
              compact={roomPinnedToMobileTray}
              pipSupported={pipSupported}
              pipActive={pipActive}
              canMinimize={canMinimize}
              isMinimized={isMinimized}
              autoSyncing={autoSyncing}
              finalizingSession={finalizingSession}
              transcriptProcessingState={transcriptProcessingState}
              notesProcessingState={notesProcessingState}
              notesProcessingError={notesProcessingError}
              transcriptProcessingError={transcriptProcessingError}
              summaryPreview={summaryPreview}
              onTogglePictureInPicture={onTogglePictureInPicture}
              onToggleMinimize={onToggleMinimize}
              roomViewportRef={roomViewportRef}
              onAppendTranscript={onAppendTranscript}
              onInterimTranscriptChange={onInterimTranscriptChange}
              onCaptureStatusChange={onCaptureStatusChange}
            />
          </LiveKitRoom>
        </>
      ) : (
        <MeetingRoomEmptyState inlineJoinError={inlineJoinError} hasJoinReference={hasJoinReference} />
      )}

      {joinConfig && joinError ? (
        <Alert className="border-destructive/40 bg-destructive/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Room connection warning</AlertTitle>
          <AlertDescription>{joinError}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

export function MeetingRoomToolsSection({
  captureErrorPresent,
  captureListening,
  finalizingSession,
  hasTranscriptSaved,
  roomAutomationMessage,
  roomAutomationBadge,
  lastAutoSyncAt,
  summaryReady,
  transcriptProcessingState,
  notesProcessingState,
  meetingTimezone,
  joinConfigPresent,
  isMobileViewport,
  isMinimized,
  pipSupported,
  pipActive,
  joiningRoom,
  isPreviewMeeting,
  hasJoinReference,
  roomActionLabel,
  onOpenSidebar,
  onToggleMinimize,
  onJoinRoom,
}: {
  captureErrorPresent: boolean
  captureListening: boolean
  finalizingSession: boolean
  hasTranscriptSaved: boolean
  roomAutomationMessage: string
  roomAutomationBadge: string
  lastAutoSyncAt: number | null
  summaryReady: boolean
  transcriptProcessingState: MeetingProcessingState
  notesProcessingState: MeetingProcessingState
  meetingTimezone: string
  joinConfigPresent: boolean
  isMobileViewport: boolean
  isMinimized: boolean
  pipSupported: boolean
  pipActive: boolean
  joiningRoom: boolean
  isPreviewMeeting: boolean
  hasJoinReference: boolean
  roomActionLabel: string
  onOpenSidebar: () => void
  onToggleMinimize: () => void
  onJoinRoom: () => void
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Room tools</p>
        <p className="mt-1 text-sm text-foreground">{roomAutomationMessage}</p>
        <p className="sr-only" aria-live="polite">
          {`Meeting status: ${roomAutomationBadge}. ${roomAutomationMessage}`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline">{roomAutomationBadge}</Badge>
          {joinConfigPresent ? <Badge variant={pipActive ? 'secondary' : 'outline'}>{pipActive ? 'PiP active' : pipSupported ? 'PiP available' : 'PiP unavailable'}</Badge> : null}
          {joinConfigPresent ? <Badge variant={isMinimized ? 'secondary' : 'outline'}>{isMinimized ? 'Mobile tray active' : isMobileViewport ? 'Mobile tray available' : 'Mobile tray on mobile'}</Badge> : null}
          {lastAutoSyncAt ? <Badge variant="outline">Last sync {formatLocalDateTime(lastAutoSyncAt, meetingTimezone)}</Badge> : null}
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
        {joinConfigPresent ? <p className="mt-3 max-w-2xl text-xs text-muted-foreground">{isMinimized ? 'The mobile tray is active. Expand the room anytime to return to the full call layout.' : pipActive ? 'Picture in Picture is active and the call can stay visible while you move around the dashboard.' : !pipSupported ? 'Picture in Picture is unavailable in this browser, so the room stays embedded inside Cohorts.' : isMobileViewport ? 'This phone-sized view supports both PiP and the mobile tray while the room is live.' : 'PiP is ready when supported, and the mobile tray appears automatically on small screens.'}</p> : null}
        <MeetingAutomationPipeline
          className="mt-3"
          captureErrorPresent={captureErrorPresent}
          captureListening={captureListening}
          finalizingSession={finalizingSession}
          hasTranscriptSaved={hasTranscriptSaved}
          inRoom={joinConfigPresent}
          notesProcessingState={notesProcessingState}
          summaryReady={summaryReady}
          transcriptProcessingState={transcriptProcessingState}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onOpenSidebar}>
          Open sidebar
        </Button>
        {joinConfigPresent && isMobileViewport ? (
          <Button type="button" variant="outline" className="md:hidden" onClick={onToggleMinimize}>
            {isMinimized ? <Maximize2 className="mr-2 h-4 w-4" /> : <Minimize2 className="mr-2 h-4 w-4" />}
            {isMinimized ? 'Restore room' : 'Send to tray'}
          </Button>
        ) : null}
        {!joinConfigPresent ? (
          <Button
            type="button"
            className={cn(getButtonClasses('primary'), 'min-w-[168px]')}
            disabled={joiningRoom || isPreviewMeeting || !hasJoinReference}
            onClick={onJoinRoom}
          >
            {joiningRoom ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
            {roomActionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function MeetingRoomLeaveDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave and finalize this meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            This exits the room and starts transcript finalization plus AI notes generation immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Stay in room</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Leave and finalize</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
