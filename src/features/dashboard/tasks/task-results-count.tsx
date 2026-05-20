'use client'

import { LoaderCircle } from 'lucide-react'

export type TaskResultsCountProps = {
  sortedCount: number
  totalCount: number
  loading: boolean
}

export function TaskResultsCount({ sortedCount, totalCount, loading }: TaskResultsCountProps) {
  if (totalCount === 0) return null

  return (
    <div className="flex items-center justify-between border-t border-border/80 px-4 py-2 text-xs text-muted-foreground">
      <span>
        Showing {sortedCount} of {totalCount} task
        {totalCount !== 1 ? 's' : ''}
      </span>
      {loading && (
        <span className="flex items-center gap-1">
          <LoaderCircle className="h-3 w-3 animate-spin" />
          Updating…
        </span>
      )}
    </div>
  )
}
