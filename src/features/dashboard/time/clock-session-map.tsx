import { MapPin } from 'lucide-react'

import type { TimeSession } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function ClockSessionMap({ sessions }: { sessions: TimeSession[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Location audit view</CardTitle>
        <CardDescription>Preview GPS and workplace context without wiring live device signals yet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-dashed border-primary/30 bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-2xl border border-muted/40 bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {session.personName}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{session.locationLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">{session.project}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
