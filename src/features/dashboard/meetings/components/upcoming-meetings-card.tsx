import { Clock3 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

import type { MeetingRecord } from '../types'
import {
  UpcomingMeetingItemCard,
  UpcomingMeetingsEmptyState,
  UpcomingMeetingsLoadingState,
} from './upcoming-meetings-card-sections'

type UpcomingMeetingsCardProps = {
  meetings: MeetingRecord[]
  loading?: boolean
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
    loading = false,
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
        {loading ? (
          <UpcomingMeetingsLoadingState />
        ) : meetings.length === 0 ? (
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
