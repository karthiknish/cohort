'use client'

import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'

import { formatStatusLabel, STATUS_DOT_STYLES, type StatusFilter } from './utils'

type ProjectStatusPillsProps = {
  statusFilter: StatusFilter
  statusCounts: Record<ProjectStatus, number>
  totalCount: number
  onStatusChange: (value: StatusFilter) => void
}

export function ProjectStatusPills({
  statusFilter,
  statusCounts,
  totalCount,
  onStatusChange,
}: ProjectStatusPillsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by status">
      <StatusPill
        label="All"
        count={totalCount}
        active={statusFilter === 'all'}
        onClick={() => onStatusChange('all')}
      />
      {PROJECT_STATUSES.map((status) => (
        <StatusPill
          key={status}
          label={formatStatusLabel(status)}
          count={statusCounts[status] ?? 0}
          active={statusFilter === status}
          dotStyle={STATUS_DOT_STYLES[status]}
          onClick={() => onStatusChange(status)}
        />
      ))}
    </div>
  )
}

function StatusPill({
  label,
  count,
  active,
  onClick,
  dotStyle,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  dotStyle?: { backgroundColor: string }
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,box-shadow]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        active
          ? 'border-primary/30 bg-primary/8 text-foreground shadow-sm ring-1 ring-primary/10'
          : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
      )}
    >
      {dotStyle ? (
        <span className="h-2 w-2 shrink-0 rounded-full" style={dotStyle} aria-hidden />
      ) : null}
      <span>{label}</span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
          active ? 'bg-primary/15 text-primary' : 'bg-muted/60 text-muted-foreground',
        )}
      >
        {count}
      </span>
    </button>
  )
}
