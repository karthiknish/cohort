import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

export function ArticleEditor() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Article editor scaffold</CardTitle>
        <CardDescription>Draft, review, and publish states are mapped before editor persistence lands.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Title</p>
          <p className="mt-1 text-muted-foreground">Escalation matrix for review week</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Outline</p>
          <p className="mt-1 text-muted-foreground">1. Escalation triggers 2. Coverage owner 3. Approval path 4. Recovery timing</p>
        </div>
        <Button variant="outline" className="rounded-xl">Open editor workflow</Button>
      </CardContent>
    </Card>
  )
}
