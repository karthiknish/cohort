'use client'

import { useCallback, useMemo } from 'react'
import { useMeetingsPageContext } from './meetings-page-provider'
import {
  ActiveMeetingRoomSection,
  MeetingsDefaultView,
  SharedRoomLoadingSection,
} from './meetings-page-shell-sections'

export function MeetingsPageShell() {
  const {
    canSchedule,
    cancelDialogMeeting,
    cancellingMeetingId,
    closeMeetingRoom,
    description,
    durationMinutes,
    editingMeeting,
    handleCancelMeeting,
    handleConfirmCancelMeeting,
    handleConnectGoogleWorkspace: connectGoogleWorkspace,
    handleDisconnectGoogleWorkspace: disconnectGoogleWorkspace,
    handleMarkCompleted,
    handleMeetingUpdated,
    handleRescheduleMeeting,
    handleScheduleMeeting,
    handleSubmitQuickMeet,
    googleWorkspaceStatusLoading,
    isPreviewMode,
    meetingDate,
    meetingTime,
    openInSiteMeeting,
    quickAttendeeDraft,
    quickAttendees,
    quickMeetDescription,
    quickMeetDialogOpen,
    quickMeetDurationMinutes,
    quickMeetTitle,
    quickStarting,
    resetQuickMeetForm,
    resetScheduleForm,
    resolvedActiveInSiteMeeting,
    resolvedGoogleWorkspaceStatus,
    scheduleAttendeeDraft,
    scheduleAttendees,
    scheduleDisabled,
    scheduleRequiresGoogleWorkspace,
    scheduling,
    setCancelDialogMeeting,
    setDescription,
    setDurationMinutes,
    setMeetingDate,
    setMeetingTime,
    setQuickMeetDescription,
    setQuickMeetDialogOpen,
    setQuickMeetDurationMinutes,
    setQuickMeetTitle,
    setTimezone,
    setTitle,
    sharedRoomName,
    timezone,
    title,
    upcomingMeetings,
    upcomingMeetingsLoading,
  } = useMeetingsPageContext()

  const handleConnectGoogleWorkspaceAction = useCallback(() => {
    void connectGoogleWorkspace()
  }, [connectGoogleWorkspace])

  const handleDisconnectGoogleWorkspaceAction = useCallback(() => {
    void disconnectGoogleWorkspace()
  }, [disconnectGoogleWorkspace])

  const handleStartQuickMeet = useCallback(() => {
    setQuickMeetDialogOpen(true)
  }, [setQuickMeetDialogOpen])

  const handleMeetingCancelDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !cancellingMeetingId) {
        setCancelDialogMeeting(null)
      }
    },
    [cancellingMeetingId, setCancelDialogMeeting]
  )

  const handleQuickMeetDialogOpenChange = useCallback(
    (open: boolean) => {
      if (quickStarting) return
      setQuickMeetDialogOpen(open)
      if (!open) {
        resetQuickMeetForm()
      }
    },
    [quickStarting, resetQuickMeetForm, setQuickMeetDialogOpen]
  )

  const handleQuickMeetCancel = useCallback(() => {
    if (quickStarting) return
    setQuickMeetDialogOpen(false)
    resetQuickMeetForm()
  }, [quickStarting, resetQuickMeetForm, setQuickMeetDialogOpen])

  const handleMarkCompletedClick = useCallback(
    (legacyId: string) => {
      void handleMarkCompleted(legacyId)
    },
    [handleMarkCompleted]
  )

  const scheduleCardSharedProps = useMemo(
    () => ({
      meetingDate,
      meetingTime,
      durationMinutes,
      timezone,
      title,
      description,
      attendeeInput: scheduleAttendees.input,
      attendeeEmails: scheduleAttendees.emails,
      attendeeSuggestions: scheduleAttendees.suggestions,
      scheduleRequiresGoogleWorkspace,
      googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
      scheduleDisabled,
      submitDisabled: scheduleDisabled || !scheduleAttendeeDraft.hasParticipants,
      scheduling,
      onMeetingDateChange: setMeetingDate,
      onMeetingTimeChange: setMeetingTime,
      onDurationMinutesChange: setDurationMinutes,
      onTimezoneChange: setTimezone,
      onTitleChange: setTitle,
      onDescriptionChange: setDescription,
      onAttendeeInputChange: scheduleAttendees.setInput,
      onAttendeeKeyDown: scheduleAttendees.handleKeyDown,
      onCommitAttendeeInput: scheduleAttendees.commitInput,
      onRemoveAttendee: scheduleAttendees.removeEmail,
      onAddSuggestedAttendee: scheduleAttendees.addSuggestedEmail,
      onSubmit: handleScheduleMeeting,
    }),
    [
      description,
      durationMinutes,
      handleScheduleMeeting,
      meetingDate,
      meetingTime,
      resolvedGoogleWorkspaceStatus?.connected,
      scheduleAttendeeDraft.hasParticipants,
      scheduleAttendees.addSuggestedEmail,
      scheduleAttendees.commitInput,
      scheduleAttendees.emails,
      scheduleAttendees.handleKeyDown,
      scheduleAttendees.input,
      scheduleAttendees.removeEmail,
      scheduleAttendees.setInput,
      scheduleAttendees.suggestions,
      scheduleDisabled,
      scheduleRequiresGoogleWorkspace,
      scheduling,
      setDescription,
      setDurationMinutes,
      setMeetingDate,
      setMeetingTime,
      setTimezone,
      setTitle,
      timezone,
      title,
    ]
  )

  const googleWorkspaceCardProps = useMemo(
    () => ({
      connected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
      canSchedule: canSchedule && !isPreviewMode,
      loading: googleWorkspaceStatusLoading,
      onConnect: handleConnectGoogleWorkspaceAction,
      onDisconnect: handleDisconnectGoogleWorkspaceAction,
    }),
    [
      canSchedule,
      googleWorkspaceStatusLoading,
      handleConnectGoogleWorkspaceAction,
      handleDisconnectGoogleWorkspaceAction,
      isPreviewMode,
      resolvedGoogleWorkspaceStatus?.connected,
    ]
  )

  const meetingsHeaderProps = useMemo(
    () => ({
      googleWorkspaceConnected: Boolean(resolvedGoogleWorkspaceStatus?.connected),
      googleWorkspaceStatusLoading,
      canSchedule,
      quickStarting,
      quickMeetDisabled: isPreviewMode || googleWorkspaceStatusLoading || !resolvedGoogleWorkspaceStatus?.connected,
      onStartQuickMeet: handleStartQuickMeet,
    }),
    [
      canSchedule,
      googleWorkspaceStatusLoading,
      handleStartQuickMeet,
      isPreviewMode,
      quickStarting,
      resolvedGoogleWorkspaceStatus?.connected,
    ]
  )

  const meetingCancelDialogProps = useMemo(
    () => ({
      meeting: cancelDialogMeeting,
      cancellingMeetingId,
      onOpenChange: handleMeetingCancelDialogOpenChange,
      onConfirm: handleConfirmCancelMeeting,
    }),
    [cancelDialogMeeting, cancellingMeetingId, handleConfirmCancelMeeting, handleMeetingCancelDialogOpenChange]
  )

  const quickMeetDialogProps = useMemo(
    () => ({
      open: quickMeetDialogOpen,
      quickStarting,
      title: quickMeetTitle,
      description: quickMeetDescription,
      durationMinutes: quickMeetDurationMinutes,
      timezone,
      attendeeInput: quickAttendees.input,
      attendeeEmails: quickAttendees.emails,
      attendeeSuggestions: quickAttendees.suggestions,
      submitDisabled: !quickAttendeeDraft.hasParticipants,
      onOpenChange: handleQuickMeetDialogOpenChange,
      onCancel: handleQuickMeetCancel,
      onSubmit: handleSubmitQuickMeet,
      onTitleChange: setQuickMeetTitle,
      onDescriptionChange: setQuickMeetDescription,
      onDurationMinutesChange: setQuickMeetDurationMinutes,
      onTimezoneChange: setTimezone,
      onAttendeeInputChange: quickAttendees.setInput,
      onAttendeeKeyDown: quickAttendees.handleKeyDown,
      onCommitAttendeeInput: quickAttendees.commitInput,
      onRemoveAttendee: quickAttendees.removeEmail,
      onAddSuggestedAttendee: quickAttendees.addSuggestedEmail,
    }),
    [
      handleQuickMeetCancel,
      handleQuickMeetDialogOpenChange,
      handleSubmitQuickMeet,
      quickAttendeeDraft.hasParticipants,
      quickAttendees.addSuggestedEmail,
      quickAttendees.commitInput,
      quickAttendees.emails,
      quickAttendees.handleKeyDown,
      quickAttendees.input,
      quickAttendees.removeEmail,
      quickAttendees.setInput,
      quickAttendees.suggestions,
      quickMeetDescription,
      quickMeetDialogOpen,
      quickMeetDurationMinutes,
      quickMeetTitle,
      quickStarting,
      setQuickMeetDescription,
      setQuickMeetDurationMinutes,
      setQuickMeetTitle,
      setTimezone,
      timezone,
    ]
  )

  const rescheduleMeetingCardProps = useMemo(
    () => ({ ...scheduleCardSharedProps, onReset: resetScheduleForm }),
    [resetScheduleForm, scheduleCardSharedProps]
  )

  const upcomingMeetingsCardProps = useMemo(
    () => ({
      meetings: upcomingMeetings,
      loading: upcomingMeetingsLoading,
      canSchedule: canSchedule && !isPreviewMode,
      cancellingMeetingId,
      onOpenInSiteMeeting: openInSiteMeeting,
      onRescheduleMeeting: handleRescheduleMeeting,
      onCancelMeeting: handleCancelMeeting,
      onMarkCompleted: handleMarkCompletedClick,
    }),
    [
      canSchedule,
      cancellingMeetingId,
      handleCancelMeeting,
      handleMarkCompletedClick,
      handleRescheduleMeeting,
      isPreviewMode,
      openInSiteMeeting,
      upcomingMeetings,
      upcomingMeetingsLoading,
    ]
  )

  if (resolvedActiveInSiteMeeting) {
    return (
      <ActiveMeetingRoomSection
        meetingRoomKey={
          [
            resolvedActiveInSiteMeeting.legacyId,
            resolvedActiveInSiteMeeting.calendarEventId,
            resolvedActiveInSiteMeeting.roomName,
            sharedRoomName,
          ]
            .filter(Boolean)
            .join(':') || 'active-meeting'
        }
        meeting={resolvedActiveInSiteMeeting}
        canRecord={canSchedule && !isPreviewMode}
        onMeetingUpdated={handleMeetingUpdated}
        fallbackRoomName={sharedRoomName}
        onClose={closeMeetingRoom}
      />
    )
  }

  if (sharedRoomName) {
    return <SharedRoomLoadingSection sharedRoomName={sharedRoomName} onBack={closeMeetingRoom} />
  }

  return (
    <MeetingsDefaultView
      createMeetingCardProps={scheduleCardSharedProps}
      editingMeeting={Boolean(editingMeeting)}
      googleWorkspaceCardProps={googleWorkspaceCardProps}
      meetingsHeaderProps={meetingsHeaderProps}
      meetingCancelDialogProps={meetingCancelDialogProps}
      quickMeetDialogProps={quickMeetDialogProps}
      rescheduleMeetingCardProps={rescheduleMeetingCardProps}
      showPreviewMode={isPreviewMode}
      showReadOnlyAccessAlert={!canSchedule}
      upcomingMeetingsCardProps={upcomingMeetingsCardProps}
    />
  )
}