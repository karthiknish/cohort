'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type RefreshInterval = 'off' | '30s' | '1m' | '5m' | '15m'

const INTERVAL_OPTIONS: Array<{ value: RefreshInterval; label: string; ms: number | null }> = [
  { value: 'off', label: 'Off', ms: null },
  { value: '30s', label: '30 sec', ms: 30000 },
  { value: '1m', label: '1 min', ms: 60000 },
  { value: '5m', label: '5 min', ms: 300000 },
  { value: '15m', label: '15 min', ms: 900000 },
]

interface AutoRefreshProps {
  onRefresh: () => void | Promise<any>
  disabled?: boolean
  isRefreshing?: boolean
  className?: string
  defaultInterval?: RefreshInterval
}

export function AutoRefreshControls({
  onRefresh,
  disabled = false,
  isRefreshing = false,
  className,
  defaultInterval = 'off',
}: AutoRefreshProps) {
  const [interval, setInterval] = useState<RefreshInterval>(defaultInterval)
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const clearAutoRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
    setNextRefresh(null)
  }, [])

  const scheduleNextRefresh = useCallback(() => {
    const option = INTERVAL_OPTIONS.find((opt) => opt.value === interval)
    if (!option || !option.ms) {
      setNextRefresh(null)
      return
    }

    const next = new Date(Date.now() + option.ms)
    setNextRefresh(next)

    timeoutRef.current = setTimeout(() => {
      onRefresh()
      scheduleNextRefresh()
    }, option.ms)
  }, [interval, onRefresh])

  // Handle interval change
  const handleIntervalChange = useCallback((newInterval: RefreshInterval) => {
    clearAutoRefresh()
    setInterval(newInterval)

    if (newInterval !== 'off') {
      scheduleNextRefresh()
    }
  }, [clearAutoRefresh, scheduleNextRefresh])

  // Set up auto-refresh on mount or when interval changes
  useEffect(() => {
    if (interval !== 'off') {
      scheduleNextRefresh()
    }

    return () => clearAutoRefresh()
  }, [interval, scheduleNextRefresh, clearAutoRefresh])

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    clearAutoRefresh()
    onRefresh()
    if (interval !== 'off') {
      scheduleNextRefresh()
    }
  }, [clearAutoRefresh, onRefresh, interval, scheduleNextRefresh])

  // Calculate time remaining
  const timeRemaining = nextRefresh
    ? Math.max(0, Math.ceil((nextRefresh.getTime() - Date.now()) / 1000))
    : null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={interval} onValueChange={handleIntervalChange} disabled={disabled}>
        <SelectTrigger className="w-[110px] h-8 text-xs">
          <SelectValue placeholder="Auto-refresh" />
        </SelectTrigger>
        <SelectContent>
          {INTERVAL_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {timeRemaining !== null && interval !== 'off' && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className={cn('tabular-nums', timeRemaining < 10 && 'text-orange-500')}>
            {timeRemaining}s
          </span>
        </div>
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleManualRefresh}
        disabled={disabled || isRefreshing}
      >
        <RotateCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
      </Button>
    </div>
  )
}
