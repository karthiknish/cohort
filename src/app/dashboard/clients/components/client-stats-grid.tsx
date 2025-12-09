'use client'

import {
  Briefcase,
  CheckSquare,
  FileText,
  Users as UsersIcon,
} from 'lucide-react'

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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="border-muted/60 bg-background transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.activeProjects ?? 0}</span>
                <span className="text-sm text-muted-foreground">active</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalProjects ?? 0} total projects
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.openTasks ?? 0}</span>
                <span className="text-sm text-muted-foreground">open</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.completedTasks ?? 0} completed
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Team</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{teamMembersCount}</span>
            <span className="text-sm text-muted-foreground">members</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {managersCount} managers
          </p>
        </CardContent>
      </Card>

      <Card className="border-muted/60 bg-background transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Proposals</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.pendingProposals ?? 0}</span>
                <span className="text-sm text-muted-foreground">pending</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting review or approval
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
