import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

export function AnnouncementComposer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Announcement composer</CardTitle>
        <CardDescription>Broadcast updates with audience targeting and scheduling before they go live.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Audience</p>
          <p className="mt-1 text-muted-foreground">Delivery leads, account owners, and support coverage managers</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Message draft</p>
          <p className="mt-1 text-muted-foreground">Review week staffing plan and escalation ownership are ready for confirmation.</p>
        </div>
        <Button className="rounded-xl">Schedule announcement</Button>
      </CardContent>
    </Card>
  )
}
