import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function FormEntryDetail() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Submission detail</CardTitle>
        <CardDescription>Shows how a reviewer can inspect evidence, comments, and structured answers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Checklist status</p>
          <p className="mt-1 text-muted-foreground">9 of 11 items complete. Budget confirmation and screenshot proof are missing.</p>
        </div>
        <div className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
          <p className="font-medium text-foreground">Reviewer note</p>
          <p className="mt-1 text-muted-foreground">Send back with a required photo field before the campaign goes live.</p>
        </div>
      </CardContent>
    </Card>
  )
}
