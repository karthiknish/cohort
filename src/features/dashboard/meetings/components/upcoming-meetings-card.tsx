import { Clock3 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme';
import type { MeetingRecord } from '../types';
import { UpcomingMeetingItemCard, UpcomingMeetingsEmptyState, UpcomingMeetingsLoadingState, } from './upcoming-meetings-card-sections';
const GOOGLE_CALENDAR_URL = 'https://calendar.google.com/';
type UpcomingMeetingsCardProps = {
    meetings: MeetingRecord[];
    loading?: boolean;
    canSchedule: boolean;
    googleWorkspaceConnected?: boolean;
    cancellingMeetingId: string | null;
    onOpenInSiteMeeting: (meeting: MeetingRecord) => void;
    onRescheduleMeeting: (meeting: MeetingRecord) => void;
    onCancelMeeting: (meeting: MeetingRecord) => void;
    onMarkCompleted: (legacyId: string) => void;
};
export function UpcomingMeetingsCard(props: UpcomingMeetingsCardProps) {
    const { meetings, loading = false, canSchedule, googleWorkspaceConnected = false, cancellingMeetingId, onOpenInSiteMeeting, onRescheduleMeeting, onCancelMeeting, onMarkCompleted, } = props;
    return (<Card className={cn(DASHBOARD_THEME.cards.base, 'h-full')}>
      <CardHeader className="space-y-3 border-b border-muted/40 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className={cn(DASHBOARD_THEME.icons.container, 'size-10 shrink-0 rounded-lg')}>
              <Clock3 className="size-5" aria-hidden/>
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-base leading-tight">Upcoming meetings</CardTitle>
              <CardDescription className="text-pretty">
                Scheduled rooms and calendar-backed calls for this workspace.
              </CardDescription>
            </div>
          </div>
          {googleWorkspaceConnected ? (<Button type="button" variant="outline" className={cn(getButtonClasses('outline'), 'shrink-0')} asChild>
              <a href={GOOGLE_CALENDAR_URL} target="_blank" rel="noreferrer">
                View Calendar
              </a>
            </Button>) : (<Button type="button" variant="outline" className={cn(getButtonClasses('outline'), 'shrink-0')} disabled>
              View Calendar
            </Button>)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {loading ? (<UpcomingMeetingsLoadingState />) : meetings.length === 0 ? (<UpcomingMeetingsEmptyState />) : (meetings.map((meeting) => (<UpcomingMeetingItemCard key={meeting.legacyId} meeting={meeting} canSchedule={canSchedule} cancellingMeetingId={cancellingMeetingId} onOpenInSiteMeeting={onOpenInSiteMeeting} onRescheduleMeeting={onRescheduleMeeting} onCancelMeeting={onCancelMeeting} onMarkCompleted={onMarkCompleted}/>)))}
      </CardContent>
    </Card>);
}
