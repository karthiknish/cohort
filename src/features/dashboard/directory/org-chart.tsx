import type { TeamNode } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function OrgChart({ teams }: { teams: TeamNode[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Org snapshot</CardTitle>
        <CardDescription>A lightweight org view built from the same team-node data used elsewhere in the directory.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-dashed border-primary/25 bg-card p-5">
          <div className="mx-auto max-w-xs rounded-2xl border border-muted/40 bg-muted/20 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Executive operations</p>
            <p className="mt-2 font-semibold text-foreground">Dan Wright</p>
            <p className="text-sm text-muted-foreground">Operations manager</p>
          </div>
          <div className="mx-auto my-4 h-8 w-px bg-border" />
          <div className="grid gap-4 md:grid-cols-3">
            {teams.map((team) => (
              <div key={team.id} className="rounded-2xl border border-muted/40 bg-muted/20 p-4">
                <p className="font-medium text-foreground">{team.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">Lead: {team.lead}</p>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">{team.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
