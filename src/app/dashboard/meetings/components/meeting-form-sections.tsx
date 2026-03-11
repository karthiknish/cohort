'use client'

import type { KeyboardEvent } from 'react'

import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { TimePicker } from '@/components/ui/time-picker'
import { cn } from '@/lib/utils'

import { MeetingAttendeesField, type MeetingAttendeeSuggestion } from './meeting-attendees-field'

type MeetingFieldSharedProps = {
  disabled: boolean
}

type MeetingDetailsSectionProps = MeetingFieldSharedProps & {
  description: string
  descriptionId: string
  descriptionPlaceholder: string
  title: string
  titleId: string
  titlePlaceholder: string
  onDescriptionChange: (value: string) => void
  onTitleChange: (value: string) => void
}

type MeetingTimingSectionProps = MeetingFieldSharedProps & {
  durationId: string
  durationMinutes: string
  meetingTime?: string
  minuteStep?: number
  showStartTime?: boolean
  timeId?: string
  timezone: string
  timezoneId: string
  onDurationMinutesChange: (value: string) => void
  onMeetingTimeChange?: (value: string) => void
  onTimezoneChange: (value: string) => void
}

type MeetingScheduleDateSectionProps = MeetingFieldSharedProps & {
  dateId: string
  meetingDate: Date | undefined
  onMeetingDateChange: (value: Date | undefined) => void
}

type MeetingAttendeesSectionProps = MeetingFieldSharedProps & {
  emptyStateText: string
  helperText: string
  inputId: string
  inputValue: string
  label: string
  selectedEmails: string[]
  suggestions: MeetingAttendeeSuggestion[]
  onAddSuggestedEmail: (email: string) => void
  onCommitInput: () => void
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onRemoveEmail: (email: string) => void
}

export function MeetingDetailsSection({
  description,
  descriptionId,
  descriptionPlaceholder,
  disabled,
  title,
  titleId,
  titlePlaceholder,
  onDescriptionChange,
  onTitleChange,
}: MeetingDetailsSectionProps) {
  return (
    <>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor={titleId} className="text-sm font-medium">Title</label>
        <Input
          id={titleId}
          required
          disabled={disabled}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={titlePlaceholder}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label htmlFor={descriptionId} className="text-sm font-medium">Description</label>
        <Textarea
          id={descriptionId}
          rows={3}
          disabled={disabled}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder={descriptionPlaceholder}
        />
      </div>
    </>
  )
}

export function MeetingScheduleDateSection({
  dateId,
  disabled,
  meetingDate,
  onMeetingDateChange,
}: MeetingScheduleDateSectionProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={dateId} className="text-sm font-medium">Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={dateId}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !meetingDate && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {meetingDate ? format(meetingDate, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={meetingDate}
            onSelect={onMeetingDateChange}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function MeetingTimingSection({
  disabled,
  durationId,
  durationMinutes,
  meetingTime,
  minuteStep = 15,
  showStartTime = true,
  timeId,
  timezone,
  timezoneId,
  onDurationMinutesChange,
  onMeetingTimeChange,
  onTimezoneChange,
}: MeetingTimingSectionProps) {
  return (
    <>
      {showStartTime && timeId && onMeetingTimeChange ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Start Time</legend>
          <TimePicker
            id={timeId}
            value={meetingTime ?? ''}
            onChange={onMeetingTimeChange}
            disabled={disabled}
            minuteStep={minuteStep}
          />
        </fieldset>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={durationId} className="text-sm font-medium">Duration (minutes)</label>
        <Input
          id={durationId}
          type="number"
          min={minuteStep}
          step={minuteStep}
          required
          disabled={disabled}
          value={durationMinutes}
          onChange={(event) => onDurationMinutesChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={timezoneId} className="text-sm font-medium">Timezone</label>
        <Input
          id={timezoneId}
          required
          disabled={disabled}
          value={timezone}
          onChange={(event) => onTimezoneChange(event.target.value)}
          placeholder="America/New_York"
        />
      </div>
    </>
  )
}

export function MeetingAttendeesSection({
  disabled,
  emptyStateText,
  helperText,
  inputId,
  inputValue,
  label,
  selectedEmails,
  suggestions,
  onAddSuggestedEmail,
  onCommitInput,
  onInputChange,
  onInputKeyDown,
  onRemoveEmail,
}: MeetingAttendeesSectionProps) {
  return (
    <MeetingAttendeesField
      label={label}
      inputId={inputId}
      inputValue={inputValue}
      selectedEmails={selectedEmails}
      disabled={disabled}
      emptyStateText={emptyStateText}
      helperText={helperText}
      suggestions={suggestions}
      onInputChange={onInputChange}
      onInputKeyDown={onInputKeyDown}
      onCommitInput={onCommitInput}
      onRemoveEmail={onRemoveEmail}
      onAddSuggestedEmail={onAddSuggestedEmail}
    />
  )
}