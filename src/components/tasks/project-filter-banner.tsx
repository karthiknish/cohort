'use client'

import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isFeatureEnabled } from '@/lib/features'

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
    <div className="mx-4 mb-3 mt-2 flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary">
      <span className="font-medium">
        Showing tasks for {projectName ?? 'selected project'}
      </span>
      <div className="flex items-center gap-2">
        {isFeatureEnabled('BIDIRECTIONAL_NAV') && projectId && (
          <Button asChild variant="outline" size="sm" className="h-6 text-xs">
            <Link
              href={`/dashboard/projects?projectId=${projectId}&projectName=${encodeURIComponent(projectName || '')}`}
            >
              View Project
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-primary hover:text-primary"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear project filter</span>
        </Button>
      </div>
    </div>
  )
}
