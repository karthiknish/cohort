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
  RefreshCw,
  User,
  type LucideIcon,
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
  taskInfoPanelClasses,
  taskPillColors,
  type TaskParticipant,
} from './task-types'

export type TaskDetailItem = {
  label: string
  value: string
  icon: LucideIcon
}

const taskViewStatusPill: Record<TaskStatus, string> = {
  todo: 'border-primary/25 bg-primary/10 text-primary',
  'in-progress': 'border-primary/25 bg-primary/10 text-primary',
  review: 'border-accent/30 bg-accent/15 text-accent-foreground',
  completed: 'border-primary/25 bg-primary/10 text-primary',
  archived: 'border-border bg-muted text-muted-foreground',
}

const taskViewPriorityPill: Record<TaskPriority, string> = {
  low: 'border-border bg-muted text-muted-foreground',
  medium: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/15 dark:text-violet-200',
  high: 'border-accent/30 bg-accent/15 text-accent-foreground',
  urgent: 'border-destructive/30 bg-destructive/10 text-destructive',
}

function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const Icon = STATUS_ICONS[status]
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', taskViewStatusPill[status])}
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
      className={cn('gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold', taskViewPriorityPill[priority])}
    >
      <ChevronUp className="h-3 w-3 shrink-0" aria-hidden />
      {formatPriorityLabel(priority)} priority
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
  const assigneeLabel =
    assignedTo.length > 0 ? `Assigned to ${assignedTo.join(', ')}` : 'Unassigned'
  const showMenu = Boolean(onEdit || onDelete || onQuickStatusChange)

  return (
    <DialogHeader className="space-y-4 border-b border-border/60 bg-background px-6 pb-4 pt-5 pr-14">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TaskStatusBadge status={status} />
          <TaskPriorityBadge priority={priority} />
          {client ? (
            <Badge
              variant="outline"
              className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', taskPillColors.client)}
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
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
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
        ) : (
          <span className="h-8 w-8 shrink-0" aria-hidden />
        )}
      </div>
      <div className="space-y-2">
        <DialogTitle className="text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription asChild>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              {assigneeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              Due {formatDate(dueDate)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock4 className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              {formatTimeSpent(timeSpentMinutes)}
            </span>
          </div>
        </DialogDescription>
      </div>
    </DialogHeader>
  )
}

