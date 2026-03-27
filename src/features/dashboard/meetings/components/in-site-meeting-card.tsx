'use client'

import { useCallback, useState } from 'react'

import { useToast } from '@/shared/ui/use-toast'

import { useInSiteMeetingRoomController } from '../hooks/use-in-site-meeting-room-controller'
import type { MeetingRoomPageProps } from './in-site-meeting-card.shared'
import {
  MeetingRoomCanvasSection,
  MeetingRoomHeroSection,
  MeetingRoomLeaveDialog,
  MeetingRoomPageHeader,
  MeetingRoomToolsSection,
} from './in-site-meeting-card-sections'
import { InSiteMeetingOperationsSheet } from './in-site-meeting-operations-sheet'

export function MeetingRoomPage(props: MeetingRoomPageProps) {
  const { meeting, onClose } = props
  const { toast } = useToast()
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
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

        const handleOpenSidebar = useCallback(() => {
          handleOperationsOpenChange(true)
        }, [handleOperationsOpenChange])

        const handleCopyLink = useCallback(async () => {
          if (typeof navigator === 'undefined' || !meetingLink) {
            return
          }

          try {
            await navigator.clipboard.writeText(meetingLink)
            toast({
              title: 'Room link copied',
              description: 'Share the Cohorts room URL with attendees who need direct access.',
            })
          } catch {
            toast({
              variant: 'destructive',
              title: 'Copy failed',
              description: 'Clipboard access is unavailable. Copy the room URL manually from the address bar.',
            })
          }
        }, [meetingLink, toast])

        const handleDisconnected = useCallback(() => {
          setJoinConfig(null)
          setInterimTranscript('')
          finalizeMeetingAfterRoomExit(false)
        }, [finalizeMeetingAfterRoomExit, setInterimTranscript, setJoinConfig])

        const handleBack = useCallback(() => {
          if (joinConfig) {
            setLeaveDialogOpen(true)
            return
          }

          onClose()
        }, [joinConfig, onClose])

        const handleConfirmLeave = useCallback(() => {
          setLeaveDialogOpen(false)
          finalizeMeetingAfterRoomExit(true)
        }, [finalizeMeetingAfterRoomExit])

  const meetingShell = (
    <>
      <div className="flex flex-col gap-5 px-5 py-5 lg:px-6">
        <MeetingRoomHeroSection
          meetingStatus={meetingStatus}
          meetingTitle={meetingTitle}
          meetingDescription={meetingDescription}
          meetingStartTimeMs={meeting.startTimeMs}
          meetingEndTimeMs={meeting.endTimeMs}
          meetingTimezone={meetingTimezone}
          joinConfigPresent={Boolean(joinConfig)}
          isMobileViewport={isMobileViewport}
          pipSupported={pipSupported}
          pipActive={pipActive}
          canMinimizeRoom={canMinimizeRoom}
          isMinimized={isMinimized}
          meetingLink={meetingLink}
          onOpenSidebar={handleOpenSidebar}
          onTogglePictureInPicture={togglePictureInPicture}
          onToggleMinimize={toggleMinimizedRoom}
          onCopyLink={handleCopyLink}
        />

        <MeetingRoomCanvasSection
          autoCaptureEnabled={autoCaptureEnabled && canPersist}
          autoSyncing={autoSyncing}
          canMinimize={canMinimizeRoom}
          finalizingSession={finalizingSession}
          hasJoinReference={hasJoinReference}
          inlineJoinError={inlineJoinError}
          isMinimized={isMinimized}
          joinConfig={joinConfig}
          joinError={joinError}
          layoutContext={liveRoomLayoutContext}
          meetingTitle={meetingTitle}
          notesProcessingError={notesProcessingError}
          notesProcessingState={notesProcessingState}
          onAppendTranscript={appendTranscriptSnippet}
          onCaptureStatusChange={setCaptureStatus}
          onDisconnected={handleDisconnected}
          onError={setJoinError}
          onInterimTranscriptChange={setInterimTranscript}
          onToggleMinimize={toggleMinimizedRoom}
          onTogglePictureInPicture={togglePictureInPicture}
          pipActive={pipActive}
          pipSupported={pipSupported}
          roomPinnedToMobileTray={roomPinnedToMobileTray}
          roomViewportRef={setRoomViewportElement}
          summaryPreview={summaryPreview}
          transcriptProcessingError={transcriptProcessingError}
          transcriptProcessingState={transcriptProcessingState}
        />

        <MeetingRoomToolsSection
          captureErrorPresent={Boolean(captureStatus.error)}
          captureListening={captureStatus.listening}
          finalizingSession={finalizingSession}
          hasTranscriptSaved={Boolean(transcriptSavedAt)}
          roomAutomationMessage={roomAutomationMessage}
          roomAutomationBadge={roomAutomationBadge}
          lastAutoSyncAt={lastAutoSyncAt}
          summaryReady={Boolean(summaryPreview)}
          transcriptProcessingState={transcriptProcessingState}
          notesProcessingState={notesProcessingState}
          meetingTimezone={meetingTimezone}
          joinConfigPresent={Boolean(joinConfig)}
          isMobileViewport={isMobileViewport}
          isMinimized={isMinimized}
          pipSupported={pipSupported}
          pipActive={pipActive}
          joiningRoom={joiningRoom}
          isPreviewMeeting={isPreviewMeeting}
          hasJoinReference={hasJoinReference}
          roomActionLabel={roomActionLabel}
          onOpenSidebar={handleOpenSidebar}
          onToggleMinimize={toggleMinimizedRoom}
          onJoinRoom={handleJoinRoom}
        />
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
        retryingPostCallProcessing={retryingPostCallProcessing}
        canRetryPostCallProcessing={canPersist && normalizedTranscript.length >= 20}
        onRetryPostCallProcessing={handleRetryPostCallProcessing}
      />
    </>
  )

  return (
    <div className="flex flex-col gap-4">
      <MeetingRoomPageHeader
        joinConfigPresent={Boolean(joinConfig)}
        onBack={handleBack}
      />

      <div className="overflow-hidden rounded-[32px] border border-border/80 bg-background shadow-sm">
        {meetingShell}
      </div>

      <MeetingRoomLeaveDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        onConfirm={handleConfirmLeave}
      />
    </div>
  )
}
