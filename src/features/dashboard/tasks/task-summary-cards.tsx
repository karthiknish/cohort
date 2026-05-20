'use client'

import { memo, useCallback, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/tasks'
import { formatStatusLabel } from './task-types'

export type TaskSummaryCardsProps = {
  taskCounts: Record<TaskStatus, number>
  selectedStatus?: 'all' | TaskStatus
  onStatusCardClick?: (status: TaskStatus) => void
}

const stripStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'completed']

const stripAccent: Record<TaskStatus, string> = {
  todo: 'text-muted-foreground',
  'in-progress': 'text-info',
  review: 'text-warning',
  completed: 'text-success',
  archived: 'text-muted-foreground',
}

export const TaskSummaryCards = memo(function TaskSummaryCards({
  taskCounts,
  selectedStatus = 'all',
  onStatusCardClick,
}: TaskSummaryCardsProps) {
  const total = stripStatuses.reduce((sum, status) => sum + (taskCounts[status] ?? 0), 0)

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 text-sm" role="group" aria-label="Task counts by status">
      <span className="mr-2 text-xs font-medium text-muted-foreground">
        {total} {total === 1 ? 'task' : 'tasks'}
      </span>
      <span className="hidden h-4 w-px bg-border sm:inline-block" aria-hidden />
      {stripStatuses.map((status) => (
        <StatusChip
          key={status}
          status={status}
          count={taskCounts[status]}
          isSelected={selectedStatus === status}
          onSelect={onStatusCardClick}
        />
      ))}
    </div>
  )
})

function StatusChip({
  status,
  count,
  isSelected,
  onSelect,
}: {
  status: TaskStatus
  count: number
  isSelected: boolean
  onSelect?: (status: TaskStatus) => void
}) {
  const interactive = Boolean(onSelect)

  const handleClick = useCallback(() => {
    onSelect?.(status)
  }, [onSelect, status])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect?.(status)
      }
    },
    [onSelect, status],
  )

  const className = cn(
    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-colors',
    interactive && 'hover:bg-muted/60',
    isSelected && 'bg-muted ring-1 ring-border',
  )

  const content = (
    <>
      <span className={cn('font-medium', stripAccent[status])}>{formatStatusLabel(status)}</span>
      <span className="tabular-nums text-muted-foreground">{count}</span>
    </>
  )

  if (!interactive) {
    return <span className={className}>{content}</span>
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
    >
      {content}
    </button>
  )
}
