'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock4, Download, FolderKanban, ListChecks, MessageCircle, Paperclip, User } from 'lucide-react'

import type { TaskRecord } from '@/types/tasks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildProjectRoute, buildProjectTasksRoute } from '@/lib/project-routes'
import { cn } from '@/lib/utils'
import { TaskCommentsPanel } from './task-comments'
import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  formatTimeSpent,
  taskInfoPanelClasses,
  taskPillColors,
  type TaskParticipant,
} from './task-types'

type TaskViewDialogProps = {
  task: TaskRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId?: string | null
  userId?: string | null
  userName?: string | null
  userRole?: string | null
  participants?: TaskParticipant[]
}

const EMPTY_PARTICIPANTS: TaskParticipant[] = []

export function TaskViewDialog({
  task,
  open,
  onOpenChange,
  workspaceId = null,
  userId = null,
  userName = null,
  userRole = null,
  participants = EMPTY_PARTICIPANTS,
}: TaskViewDialogProps) {
  const [liveCommentCount, setLiveCommentCount] = useState(0)

  useEffect(() => {
    setLiveCommentCount(task?.commentCount ?? 0)
  }, [task?.commentCount])

  if (!task) return null

  const summaryParts = [
    formatStatusLabel(task.status),
    `${formatPriorityLabel(task.priority)} priority`,
    task.client,
    task.projectName,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  const detailItems = [
    { label: 'Assignee', value: task.assignedTo.length > 0 ? task.assignedTo.join(', ') : 'Unassigned', icon: User },
    { label: 'Due date', value: formatDate(task.dueDate), icon: Calendar },
    { label: 'Time spent', value: formatTimeSpent(task.timeSpentMinutes), icon: Clock4 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200/80 px-6 py-5">
          <DialogTitle className="text-2xl leading-tight text-slate-950">{task.title}</DialogTitle>
          <DialogDescription>
            {summaryParts.length > 0
              ? summaryParts.join(' • ')
              : 'Full task details, assignments, timing, and supporting metadata.'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(88vh-152px)]">
          <div className="px-6 py-5">
            <Tabs defaultValue="details" className="space-y-5">
              <TabsList className="rounded-2xl border border-slate-200 bg-slate-100/80 p-1">
                <TabsTrigger value="details" className="rounded-xl px-4">Details</TabsTrigger>
                <TabsTrigger value="comments" className="rounded-xl px-4">
                  Comments
                  <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600 shadow-sm">
                    {liveCommentCount}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-0 space-y-6">
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Description</h3>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700 shadow-sm">
                    {task.description?.trim() ? task.description : 'No description provided.'}
                  </div>
                </section>

                {(task.projectId || task.projectName) && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Linked Project</h3>
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
                  </section>
                )}

                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {detailItems.map(({ label, value, icon: Icon }) => (
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

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Attachments</h3>
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
                </section>

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

              <TabsContent value="comments" className="mt-0 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Comments</h3>
                    <p className="mt-1 text-sm text-slate-500">Write updates and review the full task conversation here.</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {liveCommentCount} comment{liveCommentCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <TaskCommentsPanel
                  taskId={task.id}
                  workspaceId={workspaceId}
                  userId={userId}
                  userName={userName}
                  userRole={userRole}
                  participants={participants}
                  onCommentCountChange={setLiveCommentCount}
                />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-slate-200/80 px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
