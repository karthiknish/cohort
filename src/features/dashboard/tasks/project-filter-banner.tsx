'use client'

import { BriefcaseBusiness, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { TASKS_THEME } from './tasks-theme'

export type ProjectFilterBannerProps = {
  projectId: string | null
  projectName: string | null
  onClear: () => void
}

export function ProjectFilterBanner({
  projectId,
  projectName,
  onClear,
}: ProjectFilterBannerProps) {
  if (!projectId && !projectName) return null

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-2">
      <span className={TASKS_THEME.projectPill}>
        <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
        <span className="truncate">
          Project <span className="font-semibold">{projectName ?? 'Selected'}</span>
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Clear
      </Button>
    </div>
  )
}
