'use client'

import { cn } from '@/lib/utils'

export function ProgressOperationStepIndicator({
  status,
}: {
  status: 'pending' | 'running' | 'completed' | 'failed'
}) {
  const config = {
    pending: 'bg-muted-foreground/20',
    running: 'bg-primary animate-pulse',
    completed: 'bg-success',
    failed: 'bg-destructive',
  }

  return (
    <div className={cn('size-3.5 rounded-full', config[status])}>
      {status === 'completed' && (
        <span className="flex items-center justify-center text-success-foreground text-[8px]">✓</span>
      )}
    </div>
  )
}
