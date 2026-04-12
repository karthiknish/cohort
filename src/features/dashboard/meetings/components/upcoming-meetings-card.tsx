import { Clock3 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

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
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10 shrink-0 rounded-lg')}>
            <Clock3 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-base leading-tight">Upcoming meetings</CardTitle>
            <CardDescription className="text-pretty">
              Scheduled rooms and calendar-backed calls for this workspace.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 border-t border-muted/40 pt-4">
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
