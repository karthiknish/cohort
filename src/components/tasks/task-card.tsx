'use client'

import { memo } from 'react'
import Link from 'next/link'
import {
  Calendar,
  CalendarX2,
  ChevronRight,
  Clock4,
  Copy,
  FolderKanban,
  Link2,
  ListTodo,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Repeat,
  Trash2,
  User,
} from 'lucide-react'

import type { TaskRecord, TaskStatus } from '@/types/tasks'
import { TASK_STATUSES } from '@/types/tasks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { buildProjectRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  formatTimeSpent,
  isDueSoon,
  isOverdue,
  priorityColors,
  STATUS_ICONS,
  taskInfoPanelClasses,
  taskPillColors,
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

  let cursor = 0

  return parts.map((part) => {
    const key = `highlight-${cursor}`
    const isMatch = part !== '' && regex.test(part)
    regex.lastIndex = 0
    cursor += part.length

    if (isMatch) {
      return (
        <mark key={key} className="rounded bg-yellow-100 px-0.5 text-slate-900">
          {part}
        </mark>
      )
    }

    return part
  })
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
  searchQuery = '',
}: TaskCardProps) {
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)

  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-gradient-to-b from-white via-white to-slate-50/70 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
        isPendingUpdate && 'opacity-75 pointer-events-none',
        selected && 'border-primary/40 ring-2 ring-primary/15 shadow-md',
        overdue && 'border-red-300/90 bg-red-50/70',
        dueSoon && !overdue && 'border-amber-300/90 bg-amber-50/70',
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

      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-start gap-2">
              <h3 className="line-clamp-2 min-w-0 flex-1 text-[1.05rem] font-bold leading-tight text-slate-900 transition-colors group-hover:text-primary">
                {highlightMatch(task.title, searchQuery)}
              </h3>
              {isPendingUpdate ? <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" /> : null}
            </div>

            {(task.client || task.projectName) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                {task.client && task.clientId ? (
                  <Link
                    href={`/dashboard/clients?clientId=${task.clientId}`}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-primary/30 hover:text-primary',
                      taskPillColors.client
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current/55" />
                    {task.client}
                  </Link>
                ) : task.client ? (
                  <p className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold', taskPillColors.client)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current/55" />
                    {task.client}
                  </p>
                ) : null}
                {task.projectId ? (
                  <Link
                    href={buildProjectRoute(task.projectId, task.projectName)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-primary/30 hover:text-primary',
                      taskPillColors.project,
                    )}
                  >
                    <FolderKanban className="h-3 w-3" />
                    {task.projectName ?? task.projectId}
                  </Link>
                ) : task.projectName ? (
                  <p className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold', taskPillColors.project)}>
                    <FolderKanban className="h-3 w-3" />
                    {task.projectName}
                  </p>
                ) : null}
              </div>
            )}

            {/* Task metadata indicators row */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
                {(task.parentId || (task.subtaskCount ?? 0) > 0) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.subtask)}>
                          {task.parentId ? <ChevronRight className="h-2.5 w-2.5" /> : <ListTodo className="h-2.5 w-2.5" />}
                          {task.parentId ? 'Subtask' : task.subtaskCount}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {task.parentId
                          ? 'Subtask'
                          : `${task.subtaskCount} subtask${task.subtaskCount !== 1 ? 's' : ''}`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {/* Comment count badge */}
                {(task.commentCount ?? 0) > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.comments)}>
                          <MessageCircle className="h-2.5 w-2.5" />
                          {task.commentCount}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{task.commentCount} comment{task.commentCount !== 1 ? 's' : ''}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {(task.attachments ?? []).length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.attachments)}>
                          <Paperclip className="h-2.5 w-2.5" />
                          {task.attachments?.length}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {task.attachments?.length} attachment{(task.attachments?.length ?? 0) !== 1 ? 's' : ''}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Time spent indicator */}
                {(task.timeSpentMinutes ?? 0) > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.time)}>
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
                        <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.recurring)}>
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
                        <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.shared)}>
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
          <div className="flex items-start gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-transparent text-slate-500 transition-colors hover:border-slate-200 hover:bg-slate-100/90 hover:text-slate-900"
                  aria-label="Task actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TASK_STATUSES.filter((status) => status !== task.status && status !== 'archived').map((status) => {
                  const NextStatusIcon = STATUS_ICONS[status]

                  return (
                    <DropdownMenuItem key={status} onClick={() => onQuickStatusChange(task, status)}>
                      <NextStatusIcon className="mr-2 h-4 w-4" />
                      Move to {formatStatusLabel(status)}
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit task
                </DropdownMenuItem>
                {onClone && (
                  <DropdownMenuItem onClick={() => onClone(task)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate task
                  </DropdownMenuItem>
                )}
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(task)}>
                    <Link2 className="mr-2 h-4 w-4" />
                    Share task
                  </DropdownMenuItem>
                )}
                {(onClone || onShare) && <DropdownMenuSeparator />}
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

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn(priorityColors[task.priority], 'h-7 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.18em]')}
          >
            {formatPriorityLabel(task.priority)}
          </Badge>
        </div>

        {task.description && (
          <p className="min-h-[2.75rem] line-clamp-2 text-sm leading-6 text-slate-600">
            {highlightMatch(task.description, searchQuery)}
          </p>
        )}

        <div className="mt-auto grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 border-t border-slate-200/70 pt-4">
          <div className={cn(taskInfoPanelClasses.base, 'flex min-w-0 items-start gap-3')}>
            <div className={cn(taskInfoPanelClasses.icon, 'mt-0.5')}>
              <User className="h-3 w-3" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className={taskInfoPanelClasses.label}>
                Assignee
              </p>
              <p className={cn(taskInfoPanelClasses.value, 'line-clamp-2')}>
                {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
              </p>
            </div>
          </div>
          <div className={cn(
            taskInfoPanelClasses.base,
            'flex items-start gap-3',
            overdue && 'border-red-200/90 bg-red-50/95',
            dueSoon && !overdue && 'border-amber-200/90 bg-amber-50/95'
          )}>
            <div className={cn(
              taskInfoPanelClasses.icon,
              'mt-0.5',
              overdue && 'border-red-200/90 bg-white text-red-600',
              dueSoon && !overdue && 'border-amber-200/90 bg-white text-amber-700'
            )}>
              <Calendar className="h-3 w-3" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className={taskInfoPanelClasses.label}>
                Due date
              </p>
              <p className={cn(taskInfoPanelClasses.value, !task.dueDate && 'text-slate-500')}>
                {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
              </p>
            </div>
          </div>
        </div>

        {(task.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(task.tags ?? []).slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn('h-6 rounded-full px-2 text-[10px] font-medium', taskPillColors.tag)}
              >
                #{highlightMatch(tag, searchQuery)}
              </Badge>
            ))}
            {(task.tags ?? []).length > 3 && (
              <span className="text-[10px] text-slate-500">+{(task.tags ?? []).length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const TaskCard = memo(TaskCardComponent)
TaskCard.displayName = 'TaskCard'
