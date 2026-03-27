'use client'

import { useCallback, useMemo } from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/shared/ui/use-toast'

export type MessagePriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

interface PriorityConfig {
  value: MessagePriority
  label: string
  color: string
  icon: string
}

const PRIORITY_CONFIGS: Record<MessagePriority, PriorityConfig> = {
  none: { value: 'none', label: 'No Priority', color: '', icon: '🏳️' },
  low: { value: 'low', label: 'Low', color: 'bg-secondary text-secondary-foreground border-secondary/40', icon: '🔵' },
  medium: { value: 'medium', label: 'Medium', color: 'bg-accent text-accent-foreground border-accent/40', icon: '🟡' },
  high: { value: 'high', label: 'High', color: 'bg-primary/10 text-primary border-primary/20', icon: '🟠' },
  urgent: { value: 'urgent', label: 'Urgent', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: '🔴' },
}

const PRIORITY_OPTIONS = Object.values(PRIORITY_CONFIGS)
const PRIORITY_FILTER_OPTIONS: Array<{ value: MessagePriority; label: string; color: string }> = [
  { value: 'urgent', label: 'Urgent', color: 'bg-destructive' },
  { value: 'high', label: 'High', color: 'bg-primary' },
  { value: 'medium', label: 'Medium', color: 'bg-accent' },
  { value: 'low', label: 'Low', color: 'bg-secondary' },
]

interface MessagePriorityBadgeProps {
  priority: MessagePriority
  className?: string
}

/**
 * Badge showing message priority
 */
export function MessagePriorityBadge({ priority, className }: MessagePriorityBadgeProps) {
  const config = PRIORITY_CONFIGS[priority]

  if (priority === 'none') return null

  return (
    <Badge variant="outline" className={cn('gap-1', config.color, className)}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  )
}

interface MessagePrioritySelectorProps {
  priority: MessagePriority
  onPriorityChange: (priority: MessagePriority) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  variant?: 'button' | 'dropdown'
  className?: string
}

/**
 * Component for selecting/changing message priority
 */
export function MessagePrioritySelector({
  priority,
  onPriorityChange,
  disabled = false,
  size = 'md',
  variant = 'dropdown',
  className,
}: MessagePrioritySelectorProps) {
  const { toast } = useToast()
  const config = PRIORITY_CONFIGS[priority]

  const handlePriorityChange = useCallback(
    (newPriority: MessagePriority) => {
      onPriorityChange(newPriority)
      const newConfig = PRIORITY_CONFIGS[newPriority]
      toast({
        title: `Priority changed to ${newConfig.label}`,
        description: newPriority !== 'none' ? 'This message will appear more prominently.' : undefined,
      })
    },
    [onPriorityChange, toast]
  )

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
  }

  const priorityButtonHandlers = useMemo(
    () =>
      Object.fromEntries(
        PRIORITY_OPTIONS.map((p) => [p.value, () => handlePriorityChange(p.value)])
      ) as Record<MessagePriority, () => void>,
    [handlePriorityChange]
  )

  if (variant === 'button') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn('gap-2', className)}
            disabled={disabled}
          >
            <Flag
              className={cn(
                'h-4 w-4',
                priority === 'none' && 'text-muted-foreground',
                priority === 'low' && 'text-secondary-foreground',
                priority === 'medium' && 'text-accent-foreground',
                priority === 'high' && 'text-primary',
                priority === 'urgent' && 'text-destructive'
              )}
            />
            {config.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {PRIORITY_OPTIONS.map((p) => (
            <DropdownMenuItem
              key={p.value}
              onClick={priorityButtonHandlers[p.value]}
            >
              <span className="mr-2">{p.icon}</span>
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className={cn(sizeClasses[size], className)}
                disabled={disabled}
              >
                {priority === 'none' ? (
                  <Flag className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Flag
                    className={cn(
                      'h-4 w-4 fill-current',
                      priority === 'low' && 'text-secondary-foreground',
                      priority === 'medium' && 'text-accent-foreground',
                      priority === 'high' && 'text-primary',
                      priority === 'urgent' && 'text-destructive'
                    )}
                  />
                )}
                <span className="sr-only">Set priority</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {priority === 'none' ? 'Set priority' : `Priority: ${config.label}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-40">
        {Object.values(PRIORITY_CONFIGS).map((p) => (
          <DropdownMenuItem
            key={p.value}
            onClick={priorityButtonHandlers[p.value]}
          >
            <span className="mr-2">{p.icon}</span>
            {p.label}
            {priority === p.value && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface PriorityFilterProps {
  selected: MessagePriority[]
  onChange: (priorities: MessagePriority[]) => void
  className?: string
}

/**
 * Filter for showing messages by priority
 */
export function PriorityFilter({ selected, onChange, className }: PriorityFilterProps) {
  const toggle = useCallback((value: MessagePriority) => {
    if (selected.includes(value)) {
      onChange(selected.filter((p) => p !== value))
    } else {
      onChange([...selected, value])
    }
  }, [onChange, selected])

  const optionClickHandlers = useMemo(
    () =>
      Object.fromEntries(
        PRIORITY_FILTER_OPTIONS.map((option) => [option.value, () => toggle(option.value)])
      ) as Record<MessagePriority, () => void>,
    [toggle]
  )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground">Priority:</span>
      {PRIORITY_FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={optionClickHandlers[option.value]}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors',
            selected.includes(option.value)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-muted/70'
          )}
        >
          <span className={cn('h-2 w-2 rounded-full', option.color)} />
          {option.label}
        </button>
      ))}
    </div>
  )
}

interface UrgentMessageBannerProps {
  message: string
  priority: MessagePriority
  onDismiss?: () => void
  className?: string
}

/**
 * Banner shown for urgent/high priority messages
 */
export function PriorityMessageBanner({
  message,
  priority,
  onDismiss,
  className,
}: UrgentMessageBannerProps) {
  const config = PRIORITY_CONFIGS[priority]

  if (priority === 'none' || priority === 'low') return null

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border',
        priority === 'urgent' && 'bg-destructive/10 border-destructive/30 text-destructive',
        priority === 'high' && 'bg-warning/10 border-warning/30 text-warning',
        priority === 'medium' && 'bg-info/10 border-info/30 text-info',
        className
      )}
    >
      <span className="text-lg">{config.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{config.label} Priority</p>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm opacity-70 hover:opacity-100"
        >
          Dismiss
        </button>
      )}
    </div>
  )
}
