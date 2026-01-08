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

export type TaskRowProps = {
  task: TaskRecord
  isPendingUpdate?: boolean
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  selected?: boolean
  onSelectToggle?: (taskId: string, checked: boolean) => void
}

function TaskRowComponent({
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
        'group relative px-6 py-5 transition-all hover:bg-muted/40 border-b border-muted/20 last:border-0',
        isPendingUpdate && 'opacity-75 pointer-events-none'
      )}
    >
      {/* Priority accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 transition-opacity opacity-70 group-hover:opacity-100",
          task.priority === 'urgent' ? 'bg-red-500' :
            task.priority === 'high' ? 'bg-orange-500' :
              task.priority === 'medium' ? 'bg-blue-500' : 'bg-emerald-500'
        )}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selected}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onSelectToggle?.(task.id, event.target.checked)
                }
                aria-label="Select task"
              />
              <p className="text-base font-bold text-foreground truncate max-w-[300px] sm:max-w-[450px]">
                {task.title}
              </p>
            </div>

            <div className="flex items-center gap-2">
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
                    <span className="text-[10px] font-bold tracking-wider uppercase leading-none">
                      {formatStatusLabel(task.status)}
                    </span>
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

              <Badge
                variant="outline"
                className={cn(priorityColors[task.priority], "h-6 text-[10px] px-2 font-bold uppercase tracking-wide")}
              >
                {formatPriorityLabel(task.priority)}
              </Badge>

              {task.client && (
                task.clientId ? (
                  <Link href={`/dashboard/clients?clientId=${task.clientId}`}>
                    <Badge
                      variant="secondary"
                      className="h-6 text-[11px] font-medium bg-muted/50 hover:bg-muted cursor-pointer transition-colors border-none px-2 shadow-none"
                    >
                      {task.client}
                    </Badge>
                  </Link>
                ) : (
                  <Badge variant="outline" className="h-6 text-[11px] border-dashed border-muted/60 font-medium px-2">
                    {task.client}
                  </Badge>
                )
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-1 max-w-2xl">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground/70">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                <User className="h-2.5 w-2.5" />
              </div>
              {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className={cn(
                task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && "text-red-500 font-medium"
              )}>
                {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}
              </span>
            </span>

            {(task.tags ?? []).length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                {(task.tags ?? []).slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1 bg-muted/30 text-muted-foreground/60 border-none">
                    #{tag}
                  </Badge>
                ))}
                {(task.tags ?? []).length > 2 && (
                  <span className="text-[10px] text-muted-foreground/40">+{(task.tags ?? []).length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1.5 font-medium hover:bg-primary/5 hover:text-primary transition-colors"
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

export const TaskRow = memo(TaskRowComponent)
TaskRow.displayName = 'TaskRow'
