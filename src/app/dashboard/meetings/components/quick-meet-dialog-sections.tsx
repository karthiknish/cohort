'use client'

import type { FormEvent, KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getButtonClasses } from '@/lib/dashboard-theme'

import type { MeetingAttendeeSuggestion } from './meeting-attendees-field'
import { MeetingAttendeesSection, MeetingDetailsSection, MeetingTimingSection } from './meeting-form-sections'

export type QuickMeetFormProps = {
  quickStarting: boolean
  title: string
  description: string
  durationMinutes: string
  timezone: string
  attendeeInput: string
  attendeeEmails: string[]
  attendeeSuggestions: MeetingAttendeeSuggestion[]
  submitDisabled: boolean
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onDurationMinutesChange: (value: string) => void
  onTimezoneChange: (value: string) => void
  onAttendeeInputChange: (value: string) => void
  onAttendeeKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCommitAttendeeInput: () => void
  onRemoveAttendee: (email: string) => void
  onAddSuggestedAttendee: (email: string) => void
}

export function QuickMeetDialogHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Start Cohorts Room</DialogTitle>
      <DialogDescription>
        Launch a native in-site meeting room immediately and send optional Google Calendar invites to attendees.
      </DialogDescription>
    </DialogHeader>
  )
}

export function QuickMeetDialogForm({
  attendeeEmails,
  attendeeInput,
  attendeeSuggestions,
  description,
  durationMinutes,
  onAddSuggestedAttendee,
  onAttendeeInputChange,
  onAttendeeKeyDown,
  onCancel,
  onCommitAttendeeInput,
  onDescriptionChange,
  onDurationMinutesChange,
  onRemoveAttendee,
  onSubmit,
  onTimezoneChange,
  onTitleChange,
  quickStarting,
  submitDisabled,
  timezone,
  title,
}: QuickMeetFormProps) {
  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <MeetingDetailsSection
        disabled={quickStarting}
        title={title}
        titleId="quick-meet-title"
        titlePlaceholder="Instant client sync"
        description={description}
        descriptionId="quick-meet-description"
        descriptionPlaceholder="Agenda or context for this meeting"
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />

      <MeetingTimingSection
        disabled={quickStarting}
        durationId="quick-meet-duration"
        durationMinutes={durationMinutes}
        showStartTime={false}
        timezone={timezone}
        timezoneId="quick-meet-timezone"
        minuteStep={5}
        onDurationMinutesChange={onDurationMinutesChange}
        onTimezoneChange={onTimezoneChange}
      />

      <MeetingAttendeesSection
        label="Invite Users"
        inputId="quick-attendees-input"
        inputValue={attendeeInput}
        selectedEmails={attendeeEmails}
        disabled={quickStarting}
        emptyStateText="Add people by selecting users below or typing email addresses."
        helperText="Use Enter, Tab, comma, or semicolon to add typed emails. Add at least one participant before starting the room."
        suggestions={attendeeSuggestions}
        onInputChange={onAttendeeInputChange}
        onInputKeyDown={onAttendeeKeyDown}
        onCommitInput={onCommitAttendeeInput}
        onRemoveEmail={onRemoveAttendee}
        onAddSuggestedEmail={onAddSuggestedAttendee}
      />

      <div className="md:col-span-2">
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className={getButtonClasses('primary')} disabled={quickStarting || submitDisabled}>
            {quickStarting ? 'Starting…' : 'Start Room'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className={getButtonClasses('outline')}
            onClick={onCancel}
            disabled={quickStarting}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}