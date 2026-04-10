import type { RecognitionEntry } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function RecognitionFeed({ entries }: { entries: RecognitionEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recognition feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-2xl border border-muted/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{entry.personName}</p>
                <p className="text-sm text-muted-foreground">{entry.team}</p>
              </div>
              <span className="text-xs text-muted-foreground">{entry.awardedAt}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{entry.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{entry.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
