import { Link2 } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { getButtonClasses } from '@/lib/dashboard-theme'

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
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Google Workspace
          {loading ? (
            <Badge variant="outline">Checking connection</Badge>
          ) : connected ? (
            <Badge variant="secondary">Connected</Badge>
          ) : (
            <Badge variant="outline">Setup required</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {loading
            ? 'Checking whether this workspace already has Google Calendar invite support enabled.'
            : 'Connect a Google account to create Calendar invites for native Cohorts meeting rooms.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
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
