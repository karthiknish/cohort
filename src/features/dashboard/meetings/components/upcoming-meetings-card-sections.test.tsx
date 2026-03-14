import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import type { MeetingRecord } from '../types'

import { UpcomingMeetingItemCard, UpcomingMeetingsEmptyState } from './upcoming-meetings-card-sections'

const meeting: MeetingRecord = {
  legacyId: 'meeting-1',
  providerId: 'provider-1',
  title: 'Weekly client sync',
  description: 'Review blockers and next steps.',
  startTimeMs: 1760000000000,
  endTimeMs: 1760003600000,
  timezone: 'UTC',
  calendarEventId: 'evt-1',
  status: 'scheduled',
  meetLink: 'https://meet.example.com/abc',
  roomName: 'room-1',
  attendeeEmails: ['alex@example.com'],
  notesSummary: 'Action items captured.',
  transcriptText: 'Transcript body',
  transcriptUpdatedAtMs: 1760007200000,
  transcriptSource: 'livekit',
  transcriptProcessingState: 'idle',
  transcriptProcessingError: null,
  notesUpdatedAtMs: 1760008200000,
  notesModel: 'gpt-notes',
  notesProcessingState: 'idle',
  notesProcessingError: null,
}

describe('upcoming meetings card sections', () => {
  it('renders the empty state', () => {
    const markup = renderToStaticMarkup(<UpcomingMeetingsEmptyState />)

    expect(markup).toContain('No upcoming meetings yet.')
  })

  it('renders an upcoming meeting item with actions and notes', () => {
    const markup = renderToStaticMarkup(
      <UpcomingMeetingItemCard
        meeting={meeting}
        canSchedule={true}
        cancellingMeetingId={null}
        onOpenInSiteMeeting={vi.fn()}
        onRescheduleMeeting={vi.fn()}
        onCancelMeeting={vi.fn()}
        onMarkCompleted={vi.fn()}
      />,
    )

    expect(markup).toContain('Weekly client sync')
    expect(markup).toContain('Join Room')
    expect(markup).toContain('Open Share Link')
    expect(markup).toContain('Source: livekit')
    expect(markup).toContain('AI Meeting Notes')
    expect(markup).toContain('Action items captured.')
  })
})