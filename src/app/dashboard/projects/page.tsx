'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Briefcase, Calendar, ListChecks, Loader2, MessageSquare, RefreshCw, Search, Tag, Users } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatRelativeTime } from '../collaboration/utils'

type ProjectResponse = {
  projects?: ProjectRecord[]
}

type StatusFilter = 'all' | ProjectStatus

const STATUS_FILTERS: StatusFilter[] = ['all', ...PROJECT_STATUSES]

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-800',
  active: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-amber-100 text-amber-800',
  completed: 'bg-muted text-muted-foreground',
}

export default function ProjectsPage() {
  const { user, getIdToken } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebouncedValue(searchInput, 350)

  const loadProjects = useCallback(async () => {
    if (!user?.id) {
      setProjects([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getIdToken()
      const params = new URLSearchParams()
      if (selectedClientId) {
        params.set('clientId', selectedClientId)
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (debouncedQuery.trim().length > 0) {
        params.set('query', debouncedQuery.trim())
      }

      const queryString = params.toString()
      const response = await fetch(`/api/projects${queryString ? `?${queryString}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      if (!response.ok) {
        let message = 'Unable to load projects'
        try {
          const payload = (await response.json()) as { error?: string }
          if (payload?.error) {
            message = payload.error
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message)
      }

      const data = (await response.json()) as ProjectResponse
      setProjects(Array.isArray(data.projects) ? data.projects : [])
    } catch (fetchError: unknown) {
      console.error('Failed to fetch projects', fetchError)
      setProjects([])
      setError(getErrorMessage(fetchError, 'Unable to load projects'))
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, getIdToken, selectedClientId, statusFilter, user?.id])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  const statusCounts = useMemo(() => {
    return projects.reduce<Record<ProjectStatus, number>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1
      return acc
    }, { planning: 0, active: 0, on_hold: 0, completed: 0 })
  }, [projects])

  const openTaskTotal = useMemo(() => {
    return projects.reduce((total, project) => total + project.openTaskCount, 0)
  }, [projects])

  const taskTotal = useMemo(() => {
    return projects.reduce((total, project) => total + project.taskCount, 0)
  }, [projects])

  const initialLoading = loading && projects.length === 0

  const portfolioLabel = selectedClient?.name ? `${selectedClient.name} workspace` : 'all workspaces'

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Portfolio overview for {portfolioLabel}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void loadProjects()
            }}
            className="inline-flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total projects"
          icon={Briefcase}
          value={projects.length}
          caption={statusCounts.completed > 0 ? `${statusCounts.completed} completed` : 'Tracking active and planned work'}
        />
        <SummaryCard
          label="Active"
          icon={ListChecks}
          value={statusCounts.active}
          caption={`${statusCounts.planning} planning · ${statusCounts.on_hold} on hold`}
        />
        <SummaryCard
          label="Open tasks"
          icon={Users}
          value={openTaskTotal}
          caption={taskTotal > 0 ? `${taskTotal - openTaskTotal} closed` : 'Waiting for assignments'}
        />
        <SummaryCard
          label="Recent updates"
          icon={MessageSquare}
          value={projects.filter((project) => project.recentActivityAt).length}
          caption="Tracked over the past 30 days"
        />
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">Project backlog</CardTitle>
              <CardDescription>Search, filter, and review current initiatives.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value === 'all' ? 'All statuses' : formatStatusLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
        </CardHeader>
        <CardContent>
          {initialLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full" />
              ))}
            </div>
          )}

          {!initialLoading && error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!initialLoading && !error && projects.length === 0 && (
            <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
              No projects match the current filters.
            </div>
          )}

          {!initialLoading && !error && projects.length > 0 && (
            <ScrollArea className="max-h-[640px]">
              <div className="space-y-4 pr-4">
                {projects.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectRow({ project }: { project: ProjectRecord }) {
  const tasksQuery = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
  })
  const tasksHref = `/dashboard/tasks?${tasksQuery.toString()}`
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`

  return (
    <div className="rounded-md border border-muted/40 bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
            <Badge variant="secondary" className={STATUS_CLASSES[project.status]}>
              {formatStatusLabel(project.status)}
            </Badge>
            {project.clientName ? (
              <Badge variant="outline" className="border-dashed">
                {project.clientName}
              </Badge>
            ) : null}
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              {formatTaskSummary(project.openTaskCount, project.taskCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange(project.startDate, project.endDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {project.recentActivityAt ? `Updated ${formatRelativeTime(project.recentActivityAt)}` : 'No recent activity'}
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="inline-flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3 text-xs text-muted-foreground">
          <div className="text-right">
            <p>Created {formatDate(project.createdAt)}</p>
            <p>Updated {formatDate(project.updatedAt)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={tasksHref} prefetch>
                <ListChecks className="h-4 w-4" />
                View tasks
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={collaborationHref} prefetch>
                <MessageSquare className="h-4 w-4" />
                Open discussion
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string
  value: number
  caption: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  )
}

function formatStatusLabel(status: ProjectStatus | StatusFilter): string {
  if (status === 'all') {
    return 'All statuses'
  }
  return status
    .replace('_', ' ')
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatTaskSummary(open: number, total: number): string {
  if (total === 0) {
    return 'No tasks yet'
  }
  if (open === 0) {
    return `${total} tasks • all closed`
  }
  return `${open} of ${total} open`
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatDateRange(start: string | null, end: string | null): string {
  const startLabel = formatDate(start)
  const endLabel = formatDate(end)
  if (startLabel === '—' && endLabel === '—') {
    return 'Timeline TBA'
  }
  if (startLabel !== '—' && endLabel === '—') {
    return `Started ${startLabel}`
  }
  if (startLabel === '—' && endLabel !== '—') {
    return `Due ${endLabel}`
  }
  return `${startLabel} – ${endLabel}`
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }
  return fallback
}

