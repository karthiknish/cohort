'use client'

import { LiveKitRoom } from '@livekit/components-react'
import { AlertTriangle, ArrowLeft, CalendarDays, Clock3, Copy, LoaderCircle, Maximize2, Minimize2, PictureInPicture2, Video } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

import { useInSiteMeetingRoomController } from '../hooks/use-in-site-meeting-room-controller'
import {
  formatLocalDateTime,
} from '../utils'
import type { MeetingRoomPageProps } from './in-site-meeting-card.shared'
import { InSiteMeetingLiveRoomCanvas } from './in-site-meeting-live-room-canvas'
import { InSiteMeetingOperationsSheet } from './in-site-meeting-operations-sheet'

export function MeetingRoomPage(props: MeetingRoomPageProps) {
  const { meeting, onClose } = props
  const { toast } = useToast()
  const controller = useInSiteMeetingRoomController(props)
  const {
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
    isMobileViewport,
    pipSupported,
    pipActive,
    setRoomViewportElement,
    togglePictureInPicture,
    toggleMinimizedRoom,
    handleJoinRoom,
    finalizeMeetingAfterRoomExit,
    handleGenerateNotes,
    handleOperationsOpenChange,
  } = controller

  const roomAutomationMessage = autoSyncing || notesProcessingState === 'processing'
    ? 'Transcript is synced and AI notes are regenerating in the background.'
    : finalizingSession || transcriptProcessingState === 'processing'
      ? 'The call is wrapping up and the final transcript package is being processed.'
      : notesProcessingError || transcriptProcessingError
        ? 'Room automation needs attention. Open the sidebar for the latest processing error.'
        : hasTranscriptPendingSync
          ? 'New transcript lines are queued and will sync shortly.'
          : summaryPreview
            ? 'Transcript capture and AI notes are in sync.'
            : normalizedTranscript.length >= 20
              ? 'Transcript capture is active. AI notes will generate automatically as the room continues.'
              : 'Join the room and speak naturally. Cohorts will save transcript first, then upgrade to AI notes.'

  const roomAutomationBadge = autoSyncing || notesProcessingState === 'processing'
    ? 'AI notes syncing'
    : finalizingSession || transcriptProcessingState === 'processing'
      ? 'Finalizing transcript'
      : notesProcessingError || transcriptProcessingError
        ? 'Attention needed'
        : hasTranscriptPendingSync
          ? 'Pending sync'
          : summaryPreview
            ? 'Summary ready'
            : 'Listening'

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
            <Button type="button" variant="outline" onClick={() => handleOperationsOpenChange(true)}>
              Room sidebar
            </Button>
            {joinConfig && pipSupported ? (
              <Button type="button" variant="outline" onClick={togglePictureInPicture}>
                <PictureInPicture2 className="mr-2 h-4 w-4" />
                {pipActive ? 'Exit PiP' : 'Picture in Picture'}
              </Button>
            ) : null}
            {joinConfig && canMinimizeRoom ? (
              <Button type="button" variant="outline" className="md:hidden" onClick={toggleMinimizedRoom}>
                {isMinimized ? <Maximize2 className="mr-2 h-4 w-4" /> : <Minimize2 className="mr-2 h-4 w-4" />}
                {isMinimized ? 'Expand room' : 'Minimize room'}
              </Button>
            ) : null}
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

        <div className={cn('relative', roomPinnedToMobileTray ? 'min-h-[168px]' : 'min-h-[420px]')}>
          {joinConfig ? (
            <>
              {roomPinnedToMobileTray ? (
                <div className="rounded-[28px] border border-dashed border-border bg-muted/20 p-5 shadow-sm md:hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Room minimized</p>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">The call is still running in Cohorts.</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Keep browsing the meeting details while the room stays pinned to the bottom of the screen.
                      </p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={toggleMinimizedRoom}>
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
                onDisconnected={() => {
                  setJoinConfig(null)
                  setInterimTranscript('')
                  finalizeMeetingAfterRoomExit(false)
                }}
                onError={(error) => {
                  setJoinError(error.message)
                }}
                className={cn(
                  roomPinnedToMobileTray
                    ? 'fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-[calc(100vw-2rem)] md:hidden'
                    : 'h-full',
                )}
              >
                <InSiteMeetingLiveRoomCanvas
                  meetingTitle={meetingTitle}
                  layoutContext={liveRoomLayoutContext}
                  autoCaptureEnabled={autoCaptureEnabled && canPersist}
                  compact={roomPinnedToMobileTray}
                  pipSupported={pipSupported}
                  pipActive={pipActive}
                  canMinimize={canMinimizeRoom}
                  isMinimized={isMinimized}
                  autoSyncing={autoSyncing}
                  finalizingSession={finalizingSession}
                  transcriptProcessingState={transcriptProcessingState}
                  notesProcessingState={notesProcessingState}
                  notesProcessingError={notesProcessingError}
                  transcriptProcessingError={transcriptProcessingError}
                  summaryPreview={summaryPreview}
                  onTogglePictureInPicture={togglePictureInPicture}
                  onToggleMinimize={toggleMinimizedRoom}
                  roomViewportRef={setRoomViewportElement}
                  onAppendTranscript={appendTranscriptSnippet}
                  onInterimTranscriptChange={setInterimTranscript}
                  onCaptureStatusChange={setCaptureStatus}
                />
              </LiveKitRoom>
            </>
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
            <p className="mt-1 text-sm text-foreground">{roomAutomationMessage}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline">{roomAutomationBadge}</Badge>
              {lastAutoSyncAt ? (
                <Badge variant="outline">Last sync {formatLocalDateTime(lastAutoSyncAt, meetingTimezone)}</Badge>
              ) : null}
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
            <Button type="button" variant="outline" onClick={() => handleOperationsOpenChange(true)}>
              Open sidebar
            </Button>
            {joinConfig && isMobileViewport ? (
              <Button type="button" variant="outline" className="md:hidden" onClick={toggleMinimizedRoom}>
                {isMinimized ? <Maximize2 className="mr-2 h-4 w-4" /> : <Minimize2 className="mr-2 h-4 w-4" />}
                {isMinimized ? 'Expand room' : 'Minimize room'}
              </Button>
            ) : null}
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

      <InSiteMeetingOperationsSheet
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
