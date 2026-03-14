'use client'

import type { ComponentProps } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

import { GoogleWorkspaceCard } from './google-workspace-card'
import { MeetingRoomPage } from './in-site-meeting-card'
import { MeetingCancelDialog } from './meeting-cancel-dialog'
import { MeetingRoomLoadingState } from './meeting-room-loading-state'
import { CreateMeetingCard, RescheduleMeetingCard } from './meeting-schedule-card'
import { MeetingsHeader } from './meetings-header'
import { QuickMeetDialog } from './quick-meet-dialog'
import { UpcomingMeetingsCard } from './upcoming-meetings-card'

type MeetingsHeaderProps = ComponentProps<typeof MeetingsHeader>
type QuickMeetDialogProps = ComponentProps<typeof QuickMeetDialog>
type GoogleWorkspaceCardProps = ComponentProps<typeof GoogleWorkspaceCard>
type MeetingCancelDialogProps = ComponentProps<typeof MeetingCancelDialog>
type CreateMeetingCardProps = ComponentProps<typeof CreateMeetingCard>
type RescheduleMeetingCardProps = ComponentProps<typeof RescheduleMeetingCard>
type UpcomingMeetingsCardProps = ComponentProps<typeof UpcomingMeetingsCard>
type MeetingRoomPageProps = ComponentProps<typeof MeetingRoomPage>
type MeetingRoomLoadingStateProps = ComponentProps<typeof MeetingRoomLoadingState>

export function ActiveMeetingRoomSection({
  meetingRoomKey,
  ...meetingRoomProps
}: MeetingRoomPageProps & { meetingRoomKey: string }) {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <MeetingRoomPage key={meetingRoomKey} {...meetingRoomProps} />
    </div>
  )
}

export function SharedRoomLoadingSection(props: MeetingRoomLoadingStateProps) {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <MeetingRoomLoadingState {...props} />
    </div>
  )
}

export function MeetingsDefaultView({
  createMeetingCardProps,
  editingMeeting,
  googleWorkspaceCardProps,
  meetingsHeaderProps,
  meetingCancelDialogProps,
  quickMeetDialogProps,
  rescheduleMeetingCardProps,
  showPreviewMode,
  showReadOnlyAccessAlert,
  upcomingMeetingsCardProps,
}: {
  createMeetingCardProps: CreateMeetingCardProps
  editingMeeting: boolean
  googleWorkspaceCardProps: GoogleWorkspaceCardProps
  meetingsHeaderProps: MeetingsHeaderProps
  meetingCancelDialogProps: MeetingCancelDialogProps
  quickMeetDialogProps: QuickMeetDialogProps
  rescheduleMeetingCardProps: RescheduleMeetingCardProps
  showPreviewMode: boolean
  showReadOnlyAccessAlert: boolean
  upcomingMeetingsCardProps: UpcomingMeetingsCardProps
}) {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <MeetingsHeader {...meetingsHeaderProps} />

      {showPreviewMode ? (
        <Alert>
          <AlertTitle>Preview mode</AlertTitle>
          <AlertDescription>
            Meetings use sample data in preview mode. You can browse upcoming calls and open the native room workspace, but scheduling and integration actions are disabled.
          </AlertDescription>
        </Alert>
      ) : null}

      <QuickMeetDialog {...quickMeetDialogProps} />

      {showReadOnlyAccessAlert ? (
        <Alert>
          <AlertTitle>Read-only access</AlertTitle>
          <AlertDescription>
            Client users can join and review meetings, but scheduling is restricted to admin and team members.
          </AlertDescription>
        </Alert>
      ) : null}

      <GoogleWorkspaceCard {...googleWorkspaceCardProps} />
      <MeetingCancelDialog {...meetingCancelDialogProps} />
      {editingMeeting ? <RescheduleMeetingCard {...rescheduleMeetingCardProps} /> : <CreateMeetingCard {...createMeetingCardProps} />}
      <UpcomingMeetingsCard {...upcomingMeetingsCardProps} />
    </div>
  )
}