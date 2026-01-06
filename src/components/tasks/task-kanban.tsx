"use client"

import { useMemo } from 'react'
import { TriangleAlert, Columns3, LoaderCircle, ListTodo, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskRecord, TaskStatus, TASK_STATUSES } from '@/types/tasks'
import { TaskCard } from './task-card'
import { formatStatusLabel } from './task-types'

export type TaskKanbanProps = {
  tasks: TaskRecord[]
  loading: boolean
  initialLoading: boolean
  error: string | null
  pendingStatusUpdates: Set<string>
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onRefresh: () => void
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  emptyStateMessage: string
  showEmptyStateFiltered: boolean
}

export function TaskKanban({
  tasks,
  loading,
  initialLoading,
  error,
  pendingStatusUpdates,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onRefresh,
  loadingMore,
  hasMore,
  onLoadMore,
  emptyStateMessage,
  showEmptyStateFiltered,
}: TaskKanbanProps) {
  const columns = useMemo(
    () =>
      TASK_STATUSES.map((status) => ({
        status,
        label: formatStatusLabel(status),
        items: tasks.filter((task) => task.status === status),
      })),
    [tasks]
  )

  if (initialLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-md border bg-muted/30 p-4 space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
        <ListTodo className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No tasks found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {showEmptyStateFiltered
            ? 'No tasks match the current filters. Try adjusting your search or filters.'
            : emptyStateMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <Columns3 className="h-4 w-4" />
          <span>Kanban</span>
        </div>
        <span>{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>
      </div>

      <ScrollArea className="w-full">
        <div className="flex w-full gap-3 pb-2 pr-2">
          {columns.map((column) => (
            <div
              key={column.status}
              className="flex min-w-[260px] max-w-[320px] flex-1 flex-col rounded-md border bg-muted/20"
            >
              <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    {column.label}
                  </span>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: laneColor(column.status) }} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{column.items.length}</span>
              </div>
              <div className="space-y-3 p-3">
                {column.items.length === 0 ? (
                  <div className="rounded-md border border-dashed border-muted/60 bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                    No tasks in this lane
                  </div>
                ) : (
                  column.items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isPendingUpdate={pendingStatusUpdates.has(task.id)}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onQuickStatusChange={onQuickStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loadingMore || loading}>
            {loadingMore ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading…
              </span>
            ) : (
              'Load more tasks'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

function laneColor(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return '#6b7280'
    case 'in-progress':
      return '#2563eb'
    case 'review':
      return '#f59e0b'
    case 'completed':
      return '#10b981'
    default:
      return '#64748b'
  }
}
