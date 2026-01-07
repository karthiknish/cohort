'use client'

import Link from 'next/link'
import { TASK_STATUSES, type TaskRecord } from '@/types/tasks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export interface MiniTaskKanbanProps {
  tasks: TaskRecord[]
  loading: boolean
}

export function MiniTaskKanban({ tasks, loading }: MiniTaskKanbanProps) {
  const columns = TASK_STATUSES.map((status) => ({
    status,
    items: tasks.filter((task) => task.status === status).slice(0, 6),
  }))

  const formatDue = (value?: string | null) => {
    if (!value) return 'No due date'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No due date'
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Task board (compact)</CardTitle>
        <CardDescription>Quick glance across todo, in-progress, review, and completed.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-md border border-dashed border-muted/50 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
            No tasks available. Create tasks to populate the board.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {columns.map(({ status, items }) => (
              <div key={status} className="flex flex-col gap-2 rounded-md border border-muted/50 bg-muted/10 p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span className="capitalize">{status.replace('-', ' ')}</span>
                  <Badge variant="outline" className="bg-background text-xs">{items.length}</Badge>
                </div>
                {items.length === 0 ? (
                  <div className="rounded-md border border-dashed border-muted/40 bg-background px-3 py-4 text-center text-xs text-muted-foreground">
                    Empty lane
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((task) => (
                      <Link
                        key={task.id}
                        href={`/dashboard/tasks?taskId=${task.id}`}
                        className="block rounded-md border border-muted/40 bg-background p-2 text-sm shadow-sm transition hover:border-primary/40 hover:shadow"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium" title={task.title}>{task.title}</span>
                          <Badge variant="secondary" className="text-[10px] capitalize">{task.priority}</Badge>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{task.client || 'Internal'}</span>
                          <span>{formatDue(task.dueDate)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
