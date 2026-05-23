"use client"

import { useCallback, useId, useMemo, useReducer } from 'react'
import { GripVertical, ListTodo, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { LiveRegion } from '@/shared/ui/live-region'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/lib/utils'
import type { TaskRecord, TaskStatus } from '@/types/tasks'
import { TASK_STATUSES } from '@/types/tasks'
import { TaskCard } from './task-card'
import { TaskViewDialog } from './task-view-dialog'
import { formatDate, formatStatusLabel, statusLaneColors, taskPillColors, type TaskParticipant } from './task-types'

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
  onEmptyClearFilters?: () => void
  onEmptyCreateTask?: () => void
  onClone?: (task: TaskRecord) => void
  onShare?: (task: TaskRecord) => void
  searchQuery?: string
  selectedTaskIds?: Set<string>
  onToggleTaskSelection?: (taskId: string, checked: boolean) => void
  bulkActive?: boolean
  workspaceId?: string | null
  userId?: string | null
  userName?: string | null
  userRole?: string | null
  participants?: TaskParticipant[]
}

type DraggedTask = {
  id: string
  sourceStatus: TaskStatus
}

type TaskKanbanState = {
  draggedTask: DraggedTask | null
  dragOverStatus: TaskStatus | null
  viewingTask: TaskRecord | null
  boardAnnouncement: string
}

type TaskKanbanAction =
  | { type: 'startDrag'; draggedTask: DraggedTask }
  | { type: 'setDragOverStatus'; status: TaskStatus | null }
  | { type: 'resetDragState' }
  | { type: 'setBoardAnnouncement'; message: string }
  | { type: 'setViewingTask'; task: TaskRecord | null }

const INITIAL_TASK_KANBAN_STATE: TaskKanbanState = {
  draggedTask: null,
  dragOverStatus: null,
  viewingTask: null,
  boardAnnouncement: '',
}

function taskKanbanReducer(state: TaskKanbanState, action: TaskKanbanAction): TaskKanbanState {
  switch (action.type) {
    case 'startDrag':
      return {
        ...state,
        draggedTask: action.draggedTask,
      }
    case 'setDragOverStatus':
      return {
        ...state,
        dragOverStatus: action.status,
      }
    case 'resetDragState':
      return {
        ...state,
        draggedTask: null,
        dragOverStatus: null,
      }
    case 'setBoardAnnouncement':
      return {
        ...state,
        boardAnnouncement: action.message,
      }
    case 'setViewingTask':
      return {
        ...state,
        viewingTask: action.task,
      }
    default:
      return state
  }
}

