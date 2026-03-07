import { Link2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getButtonClasses } from '@/lib/dashboard-theme'

type GoogleWorkspaceCardProps = {
  connected: boolean
  canSchedule: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function GoogleWorkspaceCard(props: GoogleWorkspaceCardProps) {
  const { connected, canSchedule, onConnect, onDisconnect } = props

  return (
    <Card className="border-muted/70 bg-background shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Google Workspace
        </CardTitle>
        <CardDescription>
          Connect a Google account to create Calendar invites for native Cohorts meeting rooms.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {!connected ? (
          <Button className={getButtonClasses('primary')} disabled={!canSchedule} onClick={onConnect}>
            Connect Google Workspace
          </Button>
        ) : (
          <Button variant="outline" className={getButtonClasses('outline')} disabled={!canSchedule} onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
