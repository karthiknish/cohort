'use client'

import { memo } from 'react'
import Link from 'next/link'
import {
  Calendar,
  FolderKanban,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
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
import { buildProjectRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  isDueSoon,
  isOverdue,
  priorityColors,
  STATUS_ICONS,
  statusColors,
  taskPillColors,
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
}: TaskRowProps) {
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)

  return (
    <div
      className={cn(
        'group relative border-b border-slate-200/60 px-6 py-5 transition-all hover:bg-slate-50/80 last:border-0',
        isPendingUpdate && 'opacity-75 pointer-events-none',
        selected && 'bg-primary/5'
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2">
              <p className="max-w-[300px] truncate text-base font-bold text-slate-900 sm:max-w-[450px]">
                {task.title}
              </p>
              {isPendingUpdate ? <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" /> : null}
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
                  {TASK_STATUSES.filter((status) => status !== task.status).map((status) => {
                    const NextStatusIcon = STATUS_ICONS[status]

                    return (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onQuickStatusChange(task, status)}
                      >
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

          {task.description && (
            <p className="max-w-2xl line-clamp-1 text-sm text-slate-600">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2.5 text-[12px]">
            <Badge
              variant="outline"
              className={cn(statusColors[task.status], 'h-7 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.18em]')}
            >
              {formatStatusLabel(task.status)}
            </Badge>
            <Badge
              variant="outline"
              className={cn(priorityColors[task.priority], 'h-7 rounded-full px-2.5 text-[10px] font-bold uppercase tracking-[0.18em]')}
            >
              {formatPriorityLabel(task.priority)}
            </Badge>
            {task.client && (
              task.clientId ? (
                <Link href={`/dashboard/clients?clientId=${task.clientId}`}>
                  <Badge
                    variant="outline"
                    className={cn('h-7 rounded-full px-2.5 text-[11px] font-semibold transition-colors hover:border-primary/30 hover:text-primary', taskPillColors.client)}
                  >
                    {task.client}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className={cn('h-7 rounded-full px-2.5 text-[11px] font-semibold', taskPillColors.client)}>
                  {task.client}
                </Badge>
              )
            )}
            {task.projectId ? (
              <Link href={buildProjectRoute(task.projectId, task.projectName)}>
                <Badge
                  variant="outline"
                  className={cn('h-7 rounded-full px-2.5 text-[11px] font-semibold transition-colors hover:border-primary/30 hover:text-primary', taskPillColors.project)}
                >
                  <FolderKanban className="mr-1.5 h-3.5 w-3.5" />
                  {task.projectName ?? task.projectId}
                </Badge>
              </Link>
            ) : task.projectName ? (
              <Badge variant="outline" className={cn('h-7 rounded-full px-2.5 text-[11px] font-semibold', taskPillColors.project)}>
                <FolderKanban className="mr-1.5 h-3.5 w-3.5" />
                {task.projectName}
              </Badge>
            ) : null}
            <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium', taskPillColors.neutral)}>
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-slate-500">
                <User className="h-2.5 w-2.5" />
              </div>
              {(task.assignedTo ?? []).length > 0 ? (task.assignedTo ?? []).join(', ') : 'Unassigned'}
            </span>
            <span className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium',
              overdue ? taskPillColors.overdue : dueSoon ? taskPillColors.dueSoon : taskPillColors.neutral
            )}>
              <Calendar className="h-3.5 w-3.5" />
              <span>{task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'}</span>
            </span>

            {(task.attachments ?? []).length > 0 && (
              <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium', taskPillColors.attachments)}>
                <Paperclip className="h-3.5 w-3.5" />
                {task.attachments?.length} attachment{(task.attachments?.length ?? 0) !== 1 ? 's' : ''}
              </span>
            )}

            {(task.commentCount ?? 0) > 0 && (
              <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-medium', taskPillColors.comments)}>
                <MessageCircle className="h-3.5 w-3.5" />
                {task.commentCount} comment{task.commentCount !== 1 ? 's' : ''}
              </span>
            )}

            {(task.tags ?? []).length > 0 && (
              <div className="flex items-center gap-1.5">
                {(task.tags ?? []).slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className={cn('h-6 rounded-full px-2 text-[10px] font-medium', taskPillColors.tag)}>
                    #{tag}
                  </Badge>
                ))}
                {(task.tags ?? []).length > 2 && (
                  <span className="text-[10px] text-slate-400">+{(task.tags ?? []).length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const TaskRow = memo(TaskRowComponent)
TaskRow.displayName = 'TaskRow'
