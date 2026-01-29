'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Minimize2, Maximize2, Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type OperationStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

export interface Operation {
  id: string
  name: string
  description?: string
  status: OperationStatus
  progress: number
  total?: number
  current?: number
  startTime?: number
  endTime?: number
  error?: string
  steps?: Array<{
    name: string
    status: 'pending' | 'running' | 'completed' | 'failed'
    timestamp?: number
  }>
  onPause?: () => void
  onResume?: () => void
  onCancel?: () => void
  onRetry?: () => void
}

interface ProgressIndicatorsProps {
  operations: Operation[]
  onDismiss?: (operationId: string) => void
  onDismissAll?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  position?: 'top-right' | 'top-center' | 'bottom-right'
}

/**
 * Progress indicators for long-running operations
 * Supports batch operations, multi-step processes, and pause/resume
 */
export function ProgressIndicators({
  operations,
  onDismiss,
  onDismissAll,
  className,
  variant = 'default',
  position = 'top-right',
}: ProgressIndicatorsProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [collapsedOps, setCollapsedOps] = useState<Set<string>>(new Set())

  const activeOperations = operations.filter((op) =>
    ['pending', 'running', 'paused'].includes(op.status)
  )
  const completedOperations = operations.filter((op) =>
    ['completed', 'failed', 'cancelled'].includes(op.status)
  )

  const toggleCollapsed = useCallback((opId: string) => {
    setCollapsedOps((prev) => {
      const next = new Set(prev)
      if (next.has(opId)) {
        next.delete(opId)
      } else {
        next.add(opId)
      }
      return next
    })
  }, [])

  if (variant === 'minimal') {
    return (
      <div className={cn('fixed top-4 right-4 z-50 flex flex-col gap-2', className)}>
        {activeOperations.map((op) => (
          <MinimalProgressIndicator key={op.id} operation={op} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 max-w-md w-full',
        {
          'top-4 right-4': position === 'top-right',
          'top-4 left-1/2 -translate-x-1/2': position === 'top-center',
          'bottom-4 right-4': position === 'bottom-right',
        },
        className
      )}
    >
      {/* Header */}
      {activeOperations.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <CardTitle className="text-sm">
                {activeOperations.length} operation{activeOperations.length !== 1 ? 's' : ''} in progress
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              {onDismissAll && activeOperations.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={onDismissAll}
                >
                  Dismiss All
                </Button>
              )}
            </div>
          </CardHeader>

          {isExpanded && (
            <CardContent className="pt-0 px-4 pb-4 space-y-3">
              {activeOperations.map((op) => (
                <OperationItem
                  key={op.id}
                  operation={op}
                  isCollapsed={collapsedOps.has(op.id)}
                  onToggleCollapse={() => toggleCollapsed(op.id)}
                  onDismiss={() => onDismiss?.(op.id)}
                />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Completed operations (auto-dismiss after delay) */}
      {completedOperations.length > 0 && variant !== 'compact' && (
        <div className="space-y-2">
          {completedOperations.slice(0, 3).map((op) => (
            <CompletedOperationItem
              key={op.id}
              operation={op}
              onDismiss={() => onDismiss?.(op.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface OperationItemProps {
  operation: Operation
  isCollapsed: boolean
  onToggleCollapse: () => void
  onDismiss: () => void
}

function OperationItem({
  operation,
  isCollapsed,
  onToggleCollapse,
  onDismiss,
}: OperationItemProps) {
  const statusColors = {
    pending: 'text-muted-foreground',
    running: 'text-primary',
    paused: 'text-amber-600',
    completed: 'text-emerald-600',
    failed: 'text-red-600',
    cancelled: 'text-muted-foreground',
  }

  const statusBadges: Record<OperationStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    running: { variant: 'default', label: 'Running' },
    paused: { variant: 'outline', label: 'Paused' },
    completed: { variant: 'outline', label: 'Completed' },
    failed: { variant: 'destructive', label: 'Failed' },
    cancelled: { variant: 'secondary', label: 'Cancelled' },
  }

  const progressText =
    operation.total && operation.current
      ? `${operation.current} of ${operation.total}`
      : `${operation.progress}%`

  return (
    <div className="space-y-2 p-3 rounded-lg bg-muted/50">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Badge variant={statusBadges[operation.status].variant} className="shrink-0">
            {statusBadges[operation.status].label}
          </Badge>
          <span className="text-sm font-medium truncate">{operation.name}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {operation.status === 'running' && operation.onPause && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={operation.onPause}
              title="Pause"
            >
              <Pause className="h-3.5 w-3.5" />
            </Button>
          )}
          {operation.status === 'paused' && operation.onResume && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={operation.onResume}
              title="Resume"
            >
              <Play className="h-3.5 w-3.5" />
            </Button>
          )}
          {operation.status === 'failed' && operation.onRetry && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={operation.onRetry}
              title="Retry"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
          {operation.onCancel && ['running', 'pending', 'paused'].includes(operation.status) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={operation.onCancel}
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{progressText}</span>
          {operation.startTime && operation.status !== 'pending' && (
            <span>{getElapsedTime(operation.startTime, operation.endTime)}</span>
          )}
        </div>
        <Progress value={operation.progress} className="h-2" />
      </div>

      {/* Expanded details */}
      {!isCollapsed && (
        <div className="space-y-2 pt-2 border-t">
          {operation.description && (
            <p className="text-xs text-muted-foreground">{operation.description}</p>
          )}

          {/* Steps */}
          {operation.steps && operation.steps.length > 0 && (
            <div className="space-y-1">
              {operation.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <StepIndicator status={step.status} />
                  <span
                    className={cn(
                      step.status === 'completed' && 'text-muted-foreground line-through',
                      step.status === 'failed' && 'text-red-600',
                      step.status === 'running' && 'font-medium'
                    )}
                  >
                    {step.name}
                  </span>
                  {step.timestamp && (
                    <span className="text-muted-foreground ml-auto">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error message */}
          {operation.status === 'failed' && operation.error && (
            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
              {operation.error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

interface CompletedOperationItemProps {
  operation: Operation
  onDismiss: () => void
}

function CompletedOperationItem({ operation, onDismiss }: CompletedOperationItemProps) {
  useEffect(() => {
    // Auto-dismiss completed operations after 5 seconds
    if (operation.status === 'completed') {
      const timer = setTimeout(onDismiss, 5000)
      return () => clearTimeout(timer)
    }
  }, [operation.status, onDismiss])

  const statusConfig = {
    completed: { icon: '✓', className: 'bg-emerald-500 text-white' },
    failed: { icon: '✕', className: 'bg-red-500 text-white' },
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
        className="h-7 w-7 shrink-0"
        onClick={onDismiss}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

interface MinimalProgressIndicatorProps {
  operation: Operation
}

function MinimalProgressIndicator({ operation }: MinimalProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-background rounded-lg shadow-lg border">
      {operation.status === 'running' && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
      {operation.status === 'completed' && (
        <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      {operation.status === 'failed' && (
        <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
          <span className="text-white text-xs">✕</span>
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

function StepIndicator({ status }: { status: 'pending' | 'running' | 'completed' | 'failed' }) {
  const config = {
    pending: 'bg-muted-foreground/20',
    running: 'bg-primary animate-pulse',
    completed: 'bg-emerald-500',
    failed: 'bg-red-500',
  }

  return (
    <div className={cn('h-3.5 w-3.5 rounded-full', config[status])}>
      {status === 'completed' && (
        <span className="flex items-center justify-center text-white text-[8px]">✓</span>
      )}
    </div>
  )
}

function getElapsedTime(startTime: number, endTime?: number): string {
  const end = endTime ?? Date.now()
  const elapsed = end - startTime

  if (elapsed < 1000) return `${elapsed}ms`
  if (elapsed < 60000) return `${Math.floor(elapsed / 1000)}s`
  if (elapsed < 3600000) return `${Math.floor(elapsed / 60000)}m ${Math.floor((elapsed % 60000) / 1000)}s`

  const hours = Math.floor(elapsed / 3600000)
  const minutes = Math.floor((elapsed % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

/**
 * Hook for managing progress operations
 */
export function useProgressOperations() {
  const [operations, setOperations] = useState<Operation[]>([])

  const addOperation = useCallback((operation: Omit<Operation, 'id' | 'startTime'>) => {
    const id = Math.random().toString(36).substring(7)
    setOperations((prev) => [
      ...prev,
      { ...operation, id, startTime: Date.now(), progress: operation.progress ?? 0 },
    ])
    return id
  }, [])

  const updateOperation = useCallback((id: string, updates: Partial<Operation>) => {
    setOperations((prev) =>
      prev.map((op) => (op.id === id ? { ...op, ...updates } : op))
    )
  }, [])

  const removeOperation = useCallback((id: string) => {
    setOperations((prev) => prev.filter((op) => op.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setOperations((prev) => prev.filter((op) => ['pending', 'running', 'paused'].includes(op.status)))
  }, [])

  return {
    operations,
    addOperation,
    updateOperation,
    removeOperation,
    dismissAll,
  }
}

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

/**
 * Step progress indicator showing numbered steps
 */
export function StepProgress({
  steps,
  currentStep,
  className,
}: {
  steps: Array<{ id: string; label: string }>
  currentStep: number
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {steps.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-1">
          {/* Step circle */}
          <div
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0',
              idx < currentStep
                ? 'bg-primary text-primary-foreground'
                : idx === currentStep
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {idx < currentStep ? '✓' : idx + 1}
          </div>

          {/* Step label */}
          {step.label && (
            <span
              className={cn(
                'ml-2 text-sm',
                idx <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          )}

          {/* Connector line */}
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2',
                idx < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
