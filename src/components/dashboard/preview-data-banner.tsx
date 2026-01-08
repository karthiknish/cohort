'use client'

import { Database, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePreview } from '@/contexts/preview-context'

interface PreviewDataBannerProps {
  className?: string
}

export function PreviewDataBanner({ className }: PreviewDataBannerProps) {
  const { isPreviewMode, togglePreviewMode } = usePreview()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border transition-all duration-300',
        isPreviewMode
          ? 'border-primary/50 bg-gradient-to-r from-primary/10 via-primary/5 to-violet-500/10'
          : 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-orange-500/10',
        className
      )}
    >
      {/* Animated background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" />
      </div>

      <div className="relative flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
              isPreviewMode
                ? 'bg-primary/20 text-primary'
                : 'bg-amber-500/20 text-amber-600'
            )}
          >
            {isPreviewMode ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Database className="h-4 w-4" />
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
              'gap-2 transition-all',
              isPreviewMode
                ? 'border-primary/40 text-primary hover:bg-primary/10 hover:text-primary'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewMode ? 'Exit Preview' : 'Preview with Data'}
          </Button>
        </div>
      </div>

      {/* Preview mode indicator strip */}
      {isPreviewMode && (
        <div className="h-1 w-full bg-gradient-to-r from-primary via-violet-500 to-primary animate-pulse" />
      )}
    </div>
  )
}
