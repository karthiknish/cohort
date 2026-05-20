'use client'

import { memo } from 'react'
import { CheckSquare, Hash, ListTodo, Signal, UserRound } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Shared column grid for header + rows (Jira-style list). */
export const TASK_TABLE_GRID =
  'grid grid-cols-[36px_88px_minmax(12rem,1fr)_7.5rem_9.5rem_6.5rem_6.5rem_2.5rem] items-center gap-x-3'

export function TaskTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className="min-w-208">{children}</div>
    </div>
  )
}

export const TaskTableHeader = memo(function TaskTableHeader({
  showCheckbox = true,
}: {
  showCheckbox?: boolean
}) {
  return (
    <div
      className={cn(
        TASK_TABLE_GRID,
        'border-b border-border/80 bg-muted/30 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground',
      )}
      role="row"
    >
      <span className="flex justify-center" role="columnheader">
        {showCheckbox ? <CheckSquare className="h-3.5 w-3.5 opacity-60" aria-hidden /> : null}
      </span>
      <span className="inline-flex items-center gap-1" role="columnheader">
        <Hash className="h-3 w-3 opacity-50" aria-hidden />
        Key
      </span>
      <span className="inline-flex items-center gap-1" role="columnheader">
        <ListTodo className="h-3 w-3 opacity-50" aria-hidden />
        Summary
      </span>
      <span role="columnheader">Status</span>
      <span className="inline-flex items-center gap-1" role="columnheader">
        <UserRound className="h-3 w-3 opacity-50" aria-hidden />
        Assignee
      </span>
      <span role="columnheader">Due date</span>
      <span className="inline-flex items-center gap-1" role="columnheader">
        <Signal className="h-3 w-3 opacity-50" aria-hidden />
        Priority
      </span>
      <span className="sr-only" role="columnheader">
        Actions
      </span>
    </div>
  )
})

export function TaskTableBody({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border/70">{children}</div>
}

export function formatTaskKey(taskId: string): string {
  const compact = taskId.replace(/[^a-zA-Z0-9]/g, '')
  if (compact.length <= 6) return `TASK-${compact.toUpperCase() || '1'}`
  const tail = compact.slice(-5).toUpperCase()
  const head = compact.slice(0, 2).toUpperCase()
  return `TASK-${head}${tail}`
}
