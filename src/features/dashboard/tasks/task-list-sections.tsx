'use client'

import { ListTodo, LoaderCircle, Plus, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import type { TaskRecord, TaskStatus } from '@/types/tasks'

import { TaskCard } from './task-card'
import { TaskRow } from './task-row'
import { TaskTable, TaskTableBody, TaskTableHeader } from './task-table'

export function TaskListLoadingState({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <>
        {['task-skeleton-1', 'task-skeleton-2', 'task-skeleton-3', 'task-skeleton-4', 'task-skeleton-5', 'task-skeleton-6'].map(
          (skeletonKey) => (
            <Skeleton key={skeletonKey} className="h-44 w-full rounded-[1.25rem]" />
          ),
        )}
      </>
    )
  }

  return (
    <TaskTable>
      <TaskTableHeader showCheckbox={false} />
      <TaskTableBody>
        {['row-1', 'row-2', 'row-3', 'row-4', 'row-5'].map((key) => (
          <div key={key} className="px-4 py-3">
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </TaskTableBody>
    </TaskTable>
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
    <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <ListTodo className="h-10 w-10 text-muted-foreground/60" aria-hidden />
        <p className="mt-3 text-sm font-medium text-foreground">No tasks</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {showEmptyStateFiltered
            ? 'Nothing matches your filters.'
            : emptyStateMessage}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {showEmptyStateFiltered && onClearFilters ? (
            <Button type="button" variant="outline" size="sm" className="h-8" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}
          {!showEmptyStateFiltered && onCreateTask ? (
            <Button type="button" size="sm" className="h-8 gap-1.5" onClick={onCreateTask}>
              <Plus className="h-4 w-4" aria-hidden />
              Add item
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
    <TaskTable>
      <TaskTableHeader showCheckbox={Boolean(onSelectToggle)} />
      <TaskTableBody>
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isPendingUpdate={pendingStatusUpdates.has(task.id)}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
            onQuickStatusChange={onQuickStatusChange}
            selected={selectedTaskIds?.has(task.id)}
            onSelectToggle={onSelectToggle}
          />
        ))}
      </TaskTableBody>
    </TaskTable>
  )
}
