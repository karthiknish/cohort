'use client'

import type { FormEvent, KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getButtonClasses } from '@/lib/dashboard-theme'

import { MeetingAttendeesField, type MeetingAttendeeSuggestion } from './meeting-attendees-field'

type QuickMeetDialogProps = {
  open: boolean
  quickStarting: boolean
  title: string
  description: string
  durationMinutes: string
  timezone: string
  attendeeInput: string
  attendeeEmails: string[]
  attendeeSuggestions: MeetingAttendeeSuggestion[]
  submitDisabled: boolean
  onOpenChange: (open: boolean) => void
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

export function QuickMeetDialog({
  open,
  quickStarting,
  title,
  description,
  durationMinutes,
  timezone,
  attendeeInput,
  attendeeEmails,
  attendeeSuggestions,
  submitDisabled,
  onOpenChange,
  onCancel,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onDurationMinutesChange,
  onTimezoneChange,
  onAttendeeInputChange,
  onAttendeeKeyDown,
  onCommitAttendeeInput,
  onRemoveAttendee,
  onAddSuggestedAttendee,
}: QuickMeetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Start Cohorts Room</DialogTitle>
          <DialogDescription>
            Launch a native in-site meeting room immediately and send optional Google Calendar invites to attendees.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="quick-meet-title" className="text-sm font-medium">Title</label>
            <Input
              id="quick-meet-title"
              required
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Instant client sync"
              disabled={quickStarting}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="quick-meet-description" className="text-sm font-medium">Description</label>
            <Textarea
              id="quick-meet-description"
              rows={3}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Agenda or context for this meeting"
              disabled={quickStarting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="quick-meet-duration" className="text-sm font-medium">Duration (minutes)</label>
            <Input
              id="quick-meet-duration"
              type="number"
              min={10}
              max={240}
              step={5}
              required
              value={durationMinutes}
              onChange={(event) => onDurationMinutesChange(event.target.value)}
              disabled={quickStarting}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="quick-meet-timezone" className="text-sm font-medium">Timezone</label>
            <Input
              id="quick-meet-timezone"
              required
              value={timezone}
              onChange={(event) => onTimezoneChange(event.target.value)}
              placeholder="America/New_York"
              disabled={quickStarting}
            />
          </div>

          <MeetingAttendeesField
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
                {quickStarting ? 'Starting...' : 'Start Room'}
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
      </DialogContent>
    </Dialog>
  )
}
