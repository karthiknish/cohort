'use client'

import { useMeetingsPageContext } from './meetings-page-provider'
import {
  ActiveMeetingRoomSection,
  MeetingsDefaultView,
  SharedRoomLoadingSection,
} from './meetings-page-shell-sections'
import { MeetingsPageShellBoundary } from './meetings-page-shell-layout-sections'
import { useMeetingsPageShellProps } from '../hooks/use-meetings-page-shell-props'

export function MeetingsPageShell() {
  const {
    googleWorkspaceStatusLoading,
    meetingsQueryError,
    resolvedActiveInSiteMeeting,
    sharedRoomName,
    upcomingMeetingsLoading,
  } = useMeetingsPageContext()

  const {
    canSchedule,
    isPreviewMode,
    editingMeeting,
    closeMeetingRoom,
    handleMeetingUpdated,
    createMeetingCardProps,
    meetingsHeaderProps,
    meetingCancelDialogProps,
    quickMeetDialogProps,
    rescheduleMeetingCardProps,
    upcomingMeetingsCardProps,
    timezone,
  } = useMeetingsPageShellProps()

  const isInitialLoading =
    !resolvedActiveInSiteMeeting && !sharedRoomName && googleWorkspaceStatusLoading && upcomingMeetingsLoading

  const pageContent = resolvedActiveInSiteMeeting ? (
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
  ) : sharedRoomName ? (
    <SharedRoomLoadingSection sharedRoomName={sharedRoomName} onBack={closeMeetingRoom} />
  ) : (
    <MeetingsDefaultView
      editingMeeting={Boolean(editingMeeting)}
      meetingsHeaderProps={meetingsHeaderProps}
      meetingCancelDialogProps={meetingCancelDialogProps}
      quickMeetDialogProps={quickMeetDialogProps}
      createMeetingCardProps={createMeetingCardProps}
      rescheduleMeetingCardProps={rescheduleMeetingCardProps}
      showPreviewMode={isPreviewMode}
      showReadOnlyAccessAlert={!canSchedule}
      upcomingMeetingsCardProps={upcomingMeetingsCardProps}
      timezone={timezone}
    />
  )

  return (
    <MeetingsPageShellBoundary loading={isInitialLoading} queryError={meetingsQueryError}>
      {pageContent}
    </MeetingsPageShellBoundary>
  )
}
