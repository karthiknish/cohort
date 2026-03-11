'use client'

import type { ReactNode } from 'react'
import { Download, FolderKanban, ListChecks, MessageCircle, Paperclip, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildProjectRoute, buildProjectTasksRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import type { TaskRecord } from '@/types/tasks'

import { TaskCommentsPanel } from './task-comments'
import { formatDate, taskInfoPanelClasses, taskPillColors, type TaskParticipant } from './task-types'

export type TaskDetailItem = {
  label: string
  value: string
  icon: LucideIcon
}

export function TaskViewDialogHeader({ summary, title }: { summary: string; title: string }) {
  return (
    <DialogHeader className="border-b border-slate-200/80 px-6 py-5">
      <DialogTitle className="text-2xl leading-tight text-slate-950">{title}</DialogTitle>
      <DialogDescription>{summary}</DialogDescription>
    </DialogHeader>
  )
}

export function TaskViewDialogTabsList({ commentCount }: { commentCount: number }) {
  return (
    <TabsList className="rounded-2xl border border-slate-200 bg-slate-100/80 p-1">
      <TabsTrigger value="details" className="rounded-xl px-4">Details</TabsTrigger>
      <TabsTrigger value="comments" className="rounded-xl px-4">
        Comments
        <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 shadow-sm">
          {commentCount}
        </span>
      </TabsTrigger>
    </TabsList>
  )
}

function TaskViewDetailSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</h3>
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
    <TabsContent value="details" className="mt-0 space-y-6">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Description</h3>
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700 shadow-sm">
          {task.description?.trim() ? task.description : 'No description provided.'}
        </div>
      </section>

      {task.projectId || task.projectName ? (
        <TaskViewDetailSection title="Linked Project">
          <div className="flex flex-wrap items-center gap-2">
            {task.projectName ? (
              <Badge variant="outline" className={cn('h-7 rounded-full px-2.5 text-[11px] font-medium', taskPillColors.project)}>
                <FolderKanban className="mr-1.5 h-3.5 w-3.5" />
                {task.projectName}
              </Badge>
            ) : null}
            {task.projectId ? (
              <>
                <Button asChild type="button" variant="outline" size="sm" className="h-8 rounded-xl">
                  <Link href={buildProjectRoute(task.projectId, task.projectName)}>
                    <FolderKanban className="mr-1.5 h-3.5 w-3.5" />
                    Open project
                  </Link>
                </Button>
                <Button asChild type="button" variant="ghost" size="sm" className="h-8 rounded-xl">
                  <Link href={buildProjectTasksRoute({ projectId: task.projectId, projectName: task.projectName, clientId: task.clientId, clientName: task.client })}>
                    <ListChecks className="mr-1.5 h-3.5 w-3.5" />
                    View related tasks
                  </Link>
                </Button>
              </>
            ) : null}
          </div>
        </TaskViewDetailSection>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
              >
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 truncate transition-colors hover:text-primary"
                >
                  <Paperclip className="h-4 w-4 shrink-0" />
                  <span className="truncate">{attachment.name}</span>
                </a>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs text-slate-500">{attachment.size ?? attachment.type ?? 'Open'}</span>
                  <Button asChild type="button" variant="outline" size="sm" className="h-8 rounded-xl">
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
          <p className="text-sm text-slate-500">No attachments.</p>
        )}
      </TaskViewDetailSection>

      <section className="grid gap-3 md:grid-cols-2">
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
  commentCount,
  onCommentCountChange,
  participants,
  taskId,
  userId,
  userName,
  userRole,
  workspaceId,
}: {
  commentCount: number
  onCommentCountChange: (count: number) => void
  participants: TaskParticipant[]
  taskId: string
  userId: string | null
  userName: string | null
  userRole: string | null
  workspaceId: string | null
}) {
  return (
    <TabsContent value="comments" className="mt-0 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Comments</h3>
          <p className="mt-1 text-sm text-slate-500">Write updates and review the full task conversation here.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          <MessageCircle className="h-3.5 w-3.5" />
          {commentCount} comment{commentCount !== 1 ? 's' : ''}
        </span>
      </div>
      <TaskCommentsPanel
        taskId={taskId}
        workspaceId={workspaceId}
        userId={userId}
        userName={userName}
        userRole={userRole}
        participants={participants}
        onCommentCountChange={(count) => onCommentCountChange(count)}
      />
    </TabsContent>
  )
}

export function TaskViewDialogFooter({ onClose }: { onClose: () => void }) {
  return (
    <DialogFooter className="border-t border-slate-200/80 px-6 py-4">
      <Button variant="outline" onClick={onClose}>Close</Button>
    </DialogFooter>
  )
}