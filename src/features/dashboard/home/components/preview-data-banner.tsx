'use client'

import { Database, Eye } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import { usePreview } from '@/shared/contexts/preview-context'

interface PreviewDataBannerProps {
  className?: string
}

export function PreviewDataBanner({ className }: PreviewDataBannerProps) {
  const { isPreviewMode, togglePreviewMode } = usePreview()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
          isPreviewMode
          ? 'border-info/20 bg-gradient-to-r from-info/10 via-info/5 to-success/10'
          : 'border-warning/20 bg-gradient-to-r from-warning/10 via-warning/5 to-info/10',
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
                ? 'bg-info/10 text-info'
                : 'bg-warning/10 text-warning'
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
              'gap-2 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]',
              isPreviewMode
                ? 'border-info/20 text-info hover:bg-info/10 hover:text-info'
                : 'bg-gradient-to-r from-warning to-info hover:from-warning/90 hover:to-info/90 text-warning-foreground border-0'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            {isPreviewMode ? 'Exit Preview' : 'Preview with Data'}
          </Button>
        </div>
      </div>

      {/* Preview mode indicator strip */}
      {isPreviewMode && (
        <div className="h-1 w-full animate-pulse bg-gradient-to-r from-info via-success to-info" />
      )}
    </div>
  )
}
