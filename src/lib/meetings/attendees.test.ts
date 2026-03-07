import { describe, expect, it } from 'vitest'

import {
  buildMeetingAttendeeDraft,
  buildMeetingAttendeeSuggestions,
  parseAttendeeInput,
  sanitizeMeetingParticipantEmails,
} from './attendees'

describe('meeting attendee helpers', () => {
  it('parses typed attendee input into normalized emails', () => {
    expect(parseAttendeeInput('Alex <Alex@Example.com>, jordan@example.com')).toEqual([
      'alex@example.com',
      'jordan@example.com',
    ])
  })

  it('removes the organizer email from meeting participants', () => {
    expect(sanitizeMeetingParticipantEmails(['Host@example.com', 'guest@example.com'], 'host@example.com')).toEqual([
      'guest@example.com',
    ])
  })

  it('builds attendee suggestions without the organizer or already selected users', () => {
    const suggestions = buildMeetingAttendeeSuggestions({
      workspaceMembers: [
        { id: '1', name: 'Host User', email: 'host@example.com', role: 'admin' },
        { id: '2', name: 'Jordan Lee', email: 'jordan@example.com', role: 'team' },
      ],
      platformUsers: [{ id: '3', name: 'Priya Patel', email: 'priya@example.com', role: 'team' }],
      organizerEmail: 'host@example.com',
      selectedEmails: ['jordan@example.com'],
      queryValue: '',
    })

    expect(suggestions.map((suggestion) => suggestion.email)).toEqual(['priya@example.com'])
  })

  it('treats a draft with only the organizer email as missing participants', () => {
    expect(
      buildMeetingAttendeeDraft({
        selectedEmails: [],
        pendingInput: 'host@example.com',
        organizerEmail: 'host@example.com',
      })
    ).toMatchObject({
      attendeeEmails: [],
      hasParticipants: false,
      hasPendingInvalidInput: false,
    })
  })
})