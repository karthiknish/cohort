'use client'

import {
  ActiveMeetingRoomSection,
  MeetingsDefaultView,
  SharedRoomLoadingSection,
} from './meetings-page-shell-sections'
import type { useMeetingsPageContext } from './meetings-page-provider'
import type { useMeetingsPageShellProps } from '../hooks/use-meetings-page-shell-props'

type MeetingsPageContext = ReturnType<typeof useMeetingsPageContext>
type MeetingsPageShellHookProps = ReturnType<typeof useMeetingsPageShellProps>

export type MeetingsPageShellContentProps = {
  context: Pick<MeetingsPageContext, 'resolvedActiveInSiteMeeting' | 'sharedRoomName'>
  shell: MeetingsPageShellHookProps
}

function buildMeetingRoomKey(
  meeting: NonNullable<MeetingsPageContext['resolvedActiveInSiteMeeting']>,
  sharedRoomName: string | null | undefined,
) {
  return (
    [meeting.legacyId, meeting.calendarEventId, meeting.roomName, sharedRoomName].filter(Boolean).join(':') ||
    'active-meeting'
  )
}

export function MeetingsPageShellContent({ context, shell }: MeetingsPageShellContentProps) {
  const { resolvedActiveInSiteMeeting, sharedRoomName } = context
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
  } = shell

  if (resolvedActiveInSiteMeeting) {
    return (
      <ActiveMeetingRoomSection
        meetingRoomKey={buildMeetingRoomKey(resolvedActiveInSiteMeeting, sharedRoomName)}
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
}
