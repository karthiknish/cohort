import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import { QuickMeetDialog } from './quick-meet-dialog'

const baseProps = {
  open: true,
  quickStarting: false,
  title: 'Instant client sync',
  description: 'Agenda or context for this meeting',
  durationMinutes: '30',
  timezone: 'UTC',
  attendeeInput: '',
  attendeeEmails: ['alex@example.com'],
  attendeeSuggestions: [],
  submitDisabled: false,
  onOpenChange: () => {},
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

describe('QuickMeetDialog', () => {
  it('disables start room when no participant has been added', () => {
    const markup = renderToStaticMarkup(
      <QuickMeetDialog
        {...baseProps}
        attendeeEmails={[]}
        submitDisabled
      />,
    )

    expect(markup).toContain('Add at least one participant before starting the room.')
    expect(markup).toMatch(/<button[^>]*type="submit"[^>]*disabled=""[^>]*>Start Room<\/button>/)
  })
})