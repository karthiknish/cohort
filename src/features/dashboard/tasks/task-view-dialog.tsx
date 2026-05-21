'use client'

import { useCallback, useEffect, useState } from 'react'
import { Calendar, Clock4, User } from 'lucide-react'

import type { TaskRecord } from '@/types/tasks'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
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
  onEdit?: (task: TaskRecord) => void
  initialTab?: 'details' | 'comments'
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
  onEdit,
  initialTab = 'details',
  workspaceId = null,
  userId = null,
  userName = null,
  userRole = null,
  participants = EMPTY_PARTICIPANTS,
}: TaskViewDialogProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>(initialTab)
  const [commentCountState, setCommentCountState] = useState<{
    taskId: string
    sourceCount: number
    count: number
  } | null>(null)

  const taskId = task?.id ?? ''
  const sourceCommentCount = task?.commentCount ?? 0
  const liveCommentCount =
    commentCountState?.taskId === taskId && commentCountState.sourceCount === sourceCommentCount
      ? commentCountState.count
      : sourceCommentCount

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
    }
  }, [open, initialTab, taskId])

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setCommentCountState(null)
        setActiveTab('details')
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  const handleCommentCountChange = useCallback(
    (count: number) => {
      setCommentCountState({
        taskId,
        sourceCount: sourceCommentCount,
        count,
      })
    },
    [sourceCommentCount, taskId],
  )

  const handleFooterClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleEdit = useCallback(() => {
    if (!task || !onEdit) return
    onOpenChange(false)
    onEdit(task)
  }, [onEdit, onOpenChange, task])

  if (!task) return null

  const summaryParts = [
    task.assignedTo.length > 0 ? `Assigned to ${task.assignedTo.join(', ')}` : 'Unassigned',
    `Due ${formatDate(task.dueDate)}`,
    formatTimeSpent(task.timeSpentMinutes),
  ].filter(Boolean)

  const detailItems: TaskDetailItem[] = [
    {
      label: 'Assignee',
      value: task.assignedTo.length > 0 ? task.assignedTo.join(', ') : 'Unassigned',
      icon: User,
    },
    { label: 'Due date', value: formatDate(task.dueDate), icon: Calendar },
    { label: 'Time spent', value: formatTimeSpent(task.timeSpentMinutes), icon: Clock4 },
  ]

  const summary =
    summaryParts.length > 0
      ? summaryParts.join(' · ')
      : `${formatStatusLabel(task.status)} · ${formatPriorityLabel(task.priority)} priority`

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <TaskViewDialogHeader
          title={task.title}
          summary={summary}
          status={task.status}
          priority={task.priority}
          client={task.client}
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'details' | 'comments')} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-border/60 px-6 py-3">
            <TaskViewDialogTabsList commentCount={liveCommentCount} />
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="px-6 py-5">
              <TaskViewDetailsTab detailItems={detailItems} task={task} />
              <TaskViewCommentsTab
                onCommentCountChange={handleCommentCountChange}
                participants={participants}
                taskId={task.id}
                userId={userId}
                userName={userName}
                userRole={userRole}
                workspaceId={workspaceId}
              />
            </div>
          </ScrollArea>
        </Tabs>

        <TaskViewDialogFooter onClose={handleFooterClose} onEdit={onEdit ? handleEdit : undefined} />
      </DialogContent>
    </Dialog>
  )
}
