'use client'

import { memo, useCallback, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/tasks'
import { formatStatusLabel, STATUS_ICONS, statusLaneColors } from './task-types'

export type TaskSummaryCardsProps = {
  taskCounts: Record<TaskStatus, number>
  selectedStatus?: 'all' | TaskStatus
  onStatusCardClick?: (status: TaskStatus) => void
}

const stripStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'completed']

const stripStyles: Record<
  TaskStatus,
  { ring: string; bg: string; text: string; hover: string }
> = {
  todo: {
    ring: 'ring-muted-foreground/30',
    bg: 'bg-muted/50',
    text: 'text-muted-foreground',
    hover: 'hover:bg-muted/80',
  },
  'in-progress': {
    ring: 'ring-primary/35',
    bg: 'bg-primary/8',
    text: 'text-primary',
    hover: 'hover:bg-primary/12',
  },
  review: {
    ring: 'ring-warning/35',
    bg: 'bg-warning/10',
    text: 'text-warning',
    hover: 'hover:bg-warning/15',
  },
  completed: {
    ring: 'ring-success/35',
    bg: 'bg-success/10',
    text: 'text-success',
    hover: 'hover:bg-success/15',
  },
  archived: {
    ring: 'ring-muted-foreground/20',
    bg: 'bg-muted/30',
    text: 'text-muted-foreground',
    hover: 'hover:bg-muted/50',
  },
}

export const TaskSummaryCards = memo(function TaskSummaryCards({
  taskCounts,
  selectedStatus = 'all',
  onStatusCardClick,
}: TaskSummaryCardsProps) {
  const total = stripStatuses.reduce((sum, status) => sum + (taskCounts[status] ?? 0), 0)

  return (
    <div
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
      role="group"
      aria-label="Task counts by status"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{total}</span>
        <span className="text-sm text-muted-foreground">
          {total === 1 ? 'task' : 'tasks'} on the board
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
        {stripStatuses.map((status) => (
          <StatusChip
            key={status}
            status={status}
            count={taskCounts[status] ?? 0}
            isSelected={selectedStatus === status}
            onSelect={onStatusCardClick}
          />
        ))}
      </div>
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
  const Icon = STATUS_ICONS[status]
  const styles = stripStyles[status]

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
    'inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/60 px-3 py-2.5 text-left text-sm transition-all sm:flex-initial sm:min-w-[7.5rem]',
    styles.bg,
    styles.hover,
    interactive && 'cursor-pointer',
    isSelected && cn('ring-2 ring-offset-2 ring-offset-background', styles.ring),
  )

  const content = (
    <>
      <span
        className={cn('h-2 w-2 shrink-0 rounded-full', statusLaneColors[status])}
        aria-hidden
      />
      <Icon className={cn('h-3.5 w-3.5 shrink-0 opacity-80', styles.text)} aria-hidden />
      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
        {formatStatusLabel(status)}
      </span>
      <span className={cn('shrink-0 tabular-nums text-xs font-semibold', styles.text)}>{count}</span>
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
      aria-label={`${formatStatusLabel(status)}: ${count} tasks`}
    >
      {content}
    </button>
  )
}
