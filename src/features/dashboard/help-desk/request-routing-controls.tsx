import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

export function RequestRoutingControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Routing controls</CardTitle>
        <CardDescription>Owner queues, priority tiers, and SLA labels are scaffolded in the UI layer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Queue</p>
          <p className="mt-1 text-muted-foreground">Operations</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Priority</p>
          <p className="mt-1 text-muted-foreground">High · due within the workday</p>
        </div>
        <Button variant="outline" className="rounded-xl">Assign owner</Button>
      </CardContent>
    </Card>
  )
}