const EMPTY_SELECTED_TASK_IDS = new Set<string>()
const EMPTY_TASK_PARTICIPANTS: TaskParticipant[] = []
const KANBAN_STATUSES = TASK_STATUSES.filter((status): status is TaskStatus => status !== 'archived')

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
  onEmptyClearFilters,
  onEmptyCreateTask,
  onClone,
  onShare,
  searchQuery = '',
  selectedTaskIds = EMPTY_SELECTED_TASK_IDS,
  onToggleTaskSelection,
  bulkActive = false,
  workspaceId = null,
  userId = null,
  userName = null,
  userRole = null,
  participants = EMPTY_TASK_PARTICIPANTS,
}: TaskKanbanProps) {
  const [{ draggedTask, dragOverStatus, viewingTask, boardAnnouncement }, dispatch] = useReducer(
    taskKanbanReducer,
    INITIAL_TASK_KANBAN_STATE,
  )
  const keyboardInstructionsId = useId()

  const columns = useMemo(
    () =>
      KANBAN_STATUSES.map((status) => ({
        status,
        label: formatStatusLabel(status),
        items: tasks.filter((task) => task.status === status),
      })),
    [tasks]
  )

  const handleDragStart = useCallback((e: React.DragEvent, task: TaskRecord) => {
    if (bulkActive) return // Disable drag during bulk operations
    dispatch({
      type: 'startDrag',
      draggedTask: { id: task.id, sourceStatus: task.status },
    })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }, [bulkActive])

  const handleDragOver = useCallback((e: React.DragEvent, status: TaskStatus) => {
    if (bulkActive) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    dispatch({ type: 'setDragOverStatus', status })
  }, [bulkActive])

  const handleDragLeave = useCallback(() => {
    dispatch({ type: 'setDragOverStatus', status: null })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault()
      dispatch({ type: 'setDragOverStatus', status: null })

      if (!draggedTask || bulkActive) return

      const task = tasks.find((t) => t.id === draggedTask.id)
      if (task && draggedTask.sourceStatus !== targetStatus) {
        dispatch({
          type: 'setBoardAnnouncement',
          message: `${task.title} moved to ${formatStatusLabel(targetStatus)}.`,
        })
        onQuickStatusChange(task, targetStatus)
      }

      dispatch({ type: 'resetDragState' })
    },
    [draggedTask, tasks, onQuickStatusChange, bulkActive]
  )

  const handleKeyboardMoveTask = useCallback(
    (task: TaskRecord, direction: 'previous' | 'next') => {
      if (bulkActive || pendingStatusUpdates.has(task.id)) {
        return
      }

      const currentIndex = KANBAN_STATUSES.indexOf(task.status)
      const targetStatus = direction === 'previous'
        ? KANBAN_STATUSES[currentIndex - 1]
        : KANBAN_STATUSES[currentIndex + 1]

      if (!targetStatus) {
        dispatch({
          type: 'setBoardAnnouncement',
          message: `${task.title} is already in the ${formatStatusLabel(task.status)} column.`,
        })
        return
      }

      dispatch({
        type: 'setBoardAnnouncement',
        message: `${task.title} moved to ${formatStatusLabel(targetStatus)}.`,
      })
      onQuickStatusChange(task, targetStatus)
    },
    [bulkActive, onQuickStatusChange, pendingStatusUpdates]
  )

  const handleDragEnd = useCallback(() => {
    dispatch({ type: 'resetDragState' })
  }, [])

  const handleViewTask = useCallback((task: TaskRecord) => {
    dispatch({ type: 'setViewingTask', task })
  }, [])

  const handleViewingTaskDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      dispatch({ type: 'setViewingTask', task: null })
    }
  }, [])

  if (initialLoading) {
    const columnSkeletonKeys = ['todo', 'in-progress', 'review', 'completed'] as const

    return (
      <div className="flex gap-4 overflow-hidden px-4 pb-4">
        {columnSkeletonKeys.map((columnKey) => (
          <div
            key={columnKey}
            className="flex min-h-[min(68vh,560px)] w-[280px] shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-muted/15 p-3"
          >
            <Skeleton className="mb-3 h-8 w-full rounded-lg" />
            <Skeleton className="mb-3 h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <TriangleAlert className="mx-auto size-12 text-destructive" />
        <h3 className="mt-4 text-lg font-semibold text-destructive">Unable to load board</h3>
        <p className="mt-1 text-sm text-destructive/80">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-6 border-destructive/20 hover:bg-destructive/10"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 size-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-border/60">
          <ListTodo className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">No tasks on the board</h3>
        <p className="mx-auto mt-2 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
          {showEmptyStateFiltered
            ? 'Nothing matches these filters. Clear them or switch to list view for bulk actions.'
            : emptyStateMessage}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {showEmptyStateFiltered && onEmptyClearFilters ? (
            <Button type="button" size="sm" onClick={onEmptyClearFilters}>
              Clear filters
            </Button>
          ) : null}
          {!showEmptyStateFiltered && onEmptyCreateTask ? (
            <Button type="button" size="sm" onClick={onEmptyCreateTask}>
              Create task
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 px-4 pb-4 pt-2">
      <LiveRegion message={boardAnnouncement} />
      <p id={keyboardInstructionsId} className="sr-only">
        Use Alt plus Left Arrow or Alt plus Right Arrow on a focused task card to move it between workflow columns. You can also drag and drop tasks with a pointer.
      </p>
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs text-muted-foreground">
          Drag tasks between columns to update status. Click a card to open details.
        </p>
        <div className={cn('shrink-0 rounded-full border px-3 py-1 text-xs font-semibold tabular-nums', taskPillColors.count)}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="flex w-full gap-4 pb-4 pr-2 min-h-[min(72vh,640px)]">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              bulkActive={bulkActive}
              column={column}
              dragOverStatus={dragOverStatus}
              draggedTask={draggedTask}
              handleDragEnd={handleDragEnd}
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleDragStart={handleDragStart}
              keyboardInstructionsId={keyboardInstructionsId}
              onKeyboardMoveTask={handleKeyboardMoveTask}
              handleViewTask={handleViewTask}
              onClone={onClone}
              onDelete={onDelete}
              onEdit={onEdit}
              onQuickStatusChange={onQuickStatusChange}
              onShare={onShare}
              onToggleTaskSelection={onToggleTaskSelection}
              pendingStatusUpdates={pendingStatusUpdates}
              searchQuery={searchQuery}
              selectedTaskIds={selectedTaskIds}
            />
          ))}
        </div>
      </ScrollArea>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            className="h-10 gap-2 rounded-xl px-6 font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            onClick={onLoadMore}
            disabled={loadingMore || loading}
          >
            {loadingMore ? <LoaderCircle className="size-4 animate-spin text-primary" /> : null}
            {loadingMore ? 'Loading more tasks…' : 'Load more tasks'}
          </Button>
        </div>
      ) : null}

      <TaskViewDialog
        task={viewingTask}
        open={!!viewingTask}
        workspaceId={workspaceId}
        userId={userId}
        userName={userName}
        userRole={userRole}
        participants={participants}
        onEdit={onEdit}
        onDelete={onDelete}
        onQuickStatusChange={onQuickStatusChange}
        onOpenChange={handleViewingTaskDialogOpenChange}
      />
    </div>
  )
}

