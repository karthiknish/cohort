'use client';
import { useMemo } from 'react';
import { useMeetingsPageContext } from './meetings-page-provider';
import { MeetingsPageShellBoundary } from './meetings-page-shell-layout-sections';
import { MeetingsPageShellContent } from './meetings-page-shell-content-sections';
import { useMeetingsPageShellProps } from '../hooks/use-meetings-page-shell-props';
export function MeetingsPageShell() {
    const context = useMeetingsPageContext();
    const shell = useMeetingsPageShellProps();
    const { googleWorkspaceStatusLoading, meetingsQueryError, resolvedActiveInSiteMeeting, sharedRoomName, upcomingMeetingsLoading, } = context;
    const isInitialLoading = !resolvedActiveInSiteMeeting && !sharedRoomName && googleWorkspaceStatusLoading && upcomingMeetingsLoading;
    const shellContext = ({ resolvedActiveInSiteMeeting, sharedRoomName });
    return (<MeetingsPageShellBoundary loading={isInitialLoading} queryError={meetingsQueryError}>
      <MeetingsPageShellContent context={shellContext} shell={shell}/>
    </MeetingsPageShellBoundary>);
}
