'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { RotateCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
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
  onRefresh: () => void | Promise<unknown>
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
  const [interval, setRefreshInterval] = useState<RefreshInterval>(() => defaultInterval)
  const timeoutRef = useRef<ReturnType<typeof globalThis.setInterval> | undefined>(undefined)
  const onRefreshRef = useRef(onRefresh)

  const selectedIntervalMs = INTERVAL_OPTIONS.find((opt) => opt.value === interval)?.ms ?? null

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  const clearAutoRefresh = useCallback(() => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  const startAutoRefresh = useCallback((intervalMs: number | null) => {
    clearAutoRefresh()

    if (!intervalMs) {
      return
    }

    timeoutRef.current = setInterval(() => {
      void onRefreshRef.current()
    }, intervalMs)
  }, [clearAutoRefresh])

  // Handle interval change
  const handleIntervalChange = useCallback(
    (newInterval: RefreshInterval) => {
      setRefreshInterval(newInterval)
      const intervalMs = INTERVAL_OPTIONS.find((opt) => opt.value === newInterval)?.ms ?? null
      startAutoRefresh(intervalMs)
    },
    [startAutoRefresh],
  )

  useEffect(() => {
    const initialIntervalMs = INTERVAL_OPTIONS.find((opt) => opt.value === defaultInterval)?.ms ?? null
    startAutoRefresh(initialIntervalMs)
    const intervalStore = timeoutRef
    return () => {
      if (intervalStore.current) {
        clearInterval(intervalStore.current)
        intervalStore.current = undefined
      }
    }
  }, [defaultInterval, startAutoRefresh])

  // Manual refresh handler
  const handleManualRefresh = useCallback(() => {
    onRefresh()
    startAutoRefresh(selectedIntervalMs)
  }, [onRefresh, selectedIntervalMs, startAutoRefresh])

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

      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={handleManualRefresh}
        disabled={disabled || isRefreshing}
        aria-label={isRefreshing ? 'Refreshing' : 'Refresh now'}
      >
        <RotateCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden />
      </Button>
    </div>
  )
}
