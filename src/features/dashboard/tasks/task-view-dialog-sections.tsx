'use client'

import type { ReactNode } from 'react'
import { Download, FolderKanban, ListChecks, MessageCircle, Paperclip, Pencil, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { buildProjectRoute, buildProjectTasksRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import type { TaskPriority, TaskRecord, TaskStatus } from '@/types/tasks'

import { TaskCommentsPanel } from './task-comments'
import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  priorityColors,
  statusColors,
  taskInfoPanelClasses,
  taskPillColors,
  type TaskParticipant,
} from './task-types'

export type TaskDetailItem = {
  label: string
  value: string
  icon: LucideIcon
}

export function TaskViewDialogHeader({
  title,
  summary,
  status,
  priority,
  client,
}: {
  title: string
  summary: string
  status: TaskStatus
  priority: TaskPriority
  client?: string | null
}) {
  return (
    <DialogHeader className="space-y-4 border-b border-border/60 bg-gradient-to-b from-muted/20 to-background px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusColors[status])}>
          {formatStatusLabel(status)}
        </Badge>
        <Badge variant="outline" className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', priorityColors[priority])}>
          {formatPriorityLabel(priority)} priority
        </Badge>
        {client ? (
          <Badge variant="outline" className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-medium', taskPillColors.client)}>
            {client}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <DialogTitle className="text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription className="text-pretty text-sm leading-relaxed">{summary}</DialogDescription>
      </div>
    </DialogHeader>
  )
}

export function TaskViewDialogTabsList({ commentCount }: { commentCount: number }) {
  return (
    <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-border/60 bg-muted/30 p-1">
      <TabsTrigger
        value="details"
        className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
      >
        Details
      </TabsTrigger>
      <TabsTrigger
        value="comments"
        className="gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
      >
        <MessageCircle className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
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
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      {children}
    </section>
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
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Description</h3>
        <div className="rounded-xl border border-border/60 bg-muted/25 p-4 text-sm leading-7 text-foreground">
          {task.description?.trim() ? task.description : 'No description provided.'}
        </div>
      </section>

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
        {detailItems.map(({ icon: Icon, label, value }) => (
          <div key={label} className={cn(taskInfoPanelClasses.base, 'flex min-w-0 items-start gap-3')}>
            <div className={taskInfoPanelClasses.icon}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className={taskInfoPanelClasses.label}>{label}</p>
              <p className={cn(taskInfoPanelClasses.value, 'break-words')}>{value}</p>
            </div>
          </div>
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
          <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
            No attachments on this task.
          </p>
        )}
      </TaskViewDetailSection>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className={cn(taskInfoPanelClasses.base, 'space-y-1')}>
          <p className={taskInfoPanelClasses.label}>Created</p>
          <p className={taskInfoPanelClasses.value}>{formatDate(task.createdAt)}</p>
        </div>
        <div className={cn(taskInfoPanelClasses.base, 'space-y-1')}>
          <p className={taskInfoPanelClasses.label}>Last updated</p>
          <p className={taskInfoPanelClasses.value}>{formatDate(task.updatedAt)}</p>
        </div>
      </section>
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
}: {
  onClose: () => void
  onEdit?: () => void
}) {
  return (
    <DialogFooter className="gap-2 border-t border-border/60 bg-muted/15 px-6 py-4 sm:justify-between">
      <p className="hidden text-xs text-muted-foreground sm:block">
        Press Escape to close. Comments sync in real time when enabled.
      </p>
      <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
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
