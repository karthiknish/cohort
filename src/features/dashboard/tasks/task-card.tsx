'use client'

import { memo } from 'react'
import { ViewTransition } from 'react'

import type { TaskRecord, TaskStatus } from '@/types/tasks'
import { cn } from '@/lib/utils'
import {
  TaskCardHeaderSection,
  TaskCardInfoPanels,
  TaskCardOverdueBanner,
  TaskCardPriorityBadge,
} from './task-card-sections'
import {
  isDueSoon,
  isOverdue,
} from './task-types'

export type TaskCardProps = {
  task: TaskRecord
  isPendingUpdate?: boolean
  onOpen?: (task: TaskRecord) => void
  onEdit: (task: TaskRecord) => void
  onDelete: (task: TaskRecord) => void
  onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void
  onClone?: (task: TaskRecord) => void
  onShare?: (task: TaskRecord) => void
  selected?: boolean
  onSelectToggle?: (taskId: string, checked: boolean) => void
  searchQuery?: string
}

// Highlight search term in text
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  let cursor = 0

  return parts.map((part) => {
    const key = `highlight-${cursor}`
    const isMatch = part !== '' && regex.test(part)
    regex.lastIndex = 0
    cursor += part.length

    if (isMatch) {
      return (
        <mark key={key} className="rounded bg-accent px-0.5 text-accent-foreground">
          {part}
        </mark>
      )
    }

    return part
  })
}

function TaskCardComponent({
  task,
  isPendingUpdate,
  onOpen,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onClone,
  onShare,
  selected = false,
  searchQuery = '',
}: TaskCardProps) {
  const overdue = isOverdue(task)
  const dueSoon = isDueSoon(task)

  return (
    <ViewTransition>
      <div
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-border/70 bg-gradient-to-b from-background via-background to-muted/20 p-5 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
          isPendingUpdate && 'opacity-75 pointer-events-none',
          selected && 'border-primary/40 ring-2 ring-primary/15 shadow-md',
          overdue && 'border-destructive/20 bg-destructive/10',
          dueSoon && !overdue && 'border-warning/20 bg-warning/10',
          task.parentId && 'ml-4'
        )}
      >
      {/* Priority accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity group-hover:opacity-100",
          task.priority === 'urgent' ? 'bg-destructive' :
            task.priority === 'high' ? 'bg-warning' :
              task.priority === 'medium' ? 'bg-info' : 'bg-success'
        )}
      />

      {/* Overdue indicator banner */}
      {overdue ? <TaskCardOverdueBanner /> : null}

      <div className="flex flex-1 flex-col gap-4">
        <TaskCardHeaderSection
          task={task}
          isPendingUpdate={isPendingUpdate}
          onOpen={onOpen}
          searchQuery={searchQuery}
          highlightMatch={highlightMatch}
          onEdit={onEdit}
          onDelete={onDelete}
          onQuickStatusChange={onQuickStatusChange}
          onClone={onClone}
          onShare={onShare}
        />

        <div className="flex flex-wrap gap-2">
          <TaskCardPriorityBadge priority={task.priority} />
        </div>

        {task.description && (
          <p className="min-h-[2.75rem] line-clamp-2 text-sm leading-6 text-muted-foreground">
            {highlightMatch(task.description, searchQuery)}
          </p>
        )}

        <TaskCardInfoPanels task={task} overdue={overdue} dueSoon={dueSoon} />
      </div>
      </div>
    </ViewTransition>
  )
}

export const TaskCard = memo(TaskCardComponent)
TaskCard.displayName = 'TaskCard'
