import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/shared/ui/empty-state'

export function UpcomingMeetingsEmptyState() {
  return (
    <EmptyState
      variant="card"
      icon={CalendarDays}
      title="No upcoming meetings yet"
      description="Schedule a meeting to see it here."
      className="border-muted/40 bg-muted/10"
    />
  )
}
