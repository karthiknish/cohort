'use client'

import { Progress } from '@/shared/ui/progress'
import { cn } from '@/lib/utils'

/**
 * Simple progress bar for inline use
 */
export function InlineProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'default',
  className,
}: {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && <span className="text-sm text-muted-foreground min-w-fit">{label}</span>}
      <div className="flex-1">
        <Progress value={percentage} className={cn({
          'h-1': size === 'sm',
          'h-2': size === 'default',
          'h-3': size === 'lg',
        })} />
      </div>
      {showPercentage && (
        <span className="text-sm text-muted-foreground min-w-fit tabular-nums">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}
