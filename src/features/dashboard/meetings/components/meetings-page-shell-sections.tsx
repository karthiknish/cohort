'use client';
import { useState, type ComponentProps } from 'react';
import { CalendarDays, Globe, Info, ShieldAlert, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { MeetingRoomPage } from './in-site-meeting-card';
import { MeetingCancelDialog } from './meeting-cancel-dialog';
import { MeetingRoomLoadingState } from './meeting-room-loading-state';
import { CreateMeetingCard, RescheduleMeetingCard } from './meeting-schedule-card';
import { MeetingsHeader } from './meetings-header';
import { QuickMeetDialog } from './quick-meet-dialog';
import { UpcomingMeetingsCard } from './upcoming-meetings-card';
type MeetingsHeaderProps = ComponentProps<typeof MeetingsHeader>;
type QuickMeetDialogProps = ComponentProps<typeof QuickMeetDialog>;
type MeetingCancelDialogProps = ComponentProps<typeof MeetingCancelDialog>;
type CreateMeetingCardProps = ComponentProps<typeof CreateMeetingCard>;
type RescheduleMeetingCardProps = ComponentProps<typeof RescheduleMeetingCard>;
type UpcomingMeetingsCardProps = ComponentProps<typeof UpcomingMeetingsCard>;
type MeetingRoomPageProps = ComponentProps<typeof MeetingRoomPage>;
type MeetingRoomLoadingStateProps = ComponentProps<typeof MeetingRoomLoadingState>;
export function ActiveMeetingRoomSection({ meetingRoomKey, ...meetingRoomProps }: MeetingRoomPageProps & {
    meetingRoomKey: string;
}) {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <MeetingRoomPage key={meetingRoomKey} {...meetingRoomProps}/>
    </div>);
}
export function SharedRoomLoadingSection(props: MeetingRoomLoadingStateProps) {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <MeetingRoomLoadingState {...props}/>
    </div>);
}
export function MeetingsTimezoneFooter({ timezone }: {
    timezone: string;
}) {
    return (<p className="flex items-center justify-center gap-2 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
      <Globe className="size-4 shrink-0" aria-hidden/>
      All times are shown in {timezone}
    </p>);
}
function MeetingsMobileWorkspace({ createMeetingCardProps, upcomingMeetingsCardProps, editingMeeting, }: {
    createMeetingCardProps: CreateMeetingCardProps;
    upcomingMeetingsCardProps: UpcomingMeetingsCardProps;
    editingMeeting: boolean;
}) {
    const [tab, setTab] = useState('upcoming');
    return (<Tabs value={tab} onValueChange={setTab} className="w-full lg:hidden">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1">
        <TabsTrigger value="upcoming" className="gap-1.5 text-xs sm:text-sm">
          <Video className="size-3.5 shrink-0"/>
          Upcoming
        </TabsTrigger>
        {!editingMeeting ? (<TabsTrigger value="schedule" className="gap-1.5 text-xs sm:text-sm">
            <CalendarDays className="size-3.5 shrink-0"/>
            Schedule
          </TabsTrigger>) : null}
      </TabsList>
      <TabsContent value="upcoming" className="mt-4 focus-visible:outline-none">
        <UpcomingMeetingsCard {...upcomingMeetingsCardProps}/>
      </TabsContent>
      {!editingMeeting ? (<TabsContent value="schedule" className="mt-4 focus-visible:outline-none">
          <CreateMeetingCard {...createMeetingCardProps}/>
        </TabsContent>) : null}
    </Tabs>);
}
export function MeetingsDefaultView({ editingMeeting, meetingsHeaderProps, meetingCancelDialogProps, quickMeetDialogProps, createMeetingCardProps, rescheduleMeetingCardProps, showPreviewMode, showReadOnlyAccessAlert, upcomingMeetingsCardProps, timezone, }: {
    editingMeeting: boolean;
    meetingsHeaderProps: MeetingsHeaderProps;
    meetingCancelDialogProps: MeetingCancelDialogProps;
    quickMeetDialogProps: QuickMeetDialogProps;
    createMeetingCardProps: CreateMeetingCardProps;
    rescheduleMeetingCardProps: RescheduleMeetingCardProps;
    showPreviewMode: boolean;
    showReadOnlyAccessAlert: boolean;
    upcomingMeetingsCardProps: UpcomingMeetingsCardProps;
    timezone: string;
}) {
    return (<div className={DASHBOARD_THEME.layout.container}>
      <MeetingsHeader {...meetingsHeaderProps}/>

      <div className="space-y-3">
        {showPreviewMode ? (<Alert className="border-accent/25 bg-accent/5 text-foreground">
            <Info className="text-primary" aria-hidden/>
            <AlertTitle>Preview mode</AlertTitle>
            <AlertDescription>
              Meetings use sample data in preview mode. You can browse upcoming calls and open the native room workspace, but scheduling and integration actions are disabled.
            </AlertDescription>
          </Alert>) : null}

        {showReadOnlyAccessAlert ? (<Alert className="border-muted/60 bg-muted/40 text-foreground">
            <ShieldAlert className="text-muted-foreground" aria-hidden/>
            <AlertTitle>Read-only access</AlertTitle>
            <AlertDescription>
              Client users can join and review meetings, but scheduling is restricted to admin and team members.
            </AlertDescription>
          </Alert>) : null}
      </div>

      <QuickMeetDialog {...quickMeetDialogProps}/>

      <div className="space-y-6">
        <MeetingCancelDialog {...meetingCancelDialogProps}/>

        {editingMeeting ? (<RescheduleMeetingCard {...rescheduleMeetingCardProps}/>) : null}

        <MeetingsMobileWorkspace createMeetingCardProps={createMeetingCardProps} upcomingMeetingsCardProps={upcomingMeetingsCardProps} editingMeeting={editingMeeting}/>

        <div className="hidden gap-6 lg:grid lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            {editingMeeting ? null : <CreateMeetingCard {...createMeetingCardProps}/>}
          </div>
          <div className="lg:col-span-5">
            <UpcomingMeetingsCard {...upcomingMeetingsCardProps}/>
          </div>
        </div>

        <MeetingsTimezoneFooter timezone={timezone}/>
      </div>
    </div>);
}
