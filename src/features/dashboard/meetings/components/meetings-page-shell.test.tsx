import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPreviewMeetings } from '../lib/preview-data'

let mockContext: Record<string, unknown>

vi.mock('./meetings-page-provider', () => ({
  useMeetingsPageContext: () => mockContext,
}))

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
  UpcomingMeetingsCard: ({ meetings }: { meetings: Array<{ status: string; notesProcessingState?: string | null; transcriptProcessingState?: string | null }> }) => (
    <div>
      Upcoming Meetings Card
      <span>{meetings.map((meeting) => meeting.status).join(',')}</span>
      <span>
        {meetings.map((meeting) => `${meeting.transcriptProcessingState ?? 'idle'}:${meeting.notesProcessingState ?? 'idle'}`).join(',')}
      </span>
    </div>
  ),
}))

vi.mock('./meeting-room-loading-state', () => ({
  MeetingRoomLoadingState: ({ sharedRoomName }: { sharedRoomName: string }) => <div>Loading {sharedRoomName}</div>,
}))

vi.mock('./in-site-meeting-card', () => ({
  MeetingRoomPage: ({ meeting }: { meeting: { legacyId: string } }) => <div>Meeting Room {meeting.legacyId}</div>,
}))

import { MeetingsPageShell } from './meetings-page-shell'

describe('MeetingsPageShell', () => {
  beforeEach(() => {
    mockContext = {
      resolvedActiveInSiteMeeting: null,
      sharedRoomName: null,
      canSchedule: true,
      closeMeetingRoom: () => {},
      handleMeetingUpdated: () => {},
      isPreviewMode: false,
      quickStarting: false,
      resolvedGoogleWorkspaceStatus: { connected: true },
      setQuickMeetDialogOpen: () => {},
      handleSubmitQuickMeet: () => {},
      quickAttendeeDraft: { hasParticipants: true },
      quickAttendees: {
        input: '',
        emails: [],
        suggestions: [],
        setInput: () => {},
        handleKeyDown: () => {},
        commitInput: () => {},
        removeEmail: () => {},
        addSuggestedEmail: () => {},
      },
      quickMeetDescription: '',
      quickMeetDialogOpen: false,
      quickMeetDurationMinutes: '30',
      quickMeetTitle: 'Instant Cohorts Room',
      resetQuickMeetForm: () => {},
      setQuickMeetDescription: () => {},
      setQuickMeetDurationMinutes: () => {},
      setQuickMeetTitle: () => {},
      setTimezone: () => {},
      timezone: 'UTC',
      handleConnectGoogleWorkspace: async () => {},
      handleDisconnectGoogleWorkspace: async () => {},
      cancelDialogMeeting: null,
      cancellingMeetingId: null,
      handleConfirmCancelMeeting: async () => {},
      setCancelDialogMeeting: () => {},
      description: '',
      durationMinutes: '30',
      editingMeeting: null,
      handleScheduleMeeting: () => {},
      meetingDate: undefined,
      meetingTime: '09:00',
      resetScheduleForm: () => {},
      scheduleAttendeeDraft: { hasParticipants: true },
      scheduleAttendees: {
        input: '',
        emails: [],
        suggestions: [],
        setInput: () => {},
        handleKeyDown: () => {},
        commitInput: () => {},
        removeEmail: () => {},
        addSuggestedEmail: () => {},
      },
      scheduleDisabled: false,
      scheduleRequiresGoogleWorkspace: true,
      scheduling: false,
      setDescription: () => {},
      setDurationMinutes: () => {},
      setMeetingDate: () => {},
      setMeetingTime: () => {},
      setTitle: () => {},
      title: 'Weekly sync',
      handleCancelMeeting: () => {},
      handleMarkCompleted: async () => {},
      handleRescheduleMeeting: () => {},
      openInSiteMeeting: () => {},
      upcomingMeetings: [],
    }
  })

  it('renders the default meetings shell sections', () => {
    const markup = renderToStaticMarkup(<MeetingsPageShell />)

    expect(markup).toContain('Meetings Header')
    expect(markup).toContain('Quick Meet Dialog')
    expect(markup).toContain('Google Workspace Card')
    expect(markup).toContain('Create Meeting Card')
    expect(markup).toContain('Upcoming Meetings Card')
  })

  it('renders the active room branch when an in-site meeting is open', () => {
    mockContext = {
      ...mockContext,
      resolvedActiveInSiteMeeting: {
        legacyId: 'meeting-1',
        calendarEventId: null,
        roomName: 'room-1',
      },
    }

    const markup = renderToStaticMarkup(<MeetingsPageShell />)

    expect(markup).toContain('Meeting Room meeting-1')
    expect(markup).not.toContain('Create Meeting Card')
  })

  it('passes preview meetings with lifecycle and processing states into the upcoming meetings card', () => {
    mockContext = {
      ...mockContext,
      isPreviewMode: true,
      canSchedule: false,
      upcomingMeetings: getPreviewMeetings(null, 'UTC'),
    }

    const markup = renderToStaticMarkup(<MeetingsPageShell />)

    expect(markup).toContain('Preview mode')
    expect(markup).toContain('scheduled')
    expect(markup).toContain('completed')
    expect(markup).toContain('cancelled')
    expect(markup).toContain('processing:processing')
    expect(markup).toContain('idle:failed')
  })
})