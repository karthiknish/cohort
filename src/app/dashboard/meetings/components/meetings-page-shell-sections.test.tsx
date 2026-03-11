import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('./meetings-header', () => ({
  MeetingsHeader: () => <div>Meetings Header</div>,
}))

vi.mock('./quick-meet-dialog', () => ({
  QuickMeetDialog: () => <div>Quick Meet Dialog</div>,
}))

vi.mock('./google-workspace-card', () => ({
  GoogleWorkspaceCard: () => <div>Google Workspace Card</div>,
}))

vi.mock('./meeting-cancel-dialog', () => ({
  MeetingCancelDialog: () => <div>Meeting Cancel Dialog</div>,
}))

vi.mock('./meeting-schedule-card', () => ({
  CreateMeetingCard: () => <div>Create Meeting Card</div>,
  RescheduleMeetingCard: () => <div>Reschedule Meeting Card</div>,
}))

vi.mock('./upcoming-meetings-card', () => ({
  UpcomingMeetingsCard: () => <div>Upcoming Meetings Card</div>,
}))

vi.mock('./meeting-room-loading-state', () => ({
  MeetingRoomLoadingState: ({ sharedRoomName }: { sharedRoomName: string }) => <div>Loading {sharedRoomName}</div>,
}))

vi.mock('./in-site-meeting-card', () => ({
  MeetingRoomPage: ({ meeting }: { meeting: { legacyId: string } }) => <div>Meeting Room {meeting.legacyId}</div>,
}))

import {
  ActiveMeetingRoomSection,
  MeetingsDefaultView,
  SharedRoomLoadingSection,
} from './meetings-page-shell-sections'

describe('meetings page shell sections', () => {
  it('renders the default meetings layout sections', () => {
    const markup = renderToStaticMarkup(
      <MeetingsDefaultView
        createMeetingCardProps={{} as never}
        editingMeeting={false}
        googleWorkspaceCardProps={{} as never}
        meetingsHeaderProps={{} as never}
        meetingCancelDialogProps={{} as never}
        quickMeetDialogProps={{} as never}
        rescheduleMeetingCardProps={{ onReset: vi.fn() } as never}
        showPreviewMode={true}
        showReadOnlyAccessAlert={true}
        upcomingMeetingsCardProps={{} as never}
      />,
    )

    expect(markup).toContain('Meetings Header')
    expect(markup).toContain('Preview mode')
    expect(markup).toContain('Quick Meet Dialog')
    expect(markup).toContain('Read-only access')
    expect(markup).toContain('Google Workspace Card')
    expect(markup).toContain('Create Meeting Card')
    expect(markup).toContain('Upcoming Meetings Card')
  })

  it('renders the room branches', () => {
    const markup = renderToStaticMarkup(
      <>
        <ActiveMeetingRoomSection
          meetingRoomKey="meeting-1"
          meeting={{ legacyId: 'meeting-1' } as never}
          canRecord={true}
          onMeetingUpdated={vi.fn()}
          fallbackRoomName={null}
          onClose={vi.fn()}
        />
        <SharedRoomLoadingSection sharedRoomName="Room A" onBack={vi.fn()} />
      </>,
    )

    expect(markup).toContain('Meeting Room meeting-1')
    expect(markup).toContain('Loading Room A')
  })
})