import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'

import { describe, expect, it } from 'vitest'

import { MeetingScheduleCardFrame } from './meeting-schedule-card-sections'

const FOOTER_ACTION = createElement('button', { type: 'button' }, 'Cancel Edit')

const baseProps = {
  meetingDate: new Date('2026-03-12T09:00:00.000Z'),
  meetingTime: '09:00',
  durationMinutes: '30',
  timezone: 'UTC',
  title: 'Weekly client sync',
  description: 'Agenda goes here',
  attendeeInput: '',
  attendeeEmails: ['alex@example.com'],
  attendeeSuggestions: [],
  scheduleRequiresGoogleWorkspace: true,
  googleWorkspaceConnected: false,
  scheduleDisabled: false,
  submitDisabled: false,
  scheduling: false,
  onMeetingDateChange: () => {},
  onMeetingTimeChange: () => {},
  onDurationMinutesChange: () => {},
  onTimezoneChange: () => {},
  onTitleChange: () => {},
  onDescriptionChange: () => {},
  onAttendeeInputChange: () => {},
  onAttendeeKeyDown: () => {},
  onCommitAttendeeInput: () => {},
  onRemoveAttendee: () => {},
  onAddSuggestedAttendee: () => {},
  onSubmit: (event: { preventDefault(): void }) => event.preventDefault(),
}

describe('meeting schedule card sections', () => {
  it('renders the shared frame copy and workspace alert', () => {
    const markup = renderToStaticMarkup(
      <MeetingScheduleCardFrame
        {...baseProps}
        cardTitle="Schedule Meeting"
        cardDescription="Creates a Cohorts room."
        submitLabel="Schedule room"
        submittingLabel="Scheduling..."
      />,
    )

    expect(markup).toContain('Schedule Meeting')
    expect(markup).toContain('Google Workspace required')
    expect(markup).toContain('Schedule room')
  })

  it('renders footer actions when provided', () => {
    const markup = renderToStaticMarkup(
      <MeetingScheduleCardFrame
        {...baseProps}
        googleWorkspaceConnected={true}
        cardTitle="Reschedule Meeting"
        cardDescription="Update the room."
        submitLabel="Save Reschedule"
        submittingLabel="Saving…"
        footerAction={FOOTER_ACTION}
        onReset={console.log}
      />,
    )

    expect(markup).toContain('Reschedule Meeting')
    expect(markup).toContain('Save Reschedule')
    expect(markup).toContain('Cancel Edit')
  })
})