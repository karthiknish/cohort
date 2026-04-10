import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function RequestDetailDrawer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request detail</CardTitle>
        <CardDescription>Structured intake gives the ops team something more durable than chat triage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Issue summary</p>
          <p className="mt-1 text-muted-foreground">Access to retained client docs is blocked for the Northstar migration workspace.</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Suggested next step</p>
          <p className="mt-1 text-muted-foreground">Route to operations, attach workspace membership context, and target a same-day response.</p>
        </div>
      </CardContent>
    </Card>
  )
}
