'use client'

import { Skeleton } from '@/shared/ui/skeleton'

import { PROJECTS_THEME } from './projects-theme'

export function ProjectsPageSkeleton() {
  const summarySlots = ['sum-1', 'sum-2', 'sum-3', 'sum-4']
  const pillSlots = ['pill-1', 'pill-2', 'pill-3', 'pill-4', 'pill-5']
  const rowSlots = ['row-1', 'row-2', 'row-3', 'row-4']

  return (
    <div className={PROJECTS_THEME.page}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-48 rounded-lg" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className={PROJECTS_THEME.summaryStrip}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summarySlots.map((slot) => (
            <Skeleton key={slot} className="h-[5.5rem] rounded-xl" />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pillSlots.map((slot) => (
          <Skeleton key={slot} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <div className={PROJECTS_THEME.workspace}>
        <div className={PROJECTS_THEME.workspaceRail}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="flex w-full max-w-xl gap-2">
            <Skeleton className="h-9 flex-1 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
            <Skeleton className="size-9 rounded-md" />
          </div>
        </div>
        <div className="space-y-3 p-4">
          {rowSlots.map((slot) => (
            <Skeleton key={slot} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
