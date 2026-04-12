'use client'

import { ListTodo, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
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
      <div className="mx-4 my-6 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-destructive" aria-hidden />
        <p className="mt-3 text-sm font-medium leading-relaxed text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-5 border-destructive/25"
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
  onClearFilters,
  onCreateTask,
}: {
  emptyStateMessage: string
  showEmptyStateFiltered: boolean
  viewMode: 'grid' | 'list'
  onClearFilters?: () => void
  onCreateTask?: () => void
}) {
  return (
    <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
      <div className="mx-4 my-6 rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border/60">
          <ListTodo className="h-7 w-7 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">No tasks found</h3>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          {showEmptyStateFiltered
            ? 'Nothing matches these filters. Clear them or try a different search.'
            : emptyStateMessage}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {showEmptyStateFiltered && onClearFilters ? (
            <Button type="button" variant="default" size="sm" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}
          {!showEmptyStateFiltered && onCreateTask ? (
            <Button type="button" size="sm" onClick={onCreateTask}>
              Create task
            </Button>
          ) : null}
        </div>
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