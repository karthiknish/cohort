"use client"

import { useMemo } from 'react'
import { TriangleAlert, Columns3, LoaderCircle, ListTodo, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskRecord, TaskStatus, TASK_STATUSES } from '@/types/tasks'
import { TaskCard } from './task-card'
import { formatStatusLabel, statusLaneColors } from './task-types'

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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border bg-muted/20 p-4 space-y-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <TriangleAlert className="mx-auto h-12 w-12 text-destructive/40" />
        <h3 className="mt-4 text-lg font-semibold text-destructive">Unable to load board</h3>
        <p className="mt-1 text-sm text-destructive/70">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 border-destructive/20 hover:bg-destructive/10"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-muted/60 bg-muted/5 p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/20">
          <ListTodo className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-foreground">No tasks here yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground/80">
          {showEmptyStateFiltered
            ? 'No tasks match the current filters. Try adjusting your search or clearing filters.'
            : emptyStateMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5 font-bold text-foreground tracking-tight">
          <Columns3 className="h-5 w-5 text-primary" />
          <span>Workflow Board</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-full">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="flex w-full gap-5 pb-6 pr-4 min-h-[600px]">
          {columns.map((column) => (
            <div
              key={column.status}
              className="group flex min-w-[280px] max-w-[350px] flex-1 flex-col rounded-2xl border bg-muted/10 transition-colors hover:bg-muted/15"
            >
              <div className="flex items-center justify-between gap-2 px-4 py-4.5 border-b border-muted/20">
                <div className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: statusLaneColors[column.status] }}
                  />
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                    {column.label}
                  </span>
                </div>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-muted/40 group-hover:bg-muted/60 transition-colors">
                  {column.items.length}
                </Badge>
              </div>
              <div className="flex-1 space-y-4 p-4">
                {column.items.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-muted/40 bg-background/40 p-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground/60 italic">Drop tasks here</p>
                  </div>
                ) : (
                  column.items.map((task) => (
                    <div key={task.id} className="transition-all duration-200 active:scale-[0.98]">
                      <TaskCard
                        task={task}
                        isPendingUpdate={pendingStatusUpdates.has(task.id)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onQuickStatusChange={onQuickStatusChange}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" className="h-10 px-6 rounded-xl hover:bg-muted/60 gap-2 font-medium" onClick={onLoadMore} disabled={loadingMore || loading}>
            {loadingMore ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
            ) : null}
            {loadingMore ? 'Loading more tasks…' : 'Load more tasks'}
          </Button>
        </div>
      )}
    </div>
  )
}
