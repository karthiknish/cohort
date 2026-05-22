'use client'

import type { FormEvent, KeyboardEvent, ReactNode } from 'react'

import { CalendarPlus, LoaderCircle } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme'

import type { MeetingAttendeeSuggestion } from './meeting-attendees-field'
import {
  MeetingAttendeesSection,
  MeetingDetailsSection,
  MeetingScheduleWhenSection,
} from './meeting-form-sections'

export type SharedMeetingScheduleCardProps = {
  meetingDate: Date | undefined
  meetingTime: string
  durationMinutes: string
  timezone: string
  title: string
  description: string
  attendeeInput: string
  attendeeEmails: string[]
  attendeeSuggestions: MeetingAttendeeSuggestion[]
  scheduleRequiresGoogleWorkspace: boolean
  googleWorkspaceConnected: boolean
  scheduleDisabled: boolean
  submitDisabled: boolean
  scheduling: boolean
  onMeetingDateChange: (value: Date | undefined) => void
  onMeetingTimeChange: (value: string) => void
  onDurationMinutesChange: (value: string) => void
  onTimezoneChange: (value: string) => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onAttendeeInputChange: (value: string) => void
  onAttendeeKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCommitAttendeeInput: () => void
  onRemoveAttendee: (email: string) => void
  onAddSuggestedAttendee: (email: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export type MeetingScheduleCardFrameProps = SharedMeetingScheduleCardProps & {
  cardTitle: string
  cardDescription: string
  footerAction?: ReactNode
  submittingLabel: string
  submitLabel: string
}

function ScheduleFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border border-muted/50 bg-muted/15 p-4', className)}>
      <div className="mb-4 space-y-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground text-pretty">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function MeetingScheduleCardFrame({
  attendeeEmails,
  attendeeInput,
  attendeeSuggestions,
  cardDescription,
  cardTitle,
  description,
  durationMinutes,
  footerAction,
  googleWorkspaceConnected,
  meetingDate,
  meetingTime,
  onAddSuggestedAttendee,
  onAttendeeInputChange,
  onAttendeeKeyDown,
  onCommitAttendeeInput,
  onDescriptionChange,
  onDurationMinutesChange,
  onMeetingDateChange,
  onMeetingTimeChange,
  onRemoveAttendee,
  onSubmit,
  onTimezoneChange,
  onTitleChange,
  scheduleDisabled,
  scheduleRequiresGoogleWorkspace,
  scheduling,
  submitDisabled,
  submitLabel,
  submittingLabel,
  timezone,
  title,
}: MeetingScheduleCardFrameProps) {
  return (
    <Card className={cn(DASHBOARD_THEME.cards.base, 'overflow-hidden')}>
      <CardHeader className="space-y-3 border-b border-muted/40 bg-muted/10 pb-4">
        <div className="flex items-start gap-3">
          <div className={cn(DASHBOARD_THEME.icons.container, 'size-10 shrink-0 rounded-lg')}>
            <CalendarPlus className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base leading-tight">{cardTitle}</CardTitle>
            <CardDescription className="text-pretty">{cardDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        {scheduleRequiresGoogleWorkspace && !googleWorkspaceConnected ? (
          <Alert className="mb-5">
            <AlertTitle>Google Workspace required</AlertTitle>
            <AlertDescription>
              Connect Google Workspace from the header to send calendar invites when you schedule a room.
            </AlertDescription>
          </Alert>
        ) : null}

        <form className="space-y-5" onSubmit={onSubmit}>
          <ScheduleFormSection title="When" description="Pick the date, start time, and length of the meeting.">
            <MeetingScheduleWhenSection
              disabled={scheduleDisabled}
              dateId="schedule-date"
              meetingDate={meetingDate}
              timeId="schedule-start-time"
              meetingTime={meetingTime}
              durationId="schedule-duration"
              durationMinutes={durationMinutes}
              timezone={timezone}
              timezoneId="schedule-timezone"
              onMeetingDateChange={onMeetingDateChange}
              onMeetingTimeChange={onMeetingTimeChange}
              onDurationMinutesChange={onDurationMinutesChange}
              onTimezoneChange={onTimezoneChange}
            />
          </ScheduleFormSection>

          <ScheduleFormSection title="Details" description="Give attendees context before they join.">
            <div className="grid gap-4 md:grid-cols-1">
              <MeetingDetailsSection
                disabled={scheduleDisabled}
                title={title}
                titleId="schedule-title"
                titlePlaceholder="Weekly client strategy sync"
                description={description}
                descriptionId="schedule-description"
                descriptionPlaceholder="Agenda, links, and expected outcomes"
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
              />
            </div>
          </ScheduleFormSection>

          <ScheduleFormSection title="Participants" description="Invite at least one person to create the room and calendar event.">
            <MeetingAttendeesSection
              label="Add attendees"
              inputId="schedule-attendees-input"
              inputValue={attendeeInput}
              selectedEmails={attendeeEmails}
              disabled={scheduleDisabled}
              emptyStateText="No attendees added yet."
              helperText="Press Enter or click Add after typing an email. Suggested teammates appear below."
              suggestionsLabel="Suggested participants"
              suggestions={attendeeSuggestions}
              onInputChange={onAttendeeInputChange}
              onInputKeyDown={onAttendeeKeyDown}
              onCommitInput={onCommitAttendeeInput}
              onRemoveEmail={onRemoveAttendee}
              onAddSuggestedEmail={onAddSuggestedAttendee}
            />
          </ScheduleFormSection>

          <div className="flex flex-wrap items-center gap-3 border-t border-muted/40 pt-5">
            <Button type="submit" className={cn(getButtonClasses('primary'), 'min-w-40')} disabled={submitDisabled}>
              {scheduling ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  {submittingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
            {footerAction}
            {submitDisabled && !scheduling ? (
              <p className="text-xs text-muted-foreground">Add a date, time, title, and at least one attendee to schedule.</p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
