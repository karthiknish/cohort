"use client"

import { useCallback, useMemo, useState } from 'react'
import { Calendar, ChevronsDownUp, ChevronsUpDown, Columns3, Eye, GripVertical, ListTodo, LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
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

const EMPTY_SELECTED_TASK_IDS = new Set<string>()
const EMPTY_TASK_PARTICIPANTS: TaskParticipant[] = []

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
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null)
  const [collapsedTaskIds, setCollapsedTaskIds] = useState<Set<string>>(new Set())
  const [viewingTask, setViewingTask] = useState<TaskRecord | null>(null)

  const toggleCollapsed = useCallback((taskId: string) => {
    setCollapsedTaskIds((current) => {
      const next = new Set(current)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }, [])

  const columns = useMemo(
    () =>
      TASK_STATUSES.filter(s => s !== 'archived').map((status) => ({
        status,
        label: formatStatusLabel(status),
        items: tasks.filter((task) => task.status === status),
      })),
    [tasks]
  )

  const handleDragStart = useCallback((e: React.DragEvent, task: TaskRecord) => {
    if (bulkActive) return // Disable drag during bulk operations
    setDraggedTask({ id: task.id, sourceStatus: task.status })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }, [bulkActive])

  const handleDragOver = useCallback((e: React.DragEvent, status: TaskStatus) => {
    if (bulkActive) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStatus(status)
  }, [bulkActive])

  const handleDragLeave = useCallback(() => {
    setDragOverStatus(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: TaskStatus) => {
      e.preventDefault()
      setDragOverStatus(null)

      if (!draggedTask || bulkActive) return

      const task = tasks.find((t) => t.id === draggedTask.id)
      if (task && draggedTask.sourceStatus !== targetStatus) {
        onQuickStatusChange(task, targetStatus)
      }

      setDraggedTask(null)
    },
    [draggedTask, tasks, onQuickStatusChange, bulkActive]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null)
    setDragOverStatus(null)
  }, [])

  if (initialLoading) {
    const columnSkeletonKeys = ['todo', 'in-progress', 'review', 'completed'] as const

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columnSkeletonKeys.map((columnKey) => (
          <div key={columnKey} className="space-y-4 rounded-xl border border-slate-200 bg-slate-100/60 p-4">
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
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <ListTodo className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900">No tasks here yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">
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
        <div>
          <div className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
            <Columns3 className="h-5 w-5 text-primary" />
            <span>Workflow Board</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Drag tasks between columns to update status.
          </p>
        </div>
        <div className={cn('rounded-full border px-3 py-1 text-sm font-semibold', taskPillColors.count)}>
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </div>
      </div>

      <ScrollArea className="w-full">
        <div className="flex w-full gap-5 pb-6 pr-4 min-h-[600px]">
          {columns.map((column) => {
            const isDragTarget = dragOverStatus === column.status
            const isDraggingFrom = draggedTask?.sourceStatus === column.status

            return (
              <div
                key={column.status}
                role="listbox"
                tabIndex={bulkActive ? -1 : 0}
                aria-label={`${column.label} task lane`}
                className={cn(
                  'group flex min-w-[292px] max-w-[360px] flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 shadow-sm transition-colors',
                  !bulkActive && 'hover:border-slate-300/90 hover:bg-slate-50/85',
                  isDragTarget && 'border-primary/30 bg-primary/10',
                  isDraggingFrom && "opacity-50"
                )}
                onDragOver={(e) => handleDragOver(e, column.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 bg-white/80 px-4 py-4.5 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full shadow-sm ${statusLaneColors[column.status]}`}
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {column.label}
                    </span>
                  </div>
                  <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.count)}>
                    {column.items.length}
                  </Badge>
                </div>
                <div className="flex-1 space-y-4 p-4">
                  {column.items.length === 0 ? (
                    <div className={cn(
                      'flex h-32 flex-col items-center justify-center rounded-[1.15rem] border border-dashed border-slate-200/80 bg-white/70 p-4 text-center transition-colors',
                      isDragTarget && "border-primary/40 bg-primary/5"
                    )}>
                      {draggedTask ? (
                        <>
                          <GripVertical className="mb-1 h-5 w-5 text-slate-400" />
                          <p className="text-xs font-medium text-slate-500">Drop to move</p>
                        </>
                      ) : (
                        <p className="text-xs font-medium italic text-slate-500">Drop tasks here</p>
                      )}
                    </div>
                  ) : (
                    column.items.map((task) => {
                      const isCollapsed = collapsedTaskIds.has(task.id)

                      return (
                      <div
                        key={task.id}
                        role="option"
                        tabIndex={bulkActive || pendingStatusUpdates.has(task.id) ? -1 : 0}
                        aria-selected={selectedTaskIds.has(task.id)}
                        aria-label={task.title}
                        draggable={!bulkActive && !pendingStatusUpdates.has(task.id)}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none active:scale-[0.98]",
                          !bulkActive && !pendingStatusUpdates.has(task.id) && "cursor-grab active:cursor-grabbing",
                          (bulkActive || pendingStatusUpdates.has(task.id)) && "cursor-default"
                        )}
                      >
                        {isCollapsed ? (
                          <button
                            type="button"
                            onClick={() => toggleCollapsed(task.id)}
                            className={cn(
                              'flex w-full flex-col gap-3 rounded-[1.35rem] border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/70 p-4 text-left shadow-sm transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
                              pendingStatusUpdates.has(task.id) && 'pointer-events-none opacity-75'
                            )}
                            aria-label={`Expand task ${task.title}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="line-clamp-2 text-base font-bold leading-tight text-slate-900">{task.title}</h3>
                              <ChevronsUpDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            </div>
                            <div className={cn('inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold', taskPillColors.neutral)}>
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(task.dueDate)}</span>
                            </div>
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <TaskCard
                              task={task}
                              isPendingUpdate={pendingStatusUpdates.has(task.id)}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onQuickStatusChange={onQuickStatusChange}
                              onClone={onClone}
                              onShare={onShare}
                              selected={selectedTaskIds.has(task.id)}
                              onSelectToggle={onToggleTaskSelection}
                              searchQuery={searchQuery}
                            />
                            <div className="flex items-center justify-between gap-2 px-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-xl"
                                onClick={() => setViewingTask(task)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View task
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 rounded-xl text-slate-600 hover:text-slate-900"
                                onClick={() => toggleCollapsed(task.id)}
                              >
                                <ChevronsDownUp className="mr-2 h-4 w-4" />
                                Collapse
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )})
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" className="h-10 gap-2 rounded-xl px-6 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900" onClick={onLoadMore} disabled={loadingMore || loading}>
            {loadingMore ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
            ) : null}
            {loadingMore ? 'Loading more tasks…' : 'Load more tasks'}
          </Button>
        </div>
      )}

      <TaskViewDialog
        task={viewingTask}
        open={!!viewingTask}
        workspaceId={workspaceId}
        userId={userId}
        userName={userName}
        userRole={userRole}
        participants={participants}
        onOpenChange={(open) => {
          if (!open) setViewingTask(null)
        }}
      />
    </div>
  )
}
