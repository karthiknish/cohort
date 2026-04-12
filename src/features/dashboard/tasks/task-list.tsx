'use client'
'use no memo'

import { useCallback, useState } from 'react'

import { ScrollArea } from '@/shared/ui/scroll-area'
import type { TaskRecord, TaskStatus } from '@/types/tasks'
import {
  TaskListEmptyState,
  TaskListErrorState,
  TaskListItems,
  TaskListLoadMore,
  TaskListLoadingState,
} from './task-list-sections'
import { TaskViewDialog } from './task-view-dialog'
import type { TaskParticipant } from './task-types'

const EMPTY_TASK_PARTICIPANTS: TaskParticipant[] = []

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
  onEmptyClearFilters?: () => void
  onEmptyCreateTask?: () => void
  selectedTaskIds?: Set<string>
  onToggleTaskSelection?: (taskId: string, checked: boolean) => void
  workspaceId?: string | null
  userId?: string | null
  userName?: string | null
  userRole?: string | null
  participants?: TaskParticipant[]
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
  onEmptyClearFilters,
  onEmptyCreateTask,
  selectedTaskIds,
  onToggleTaskSelection,
  workspaceId = null,
  userId = null,
  userName = null,
  userRole = null,
  participants = EMPTY_TASK_PARTICIPANTS,
}: TaskListProps) {
  'use no memo'

  const [viewingTask, setViewingTask] = useState<TaskRecord | null>(null)

  const openTask = useCallback((task: TaskRecord) => {
    setViewingTask(task)
  }, [])

  const handleTaskViewDialogOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setViewingTask(null)
    }
  }, [])

  return (
    <ScrollArea className="max-h-[min(72vh,680px)]">
      <div
        className={
          viewMode === 'grid'
            ? 'grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'divide-y divide-muted/30'
        }
      >
        {initialLoading ? <TaskListLoadingState viewMode={viewMode} /> : null}
        {!loading && error ? <TaskListErrorState error={error} loading={loading} onRefresh={onRefresh} viewMode={viewMode} /> : null}

        {!loading &&
          !error &&
          <TaskListItems
            onDelete={onDelete}
            onEdit={onEdit}
            onOpen={openTask}
            onQuickStatusChange={onQuickStatusChange}
            onSelectToggle={onToggleTaskSelection}
            pendingStatusUpdates={pendingStatusUpdates}
            selectedTaskIds={selectedTaskIds}
            tasks={tasks}
            viewMode={viewMode}
          />}

        {!loading && !error && tasks.length > 0 && hasMore ? (
          <TaskListLoadMore loadingMore={loadingMore} onLoadMore={onLoadMore} viewMode={viewMode} />
        ) : null}

        {!loading && !error && tasks.length === 0 ? (
          <TaskListEmptyState
            emptyStateMessage={emptyStateMessage}
            showEmptyStateFiltered={showEmptyStateFiltered}
            viewMode={viewMode}
            onClearFilters={onEmptyClearFilters}
            onCreateTask={onEmptyCreateTask}
          />
        ) : null}
      </div>

      <TaskViewDialog
        task={viewingTask}
        open={!!viewingTask}
        workspaceId={workspaceId}
        userId={userId}
        userName={userName}
        userRole={userRole}
        participants={participants}
        onOpenChange={handleTaskViewDialogOpenChange}
      />
    </ScrollArea>
  )
}
