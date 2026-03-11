import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import { GoogleWorkspaceCard } from './google-workspace-card'
import { MeetingsHeader } from './meetings-header'
import { UpcomingMeetingsCard } from './upcoming-meetings-card'

const meeting = {
  legacyId: 'meeting-1',
  calendarEventId: null,
  roomName: 'room-1',
  title: 'Weekly Sync',
  description: 'Discuss pipeline',
  startTimeMs: Date.parse('2024-01-10T10:00:00Z'),
  endTimeMs: Date.parse('2024-01-10T10:30:00Z'),
  timezone: 'UTC',
  status: 'scheduled' as const,
  attendees: [],
  organizerUserId: null,
  meetLink: null,
  transcriptText: null,
  transcriptSource: null,
  transcriptUpdatedAtMs: null,
  transcriptProcessingState: null,
  transcriptProcessingError: null,
  notesSummary: null,
  notesModel: null,
  notesUpdatedAtMs: null,
  notesProcessingState: null,
  notesProcessingError: null,
}

describe('meetings reliability states', () => {
  it('renders explicit loading and setup states for Google Workspace surfaces', () => {
    const headerMarkup = renderToStaticMarkup(
      <MeetingsHeader
        googleWorkspaceConnected={false}
        googleWorkspaceStatusLoading={true}
        canSchedule={true}
        quickStarting={false}
        quickMeetDisabled={true}
        onStartQuickMeet={vi.fn()}
      />,
    )
    const cardMarkup = renderToStaticMarkup(
      <GoogleWorkspaceCard connected={false} canSchedule={true} loading={true} onConnect={vi.fn()} onDisconnect={vi.fn()} />,
    )

    expect(headerMarkup).toContain('Checking Google Workspace…')
    expect(headerMarkup).toContain('Checking Workspace…')
    expect(cardMarkup).toContain('Checking connection')
    expect(cardMarkup).toContain('Checking whether this workspace already has Google Calendar invite support enabled.')
    expect(cardMarkup).toContain('skeleton-shimmer')
  })

  it('renders the disconnected guidance state', () => {
    const markup = renderToStaticMarkup(
      <GoogleWorkspaceCard connected={false} canSchedule={true} onConnect={vi.fn()} onDisconnect={vi.fn()} />,
    )

    expect(markup).toContain('Setup required')
    expect(markup).toContain('Connect Google Workspace')
    expect(markup).toContain('Required before scheduled Cohorts rooms can send Calendar invites.')
  })

  it('renders loading before empty for upcoming meetings', () => {
    const loadingMarkup = renderToStaticMarkup(
      <UpcomingMeetingsCard
        meetings={[]}
        loading={true}
        canSchedule={true}
        cancellingMeetingId={null}
        onOpenInSiteMeeting={vi.fn()}
        onRescheduleMeeting={vi.fn()}
        onCancelMeeting={vi.fn()}
        onMarkCompleted={vi.fn()}
      />,
    )
    const readyMarkup = renderToStaticMarkup(
      <UpcomingMeetingsCard
        meetings={[meeting]}
        canSchedule={true}
        cancellingMeetingId={null}
        onOpenInSiteMeeting={vi.fn()}
        onRescheduleMeeting={vi.fn()}
        onCancelMeeting={vi.fn()}
        onMarkCompleted={vi.fn()}
      />,
    )

    expect(loadingMarkup).toContain('skeleton-shimmer')
    expect(loadingMarkup).not.toContain('No upcoming meetings yet.')
    expect(readyMarkup).toContain('Weekly Sync')
    expect(readyMarkup).toContain('Transcript not saved')
  })
})