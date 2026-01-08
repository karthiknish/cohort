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
        'group relative flex flex-col justify-between rounded-xl border border-muted/40 bg-background p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:hover:bg-muted/10',
        isPendingUpdate && 'opacity-75 pointer-events-none'
      )}
    >
      {/* Priority accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity group-hover:opacity-100",
          task.priority === 'urgent' ? 'bg-red-500' :
            task.priority === 'high' ? 'bg-orange-500' :
              task.priority === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'
        )}
      />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-1 flex-shrink-0">
              <Checkbox
                checked={selected}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onSelectToggle?.(task.id, event.target.checked)
                }
                aria-label="Select task"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {task.title}
              </h3>
              {task.client && (
                <div className="flex items-center gap-1.5">
                  {task.clientId ? (
                    <Link href={`/dashboard/clients?clientId=${task.clientId}`} className="text-[11px] font-semibold text-muted-foreground/70 hover:text-primary hover:underline transition-colors flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      {task.client}
                    </Link>
                  ) : (
                    <p className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      {task.client}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    statusColors[task.status],
                    'h-6 border px-2 py-0 cursor-pointer transition-all hover:opacity-90 gap-1.5'
                  )}
                >
                  {isPendingUpdate ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {formatStatusLabel(task.status)}
                  </span>
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
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(priorityColors[task.priority], "h-5 text-[10px] px-1.5 font-bold uppercase tracking-wide")}
          >
            {formatPriorityLabel(task.priority)}
          </Badge>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-snug min-h-[2.5rem]">
            {task.description}
          </p>
        )}

        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                <User className="h-3 w-3" />
              </div>
              <span className="font-medium">
                {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className={cn(
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && "text-red-500"
              )}>
                {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
              </span>
            </div>
          </div>
        </div>

        {(task.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(task.tags ?? []).slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 bg-muted/40 text-muted-foreground/70"
              >
                #{tag}
              </Badge>
            ))}
            {(task.tags ?? []).length > 3 && (
              <span className="text-[10px] text-muted-foreground/60">+{(task.tags ?? []).length - 3}</span>
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
