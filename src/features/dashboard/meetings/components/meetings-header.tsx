'use client';
import { LoaderCircle, Video } from 'lucide-react';
import { DashboardPageHero } from '@/shared/components/dashboard-page-hero';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme';
import { GoogleWorkspaceIcon } from './google-workspace-icon';
type MeetingsHeaderProps = {
    googleWorkspaceConnected: boolean;
    googleWorkspaceStatusLoading?: boolean;
    canSchedule: boolean;
    quickStarting: boolean;
    quickMeetDisabled: boolean;
    onStartQuickMeet: () => void;
    onConnectGoogleWorkspace: () => void;
    onManageGoogleWorkspace: () => void;
};
export function MeetingsHeader(props: MeetingsHeaderProps) {
    const { googleWorkspaceConnected, googleWorkspaceStatusLoading = false, canSchedule, quickStarting, quickMeetDisabled, onStartQuickMeet, onConnectGoogleWorkspace, onManageGoogleWorkspace, } = props;
    const quickMeetDisabledReason = googleWorkspaceStatusLoading
        ? 'Checking Google Workspace connection'
        : !canSchedule
            ? 'Scheduling is unavailable in this workspace'
            : quickMeetDisabled
                ? 'Connect Google Workspace to start a meeting with calendar invite support'
                : undefined;
    return (<DashboardPageHero>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className={cn(DASHBOARD_THEME.icons.container, 'size-11 shrink-0 rounded-xl')}>
          <Video className="size-6" aria-hidden/>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.meetings?.title ?? 'Meetings'}</h1>
          <p className={cn(DASHBOARD_THEME.layout.subtitle, 'max-w-2xl text-pretty')}>
            {PAGE_TITLES.meetings?.description ??
            'Run native meeting rooms, send Google Calendar invites, and keep AI notes synced.'}
          </p>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        {googleWorkspaceStatusLoading ? (<Button type="button" variant="outline" className={cn(getButtonClasses('outline'), 'w-full sm:w-auto')} disabled>
            <LoaderCircle className="mr-2 size-4 animate-spin"/>
            Checking Workspace…
          </Button>) : googleWorkspaceConnected ? (<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
              Connected
            </Badge>
            <Button type="button" variant="outline" className={cn(getButtonClasses('outline'), 'w-full sm:w-auto')} disabled={!canSchedule} onClick={onManageGoogleWorkspace}>
              <GoogleWorkspaceIcon className="mr-2 size-4"/>
              Manage
            </Button>
          </div>) : (<Button type="button" variant="outline" className={cn(getButtonClasses('outline'), 'w-full sm:w-auto')} disabled={!canSchedule} onClick={onConnectGoogleWorkspace}>
            <GoogleWorkspaceIcon className="mr-2 size-4"/>
            Connect Google Workspace
          </Button>)}

        <Button type="button" className={cn(getButtonClasses('primary'), 'w-full sm:w-auto')} disabled={!canSchedule || quickStarting || quickMeetDisabled} onClick={onStartQuickMeet} title={quickMeetDisabledReason}>
          {quickStarting ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <Video className="mr-2 size-4"/>}
          {googleWorkspaceStatusLoading ? 'Checking…' : 'Quick Meet'}
        </Button>
      </div>
    </DashboardPageHero>);
}
