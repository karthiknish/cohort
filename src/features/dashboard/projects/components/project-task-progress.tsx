'use client'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import type { ProjectRecord } from '@/types/projects'

import { formatTaskSummary } from './utils'

type ProjectTaskProgressProps = {
  project: Pick<ProjectRecord, 'openTaskCount' | 'taskCount'>
  className?: string
}

export function ProjectTaskProgress({ project, className }: ProjectTaskProgressProps) {
  const total = project.taskCount
  const open = project.openTaskCount
  const closed = Math.max(total - open, 0)
  const progress = total > 0 ? Math.round((closed / total) * 100) : 0
  const progressStyle = useMemo(() => ({ width: `${progress}%` }), [progress])

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-medium">{formatTaskSummary(open, total)}</span>
        {total > 0 ? (
          <span className="tabular-nums text-[10px] font-semibold text-muted-foreground/70">{progress}% done</span>
        ) : null}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50 ring-1 ring-border/30">
        <div
          className="h-full rounded-full bg-linear-to-r from-primary/70 to-primary motion-chromatic"
          style={progressStyle}
        />
      </div>
    </div>
  )
}
