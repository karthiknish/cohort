'use client'

import { useMemo } from 'react'
import { Button } from '@/shared/ui/button'
import { getButtonClasses } from '@/lib/dashboard-theme'
import {
  MeetingScheduleCardFrame,
  type SharedMeetingScheduleCardProps,
} from './meeting-schedule-card-sections'

type CreateMeetingCardProps = SharedMeetingScheduleCardProps

type RescheduleMeetingCardProps = SharedMeetingScheduleCardProps & {
  onReset: () => void
}

export function CreateMeetingCard(props: CreateMeetingCardProps) {
  return (
    <MeetingScheduleCardFrame
      {...props}
      cardTitle="Schedule Meeting"
      cardDescription="Creates a Cohorts room, sends Google Calendar invites, and keeps transcript-ready meeting records."
      submittingLabel="Scheduling..."
      submitLabel="Schedule room"
    />
  )
}

export function RescheduleMeetingCard({ onReset, ...props }: RescheduleMeetingCardProps) {
  const footerAction = useMemo(
    () => (
      <Button
        type="button"
        variant="outline"
        className={getButtonClasses('outline')}
        onClick={onReset}
        disabled={props.scheduling}
      >
        Cancel Edit
      </Button>
    ),
    [onReset, props.scheduling],
  )

  return (
    <MeetingScheduleCardFrame
      {...props}
      cardTitle="Reschedule Meeting"
      cardDescription="Update time, attendees, and details. Calendar invites and room access stay in sync automatically."
      submittingLabel="Saving…"
      submitLabel="Save Reschedule"
      footerAction={footerAction}
    />
  )
}
