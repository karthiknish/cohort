'use client'

import { Progress } from '@/shared/ui/progress'
import type { Operation } from './progress-indicators-types'

export function MinimalProgressIndicator({ operation }: { operation: Operation }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-background rounded-lg shadow-lg border">
      {operation.status === 'running' && (
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
      {operation.status === 'completed' && (
        <div className="size-4 rounded-full bg-success flex items-center justify-center">
          <span className="text-success-foreground text-xs">✓</span>
        </div>
      )}
      {operation.status === 'failed' && (
        <div className="size-4 rounded-full bg-destructive flex items-center justify-center">
          <span className="text-destructive-foreground text-xs">✕</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{operation.name}</p>
        <div className="flex items-center gap-2">
          <Progress value={operation.progress} className="h-1 flex-1" />
          <span className="text-xs text-muted-foreground">{operation.progress}%</span>
        </div>
      </div>
    </div>
  )
}
