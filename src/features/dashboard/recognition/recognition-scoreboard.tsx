import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function RecognitionScoreboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recognition patterns</CardTitle>
        <CardDescription>Useful later for badge systems, nomination prompts, and quarterly culture signals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Most-recognized behavior</p>
          <p className="mt-1 text-muted-foreground">Cross-team handoff quality and proactive escalation ownership.</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Suggested next step</p>
          <p className="mt-1 text-muted-foreground">Add nomination prompts to updates and tie recognition into onboarding examples.</p>
        </div>
      </CardContent>
    </Card>
  )
}
