'use client'

import Link from 'next/link'
import { memo, type ChangeEvent } from 'react'
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

export type TaskCardProps = {
  task: TaskRecord
  isPendingUpdate?: boolean
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  selected?: boolean
  onSelectToggle?: (taskId: string, checked: boolean) => void
}

function TaskCardComponent({
  task,
  isPendingUpdate,
  onEdit,
  onDelete,
  onQuickStatusChange,
  selected = false,
  onSelectToggle,
}: TaskCardProps) {
  const StatusIcon = STATUS_ICONS[task.status]

  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-md border border-muted/40 bg-background p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md',
        isPendingUpdate && 'opacity-75 pointer-events-none'
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Checkbox
              checked={selected}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onSelectToggle?.(task.id, event.target.checked)
              }
              aria-label="Select task"
            />
            <h3 className="font-semibold text-foreground line-clamp-2">{task.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge
                variant="secondary"
                className={cn(statusColors[task.status], 'cursor-pointer hover:opacity-80 gap-1')}
              >
                {isPendingUpdate ? (
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                ) : (
                  <StatusIcon className="h-3 w-3" />
                )}
                {formatStatusLabel(task.status)}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {TASK_STATUSES.filter((s) => s !== task.status).map((status) => (
                <DropdownMenuItem key={status} onClick={() => onQuickStatusChange(task, status)}>
                  {formatStatusLabel(status)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={priorityColors[task.priority]}>
            {formatPriorityLabel(task.priority)}
          </Badge>
          {task.client &&
            (task.clientId ? (
              <Link href={`/dashboard/clients?clientId=${task.clientId}`}>
                <Badge variant="outline" className="border-dashed hover:bg-muted cursor-pointer">
                  {task.client}
                </Badge>
              </Link>
            ) : (
              <Badge variant="outline" className="border-dashed">
                {task.client}
              </Badge>
            ))}
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3rem]">
            {task.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground pt-2">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">
              {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}</span>
          </div>
        </div>

        {(task.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(task.tags ?? []).slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 bg-muted text-muted-foreground"
              >
                #{tag}
              </Badge>
            ))}
            {(task.tags ?? []).length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{(task.tags ?? []).length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-muted/40">
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
  )
}

export const TaskCard = memo(TaskCardComponent)
TaskCard.displayName = 'TaskCard'
