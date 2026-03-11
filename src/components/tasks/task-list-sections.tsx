'use client'

import { ListTodo, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TaskRecord, TaskStatus } from '@/types/tasks'

import { TaskCard } from './task-card'
import { TaskRow } from './task-row'

export function TaskListLoadingState({ viewMode }: { viewMode: 'grid' | 'list' }) {
  return (
    <div className={viewMode === 'grid' ? 'col-span-full space-y-6 px-6 py-6' : 'space-y-6 px-6 py-6'}>
      {['task-skeleton-1', 'task-skeleton-2', 'task-skeleton-3', 'task-skeleton-4'].map((skeletonKey) => (
        <div key={skeletonKey} className="space-y-3">
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
  )
}

export function TaskListErrorState({
  error,
  loading,
  onRefresh,
  viewMode,
}: {
  error: string
  loading: boolean
  onRefresh: () => void
  viewMode: 'grid' | 'list'
}) {
  return (
    <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
      <div className="mx-4 my-4 rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Try again
        </Button>
      </div>
    </div>
  )
}

export function TaskListEmptyState({
  emptyStateMessage,
  showEmptyStateFiltered,
  viewMode,
}: {
  emptyStateMessage: string
  showEmptyStateFiltered: boolean
  viewMode: 'grid' | 'list'
}) {
  return (
    <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
      <div className="mx-4 my-4 rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
        <ListTodo className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No tasks found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {showEmptyStateFiltered
            ? 'No tasks match the current filters. Try adjusting your search or filters.'
            : emptyStateMessage}
        </p>
      </div>
    </div>
  )
}

export function TaskListLoadMore({
  loadingMore,
  onLoadMore,
  viewMode,
}: {
  loadingMore: boolean
  onLoadMore: () => void
  viewMode: 'grid' | 'list'
}) {
  return (
    <div className={viewMode === 'grid' ? 'col-span-full px-6 py-4 text-center' : 'px-6 py-4 text-center'}>
      <Button variant="outline" onClick={onLoadMore} disabled={loadingMore}>
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
  )
}

export function TaskListItems({
  onDelete,
  onEdit,
  onOpen,
  onQuickStatusChange,
  onSelectToggle,
  pendingStatusUpdates,
  selectedTaskIds,
  tasks,
  viewMode,
}: {
  onDelete: (task: TaskRecord) => void
  onEdit: (task: TaskRecord) => void
  onOpen: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onSelectToggle?: (taskId: string, checked: boolean) => void
  pendingStatusUpdates: Set<string>
  selectedTaskIds?: Set<string>
  tasks: TaskRecord[]
  viewMode: 'grid' | 'list'
}) {
  return (
    <>
      {tasks.map((task) =>
        viewMode === 'grid' ? (
          <div key={task.id} className="h-full rounded-[1.35rem]">
            <TaskCard
              task={task}
              isPendingUpdate={pendingStatusUpdates.has(task.id)}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
              onQuickStatusChange={onQuickStatusChange}
              selected={selectedTaskIds?.has(task.id)}
              onSelectToggle={onSelectToggle}
            />
          </div>
        ) : (
          <div key={task.id}>
            <TaskRow
              task={task}
              isPendingUpdate={pendingStatusUpdates.has(task.id)}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
              onQuickStatusChange={onQuickStatusChange}
              selected={selectedTaskIds?.has(task.id)}
              onSelectToggle={onSelectToggle}
            />
          </div>
        )
      )}
    </>
  )
}