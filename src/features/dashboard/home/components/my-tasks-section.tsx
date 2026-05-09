'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useConvexAuth, useQuery } from 'convex/react'
import { ArrowUpRight, CheckSquare, Clock } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { useAuth } from '@/shared/contexts/auth-context'
import { tasksApi } from '@/lib/convex-api'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn, getWorkspaceId } from '@/lib/utils'
import type { TaskRecord } from '@/types/tasks'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapConvexTask(raw: unknown): TaskRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  return {
    id: String(r.legacyId ?? ''),
    title: String(r.title ?? ''),
    description: typeof r.description === 'string' ? r.description : null,
    status: (r.status as TaskRecord['status']) ?? 'todo',
    priority: (r.priority as TaskRecord['priority']) ?? 'medium',
    assignedTo: Array.isArray(r.assignedTo) ? (r.assignedTo as string[]) : [],
    clientId: typeof r.clientId === 'string' ? r.clientId : null,
    client: typeof r.client === 'string' ? r.client : null,
    projectId: typeof r.projectId === 'string' ? r.projectId : null,
    projectName: typeof r.projectName === 'string' ? r.projectName : null,
    dueDate: typeof r.dueDateMs === 'number' ? new Date(r.dueDateMs).toISOString() : null,
    createdAt: typeof r.createdAtMs === 'number' ? new Date(r.createdAtMs).toISOString() : null,
    updatedAt: typeof r.updatedAtMs === 'number' ? new Date(r.updatedAtMs).toISOString() : null,
  }
}

type BadgeVariant = 'destructive' | 'warning' | 'info' | 'secondary' | 'success' | 'default'

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  urgent: 'destructive',
  high: 'warning',
  medium: 'info',
  low: 'secondary',
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  'todo': 'secondary',
  'in-progress': 'info',
  'review': 'default',
  'completed': 'success',
  'archived': 'secondary',
}

type TaskGroup = {
  label: string
  tone: 'critical' | 'warning' | 'neutral'
  tasks: TaskRecord[]
}

function groupTasks(tasks: TaskRecord[], nowMs: number): TaskGroup[] {
  const overdue: TaskRecord[] = []
  const today: TaskRecord[] = []
  const soon: TaskRecord[] = []
  const later: TaskRecord[] = []
  const noduedate: TaskRecord[] = []

  const dayMs = 24 * 60 * 60 * 1000
  const todayEnd = new Date(nowMs)
  todayEnd.setHours(23, 59, 59, 999)
  const weekEnd = new Date(nowMs + 7 * dayMs)

  for (const t of tasks) {
    if (!t.dueDate) {
      noduedate.push(t)
      continue
    }
    const dueMs = Date.parse(t.dueDate)
    if (!Number.isFinite(dueMs)) {
      noduedate.push(t)
      continue
    }
    if (dueMs < nowMs) {
      overdue.push(t)
    } else if (dueMs <= todayEnd.getTime()) {
      today.push(t)
    } else if (dueMs <= weekEnd.getTime()) {
      soon.push(t)
    } else {
      later.push(t)
    }
  }

  const groups: TaskGroup[] = []
  if (overdue.length > 0) groups.push({ label: 'Overdue', tone: 'critical', tasks: overdue })
  if (today.length > 0) groups.push({ label: 'Due today', tone: 'warning', tasks: today })
  if (soon.length > 0) groups.push({ label: 'This week', tone: 'neutral', tasks: soon })
  if (later.length > 0) groups.push({ label: 'Upcoming', tone: 'neutral', tasks: later })
  if (noduedate.length > 0) groups.push({ label: 'No due date', tone: 'neutral', tasks: noduedate })

  return groups
}

