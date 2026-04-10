import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

export function TimeOffRequestDialog() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request flow scaffold</CardTitle>
        <CardDescription>Leave type, approval chain, and team-availability checks are represented in the shell.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Leave type</p>
          <p className="mt-1 text-muted-foreground">Annual leave with handoff coverage validation</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Approval chain</p>
          <p className="mt-1 text-muted-foreground">Team lead approval first, then operations if the request overlaps review week.</p>
        </div>
        <Button variant="outline" className="rounded-xl">Start request</Button>
      </CardContent>
    </Card>
  )
}
