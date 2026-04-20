'use client'

import { Database, Eye } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { isScreenRecordingModeEnabled } from '@/lib/preview-data'
import { cn } from '@/lib/utils'
import { usePreview } from '@/shared/contexts/preview-context'

interface PreviewDataBannerProps {
  className?: string
}

export function PreviewDataBanner({ className }: PreviewDataBannerProps) {
  const { isPreviewMode, togglePreviewMode } = usePreview()

  if (isScreenRecordingModeEnabled()) {
    return null
  }

  return (
    <div
      role="region"
      aria-label={isPreviewMode ? 'Preview mode' : 'Sample data banner'}
      className={cn(
        'relative overflow-hidden rounded-lg border motion-chromatic-lg',
        isPreviewMode
          ? 'border-warning/30 bg-warning/8'
          : 'border-warning/20 bg-warning/6',
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,hsl(var(--foreground)/0.1)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" />
      </div>

      <div className="relative flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              isPreviewMode
                ? 'bg-warning/15 text-warning'
                : 'bg-warning/10 text-warning'
            )}
          >
            {isPreviewMode ? (
              <Eye className="h-4 w-4" aria-hidden />
            ) : (
              <Database className="h-4 w-4" aria-hidden />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isPreviewMode ? 'Preview Mode Active' : 'Sample Data Available'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isPreviewMode
                ? 'Viewing demo data to preview how the dashboard looks when fully populated'
                : 'Click to see how this dashboard looks with sample data'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isPreviewMode ? 'outline' : 'default'}
            onClick={togglePreviewMode}
            className={cn(
              'gap-2 motion-chromatic',
              isPreviewMode
                ? 'border-warning/30 text-warning hover:bg-warning/10 hover:text-warning'
                : 'border-warning/30 bg-warning text-warning-foreground hover:bg-warning/90'
            )}
          >
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {isPreviewMode ? 'Exit Preview' : 'Preview with Data'}
          </Button>
        </div>
      </div>

      {/* Preview mode indicator strip */}
      {isPreviewMode && (
        <div className="h-1 w-full animate-pulse bg-warning/70" />
      )}
    </div>
  )
}
