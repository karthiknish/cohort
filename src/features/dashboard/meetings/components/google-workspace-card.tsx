import { Link2 } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/lib/utils'
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme'

type GoogleWorkspaceCardProps = {
  connected: boolean
  canSchedule: boolean
  loading?: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function GoogleWorkspaceCard(props: GoogleWorkspaceCardProps) {
  const { connected, canSchedule, loading = false, onConnect, onDisconnect } = props

  return (
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <div className={cn(DASHBOARD_THEME.icons.container, 'h-10 w-10 shrink-0 rounded-lg')}>
            <Link2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base leading-tight">
              <span>Google Workspace</span>
              {loading ? (
                <Badge variant="outline" className="font-normal">
                  Checking…
                </Badge>
              ) : connected ? (
                <Badge variant="secondary" className="font-normal">
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="font-normal">
                  Setup required
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-pretty">
              {loading
                ? 'Checking whether this workspace already has Google Calendar invite support enabled.'
                : 'Connect a Google account to create Calendar invites for native Cohorts meeting rooms.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3 border-t border-muted/40 pt-4">
        {loading ? (
          <Skeleton className="h-10 w-52 rounded-md" />
        ) : !connected ? (
          <div className="space-y-2">
            <Button className={getButtonClasses('primary')} disabled={!canSchedule} onClick={onConnect}>
              Connect Google Workspace
            </Button>
            <p className="text-xs text-muted-foreground">Required before scheduled Cohorts rooms can send Calendar invites.</p>
          </div>
        ) : (
          <Button variant="outline" className={getButtonClasses('outline')} disabled={!canSchedule} onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
