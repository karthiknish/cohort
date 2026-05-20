'use client'

import { BriefcaseBusiness, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'

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
    <div className="mx-4 flex items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-3 py-2 text-sm">
      <span className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
        <BriefcaseBusiness className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">
          Project: <span className="font-medium text-foreground">{projectName ?? 'Selected'}</span>
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 gap-1 px-2 text-xs"
        onClick={onClear}
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Clear
      </Button>
    </div>
  )
}
