'use client'

import { useCallback, type KeyboardEvent } from 'react'

import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { TimePicker } from '@/shared/ui/time-picker'
import { cn } from '@/lib/utils'

const SCHEDULE_DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
] as const

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
  durationVariant?: 'input' | 'select'
  meetingTime?: string
  minuteStep?: number
  showStartTime?: boolean
  timeId?: string
  timezone: string
  timezoneId: string
  timezoneReadOnly?: boolean
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
  suggestionsLabel?: string
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
  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value)
  }, [onTitleChange])

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(event.target.value)
  }, [onDescriptionChange])

  return (
    <>
      <div className="space-y-2 md:col-span-2">
        <label htmlFor={titleId} className="text-sm font-medium">Title</label>
        <Input
          id={titleId}
          required
          disabled={disabled}
          value={title}
          onChange={handleTitleChange}
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
          onChange={handleDescriptionChange}
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
  const handleDisabledDate = useCallback((date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0)), [])

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
            disabled={handleDisabledDate}
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
  durationVariant = 'input',
  meetingTime,
  minuteStep = 15,
  showStartTime = true,
  timeId,
  timezone,
  timezoneId,
  timezoneReadOnly = false,
  onDurationMinutesChange,
  onMeetingTimeChange,
  onTimezoneChange,
}: MeetingTimingSectionProps) {
  const handleDurationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onDurationMinutesChange(event.target.value)
  }, [onDurationMinutesChange])

  const handleDurationSelect = useCallback((value: string) => {
    onDurationMinutesChange(value)
  }, [onDurationMinutesChange])

  const handleTimezoneChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onTimezoneChange(event.target.value)
  }, [onTimezoneChange])

  const durationSelectValue = SCHEDULE_DURATION_OPTIONS.some((option) => option.value === durationMinutes)
    ? durationMinutes
    : '30'

  return (
    <>
      {showStartTime && timeId && onMeetingTimeChange ? (
        <div className="space-y-2">
          <label htmlFor={timeId} className="text-sm font-medium">
            Start time
          </label>
          <TimePicker
            id={timeId}
            value={meetingTime ?? ''}
            onChange={onMeetingTimeChange}
            disabled={disabled}
            minuteStep={minuteStep}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={durationId} className="text-sm font-medium">
          Duration
        </label>
        {durationVariant === 'select' ? (
          <Select value={durationSelectValue} onValueChange={handleDurationSelect} disabled={disabled}>
            <SelectTrigger id={durationId}>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {SCHEDULE_DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={durationId}
            type="number"
            min={minuteStep}
            step={minuteStep}
            required
            disabled={disabled}
            value={durationMinutes}
            onChange={handleDurationChange}
          />
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor={timezoneId} className="text-sm font-medium">
          Timezone
        </label>
        <Input
          id={timezoneId}
          required
          disabled={disabled || timezoneReadOnly}
          readOnly={timezoneReadOnly}
          value={timezone}
          onChange={handleTimezoneChange}
          placeholder="America/New_York"
          className={timezoneReadOnly ? 'bg-muted/40 text-muted-foreground' : undefined}
        />
        {timezoneReadOnly ? (
          <p className="text-xs text-muted-foreground">Uses your browser timezone. Shown in the footer below.</p>
        ) : null}
      </div>
    </>
  )
}

export function MeetingScheduleWhenSection({
  dateId,
  disabled,
  durationId,
  durationMinutes,
  meetingDate,
  meetingTime,
  timeId,
  timezone,
  timezoneId,
  onDurationMinutesChange,
  onMeetingDateChange,
  onMeetingTimeChange,
  onTimezoneChange,
}: MeetingFieldSharedProps & {
  dateId: string
  durationId: string
  durationMinutes: string
  meetingDate: Date | undefined
  meetingTime: string
  timeId: string
  timezone: string
  timezoneId: string
  onDurationMinutesChange: (value: string) => void
  onMeetingDateChange: (value: Date | undefined) => void
  onMeetingTimeChange: (value: string) => void
  onTimezoneChange: (value: string) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MeetingScheduleDateSection
        dateId={dateId}
        disabled={disabled}
        meetingDate={meetingDate}
        onMeetingDateChange={onMeetingDateChange}
      />
      <div className="space-y-2">
        <label htmlFor={timeId} className="text-sm font-medium">
          Start time
        </label>
        <TimePicker
          id={timeId}
          value={meetingTime}
          onChange={onMeetingTimeChange}
          disabled={disabled}
          minuteStep={15}
        />
      </div>
      <MeetingTimingSection
        disabled={disabled}
        durationId={durationId}
        durationMinutes={durationMinutes}
        durationVariant="select"
        showStartTime={false}
        timezone={timezone}
        timezoneId={timezoneId}
        timezoneReadOnly
        onDurationMinutesChange={onDurationMinutesChange}
        onTimezoneChange={onTimezoneChange}
      />
    </div>
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
  suggestionsLabel,
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
      suggestionsLabel={suggestionsLabel}
      onInputChange={onInputChange}
      onInputKeyDown={onInputKeyDown}
      onCommitInput={onCommitInput}
      onRemoveEmail={onRemoveEmail}
      onAddSuggestedEmail={onAddSuggestedEmail}
    />
  )
}
