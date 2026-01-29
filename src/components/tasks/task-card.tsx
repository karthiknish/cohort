'use client'

import Link from 'next/link'
import { memo, type ChangeEvent } from 'react'
import { Calendar, User, MoreHorizontal, LoaderCircle, Pencil, Trash2, MessageCircle, Copy, CalendarX2, Clock4, Repeat, Link2, ChevronRight, ListTodo } from 'lucide-react'

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { TaskRecord, TaskStatus, TASK_STATUSES } from '@/types/tasks'
import {
  statusColors,
  priorityColors,
  STATUS_ICONS,
  formatDate,
  formatStatusLabel,
  formatPriorityLabel,
  isOverdue,
  isDueSoon,
  formatTimeSpent,
} from './task-types'

export type TaskCardProps = {
  task: TaskRecord
  isPendingUpdate?: boolean
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onClone?: (task: TaskRecord) => void
  onShare?: (task: TaskRecord) => void
  selected?: boolean
  onSelectToggle?: (taskId: string, checked: boolean) => void
  searchQuery?: string
}

// Highlight search term in text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200/70 dark:bg-yellow-500/30 rounded px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

function TaskCardComponent({
  task,
  isPendingUpdate,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onClone,
  onShare,
  selected = false,
  onSelectToggle,
  searchQuery = '',
}: TaskCardProps) {
  const StatusIcon = STATUS_ICONS[task.status]
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border border-muted/40 bg-background p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:hover:bg-muted/10',
        isPendingUpdate && 'opacity-75 pointer-events-none',
        overdue && 'border-red-500/50 bg-red-500/[0.02] dark:border-red-500/30',
        dueSoon && !overdue && 'border-amber-500/50 bg-amber-500/[0.02] dark:border-amber-500/30',
        task.parentId && 'ml-4'
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

      {/* Overdue indicator banner */}
      {overdue && (
        <div className="absolute top-0 right-0 px-2 py-0.5 bg-red-500 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
          <CalendarX2 className="h-3 w-3 text-white" />
          <span className="text-[9px] font-bold text-white uppercase">Overdue</span>
        </div>
      )}

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
              {/* Task title with subtask indicator */}
              <div className="flex items-center gap-2">
                {task.parentId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </TooltipTrigger>
                      <TooltipContent>Subtask</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {(task.subtaskCount ?? 0) > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] bg-muted/40">
                          <ListTodo className="h-2.5 w-2.5 mr-0.5" />
                          {task.subtaskCount}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{task.subtaskCount} subtask{task.subtaskCount !== 1 ? 's' : ''}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <h3 className="font-bold text-base leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {highlightMatch(task.title, searchQuery)}
                </h3>
              </div>

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

              {/* Task metadata indicators row */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Comment count badge */}
                {(task.commentCount ?? 0) > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 bg-blue-50/50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                          <MessageCircle className="h-2.5 w-2.5" />
                          {task.commentCount}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{task.commentCount} comment{task.commentCount !== 1 ? 's' : ''}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Time spent indicator */}
                {(task.timeSpentMinutes ?? 0) > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 bg-purple-50/50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400">
                          <Clock4 className="h-2.5 w-2.5" />
                          {formatTimeSpent(task.timeSpentMinutes)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>Time spent: {formatTimeSpent(task.timeSpentMinutes)}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Recurring indicator */}
                {task.isRecurring && task.recurrenceRule && task.recurrenceRule !== 'none' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 bg-green-50/50 text-green-600 dark:bg-green-950/30 dark:text-green-400">
                          <Repeat className="h-2.5 w-2.5" />
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>Recurring: {task.recurrenceRule}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Shared indicator */}
                {(task.sharedWith ?? []).length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                          <Link2 className="h-2.5 w-2.5" />
                          {task.sharedWith?.length}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>Shared with {task.sharedWith?.length} person{(task.sharedWith?.length ?? 0) !== 1 ? 's' : ''}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
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
                  role="button"
                  aria-label={`Change status from ${formatStatusLabel(task.status)}`}
                  aria-haspopup="menu"
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
                {TASK_STATUSES.filter((s) => s !== task.status && s !== 'archived').map((status) => (
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
            {highlightMatch(task.description, searchQuery)}
          </p>
        )}

        <div className="flex flex-col gap-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
                <User className="h-3 w-3" />
              </div>
              <span className="font-medium">
                {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
              </span>
            </div>
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              overdue && "text-red-500",
              dueSoon && !overdue && "text-amber-500"
            )}>
              <Calendar className="h-3.5 w-3.5" />
              <span>
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
                #{highlightMatch(tag, searchQuery)}
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
            {onClone && (
              <>
                <DropdownMenuItem onClick={() => onClone(task)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate task
                </DropdownMenuItem>
              </>
            )}
            {onShare && (
              <DropdownMenuItem onClick={() => onShare(task)}>
                <Link2 className="mr-2 h-4 w-4" />
                Share task
              </DropdownMenuItem>
            )}
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