export function TaskViewDialogTabsList({ commentCount }: { commentCount: number }) {
  return (
    <TabsList className="h-auto w-full justify-start gap-8 rounded-none border-0 bg-transparent p-0">
      <TabsTrigger
        value="details"
        className="rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
      >
        Details
      </TabsTrigger>
      <TabsTrigger
        value="comments"
        className="gap-2 rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pb-3 pt-1 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
      >
        Comments
        <span
          className={cn(
            'inline-flex min-w-[1.375rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
            commentCount > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          {commentCount}
        </span>
      </TabsTrigger>
    </TabsList>
  )
}

function TaskViewDetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function TaskViewInfoCard({ icon: Icon, label, value }: TaskDetailItem) {
  return (
    <div className={cn(taskInfoPanelClasses.base, 'flex min-w-0 items-start gap-3')}>
      <div className={taskInfoPanelClasses.icon}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 space-y-1">
        <p className={taskInfoPanelClasses.label}>{label}</p>
        <p className={cn(taskInfoPanelClasses.value, 'break-words')}>{value}</p>
      </div>
    </div>
  )
}

export function TaskViewDetailsTab({
  detailItems,
  task,
}: {
  detailItems: TaskDetailItem[]
  task: TaskRecord
}) {
  return (
    <TabsContent value="details" className="mt-0 space-y-6 focus-visible:outline-none">
      <TaskViewDetailSection title="Description">
        <div className="rounded-xl border border-border/60 bg-background p-4 text-sm leading-7 text-foreground">
          {task.description?.trim() ? task.description : 'No description provided.'}
        </div>
      </TaskViewDetailSection>

      {task.projectId || task.projectName ? (
        <TaskViewDetailSection title="Linked project">
          <div className="flex flex-wrap items-center gap-2">
            {task.projectName ? (
              <Badge variant="outline" className={cn('h-7 rounded-full px-2.5 text-[11px] font-medium', taskPillColors.project)}>
                <FolderKanban className="mr-1.5 h-3.5 w-3.5" />
                {task.projectName}
              </Badge>
            ) : null}
            {task.projectId ? (
              <>
                <Button asChild type="button" variant="outline" size="sm" className="h-8 rounded-lg">
                  <Link href={buildProjectRoute(task.projectId, task.projectName)}>
                    <FolderKanban className="mr-1.5 h-3.5 w-3.5" />
                    Open project
                  </Link>
                </Button>
                <Button asChild type="button" variant="ghost" size="sm" className="h-8 rounded-lg">
                  <Link
                    href={buildProjectTasksRoute({
                      projectId: task.projectId,
                      projectName: task.projectName,
                      clientId: task.clientId,
                      clientName: task.client,
                    })}
                  >
                    <ListChecks className="mr-1.5 h-3.5 w-3.5" />
                    Related tasks
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </TaskViewDetailSection>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {detailItems.map((item) => (
          <TaskViewInfoCard key={item.label} {...item} />
        ))}
      </section>

      <TaskViewDetailSection title="Attachments">
        {(task.attachments ?? []).length > 0 ? (
          <div className="space-y-2">
            {(task.attachments ?? []).map((attachment) => (
              <div
                key={`${attachment.url}-${attachment.name}`}
                className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 truncate font-medium text-foreground transition-colors hover:text-primary"
                >
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{attachment.name}</span>
                </a>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{attachment.size ?? attachment.type ?? 'File'}</span>
                  <Button asChild type="button" variant="outline" size="sm" className="h-8 rounded-lg">
                    <a href={attachment.url} download={attachment.name}>
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-10 text-center">
            <Paperclip className="h-8 w-8 text-muted-foreground/50" aria-hidden />
            <p className="text-sm font-medium text-foreground">No attachments on this task.</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Drag and drop files here, or click to browse.
            </p>
          </div>
        )}
      </TaskViewDetailSection>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className={cn(taskInfoPanelClasses.base, 'flex items-start gap-3')}>
          <div className={taskInfoPanelClasses.icon}>
            <Calendar className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-1">
            <p className={taskInfoPanelClasses.label}>Created</p>
            <p className={taskInfoPanelClasses.value}>{formatDate(task.createdAt)}</p>
          </div>
        </div>
        <div className={cn(taskInfoPanelClasses.base, 'flex items-start gap-3')}>
          <div className={taskInfoPanelClasses.icon}>
            <RefreshCw className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-1">
            <p className={taskInfoPanelClasses.label}>Last updated</p>
            <p className={taskInfoPanelClasses.value}>{formatDate(task.updatedAt)}</p>
          </div>
        </div>
      </section>
    </TabsContent>
  )
}

export function TaskViewDialogSidebar({
  task,
  onEdit,
  onMarkComplete,
}: {
  task: TaskRecord
  onEdit?: () => void
  onMarkComplete?: () => void
}) {
  const assignee = task.assignedTo.length > 0 ? task.assignedTo.join(', ') : 'Unassigned'
  const canMarkComplete = task.status !== 'completed' && task.status !== 'archived'

  const summaryRows: { label: string; value: ReactNode }[] = [
    { label: 'Status', value: <TaskStatusBadge status={task.status} /> },
    { label: 'Priority', value: <TaskPriorityBadge priority={task.priority} /> },
    { label: 'Assignee', value: assignee },
    { label: 'Due date', value: formatDate(task.dueDate) },
    { label: 'Time spent', value: formatTimeSpent(task.timeSpentMinutes) },
  ]

  return (
    <aside className="w-full shrink-0 border-t border-border/60 bg-muted/20 lg:w-[17.5rem] lg:border-l lg:border-t-0">
      <div className="space-y-6 px-5 py-5">
        <section className="space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Task summary
          </h3>
          <dl className="space-y-3">
            {summaryRows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-3 text-sm">
                <dt className="shrink-0 text-muted-foreground">{label}</dt>
                <dd className="min-w-0 text-right font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(onEdit || (onMarkComplete && canMarkComplete)) ? (
          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Quick actions
            </h3>
            <div className="flex flex-col gap-2">
              {onEdit ? (
                <Button type="button" variant="outline" className="h-10 w-full justify-start rounded-lg" onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit task
                </Button>
              ) : null}
              {onMarkComplete && canMarkComplete ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full justify-start rounded-lg"
                  onClick={onMarkComplete}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as complete
                </Button>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </aside>
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
}: {
  onClose: () => void
  onEdit?: () => void
}) {
  return (
    <DialogFooter className="gap-3 border-t border-border/60 bg-background px-6 py-4 sm:items-center sm:justify-between">
      <p className="hidden text-xs text-muted-foreground sm:flex sm:items-center sm:gap-1.5">
        <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-foreground">
          Esc
        </kbd>
        <span>Press Esc to close. Comments sync in real time when enabled.</span>
      </p>
      <div className="flex w-full flex-col-reverse gap-2 sm:ml-auto sm:w-auto sm:flex-row">
        <Button variant="outline" className="rounded-lg" onClick={onClose}>
          Close
        </Button>
        {onEdit ? (
          <Button className="rounded-lg" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit task
          </Button>
        ) : null}
      </div>
    </DialogFooter>
  )
}
