'use client'

import { memo, useCallback, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/shared/ui/card'
import type { TaskStatus } from '@/types/tasks'

export type TaskSummaryCardsProps = {
  taskCounts: Record<TaskStatus, number>
  /** When set, highlights the card that matches the list status filter. */
  selectedStatus?: 'all' | TaskStatus
  /** Toggle status filter: same card again clears to all. */
  onStatusCardClick?: (status: TaskStatus) => void
}

type SummaryCardConfig = {
  status: TaskStatus
  label: string
}

const summaryCards: SummaryCardConfig[] = [
  { status: 'todo', label: 'To do' },
  { status: 'in-progress', label: 'In progress' },
  { status: 'review', label: 'Needs review' },
  { status: 'completed', label: 'Completed' },
]

type TaskSummaryStatusCardProps = {
  status: TaskStatus
  label: string
  count: number
  isSelected: boolean
  onSelect?: (status: TaskStatus) => void
}

const TaskSummaryStatusCard = memo(function TaskSummaryStatusCard({
  status,
  label,
  count,
  isSelected,
  onSelect,
}: TaskSummaryStatusCardProps) {
  const isInteractive = Boolean(onSelect)

  const handleClick = useCallback(() => {
    onSelect?.(status)
  }, [onSelect, status])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onSelect) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(status)
      }
    },
    [onSelect, status],
  )

  return (
    <Card
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      className={cn(
        'overflow-hidden border-border/70 bg-card shadow-sm transition-[box-shadow,ring-color,border-color,transform]',
        isInteractive && 'cursor-pointer hover:border-accent/25 hover:shadow-md active:scale-[0.99]',
        isSelected && 'border-accent/30 ring-2 ring-primary/35',
      )}
      aria-pressed={isInteractive ? isSelected : undefined}
      aria-label={
        isInteractive
          ? `${label}: ${count} tasks. ${isSelected ? 'Filter active, press to show all statuses.' : 'Press to filter by this status.'}`
          : undefined
      }
    >
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{count}</p>
        </div>
      </CardContent>
    </Card>
  )
})

export const TaskSummaryCards = memo(function TaskSummaryCards({
  taskCounts,
  selectedStatus = 'all',
  onStatusCardClick,
}: TaskSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <TaskSummaryStatusCard
          key={card.status}
          status={card.status}
          label={card.label}
          count={taskCounts[card.status]}
          isSelected={selectedStatus === card.status}
          onSelect={onStatusCardClick}
        />
      ))}
    </div>
  )
})
