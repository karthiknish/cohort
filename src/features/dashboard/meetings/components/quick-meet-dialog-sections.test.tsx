import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/dialog', () => ({
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { QuickMeetDialogForm, QuickMeetDialogHeader } from './quick-meet-dialog-sections'

const baseProps = {
  quickStarting: false,
  title: 'Instant client sync',
  description: 'Agenda or context for this meeting',
  durationMinutes: '30',
  timezone: 'UTC',
  attendeeInput: '',
  attendeeEmails: ['alex@example.com'],
  attendeeSuggestions: [],
  submitDisabled: false,
  onCancel: () => {},
  onSubmit: (event: { preventDefault(): void }) => event.preventDefault(),
  onTitleChange: () => {},
  onDescriptionChange: () => {},
  onDurationMinutesChange: () => {},
  onTimezoneChange: () => {},
  onAttendeeInputChange: () => {},
  onAttendeeKeyDown: () => {},
  onCommitAttendeeInput: () => {},
  onRemoveAttendee: () => {},
  onAddSuggestedAttendee: () => {},
}

describe('QuickMeetDialog sections', () => {
  it('renders the header copy', () => {
    const markup = renderToStaticMarkup(<QuickMeetDialogHeader />)

    expect(markup).toContain('Start Cohorts Room')
    expect(markup).toContain('Launch a native in-site meeting room immediately')
  })

  it('renders the shared quick-meet form actions', () => {
    const markup = renderToStaticMarkup(
      <QuickMeetDialogForm
        {...baseProps}
        attendeeEmails={[]}
        submitDisabled={true}
      />,
    )

    expect(markup).toContain('Invite Users')
    expect(markup).toContain('Add at least one participant before starting the room.')
    expect(markup).toContain('Start Room')
    expect(markup).toContain('Cancel')
  })
})
