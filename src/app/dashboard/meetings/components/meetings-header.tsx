import { LoaderCircle, Video } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme'

type MeetingsHeaderProps = {
  googleWorkspaceConnected: boolean
  canSchedule: boolean
  quickStarting: boolean
  quickMeetDisabled: boolean
  onStartQuickMeet: () => void
}

export function MeetingsHeader(props: MeetingsHeaderProps) {
  const { googleWorkspaceConnected, canSchedule, quickStarting, quickMeetDisabled, onStartQuickMeet } = props

  return (
    <div className={DASHBOARD_THEME.layout.header}>
      <div className="space-y-2">
        <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.meetings?.title ?? 'Meetings'}</h1>
        <p className={DASHBOARD_THEME.layout.subtitle}>
          {PAGE_TITLES.meetings?.description ?? 'Schedule, run, and summarize client calls.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={googleWorkspaceConnected ? 'secondary' : 'outline'}>
          {googleWorkspaceConnected ? 'Google Workspace Connected' : 'Google Workspace Not Connected'}
        </Badge>
        <Button
          className={getButtonClasses('primary')}
          disabled={!canSchedule || quickStarting || quickMeetDisabled}
          onClick={onStartQuickMeet}
        >
          {quickStarting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Video className="mr-2 h-4 w-4" />}
          Start Quick Meet
        </Button>
      </div>
    </div>
  )
}
