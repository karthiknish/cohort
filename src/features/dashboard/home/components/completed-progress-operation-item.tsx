'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import type { Operation } from './progress-indicators-types'

export function CompletedProgressOperationItem({
  operation,
  onDismiss,
}: {
  operation: Operation
  onDismiss: () => void
}) {
  useEffect(() => {
    if (operation.status === 'completed') {
      const timer = setTimeout(onDismiss, 5000)
      return () => clearTimeout(timer)
    }

    return undefined
  }, [operation.status, onDismiss])

  const statusConfig = {
    completed: { icon: '✓', className: 'bg-success text-success-foreground' },
    failed: { icon: '✕', className: 'bg-destructive text-destructive-foreground' },
    cancelled: { icon: '−', className: 'bg-muted text-muted-foreground' },
  }

  const config = statusConfig[operation.status as keyof typeof statusConfig]

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg shadow-lg animate-in slide-in-from-top-2',
        config.className
      )}
    >
      <span className="font-bold">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{operation.name}</p>
        {operation.description && (
          <p className="text-xs opacity-80 truncate">{operation.description}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        onClick={onDismiss}
        aria-label={`Dismiss ${operation.name}`}
      >
        <X className="size-3.5" aria-hidden />
      </Button>
    </div>
  )
}
