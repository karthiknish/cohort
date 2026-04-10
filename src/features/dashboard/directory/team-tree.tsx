import type { TeamNode } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function TeamTree({ teams }: { teams: TeamNode[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team structure</CardTitle>
        <CardDescription>Low-risk org chart foundation using team leads and member counts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="rounded-2xl border border-muted/50 bg-muted/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{team.name}</p>
                <p className="text-sm text-muted-foreground">Lead: {team.lead}</p>
              </div>
              <span className="text-sm font-medium text-foreground">{team.members} members</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{team.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
