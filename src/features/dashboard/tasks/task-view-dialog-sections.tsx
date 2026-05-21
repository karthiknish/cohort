'use client'

import type { ReactNode } from 'react'
import {
  Calendar,
  CheckCircle2,
  ChevronUp,
  Clock4,
  Download,
  FolderKanban,
  ListChecks,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pencil,
  User,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { buildProjectRoute, buildProjectTasksRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import type { TaskPriority, TaskRecord, TaskStatus } from '@/types/tasks'
import { TASK_STATUSES } from '@/types/tasks'

import { TaskCommentsPanel } from './task-comments'
import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  formatTimeSpent,
  STATUS_ICONS,
  taskPillColors,
  taskViewPriorityPill,
  taskViewStatusPill,
  type TaskParticipant,
} from './task-types'

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const Icon = STATUS_ICONS[status]
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold', taskViewStatusPill[status])}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {formatStatusLabel(status)}
    </Badge>
  )
}

function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold', taskViewPriorityPill[priority])}
    >
      <ChevronUp className="h-3 w-3 shrink-0" aria-hidden />
      {formatPriorityLabel(priority)}
    </Badge>
  )
}

export function TaskViewDialogHeader({
  title,
  status,
  priority,
  client,
  assignedTo,
  dueDate,
  timeSpentMinutes,
  onEdit,
  onDelete,
  onQuickStatusChange,
}: {
  title: string
  status: TaskStatus
  priority: TaskPriority
  client?: string | null
  assignedTo: string[]
  dueDate: string | null | undefined
  timeSpentMinutes: number | null | undefined
  onEdit?: () => void
  onDelete?: () => void
  onQuickStatusChange?: (status: TaskStatus) => void
}) {
  const assignee = assignedTo.length > 0 ? assignedTo.join(', ') : 'Unassigned'
  const showMenu = Boolean(onEdit || onDelete || onQuickStatusChange)

  return (
    <DialogHeader className="space-y-3 px-6 pb-0 pt-5 pr-14">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <TaskStatusBadge status={status} />
          <TaskPriorityBadge priority={priority} />
          {client ? (
            <Badge
              variant="outline"
              className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium', taskPillColors.client)}
            >
              {client}
            </Badge>
          ) : null}
        </div>
        {showMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground"
                aria-label="Task options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onQuickStatusChange
                ? TASK_STATUSES.filter((s) => s !== status && s !== 'archived').map((nextStatus) => (
                    <DropdownMenuItem
                      key={nextStatus}
                      onClick={() => onQuickStatusChange(nextStatus)}
                    >
                      Move to {formatStatusLabel(nextStatus)}
                    </DropdownMenuItem>
                  ))
                : null}
              {onQuickStatusChange && onEdit ? <DropdownMenuSeparator /> : null}
              {onEdit ? (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit task
                </DropdownMenuItem>
              ) : null}
              {onDelete ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    Delete task
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
      <div className="space-y-2">
        <DialogTitle className="text-xl font-semibold leading-snug tracking-tight text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription asChild>
          <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <dt className="sr-only">Assignee</dt>
              <dd className="truncate text-foreground">{assignee}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <dt className="sr-only">Due date</dt>
              <dd className="truncate text-foreground">{formatDate(dueDate)}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <Clock4 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <dt className="sr-only">Time spent</dt>
              <dd className="truncate text-foreground">{formatTimeSpent(timeSpentMinutes)}</dd>
            </div>
          </dl>
        </DialogDescription>
      </div>
    </DialogHeader>
  )
}

export function TaskViewDialogTabsList({ commentCount }: { commentCount: number }) {
  return (
    <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-0 bg-transparent p-0">
      <TabsTrigger
        value="details"
        className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-2.5 pt-1 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
      >
        Details
      </TabsTrigger>
      <TabsTrigger
        value="comments"
        className="gap-1.5 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-2.5 pt-1 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
      >
        Comments
        <span
          className={cn(
            'inline-flex min-w-[1.25rem] items-center justify-center rounded-md px-1 text-[11px] font-medium tabular-nums',
            commentCount > 0 ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          {commentCount}
        </span>
      </TabsTrigger>
    </TabsList>
  )
}

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
      {children}
    </section>
  )
}

export function TaskViewDetailsTab({ task }: { task: TaskRecord }) {
  return (
    <TabsContent value="details" className="mt-0 space-y-6 focus-visible:outline-none">
      <DetailBlock label="Description">
        <p className="text-sm leading-relaxed text-foreground">
          {task.description?.trim() ? task.description : (
            <span className="text-muted-foreground">No description provided.</span>
          )}
        </p>
      </DetailBlock>

      {task.projectId || task.projectName ? (
        <DetailBlock label="Project">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {task.projectName ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {task.projectName}
              </span>
            ) : null}
            {task.projectId ? (
              <>
                <Link
                  href={buildProjectRoute(task.projectId, task.projectName)}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Open project
                </Link>
                <Link
                  href={buildProjectTasksRoute({
                    projectId: task.projectId,
                    projectName: task.projectName,
                    clientId: task.clientId,
                    clientName: task.client,
                  })}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Related tasks
                </Link>
              </>
            ) : null}
          </div>
        </DetailBlock>
      ) : null}

      <DetailBlock label="Attachments">
        {(task.attachments ?? []).length > 0 ? (
          <ul className="divide-y divide-border text-sm">
            {(task.attachments ?? []).map((attachment) => (
              <li
                key={`${attachment.url}-${attachment.name}`}
                className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
              >
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 items-center gap-2 font-medium text-foreground hover:text-primary"
                >
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{attachment.name}</span>
                </a>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {attachment.size ?? attachment.type ?? 'File'}
                  </span>
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No attachments.</p>
        )}
      </DetailBlock>

      <p className="border-t border-border pt-4 text-xs text-muted-foreground">
        Created {formatDate(task.createdAt)} · Updated {formatDate(task.updatedAt)}
      </p>
    </TabsContent>
  )
}

export function TaskViewCommentsTab({
  onCommentCountChange,
  participants,
  taskId,
  userId,
  userName,
  userRole,
  workspaceId,
}: {
  onCommentCountChange: (count: number) => void
  participants: TaskParticipant[]
  taskId: string
  userId: string | null
  userName: string | null
  userRole: string | null
  workspaceId: string | null
}) {
  return (
    <TabsContent value="comments" className="mt-0 focus-visible:outline-none">
      <TaskCommentsPanel
        taskId={taskId}
        workspaceId={workspaceId}
        userId={userId}
        userName={userName}
        userRole={userRole}
        participants={participants}
        onCommentCountChange={onCommentCountChange}
      />
    </TabsContent>
  )
}

export function TaskViewDialogFooter({
  onClose,
  onEdit,
  onMarkComplete,
}: {
  onClose: () => void
  onEdit?: () => void
  onMarkComplete?: () => void
}) {
  return (
    <DialogFooter className="flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="hidden text-xs text-muted-foreground sm:block">
        <kbd className="mr-1 rounded border border-border bg-muted px-1 font-mono text-[10px]">Esc</kbd>
        to close
      </p>
      <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {onMarkComplete ? (
          <Button type="button" variant="outline" onClick={onMarkComplete}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark complete
          </Button>
        ) : null}
        {onEdit ? (
          <Button onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit task
          </Button>
        ) : null}
      </div>
    </DialogFooter>
  )
}
