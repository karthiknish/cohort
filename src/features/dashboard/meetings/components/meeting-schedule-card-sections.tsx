'use client'

import type { FormEvent, KeyboardEvent, ReactNode } from 'react'

import { CalendarPlus } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme'

import type { MeetingAttendeeSuggestion } from './meeting-attendees-field'
import {
  MeetingAttendeesSection,
  MeetingDetailsSection,
  MeetingScheduleDateSection,
  MeetingTimingSection,
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
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10 shrink-0 rounded-lg')}>
            <CalendarPlus className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base leading-tight">{cardTitle}</CardTitle>
            <CardDescription className="text-pretty">{cardDescription}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t border-muted/40 pt-4">
        {scheduleRequiresGoogleWorkspace && !googleWorkspaceConnected ? (
          <Alert className="mb-4">
            <AlertTitle>Google Workspace required</AlertTitle>
            <AlertDescription>
              Connect Google Workspace to create or update calendar-backed meeting invites.
            </AlertDescription>
          </Alert>
        ) : null}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
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

          <MeetingScheduleDateSection
            dateId="schedule-date"
            disabled={scheduleDisabled}
            meetingDate={meetingDate}
            onMeetingDateChange={onMeetingDateChange}
          />

          <MeetingTimingSection
            disabled={scheduleDisabled}
            meetingTime={meetingTime}
            timeId="schedule-start-time"
            durationId="schedule-duration"
            durationMinutes={durationMinutes}
            timezone={timezone}
            timezoneId="schedule-timezone"
            onMeetingTimeChange={onMeetingTimeChange}
            onDurationMinutesChange={onDurationMinutesChange}
            onTimezoneChange={onTimezoneChange}
          />

          <MeetingAttendeesSection
            label="Attendees"
            inputId="schedule-attendees-input"
            inputValue={attendeeInput}
            selectedEmails={attendeeEmails}
            disabled={scheduleDisabled}
            emptyStateText="Add people by selecting users below or typing email addresses."
            helperText="Use Enter, Tab, comma, or semicolon to add typed emails. Add at least one participant before scheduling."
            suggestions={attendeeSuggestions}
            onInputChange={onAttendeeInputChange}
            onInputKeyDown={onAttendeeKeyDown}
            onCommitInput={onCommitAttendeeInput}
            onRemoveEmail={onRemoveAttendee}
            onAddSuggestedEmail={onAddSuggestedAttendee}
          />

          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className={getButtonClasses('primary')} disabled={submitDisabled}>
                {scheduling ? submittingLabel : submitLabel}
              </Button>
              {footerAction}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}