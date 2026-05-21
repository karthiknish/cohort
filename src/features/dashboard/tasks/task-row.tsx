'use client'

import { memo, useCallback, type KeyboardEvent, type MouseEvent, ViewTransition } from 'react'
import {
  ArrowDown,
  ArrowUp,
  LoaderCircle,
  Minus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

import type { TaskRecord, TaskStatus, TaskPriority } from '@/types/tasks'
import { TASK_STATUSES } from '@/types/tasks'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { chromaticTransitionClass, listItemEnterClass } from '@/lib/motion'
import { cn } from '@/lib/utils'
import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  isDueSoon,
  isOverdue,
  STATUS_ICONS,
} from './task-types'
import { formatTaskKey, TASK_TABLE_GRID } from './task-table'

export type TaskRowProps = {
  task: TaskRecord
  isPendingUpdate?: boolean
  onOpen?: (task: TaskRecord) => void
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  selected?: boolean
  onSelectToggle?: (taskId: string, checked: boolean) => void
}

const statusPillClass: Record<TaskStatus, string> = {
  todo: 'bg-muted text-muted-foreground',
  'in-progress': 'bg-info/15 text-info',
  review: 'bg-warning/15 text-warning',
  completed: 'bg-success/15 text-success',
  archived: 'bg-muted/80 text-muted-foreground',
}

function PriorityIndicator({ priority }: { priority: TaskPriority }) {
  if (priority === 'urgent') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
        Highest
      </span>
    )
  }
  if (priority === 'high') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
        High
      </span>
    )
  }
  if (priority === 'low') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-info">
        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        Low
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="h-3.5 w-3.5" aria-hidden />
      {formatPriorityLabel(priority)}
    </span>
  )
}

function assigneeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]
  if (!first) return '?'
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const second = parts[1]
  return `${first[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase()
}

function TaskRowComponent({
  task,
  isPendingUpdate,
  onOpen,
  onEdit,
  onDelete,
  onQuickStatusChange,
  selected = false,
  onSelectToggle,
}: TaskRowProps) {
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)
  const assignee = (task.assignedTo ?? [])[0] ?? null

  const handleOpen = useCallback(() => {
    onOpen?.(task)
  }, [onOpen, task])

  const stopRowOpen = useCallback((event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation()
  }, [])

  const handleRowClick = useCallback(() => {
    handleOpen()
  }, [handleOpen])

  const handleRowKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleOpen()
      }
    },
    [handleOpen],
  )

  const handleEditClick = useCallback(() => {
    onEdit(task)
  }, [onEdit, task])

  const handleDeleteClick = useCallback(() => {
    onDelete(task)
  }, [onDelete, task])

  const handleSelectChange = useCallback(
    (checked: boolean) => {
      onSelectToggle?.(task.id, checked)
    },
    [onSelectToggle, task.id],
  )

  const dueLabel = task.dueDate ? formatDate(task.dueDate) : '—'

  return (
    <ViewTransition>
      <div
        role="row"
        tabIndex={onOpen ? 0 : undefined}
        onClick={onOpen ? handleRowClick : undefined}
        onKeyDown={onOpen ? handleRowKeyDown : undefined}
        aria-label={onOpen ? `View task ${task.title}` : undefined}
        className={cn(
          TASK_TABLE_GRID,
          'group px-4 py-2.5 text-sm hover:bg-muted/40',
          listItemEnterClass,
          chromaticTransitionClass,
          onOpen && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset',
          isPendingUpdate && 'pointer-events-none opacity-60',
          selected && 'bg-primary/4',
          task.status === 'completed' && 'opacity-90',
        )}
      >
        <div className="flex justify-center" role="cell" onClick={stopRowOpen} onKeyDown={stopRowOpen}>
          {onSelectToggle ? (
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelectChange}
              aria-label={`Select ${task.title}`}
              className="h-4 w-4 rounded border-border"
            />
          ) : (
            <span className="h-4 w-4" aria-hidden />
          )}
        </div>

        <span className="truncate font-mono text-xs text-muted-foreground" role="cell">
          {formatTaskKey(task.id)}
        </span>

        <div className="flex min-w-0 items-center gap-2" role="cell">
          <span
            className={cn(
              'truncate font-medium text-foreground',
              task.status === 'completed' && 'text-muted-foreground line-through decoration-border',
            )}
          >
            {task.title}
          </span>
          {isPendingUpdate ? (
            <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          ) : null}
        </div>

        <div role="cell">
          <span
            className={cn(
              'inline-flex max-w-full items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              statusPillClass[task.status],
            )}
          >
            {formatStatusLabel(task.status)}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-2" role="cell">
          {assignee ? (
            <>
              <Avatar className="h-6 w-6 shrink-0 border border-border/60">
                <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
                  {assigneeInitials(assignee)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-foreground">{assignee}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>

        <div
          role="cell"
          className={cn(
            'text-xs tabular-nums',
            overdue ? 'font-medium text-destructive' : dueSoon ? 'text-warning' : 'text-muted-foreground',
          )}
        >
          {dueLabel}
        </div>

        <div role="cell">
          <PriorityIndicator priority={task.priority} />
        </div>

        <div
          className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          role="cell"
          onClick={stopRowOpen}
          onKeyDown={stopRowOpen}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                aria-label={`Actions for ${task.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {TASK_STATUSES.filter((status) => status !== task.status).map((status) => (
                <TaskRowStatusMenuItem
                  key={status}
                  task={task}
                  status={status}
                  onQuickStatusChange={onQuickStatusChange}
                />
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditClick}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </ViewTransition>
  )
}

export const TaskRow = memo(TaskRowComponent)
TaskRow.displayName = 'TaskRow'

function TaskRowStatusMenuItem({
  task,
  status,
  onQuickStatusChange,
}: {
  task: TaskRecord
  status: TaskStatus
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
}) {
  const handleClick = useCallback(() => {
    onQuickStatusChange(task, status)
  }, [onQuickStatusChange, status, task])

  const NextStatusIcon = STATUS_ICONS[status]

  return (
    <DropdownMenuItem onClick={handleClick}>
      <NextStatusIcon className="mr-2 h-4 w-4" />
      {formatStatusLabel(status)}
    </DropdownMenuItem>
  )
}