function KanbanColumn({
  bulkActive,
  column,
  dragOverStatus,
  draggedTask,
  handleDragEnd,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleDragStart,
  keyboardInstructionsId,
  onKeyboardMoveTask,
  handleViewTask,
  onClone,
  onDelete,
  onEdit,
  onQuickStatusChange,
  onShare,
  onToggleTaskSelection,
  pendingStatusUpdates,
  searchQuery,
  selectedTaskIds,
}: {
  bulkActive: boolean
  column: { status: TaskStatus; label: string; items: TaskRecord[] }
  dragOverStatus: TaskStatus | null
  draggedTask: DraggedTask | null
  handleDragEnd: () => void
  handleDragLeave: () => void
  handleDragOver: (e: React.DragEvent, status: TaskStatus) => void
  handleDrop: (e: React.DragEvent, targetStatus: TaskStatus) => void
  handleDragStart: (e: React.DragEvent, task: TaskRecord) => void
  keyboardInstructionsId: string
  onKeyboardMoveTask: (task: TaskRecord, direction: 'previous' | 'next') => void
  handleViewTask: (task: TaskRecord) => void
  onClone?: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onEdit: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onShare?: (task: TaskRecord) => void
  onToggleTaskSelection?: (taskId: string, checked: boolean) => void
  pendingStatusUpdates: Set<string>
  searchQuery: string
  selectedTaskIds: Set<string>
}) {
  const isDragTarget = dragOverStatus === column.status
  const isDraggingFrom = draggedTask?.sourceStatus === column.status

  const handleColumnDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => handleDragOver(event, column.status),
    [column.status, handleDragOver],
  )

  const handleColumnDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => handleDrop(event, column.status),
    [column.status, handleDrop],
  )

  return (
    <section
      aria-label={`${column.label} task lane`}
      className={cn(
        'flex min-h-[min(68vh,560px)] w-[min(100%,280px)] shrink-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-muted/15 shadow-sm transition-colors sm:w-[280px]',
        isDragTarget && 'border-primary/30 bg-primary/5 ring-1 ring-primary/15',
        isDraggingFrom && !isDragTarget && 'opacity-60',
      )}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleColumnDrop}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-card/80 px-3.5 py-3 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2">
          <div className={cn('size-2 shrink-0 rounded-full', statusLaneColors[column.status])} aria-hidden />
          <span className="truncate text-sm font-semibold text-foreground">{column.label}</span>
        </div>
        <Badge variant="secondary" className="h-6 shrink-0 rounded-full px-2 text-[11px] tabular-nums">
          {column.items.length}
        </Badge>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <ul className="list-none space-y-3 p-3">
          {column.items.length === 0 ? (
            <li
              className={cn(
                'list-none flex min-h-[7.5rem] flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-card/60 p-4 text-center transition-colors',
                isDragTarget && 'border-primary/35 bg-primary/5',
              )}
            >
              {draggedTask ? (
                <>
                  <GripVertical className="mb-1.5 size-5 text-muted-foreground" aria-hidden />
                  <p className="text-xs font-medium text-muted-foreground">Drop to move here</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No tasks in this column</p>
              )}
            </li>
          ) : (
            column.items.map((task) => (
              <KanbanTaskItem
                key={task.id}
                bulkActive={bulkActive}
                handleDragEnd={handleDragEnd}
                handleDragStart={handleDragStart}
                handleViewTask={handleViewTask}
                isDragging={draggedTask?.id === task.id}
                keyboardInstructionsId={keyboardInstructionsId}
                onClone={onClone}
                onDelete={onDelete}
                onEdit={onEdit}
                onKeyboardMoveTask={onKeyboardMoveTask}
                onQuickStatusChange={onQuickStatusChange}
                onShare={onShare}
                onToggleTaskSelection={onToggleTaskSelection}
                pending={pendingStatusUpdates.has(task.id)}
                searchQuery={searchQuery}
                selected={selectedTaskIds.has(task.id)}
                task={task}
              />
            ))
          )}
        </ul>
      </ScrollArea>
    </section>
  )
}

