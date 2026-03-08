'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

import { GoogleWorkspaceCard } from './components/google-workspace-card'
import { MeetingRoomPage } from './components/in-site-meeting-card'
import { MeetingCancelDialog } from './components/meeting-cancel-dialog'
import { MeetingRoomLoadingState } from './components/meeting-room-loading-state'
import { MeetingScheduleCard } from './components/meeting-schedule-card'
import { MeetingsHeader } from './components/meetings-header'
import { QuickMeetDialog } from './components/quick-meet-dialog'
import { UpcomingMeetingsCard } from './components/upcoming-meetings-card'
import { useMeetingsPageController } from './hooks/use-meetings-page-controller'

export default function MeetingsPage() {
  const controller = useMeetingsPageController()
  const {
    isPreviewMode,
    canSchedule,
    scheduling,
    quickStarting,
    cancellingMeetingId,
    cancelDialogMeeting,
    resolvedGoogleWorkspaceStatus,
    resolvedActiveInSiteMeeting,
    editingMeeting,
    sharedRoomName,
    title,
    description,
    meetingDate,
    meetingTime,
    durationMinutes,
    timezone,
    quickMeetDialogOpen,
    quickMeetTitle,
    quickMeetDescription,
    quickMeetDurationMinutes,
    scheduleAttendees,
    quickAttendees,
    scheduleAttendeeDraft,
    quickAttendeeDraft,
    scheduleRequiresGoogleWorkspace,
    scheduleDisabled,
    upcomingMeetings,
    setTitle,
    setDescription,
    setMeetingDate,
    setMeetingTime,
    setDurationMinutes,
    setTimezone,
    setQuickMeetDialogOpen,
    setQuickMeetTitle,
    setQuickMeetDescription,
    setQuickMeetDurationMinutes,
    setCancelDialogMeeting,
    closeMeetingRoom,
    resetQuickMeetForm,
    resetScheduleForm,
    handleMeetingUpdated,
    handleConnectGoogleWorkspace,
    handleDisconnectGoogleWorkspace,
    handleSubmitQuickMeet,
    handleScheduleMeeting,
    handleRescheduleMeeting,
    handleCancelMeeting,
    handleConfirmCancelMeeting,
    handleMarkCompleted,
    openInSiteMeeting,
  } = controller

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
        <MeetingRoomLoadingState sharedRoomName={sharedRoomName} onBack={closeMeetingRoom} />
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
        attendeeInput={quickAttendees.input}
        attendeeEmails={quickAttendees.emails}
        attendeeSuggestions={quickAttendees.suggestions}
        submitDisabled={!quickAttendeeDraft.hasParticipants}
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
        onAttendeeInputChange={quickAttendees.setInput}
        onAttendeeKeyDown={quickAttendees.handleKeyDown}
        onCommitAttendeeInput={quickAttendees.commitInput}
        onRemoveAttendee={quickAttendees.removeEmail}
        onAddSuggestedAttendee={quickAttendees.addSuggestedEmail}
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

      <MeetingCancelDialog
        meeting={cancelDialogMeeting}
        cancellingMeetingId={cancellingMeetingId}
        onOpenChange={(open) => {
          if (!open && !cancellingMeetingId) {
            setCancelDialogMeeting(null)
          }
        }}
        onConfirm={handleConfirmCancelMeeting}
      />

      <MeetingScheduleCard
        editingMeeting={editingMeeting}
        meetingDate={meetingDate}
        meetingTime={meetingTime}
        durationMinutes={durationMinutes}
        timezone={timezone}
        title={title}
        description={description}
        attendeeInput={scheduleAttendees.input}
        attendeeEmails={scheduleAttendees.emails}
        attendeeSuggestions={scheduleAttendees.suggestions}
        scheduleRequiresGoogleWorkspace={scheduleRequiresGoogleWorkspace}
        googleWorkspaceConnected={Boolean(resolvedGoogleWorkspaceStatus?.connected)}
        scheduleDisabled={scheduleDisabled}
        submitDisabled={scheduleDisabled || !scheduleAttendeeDraft.hasParticipants}
        scheduling={scheduling}
        onMeetingDateChange={setMeetingDate}
        onMeetingTimeChange={setMeetingTime}
        onDurationMinutesChange={setDurationMinutes}
        onTimezoneChange={setTimezone}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onAttendeeInputChange={scheduleAttendees.setInput}
        onAttendeeKeyDown={scheduleAttendees.handleKeyDown}
        onCommitAttendeeInput={scheduleAttendees.commitInput}
        onRemoveAttendee={scheduleAttendees.removeEmail}
        onAddSuggestedAttendee={scheduleAttendees.addSuggestedEmail}
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
