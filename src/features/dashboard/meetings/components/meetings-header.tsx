import { LoaderCircle, Video } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme'

type MeetingsHeaderProps = {
  googleWorkspaceConnected: boolean
  googleWorkspaceStatusLoading?: boolean
  canSchedule: boolean
  quickStarting: boolean
  quickMeetDisabled: boolean
  onStartQuickMeet: () => void
}

export function MeetingsHeader(props: MeetingsHeaderProps) {
  const {
    googleWorkspaceConnected,
    googleWorkspaceStatusLoading = false,
    canSchedule,
    quickStarting,
    quickMeetDisabled,
    onStartQuickMeet,
  } = props

  const quickMeetDisabledReason = googleWorkspaceStatusLoading
    ? 'Checking Google Workspace connection'
    : !canSchedule
      ? 'Scheduling is unavailable in this workspace'
      : quickMeetDisabled
        ? 'Connect Google Workspace to start a meeting with calendar invite support'
        : undefined

  return (
    <header className={cn(DASHBOARD_THEME.layout.header, 'border-b border-muted/40 pb-6')}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={cn(DASHBOARD_THEME.icons.container, 'h-11 w-11 shrink-0 rounded-xl')}>
          <Video className="h-6 w-6" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.meetings?.title ?? 'Meetings'}</h1>
          <p className={cn(DASHBOARD_THEME.layout.subtitle, 'max-w-2xl text-pretty')}>
            {PAGE_TITLES.meetings?.description ?? 'Schedule, run, and summarize client calls.'}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {googleWorkspaceStatusLoading ? (
          <Badge variant="outline" className="w-fit">
            Checking Google Workspace…
          </Badge>
        ) : (
          <Badge variant={googleWorkspaceConnected ? 'secondary' : 'outline'} className="w-fit">
            {googleWorkspaceConnected ? 'Google Workspace connected' : 'Google Workspace setup required'}
          </Badge>
        )}
        <Button
          className={cn(getButtonClasses('primary'), 'w-full sm:w-auto')}
          disabled={!canSchedule || quickStarting || quickMeetDisabled}
          onClick={onStartQuickMeet}
          title={quickMeetDisabledReason}
        >
          {quickStarting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
          {googleWorkspaceStatusLoading ? 'Checking Workspace…' : 'Start Cohorts room'}
        </Button>
      </div>
    </header>
  )
}
