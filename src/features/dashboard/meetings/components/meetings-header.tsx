import { LoaderCircle, Video } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
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
    <div className={DASHBOARD_THEME.layout.header}>
      <div className="space-y-2">
        <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.meetings?.title ?? 'Meetings'}</h1>
        <p className={DASHBOARD_THEME.layout.subtitle}>
          {PAGE_TITLES.meetings?.description ?? 'Schedule, run, and summarize client calls.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {googleWorkspaceStatusLoading ? (
          <Badge variant="outline">Checking Google Workspace…</Badge>
        ) : (
          <Badge variant={googleWorkspaceConnected ? 'secondary' : 'outline'}>
            {googleWorkspaceConnected ? 'Google Workspace Connected' : 'Google Workspace Setup Required'}
          </Badge>
        )}
        <Button
          className={getButtonClasses('primary')}
          disabled={!canSchedule || quickStarting || quickMeetDisabled}
          onClick={onStartQuickMeet}
          title={quickMeetDisabledReason}
        >
          {quickStarting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
          {googleWorkspaceStatusLoading ? 'Checking Workspace…' : 'Start Cohorts Room'}
        </Button>
      </div>
    </div>
  )
}
