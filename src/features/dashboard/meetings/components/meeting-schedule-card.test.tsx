import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { CreateMeetingCard, MeetingScheduleCardFrame } from './meeting-schedule-card'

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
  googleWorkspaceConnected: true,
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

describe('meeting schedule card variants', () => {
  it('renders create meeting copy explicitly', () => {
    const markup = renderToStaticMarkup(<CreateMeetingCard {...baseProps} />)

    expect(markup).toContain('Schedule Meeting')
    expect(markup).toContain('Schedule room')
    expect(markup).not.toContain('Cancel Edit')
  })

  it('renders reschedule meeting copy explicitly', () => {
    const markup = renderToStaticMarkup(
      <MeetingScheduleCardFrame
        {...baseProps}
        cardTitle="Reschedule Meeting"
        cardDescription="Update the room."
        footerAction={createElement('button', { type: 'button' }, 'Cancel Edit')}
        submitLabel="Save Reschedule"
        submittingLabel="Saving…"
      />,
    )

    expect(markup).toContain('Reschedule Meeting')
    expect(markup).toContain('Save Reschedule')
    expect(markup).toContain('Cancel Edit')
  })

  it('disables scheduling when no participant has been added', () => {
    const markup = renderToStaticMarkup(
      <CreateMeetingCard
        {...baseProps}
        attendeeEmails={[]}
        submitDisabled
      />,
    )

    expect(markup).toContain('Add at least one participant before scheduling.')
    expect(markup).toMatch(/<button[^>]*type="submit"[^>]*disabled=""[^>]*>Schedule room<\/button>/)
  })
})