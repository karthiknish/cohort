'use client'

import { useCallback, useEffect, useState } from 'react'

import type { TaskRecord, TaskStatus } from '@/types/tasks'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tabs } from '@/shared/ui/tabs'
import type { TaskParticipant } from './task-types'
import {
  TaskViewCommentsTab,
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
  onDelete?: (task: TaskRecord) => void
  onQuickStatusChange?: (task: TaskRecord, newStatus: TaskStatus) => void
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
  onDelete,
  onQuickStatusChange,
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

  const handleDelete = useCallback(() => {
    if (!task || !onDelete) return
    onOpenChange(false)
    onDelete(task)
  }, [onDelete, onOpenChange, task])

  const handleQuickStatusChange = useCallback(
    (newStatus: TaskStatus) => {
      if (!task || !onQuickStatusChange) return
      onQuickStatusChange(task, newStatus)
    },
    [onQuickStatusChange, task],
  )

  const handleMarkComplete = useCallback(() => {
    if (!task || !onQuickStatusChange) return
    onQuickStatusChange(task, 'completed')
  }, [onQuickStatusChange, task])

  if (!task) return null

  const canMarkComplete = task.status !== 'completed' && task.status !== 'archived'

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <TaskViewDialogHeader
          title={task.title}
          status={task.status}
          priority={task.priority}
          client={task.client}
          assignedTo={task.assignedTo}
          dueDate={task.dueDate}
          timeSpentMinutes={task.timeSpentMinutes}
          onEdit={onEdit ? handleEdit : undefined}
          onDelete={onDelete ? handleDelete : undefined}
          onQuickStatusChange={onQuickStatusChange ? handleQuickStatusChange : undefined}
        />

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'details' | 'comments')}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="px-6 pt-3">
            <TaskViewDialogTabsList commentCount={liveCommentCount} />
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="px-6 pb-5 pt-4">
              <TaskViewDetailsTab task={task} />
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

        <TaskViewDialogFooter
          onClose={handleFooterClose}
          onEdit={onEdit ? handleEdit : undefined}
          onMarkComplete={
            onQuickStatusChange && canMarkComplete ? handleMarkComplete : undefined
          }
        />
      </DialogContent>
    </Dialog>
  )
}
