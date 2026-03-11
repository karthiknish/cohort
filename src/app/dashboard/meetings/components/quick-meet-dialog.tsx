'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'

import type { QuickMeetFormProps } from './quick-meet-dialog-sections'
import { QuickMeetDialogForm, QuickMeetDialogHeader } from './quick-meet-dialog-sections'

type QuickMeetDialogProps = QuickMeetFormProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
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
        <QuickMeetDialogHeader />
        <QuickMeetDialogForm
          quickStarting={quickStarting}
          title={title}
          description={description}
          durationMinutes={durationMinutes}
          timezone={timezone}
          attendeeInput={attendeeInput}
          attendeeEmails={attendeeEmails}
          attendeeSuggestions={attendeeSuggestions}
          submitDisabled={submitDisabled}
          onCancel={onCancel}
          onSubmit={onSubmit}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onDurationMinutesChange={onDurationMinutesChange}
          onTimezoneChange={onTimezoneChange}
          onAttendeeInputChange={onAttendeeInputChange}
          onAttendeeKeyDown={onAttendeeKeyDown}
          onCommitAttendeeInput={onCommitAttendeeInput}
          onRemoveAttendee={onRemoveAttendee}
          onAddSuggestedAttendee={onAddSuggestedAttendee}
        />
      </DialogContent>
    </Dialog>
  )
}
