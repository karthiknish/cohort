'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'
import { TASKS_THEME } from './tasks-theme'

export function TasksPageSkeleton() {
  const taskCardSlots = ['task-1', 'task-2', 'task-3']

  return (
    <div className={TASKS_THEME.page}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <Skeleton className={cn(TASKS_THEME.summaryCard, 'h-24')} />

      <div className={TASKS_THEME.workspace}>
        <div className={cn(TASKS_THEME.rail, 'gap-4')}>
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className={TASKS_THEME.filterBar}>
          <Skeleton className="h-9 w-full max-w-md" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {['To Do', 'In Progress', 'Review', 'Done'].map((column) => (
            <div key={column} className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
              <div className="space-y-2">
                {taskCardSlots.map((slot) => (
                  <div key={slot} className="space-y-2 rounded-xl border border-border/50 bg-card p-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="size-3/4" />
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="size-6 rounded-full" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
