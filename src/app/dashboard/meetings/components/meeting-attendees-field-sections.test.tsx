import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import {
  MeetingAttendeesInputRow,
  MeetingAttendeesSelectedList,
  MeetingAttendeesSuggestions,
} from './meeting-attendees-field-sections'

describe('meeting attendees field sections', () => {
  it('renders selected attendees and empty state variants', () => {
    const selectedMarkup = renderToStaticMarkup(
      <MeetingAttendeesSelectedList
        disabled={false}
        emptyStateText="Add attendees"
        onRemoveEmail={vi.fn()}
        selectedEmails={['alex@example.com']}
      />,
    )

    const emptyMarkup = renderToStaticMarkup(
      <MeetingAttendeesSelectedList
        disabled={false}
        emptyStateText="Add attendees"
        onRemoveEmail={vi.fn()}
        selectedEmails={[]}
      />,
    )

    expect(selectedMarkup).toContain('alex@example.com')
    expect(emptyMarkup).toContain('Add attendees')
  })

  it('renders the input row and suggestions', () => {
    const markup = renderToStaticMarkup(
      <>
        <MeetingAttendeesInputRow
          disabled={false}
          inputId="attendees"
          inputValue="alex@example.com"
          onCommitInput={vi.fn()}
          onInputChange={vi.fn()}
          onInputKeyDown={vi.fn()}
        />
        <MeetingAttendeesSuggestions
          disabled={false}
          onAddSuggestedEmail={vi.fn()}
          suggestions={[{ id: '1', name: 'Alex', email: 'alex@example.com' }]}
        />
      </>,
    )

    expect(markup).toContain('Add')
    expect(markup).toContain('Suggested Platform Users')
    expect(markup).toContain('Alex')
  })
})