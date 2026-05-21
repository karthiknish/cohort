'use client'

import { memo, useCallback, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/tasks'
import { formatStatusLabel, STATUS_ICONS } from './task-types'
import { TASKS_THEME } from './tasks-theme'

export type TaskSummaryCardsProps = {
  taskCounts: Record<TaskStatus, number>
  selectedStatus?: 'all' | TaskStatus
  onStatusCardClick?: (status: TaskStatus) => void
}

const stripStatuses: TaskStatus[] = ['todo', 'in-progress', 'review', 'completed']

const stripStyles: Record<
  TaskStatus,
  { ring: string; accent: string; text: string; hover: string }
> = {
  todo: {
    ring: 'ring-muted-foreground/35',
    accent: 'bg-muted-foreground/50',
    text: 'text-muted-foreground',
    hover: 'hover:bg-muted/60',
  },
  'in-progress': {
    ring: 'ring-primary/40',
    accent: 'bg-primary',
    text: 'text-primary',
    hover: 'hover:bg-primary/10',
  },
  review: {
    ring: 'ring-warning/40',
    accent: 'bg-warning',
    text: 'text-warning',
    hover: 'hover:bg-warning/10',
  },
  completed: {
    ring: 'ring-success/40',
    accent: 'bg-success',
    text: 'text-success',
    hover: 'hover:bg-success/10',
  },
  archived: {
    ring: 'ring-muted-foreground/25',
    accent: 'bg-muted-foreground/40',
    text: 'text-muted-foreground',
    hover: 'hover:bg-muted/40',
  },
}

export const TaskSummaryCards = memo(function TaskSummaryCards({
  taskCounts,
  selectedStatus = 'all',
  onStatusCardClick,
}: TaskSummaryCardsProps) {
  const total = stripStatuses.reduce((sum, status) => sum + (taskCounts[status] ?? 0), 0)

  return (
    <section className={TASKS_THEME.summaryCard} aria-label="Task counts by status">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-end gap-3">
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">{total}</p>
          <div className="pb-1">
            <p className="text-sm font-medium text-foreground">Open workload</p>
            <p className="text-xs text-muted-foreground">
              {total === 1 ? '1 active task' : `${total} active tasks`} across columns
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end"
          role="group"
          aria-label="Filter by status"
        >
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
    </section>
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
    'inline-flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-background/70 px-3 py-2 text-left text-sm transition-all sm:min-w-[8.5rem]',
    styles.hover,
    interactive && 'cursor-pointer',
    isSelected && cn('border-transparent ring-2 ring-offset-2 ring-offset-card', styles.ring),
  )

  const content = (
    <>
      <span className={cn('h-1.5 w-8 shrink-0 rounded-full', styles.accent)} aria-hidden />
      <Icon className={cn('h-3.5 w-3.5 shrink-0', styles.text)} aria-hidden />
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
