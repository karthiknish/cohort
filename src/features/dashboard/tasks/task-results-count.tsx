'use client'

import { LoaderCircle } from 'lucide-react'
import { TASKS_THEME } from './tasks-theme'

export type TaskResultsCountProps = {
  sortedCount: number
  totalCount: number
  loading: boolean
}

export function TaskResultsCount({ sortedCount, totalCount, loading }: TaskResultsCountProps) {
  if (totalCount === 0) return null

  return (
    <div className={TASKS_THEME.footer}>
      <span>
        Showing <span className="font-medium text-foreground">{sortedCount}</span> of{' '}
        <span className="font-medium text-foreground">{totalCount}</span> task
        {totalCount !== 1 ? 's' : ''}
      </span>
      {loading ? (
        <span className="inline-flex items-center gap-1.5">
          <LoaderCircle className="size-3 animate-spin" aria-hidden />
          Updating…
        </span>
      ) : null}
    </div>
  )
}
