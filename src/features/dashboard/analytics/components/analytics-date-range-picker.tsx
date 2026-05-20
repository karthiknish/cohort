'use client'

import { useCallback, useMemo, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'
import { format, subDays, differenceInDays, startOfDay, endOfDay } from 'date-fns'
import { CalendarIcon, ChevronDown, X } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Calendar } from '@/shared/ui/calendar'

type DayPickerRange = {
  from: Date
  to: Date
}

export interface AnalyticsDateRange {
  start: Date
  end: Date
}

type PeriodValue = '7d' | '14d' | '30d' | '90d' | 'custom'

const PERIOD_OPTIONS: Array<{ value: PeriodValue; label: string; days: number }> = [
  { value: '7d', label: 'Last 7 days', days: 7 },
  { value: '14d', label: 'Last 14 days', days: 14 },
  { value: '30d', label: 'Last 30 days', days: 30 },
  { value: '90d', label: 'Last 90 days', days: 90 },
  { value: 'custom', label: 'Custom range', days: 0 },
]

function getPresetRange(days: number): AnalyticsDateRange {
  const end = endOfDay(new Date())
  const start = startOfDay(subDays(end, days - 1))
  return { start, end }
}

function formatDateRange(range: AnalyticsDateRange): string {
  const startStr = format(range.start, 'MMM d')
  const endStr = format(range.end, 'MMM d, yyyy')
  return `${startStr} – ${endStr}`
}

function QuickPresetButton({
  onSelect,
  preset,
}: {
  onSelect: (days: number) => void
  preset: { days: number; label: string }
}) {
  const handleClick = useCallback(() => {
    onSelect(preset.days)
  }, [onSelect, preset.days])

  return (
    <Button variant="ghost" size="sm" className="justify-start font-normal" onClick={handleClick}>
      {preset.label}
    </Button>
  )
}

interface AnalyticsDateRangePickerProps {
  value: AnalyticsDateRange
  onChange: (range: AnalyticsDateRange, days?: number) => void
  className?: string
}

export function AnalyticsDateRangePicker({
  value,
  onChange,
  className,
}: AnalyticsDateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const maxDisabledDate = useMemo(() => new Date(), [])
  const minDisabledDate = useMemo(
    () => new Date(maxDisabledDate.getTime() - 365 * 24 * 60 * 60 * 1000),
    [maxDisabledDate],
  )

  const currentDays = useMemo(() => differenceInDays(value.end, value.start) + 1, [value])

  const currentPreset: PeriodValue = useMemo(() => {
    if (currentDays === 7) return '7d'
    if (currentDays === 14) return '14d'
    if (currentDays === 30) return '30d'
    if (currentDays === 90) return '90d'
    return 'custom'
  }, [currentDays])

  const dateRange = useMemo<DayPickerRange>(
    () => ({
      from: value.start,
      to: value.end,
    }),
    [value.start, value.end],
  )

  const handleSelect = useCallback(
    (range: Partial<DayPickerRange> | undefined) => {
      if (range?.from && range?.to) {
        const newRange: AnalyticsDateRange = {
          start: startOfDay(range.from),
          end: endOfDay(range.to),
        }
        const days = differenceInDays(newRange.end, newRange.start) + 1
        onChange(newRange, days)
      }
    },
    [onChange],
  )

  const handlePresetSelect = useCallback(
    (period: PeriodValue) => {
      if (period === 'custom') return
      const option = PERIOD_OPTIONS.find((opt) => opt.value === period)
      if (option) {
        onChange(getPresetRange(option.days), option.days)
        setOpen(false)
      }
    },
    [onChange],
  )

  const handleClearCustom = useCallback(() => {
    onChange(getPresetRange(30), 30)
  }, [onChange])

  const handlePresetChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      handlePresetSelect(event.target.value as PeriodValue)
    },
    [handlePresetSelect],
  )

  const handleClearClick = useCallback(
    (event: MouseEvent<SVGElement>) => {
      event.stopPropagation()
      handleClearCustom()
    },
    [handleClearCustom],
  )

  const handleQuickPresetClick = useCallback(
    (days: number) => {
      onChange(getPresetRange(days), days)
      setOpen(false)
    },
    [onChange],
  )

  const handleDisabledDate = useCallback(
    (date: Date) => date > maxDisabledDate || date < minDisabledDate,
    [maxDisabledDate, minDisabledDate],
  )

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="relative">
        <select
          value={currentPreset}
          onChange={handlePresetChange}
          aria-label="Analytics date range"
          className={cn(
            DASHBOARD_THEME.inputs.base,
            'h-9 min-w-[9.5rem] cursor-pointer appearance-none py-2 pr-9 text-sm font-medium text-foreground',
          )}
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {currentPreset === 'custom' ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-9 justify-start text-left font-normal',
                !value && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(value)}
              <X
                className="ml-2 h-3 w-3 opacity-50 hover:opacity-100"
                onClick={handleClearClick}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex flex-col sm:flex-row">
              <div className="flex flex-col gap-1 border-b p-3 sm:border-b-0 sm:border-r">
                <span className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Quick select
                </span>
                {PERIOD_OPTIONS.filter((p) => p.value !== 'custom').map((preset) => (
                  <QuickPresetButton key={preset.days} preset={preset} onSelect={handleQuickPresetClick} />
                ))}
              </div>
              <div className="p-1">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={handleSelect}
                  numberOfMonths={2}
                  disabled={handleDisabledDate}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}
