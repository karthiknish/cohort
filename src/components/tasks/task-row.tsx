'use client'

import Link from 'next/link'
import type { ChangeEvent } from 'react'
import { Calendar, User, MoreHorizontal, LoaderCircle, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { TaskRecord, TaskStatus, TASK_STATUSES } from '@/types/tasks'
import {
  statusColors,
  priorityColors,
  STATUS_ICONS,
  formatDate,
  formatStatusLabel,
  formatPriorityLabel,
} from './task-types'

export type TaskRowProps = {
  task: TaskRecord
  isPendingUpdate?: boolean
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  selected?: boolean
  onSelectToggle?: (taskId: string, checked: boolean) => void
}

export function TaskRow({
  task,
  isPendingUpdate,
  onEdit,
  onDelete,
  onQuickStatusChange,
  selected = false,
  onSelectToggle,
}: TaskRowProps) {
  const StatusIcon = STATUS_ICONS[task.status]

  return (
    <div
      className={cn(
        'px-6 py-4 transition hover:bg-muted/40',
        isPendingUpdate && 'opacity-75 pointer-events-none'
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Checkbox
              checked={selected}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onSelectToggle?.(task.id, event.target.checked)
              }
              aria-label="Select task"
            />
            <p className="text-sm font-semibold text-foreground truncate max-w-[260px] sm:max-w-[360px]">
              {task.title}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="secondary"
                  className={cn(
                    statusColors[task.status],
                    'cursor-pointer hover:opacity-80 gap-1'
                  )}
                >
                  {isPendingUpdate ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  {formatStatusLabel(task.status)}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {TASK_STATUSES.filter((s) => s !== task.status).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onQuickStatusChange(task, status)}
                  >
                    {formatStatusLabel(status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Badge variant="outline" className={priorityColors[task.priority]}>
              {formatPriorityLabel(task.priority)}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
            </span>
            {task.clientId ? (
              <Link href={`/dashboard/clients?clientId=${task.clientId}`}>
                <Badge
                  variant="outline"
                  className="border border-dashed hover:bg-muted cursor-pointer"
                >
                  {task.client ?? 'Internal'}
                </Badge>
              </Link>
            ) : (
              <Badge variant="outline" className="border border-dashed">
                {task.client ?? 'Internal'}
              </Badge>
            )}
          </div>
          {(task.tags ?? []).length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {(task.tags ?? []).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Task actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
