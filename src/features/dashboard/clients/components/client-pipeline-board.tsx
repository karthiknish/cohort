// =============================================================================
// CLIENTS PAGE - Pipeline Board Component
// =============================================================================

import Link from 'next/link'
import { Badge } from '@/shared/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { cn } from '@/lib/utils'
import type { ClientRecord } from '@/types/clients'
import type { ClientPipelineBoardProps } from '../types'

export function ClientPipelineBoard({ clients, selectedClientId }: ClientPipelineBoardProps) {
  const stages = [
    { id: 'onboarding', label: 'Onboarding', helper: 'Getting the core team in place' },
    { id: 'growth', label: 'Growth', helper: 'Expanding delivery coverage' },
    { id: 'established', label: 'Established', helper: 'Stable multi-role pod' },
  ] as const

  const deriveStage = (client: ClientRecord): (typeof stages)[number]['id'] => {
    const teamSize = Array.isArray(client.teamMembers) ? client.teamMembers.length : 0
    if (teamSize >= 4) return 'established'
    if (teamSize >= 2) return 'growth'
    return 'onboarding'
  }

  const groups = stages.map((stage) => ({
    stage,
    items: clients.filter((client) => deriveStage(client) === stage.id),
  }))

  return (
    <Card className="overflow-hidden border-muted/30 bg-card shadow-sm motion-chromatic hover:shadow-md">
      <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary" />
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Client pipeline</CardTitle>
            <CardDescription className="text-xs font-medium leading-tight text-muted-foreground">CRM overview stage transition tracking</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {groups.map(({ stage, items }) => (
            <div key={stage.id} className="flex flex-col gap-4 rounded-2xl border border-muted/20 bg-muted/5 p-4 motion-chromatic hover:bg-muted/[0.07]">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{stage.label}</span>
                  <Badge variant="outline" className="h-5 rounded-full border-muted/30 bg-card px-2 text-[10px] font-black text-primary shadow-sm">
                    {items.length}
                  </Badge>
                </div>
                <div className="size-1.5 rounded-full bg-muted-foreground/20" />
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-muted/30 bg-card/50 py-10 px-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Stage Empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((client) => (
                    <Link
                      key={client.id}
                      href={`/dashboard/clients?clientId=${client.id}`}
                      className={cn(
                        'group block rounded-xl border border-muted/30 bg-card p-4 shadow-sm motion-chromatic hover:border-primary/40 hover:shadow-md active:scale-[0.99]',
                        client.id === selectedClientId && 'border-primary/50 bg-primary/[0.02] shadow-md ring-1 ring-primary/20'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary" title={client.name}>
                            {client.name}
                          </span>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                              {client.accountManager ? client.accountManager : 'Unassigned'}
                            </span>
                          </div>
                        </div>
                        {client.id === selectedClientId && (
                          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-muted/10 pt-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/80">
                          Team {Array.isArray(client.teamMembers) ? client.teamMembers.length : 0}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'NEW'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