function KanbanTaskItem({
  bulkActive,
  handleDragEnd,
  handleDragStart,
  handleViewTask,
  isDragging,
  keyboardInstructionsId,
  onClone,
  onDelete,
  onEdit,
  onKeyboardMoveTask,
  onQuickStatusChange,
  onShare,
  onToggleTaskSelection,
  pending,
  searchQuery,
  selected,
  task,
}: {
  bulkActive: boolean
  handleDragEnd: () => void
  handleDragStart: (e: React.DragEvent, task: TaskRecord) => void
  handleViewTask: (task: TaskRecord) => void
  isDragging: boolean
  keyboardInstructionsId: string
  onClone?: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onEdit: (task: TaskRecord) => void
  onKeyboardMoveTask: (task: TaskRecord, direction: 'previous' | 'next') => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onShare?: (task: TaskRecord) => void
  onToggleTaskSelection?: (taskId: string, checked: boolean) => void
  pending: boolean
  searchQuery: string
  selected: boolean
  task: TaskRecord
}) {
  const onGripDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>) => {
      handleDragStart(event, task)
    },
    [handleDragStart, task],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!event.altKey) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onKeyboardMoveTask(task, 'previous')
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onKeyboardMoveTask(task, 'next')
      }
    },
    [onKeyboardMoveTask, task]
  )

  const reorderEnabled = !bulkActive && !pending

  return (
    <li
      className={cn('list-none rounded-xl transition-opacity', isDragging && 'opacity-40')}
    >
      {reorderEnabled ? (
        <button
          type="button"
          className="sr-only"
          aria-label={`Reorder ${task.title}`}
          aria-describedby={keyboardInstructionsId}
          aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
          aria-grabbed={isDragging}
          draggable
          onDragStart={onGripDragStart}
          onDragEnd={handleDragEnd}
          onKeyDown={handleKeyDown}
        />
      ) : null}
      <TaskCard
        task={task}
        variant="board"
        isPendingUpdate={pending}
        onOpen={handleViewTask}
        onEdit={onEdit}
        onDelete={onDelete}
        onQuickStatusChange={onQuickStatusChange}
        onClone={onClone}
        onShare={onShare}
        selected={selected}
        onSelectToggle={onToggleTaskSelection}
        searchQuery={searchQuery}
      />
    </li>
  )
}
