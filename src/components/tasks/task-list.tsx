'use client'

import { AlertTriangle, Loader2, RefreshCw, ListTodo } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskRecord, TaskStatus } from '@/types/tasks'
import { TaskCard } from './task-card'
import { TaskRow } from './task-row'

export type TaskListProps = {
  tasks: TaskRecord[]
  viewMode: 'grid' | 'list'
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

export function TaskList({
  tasks,
  viewMode,
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
}: TaskListProps) {
  return (
    <ScrollArea className="max-h-[520px]">
      <div
        className={
          viewMode === 'grid'
            ? 'grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'divide-y divide-muted/30'
        }
      >
        {/* Loading skeleton */}
        {initialLoading && (
          <div
            className={viewMode === 'grid' ? 'col-span-full space-y-6 px-6 py-6' : 'space-y-6 px-6 py-6'}
          >
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center mx-4 my-4">
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive/60" />
              <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Task items */}
        {!loading &&
          !error &&
          tasks.map((task) =>
            viewMode === 'grid' ? (
              <TaskCard
                key={task.id}
                task={task}
                isPendingUpdate={pendingStatusUpdates.has(task.id)}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuickStatusChange={onQuickStatusChange}
              />
            ) : (
              <TaskRow
                key={task.id}
                task={task}
                isPendingUpdate={pendingStatusUpdates.has(task.id)}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuickStatusChange={onQuickStatusChange}
              />
            )
          )}

        {/* Load more */}
        {!loading && !error && tasks.length > 0 && hasMore && (
          <div
            className={
              viewMode === 'grid' ? 'col-span-full px-6 py-4 text-center' : 'px-6 py-4 text-center'
            }
          >
            <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </span>
              ) : (
                'Load more tasks'
              )}
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tasks.length === 0 && (
          <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
            <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center mx-4 my-4">
              <ListTodo className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No tasks found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {showEmptyStateFiltered
                  ? 'No tasks match the current filters. Try adjusting your search or filters.'
                  : emptyStateMessage}
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