function formatDueDate(dueDate: string | null | undefined, nowMs: number): string {
  if (!dueDate) return ''
  const dueMs = Date.parse(dueDate)
  if (!Number.isFinite(dueMs)) return ''

  const diffMs = dueMs - nowMs
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))

  if (diffMs < 0) {
    const overDays = Math.abs(diffDays)
    if (overDays === 0) return 'Due today (overdue)'
    return `${overDays}d overdue`
  }
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays}d`
}

const TONE_HEADER: Record<string, string> = {
  critical: 'text-destructive',
  warning: 'text-warning',
  neutral: 'text-muted-foreground',
}

// ─── Task row ─────────────────────────────────────────────────────────────────

function TaskRow({ task, nowMs }: { task: TaskRecord; nowMs: number }) {
  const isOverdue = task.dueDate ? Date.parse(task.dueDate) < nowMs : false

  return (
    <Link
      href={`/dashboard/tasks?taskId=${task.id}`}
      className="group flex items-start gap-3 rounded-xl border border-border/50 bg-background/80 p-3 transition-colors hover:border-border hover:bg-muted/20"
    >
      <CheckSquare className={cn('mt-0.5 h-4 w-4 shrink-0', isOverdue ? 'text-destructive' : 'text-muted-foreground/60')} />

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{task.title}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Priority */}
          <Badge
            variant={PRIORITY_VARIANT[task.priority] ?? 'secondary'}
            className="rounded-full px-2 py-0 text-[10px] font-semibold uppercase tracking-wide"
          >
            {task.priority}
          </Badge>

          {/* Status */}
          <Badge
            variant={STATUS_VARIANT[task.status] ?? 'secondary'}
            className="rounded-full px-2 py-0 text-[10px] font-medium capitalize"
          >
            {task.status.replace('-', ' ')}
          </Badge>

          {/* Client badge */}
          {task.client && (
            <Badge variant="secondary" className="max-w-[120px] truncate rounded-full px-2 py-0 text-[10px]">
              {task.client}
            </Badge>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <p className={cn('flex items-center gap-1 text-[11px]', isOverdue ? 'font-medium text-destructive' : 'text-muted-foreground')}>
            <Clock className="h-3 w-3" />
            {formatDueDate(task.dueDate, nowMs)}
          </p>
        )}
      </div>

      <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const TASK_SKELETON_KEYS = ['ts-a', 'ts-b', 'ts-c', 'ts-d'] as const

function TaskSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-background/80 p-3">
      <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function MyTasksSection() {
  const { user } = useAuth()
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth()
  const [currentTimeMs, setCurrentTimeMs] = useState(0)
  const workspaceId = getWorkspaceId(user)

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTimeMs(Date.now())
    }

    updateCurrentTime()
    const intervalId = window.setInterval(updateCurrentTime, 60_000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const canQuery = isAuthenticated && !isConvexLoading && !!workspaceId && !!user?.id

  const rawTasks = useQuery(
    tasksApi.listForUser,
    canQuery ? { workspaceId, userId: user?.id ?? '' } : 'skip'
  ) as unknown[] | undefined

  const tasks: TaskRecord[] = rawTasks
    ? rawTasks.flatMap((r) => {
        const t = mapConvexTask(r)
        return t ? [t] : []
      })
    : []

  const groups = groupTasks(tasks, currentTimeMs)
  const isLoading = rawTasks === undefined
  const openCount = tasks.length

  return (
    <Card className={DASHBOARD_THEME.cards.base}>
      <CardHeader className={cn(DASHBOARD_THEME.cards.header, 'pb-4')}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">My work</CardTitle>
              {!isLoading && openCount > 0 && (
                <Badge variant="secondary" className="rounded-full text-xs">
                  {openCount}
                </Badge>
              )}
            </div>
            <CardDescription>
              Tasks assigned to you or awaiting ownership across all clients.
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/dashboard/tasks">View all tasks</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {TASK_SKELETON_KEYS.map((k) => (
              <TaskSkeleton key={k} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            <CheckSquare className="mx-auto mb-2 h-6 w-6 opacity-30" />
            <p>You&apos;re all caught up, no open tasks assigned to you right now.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <div key={group.label}>
                <p className={cn('mb-2 text-[11px] font-semibold uppercase tracking-wider', TONE_HEADER[group.tone])}>
                  {group.label}
                  <span className="ml-1.5 font-normal opacity-70">({group.tasks.length})</span>
                </p>
                <div className="space-y-2">
                  {group.tasks.map((t) => (
                    <TaskRow key={t.id} task={t} nowMs={currentTimeMs} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
