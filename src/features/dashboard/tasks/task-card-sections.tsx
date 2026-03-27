'use client'

import { useCallback } from 'react'
import type { ReactNode } from 'react'
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

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { buildProjectRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import { TASK_STATUSES, type TaskRecord, type TaskStatus } from '@/types/tasks'

import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  formatTimeSpent,
  priorityColors,
  STATUS_ICONS,
  taskInfoPanelClasses,
  taskPillColors,
} from './task-types'

type HighlightRenderer = (text: string, query: string) => ReactNode

function TaskStatusMenuItem({
  onQuickStatusChange,
  status,
  task,
}: {
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  status: TaskStatus
  task: TaskRecord
}) {
  const NextStatusIcon = STATUS_ICONS[status]

  const handleClick = useCallback(() => {
    onQuickStatusChange(task, status)
  }, [onQuickStatusChange, status, task])

  return (
    <DropdownMenuItem onClick={handleClick}>
      <NextStatusIcon className="mr-2 h-4 w-4" />
      Move to {formatStatusLabel(status)}
    </DropdownMenuItem>
  )
}

export function TaskCardHeaderSection({
  task,
  isPendingUpdate,
  onOpen,
  searchQuery,
  highlightMatch,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onClone,
  onShare,
}: {
  task: TaskRecord
  isPendingUpdate?: boolean
  onOpen?: (task: TaskRecord) => void
  searchQuery: string
  highlightMatch: HighlightRenderer
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onClone?: (task: TaskRecord) => void
  onShare?: (task: TaskRecord) => void
}) {
  const handleOpenTask = useCallback(() => {
    onOpen?.(task)
  }, [onOpen, task])

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        {onOpen ? (
          <button
            type="button"
            onClick={handleOpenTask}
            className="block min-w-0 rounded-md text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
            aria-label={`View task ${task.title}`}
          >
            <div className="flex items-start gap-2">
              <h3 className="line-clamp-2 min-w-0 flex-1 text-[1.05rem] font-bold leading-tight text-foreground transition-colors group-hover:text-primary hover:text-primary">
                {highlightMatch(task.title, searchQuery)}
              </h3>
              {isPendingUpdate ? <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" /> : null}
            </div>
          </button>
        ) : (
          <div className="flex items-start gap-2">
            <h3 className="line-clamp-2 min-w-0 flex-1 text-[1.05rem] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
              {highlightMatch(task.title, searchQuery)}
            </h3>
            {isPendingUpdate ? <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" /> : null}
          </div>
        )}

        {(task.client || task.projectName) ? (
          <TaskCardContextPills task={task} />
        ) : null}

        <TaskCardIndicators task={task} />
      </div>

      <TaskCardActionsMenu
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onQuickStatusChange={onQuickStatusChange}
        onClone={onClone}
        onShare={onShare}
      />
    </div>
  )
}

function TaskCardContextPills({ task }: { task: TaskRecord }) {
  return (
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
  )
}

function TaskCardIndicators({ task }: { task: TaskRecord }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {(task.parentId || (task.subtaskCount ?? 0) > 0) ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.subtask)}>
                {task.parentId ? <ChevronRight className="h-2.5 w-2.5" /> : <ListTodo className="h-2.5 w-2.5" />}
                {task.parentId ? 'Subtask' : task.subtaskCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {task.parentId ? 'Subtask' : `${task.subtaskCount} subtask${task.subtaskCount !== 1 ? 's' : ''}`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {(task.commentCount ?? 0) > 0 ? (
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
      ) : null}

      {(task.attachments ?? []).length > 0 ? (
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
      ) : null}

      {(task.timeSpentMinutes ?? 0) > 0 ? (
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
      ) : null}

      {task.isRecurring && task.recurrenceRule && task.recurrenceRule !== 'none' ? (
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
      ) : null}

      {(task.sharedWith ?? []).length > 0 ? (
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
      ) : null}
    </div>
  )
}

function TaskCardActionsMenu({
  task,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onClone,
  onShare,
}: {
  task: TaskRecord
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onClone?: (task: TaskRecord) => void
  onShare?: (task: TaskRecord) => void
}) {
  const handleEditClick = useCallback(() => {
    onEdit(task)
  }, [onEdit, task])

  const handleDeleteClick = useCallback(() => {
    onDelete(task)
  }, [onDelete, task])

  const handleCloneClick = useCallback(() => {
    onClone?.(task)
  }, [onClone, task])

  const handleShareClick = useCallback(() => {
    onShare?.(task)
  }, [onShare, task])

  return (
    <div className="shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground"
            aria-label="Task actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {TASK_STATUSES.filter((status) => status !== task.status && status !== 'archived').map((status) => {
            return <TaskStatusMenuItem key={status} onQuickStatusChange={onQuickStatusChange} status={status} task={task} />
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditClick}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit task
          </DropdownMenuItem>
          {onClone ? (
            <DropdownMenuItem onClick={handleCloneClick}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate task
            </DropdownMenuItem>
          ) : null}
          {onShare ? (
            <DropdownMenuItem onClick={handleShareClick}>
              <Link2 className="mr-2 h-4 w-4" />
              Share task
            </DropdownMenuItem>
          ) : null}
          {(onClone || onShare) ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function TaskCardPriorityBadge({ priority }: { priority: TaskRecord['priority'] }) {
  return (
    <Badge
      variant="outline"
      className={cn(priorityColors[priority], 'h-7 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.18em]')}
    >
      {formatPriorityLabel(priority)}
    </Badge>
  )
}

export function TaskCardInfoPanels({
  task,
  overdue,
  dueSoon,
}: {
  task: TaskRecord
  overdue: boolean
  dueSoon: boolean
}) {
  return (
    <div className="mt-auto grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 border-t border-border/70 pt-4">
      <div className={cn(taskInfoPanelClasses.base, 'flex min-w-0 items-start gap-3')}>
        <div className={cn(taskInfoPanelClasses.icon, 'mt-0.5')}>
          <User className="h-3 w-3" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className={taskInfoPanelClasses.label}>Assignee</p>
          <p className={cn(taskInfoPanelClasses.value, 'line-clamp-2')}>
            {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
          </p>
        </div>
      </div>

      <div
        className={cn(
          taskInfoPanelClasses.base,
          'flex items-start gap-3',
          overdue && 'border-destructive/20 bg-destructive/10',
          dueSoon && !overdue && 'border-warning/20 bg-warning/10'
        )}
      >
        <div
          className={cn(
            taskInfoPanelClasses.icon,
            'mt-0.5',
            overdue && 'border-destructive/20 bg-background text-destructive',
            dueSoon && !overdue && 'border-warning/20 bg-background text-warning'
          )}
        >
          <Calendar className="h-3 w-3" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className={taskInfoPanelClasses.label}>Due date</p>
          <p className={cn(taskInfoPanelClasses.value, !task.dueDate && 'text-muted-foreground')}>
            {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TaskCardOverdueBanner() {
  return (
    <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg rounded-tr-lg bg-destructive px-2 py-0.5 text-destructive-foreground">
      <CalendarX2 className="h-3 w-3" />
      <span className="text-[9px] font-bold uppercase">Overdue</span>
    </div>
  )
}
