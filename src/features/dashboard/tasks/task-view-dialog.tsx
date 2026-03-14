'use client'

import { useState } from 'react'
import { Calendar, Clock4, User } from 'lucide-react'

import type { TaskRecord } from '@/types/tasks'
import {
  Dialog,
  DialogContent,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tabs } from '@/shared/ui/tabs'
import {
  formatDate,
  formatPriorityLabel,
  formatStatusLabel,
  formatTimeSpent,
  type TaskParticipant,
} from './task-types'
import {
  TaskViewCommentsTab,
  type TaskDetailItem,
  TaskViewDetailsTab,
  TaskViewDialogFooter,
  TaskViewDialogHeader,
  TaskViewDialogTabsList,
} from './task-view-dialog-sections'

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
  const [commentCountState, setCommentCountState] = useState<{
    taskId: string
    sourceCount: number
    count: number
  } | null>(null)
  if (!task) return null

  const sourceCommentCount = task.commentCount ?? 0
  const liveCommentCount = commentCountState?.taskId === task.id && commentCountState.sourceCount === sourceCommentCount
    ? commentCountState.count
    : sourceCommentCount

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCommentCountState(null)
    }
    onOpenChange(nextOpen)
  }

  const summaryParts = [
    formatStatusLabel(task.status),
    `${formatPriorityLabel(task.priority)} priority`,
    task.client,
    task.projectName,
  ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)

  const detailItems: TaskDetailItem[] = [
    { label: 'Assignee', value: task.assignedTo.length > 0 ? task.assignedTo.join(', ') : 'Unassigned', icon: User },
    { label: 'Due date', value: formatDate(task.dueDate), icon: Calendar },
    { label: 'Time spent', value: formatTimeSpent(task.timeSpentMinutes), icon: Clock4 },
  ]
  const summary = summaryParts.length > 0
    ? summaryParts.join(' • ')
    : 'Full task details, assignments, timing, and supporting metadata.'

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-5xl overflow-hidden p-0">
        <TaskViewDialogHeader title={task.title} summary={summary} />

        <ScrollArea className="max-h-[calc(88vh-152px)]">
          <div className="px-6 py-5">
            <Tabs defaultValue="details" className="space-y-5">
              <TaskViewDialogTabsList commentCount={liveCommentCount} />
              <TaskViewDetailsTab detailItems={detailItems} task={task} />
              <TaskViewCommentsTab
                commentCount={liveCommentCount}
                onCommentCountChange={(count) => setCommentCountState({
                  taskId: task.id,
                  sourceCount: sourceCommentCount,
                  count,
                })}
                participants={participants}
                taskId={task.id}
                userId={userId}
                userName={userName}
                userRole={userRole}
                workspaceId={workspaceId}
              />
            </Tabs>
          </div>
        </ScrollArea>

        <TaskViewDialogFooter onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
