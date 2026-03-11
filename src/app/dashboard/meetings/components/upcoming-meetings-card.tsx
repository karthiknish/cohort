import { Clock3 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { MeetingRecord } from '../types'
import { UpcomingMeetingItemCard, UpcomingMeetingsEmptyState } from './upcoming-meetings-card-sections'

type UpcomingMeetingsCardProps = {
  meetings: MeetingRecord[]
  canSchedule: boolean
  cancellingMeetingId: string | null
  onOpenInSiteMeeting: (meeting: MeetingRecord) => void
  onRescheduleMeeting: (meeting: MeetingRecord) => void
  onCancelMeeting: (meeting: MeetingRecord) => void
  onMarkCompleted: (legacyId: string) => void
}

export function UpcomingMeetingsCard(props: UpcomingMeetingsCardProps) {
  const {
    meetings,
    canSchedule,
    cancellingMeetingId,
    onOpenInSiteMeeting,
    onRescheduleMeeting,
    onCancelMeeting,
    onMarkCompleted,
  } = props

  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          Upcoming Meetings
        </CardTitle>
        <CardDescription>Meetings from the selected workspace/client context.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {meetings.length === 0 ? (
          <UpcomingMeetingsEmptyState />
        ) : (
          meetings.map((meeting) => (
            <UpcomingMeetingItemCard
              key={meeting.legacyId}
              meeting={meeting}
              canSchedule={canSchedule}
              cancellingMeetingId={cancellingMeetingId}
              onOpenInSiteMeeting={onOpenInSiteMeeting}
              onRescheduleMeeting={onRescheduleMeeting}
              onCancelMeeting={onCancelMeeting}
              onMarkCompleted={onMarkCompleted}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}
