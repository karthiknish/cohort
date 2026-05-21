'use client'

import { ListTodo, LoaderCircle, Plus, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import type { TaskRecord, TaskStatus } from '@/types/tasks'

import { TaskCard } from './task-card'
import { TaskDataTable } from './task-data-table'
import { TASKS_THEME } from './tasks-theme'

export function TaskListLoadingState({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <>
        {['task-skeleton-1', 'task-skeleton-2', 'task-skeleton-3', 'task-skeleton-4', 'task-skeleton-5', 'task-skeleton-6'].map(
          (skeletonKey) => (
            <Skeleton key={skeletonKey} className="h-44 w-full rounded-2xl" />
          ),
        )}
      </>
    )
  }

  return <TaskDataTable tasks={[]} loading onOpen={() => {}} onEdit={() => {}} onDelete={() => {}} onQuickStatusChange={() => {}} pendingStatusUpdates={new Set()} />
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
      <div className="mx-4 my-8 px-4 text-center">
        <TriangleAlert className="mx-auto h-8 w-8 text-destructive" aria-hidden />
        <p className="mt-2 text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4 h-8" onClick={onRefresh} disabled={loading}>
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
    <div className={viewMode === 'grid' ? 'col-span-full p-4' : 'p-4'}>
      <div className={TASKS_THEME.emptyPanel}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
          <ListTodo className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-base font-semibold tracking-tight text-foreground">No tasks here yet</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {showEmptyStateFiltered
            ? 'Nothing matches your filters. Try clearing search or status filters.'
            : emptyStateMessage}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {showEmptyStateFiltered && onClearFilters ? (
            <Button type="button" variant="outline" size="sm" className="h-9" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}
          {!showEmptyStateFiltered && onCreateTask ? (
            <Button type="button" size="sm" className="h-9 gap-1.5" onClick={onCreateTask}>
              <Plus className="h-4 w-4" aria-hidden />
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
    <div className={viewMode === 'grid' ? 'col-span-full border-t border-border/80 px-4 py-3' : 'border-t border-border/80 px-4 py-3'}>
      <Button variant="ghost" size="sm" className="h-8 w-full text-muted-foreground" onClick={onLoadMore} disabled={loadingMore}>
        {loadingMore ? (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading…
          </span>
        ) : (
          'Load more'
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
  if (viewMode === 'grid') {
    return (
      <>
        {tasks.map((task) => (
          <div key={task.id} className="h-full">
            <TaskCard
              task={task}
              variant="grid"
              isPendingUpdate={pendingStatusUpdates.has(task.id)}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
              onQuickStatusChange={onQuickStatusChange}
              selected={selectedTaskIds?.has(task.id)}
              onSelectToggle={onSelectToggle}
            />
          </div>
        ))}
      </>
    )
  }

  return (
    <TaskDataTable
      tasks={tasks}
      pendingStatusUpdates={pendingStatusUpdates}
      onOpen={onOpen}
      onEdit={onEdit}
      onDelete={onDelete}
      onQuickStatusChange={onQuickStatusChange}
      selectedTaskIds={selectedTaskIds}
      onSelectToggle={onSelectToggle}
    />
  )
}
