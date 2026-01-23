'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ClientStats {
  activeProjects: number
  totalProjects: number
  openTasks: number
  completedTasks: number
  pendingProposals: number
}

interface ClientStatsGridProps {
  stats: ClientStats | null
  statsLoading: boolean
  teamMembersCount: number
  managersCount: number
}

export function ClientStatsGrid({
  stats,
  statsLoading,
  teamMembersCount,
  managersCount,
}: ClientStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Projects Stats */}
      <Card className="group relative overflow-hidden border-muted/30 bg-muted/5 shadow-sm transition-all hover:bg-muted/10">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70 transition-all group-hover:bg-primary" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-8 w-16 rounded-lg" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-foreground">{stats?.activeProjects ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">active</span>
              </div>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/40">
                {stats?.totalProjects ?? 0} TOTAL PROJECTS
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tasks Stats */}
      <Card className="group relative overflow-hidden border-muted/30 bg-muted/5 shadow-sm transition-all hover:bg-muted/10">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70 transition-all group-hover:bg-primary" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-8 w-16 rounded-lg" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-foreground">{stats?.openTasks ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">open</span>
              </div>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/40">
                {stats?.completedTasks ?? 0} COMPLETED
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Stats */}
      <Card className="group relative overflow-hidden border-muted/30 bg-muted/5 shadow-sm transition-all hover:bg-muted/10">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70 transition-all group-hover:bg-primary" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-foreground">{teamMembersCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">members</span>
          </div>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/40">
            {managersCount} MANAGERS ASSIGNED
          </p>
        </CardContent>
      </Card>

      {/* Proposals Stats */}
      <Card className="group relative overflow-hidden border-muted/30 bg-muted/5 shadow-sm transition-all hover:bg-muted/10">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/70 transition-all group-hover:bg-primary" />
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-8 w-16 rounded-lg" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-foreground">{stats?.pendingProposals ?? 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/60">pending</span>
              </div>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/40">
                AWAITING CLIENT ACTION
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
