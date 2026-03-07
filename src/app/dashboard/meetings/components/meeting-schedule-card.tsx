'use client'

import type { FormEvent, KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { CalendarDays, CalendarPlus } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'

import type { MeetingRecord } from '../types'
import { TIME_OPTIONS } from '../utils'
import { MeetingAttendeesField, type MeetingAttendeeSuggestion } from './meeting-attendees-field'

type MeetingScheduleCardProps = {
  editingMeeting: MeetingRecord | null
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
  onReset: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function MeetingScheduleCard({
  editingMeeting,
  meetingDate,
  meetingTime,
  durationMinutes,
  timezone,
  title,
  description,
  attendeeInput,
  attendeeEmails,
  attendeeSuggestions,
  scheduleRequiresGoogleWorkspace,
  googleWorkspaceConnected,
  scheduleDisabled,
  submitDisabled,
  scheduling,
  onMeetingDateChange,
  onMeetingTimeChange,
  onDurationMinutesChange,
  onTimezoneChange,
  onTitleChange,
  onDescriptionChange,
  onAttendeeInputChange,
  onAttendeeKeyDown,
  onCommitAttendeeInput,
  onRemoveAttendee,
  onAddSuggestedAttendee,
  onReset,
  onSubmit,
}: MeetingScheduleCardProps) {
  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-4 w-4" />
          {editingMeeting ? 'Reschedule Meeting' : 'Schedule Meeting'}
        </CardTitle>
        <CardDescription>
          {editingMeeting
            ? 'Update time, attendees, and details. Calendar invites and room access stay in sync automatically.'
            : 'Creates a Cohorts room, sends Google Calendar invites, and keeps transcript-ready meeting records.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scheduleRequiresGoogleWorkspace && !googleWorkspaceConnected && (
          <Alert className="mb-4">
            <AlertTitle>Google Workspace required</AlertTitle>
            <AlertDescription>
              Connect Google Workspace to create or update calendar-backed meeting invites.
            </AlertDescription>
          </Alert>
        )}

        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="schedule-title" className="text-sm font-medium">Title</label>
            <Input
              id="schedule-title"
              required
              disabled={scheduleDisabled}
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Weekly client strategy sync"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="schedule-description" className="text-sm font-medium">Description</label>
            <Textarea
              id="schedule-description"
              rows={3}
              disabled={scheduleDisabled}
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Agenda, links, and expected outcomes"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="schedule-date" className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="schedule-date"
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !meetingDate && 'text-muted-foreground'
                  )}
                  disabled={scheduleDisabled}
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

          <div className="space-y-2">
            <label htmlFor="schedule-start-time" className="text-sm font-medium">Start Time</label>
            <Select value={meetingTime} onValueChange={onMeetingTimeChange} disabled={scheduleDisabled}>
              <SelectTrigger id="schedule-start-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="schedule-duration" className="text-sm font-medium">Duration (minutes)</label>
            <Input
              id="schedule-duration"
              type="number"
              min={15}
              step={15}
              required
              disabled={scheduleDisabled}
              value={durationMinutes}
              onChange={(event) => onDurationMinutesChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="schedule-timezone" className="text-sm font-medium">Timezone</label>
            <Input
              id="schedule-timezone"
              required
              disabled={scheduleDisabled}
              value={timezone}
              onChange={(event) => onTimezoneChange(event.target.value)}
              placeholder="America/New_York"
            />
          </div>

          <MeetingAttendeesField
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
              <Button
                type="submit"
                className={getButtonClasses('primary')}
                disabled={submitDisabled}
              >
                {scheduling
                  ? editingMeeting
                    ? 'Saving...'
                    : 'Scheduling...'
                  : editingMeeting
                    ? 'Save Reschedule'
                    : 'Schedule room'}
              </Button>
              {editingMeeting && (
                <Button
                  type="button"
                  variant="outline"
                  className={getButtonClasses('outline')}
                  onClick={onReset}
                  disabled={scheduling}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
