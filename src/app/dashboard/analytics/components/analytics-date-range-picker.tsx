'use client'

import { useState, useMemo } from 'react'
import { format, subDays, differenceInDays, startOfDay, endOfDay } from 'date-fns'
import { CalendarIcon, ChevronDown, X } from 'lucide-react'
import { DateRange as DayPickerRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { DateRange } from '@/app/dashboard/ads/components/date-range-picker'

export interface AnalyticsDateRange {
  start: Date
  end: Date
}

type PeriodValue = '7d' | '14d' | '30d' | '90d' | 'custom'

const PERIOD_OPTIONS: Array<{ value: PeriodValue; label: string; days: number }> = [
  { value: '7d', label: '7 days', days: 7 },
  { value: '14d', label: '14 days', days: 14 },
  { value: '30d', label: '30 days', days: 30 },
  { value: '90d', label: '90 days', days: 90 },
  { value: 'custom', label: 'Custom', days: 0 },
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

  // Calculate current days in range
  const currentDays = useMemo(() => {
    return differenceInDays(value.end, value.start) + 1
  }, [value])

  // Determine current preset based on days
  const currentPreset: PeriodValue = useMemo(() => {
    if (currentDays === 7) return '7d'
    if (currentDays === 14) return '14d'
    if (currentDays === 30) return '30d'
    if (currentDays === 90) return '90d'
    return 'custom'
  }, [currentDays])

  const dateRange: DayPickerRange = {
    from: value.start,
    to: value.end,
  }

  const handleSelect = (range: DayPickerRange | undefined) => {
    if (range?.from && range?.to) {
      const newRange: AnalyticsDateRange = {
        start: startOfDay(range.from),
        end: endOfDay(range.to),
      }
      const days = differenceInDays(newRange.end, newRange.start) + 1
      onChange(newRange, days)
    }
  }

  const handlePresetSelect = (period: PeriodValue) => {
    if (period === 'custom') {
      // Keep popover open for custom selection
      return
    }
    const option = PERIOD_OPTIONS.find((opt) => opt.value === period)
    if (option) {
      onChange(getPresetRange(option.days), option.days)
      setOpen(false)
    }
  }

  const handleClearCustom = () => {
    onChange(getPresetRange(30), 30)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Preset Selector */}
      <div className="relative group">
        <div className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-primary/40 opacity-0 transition-opacity group-focus-within:opacity-100" />
        <select
          value={currentPreset}
          onChange={(e) => handlePresetSelect(e.target.value as PeriodValue)}
          className="block w-full min-w-[140px] cursor-pointer appearance-none rounded-xl border border-muted/30 bg-background px-4 py-2.5 pr-10 text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:border-primary/40 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/5"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Custom Date Range Picker - only show when custom is selected */}
      {currentPreset === 'custom' && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange(value)}
              <X
                className="ml-2 h-3 w-3 opacity-50 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearCustom()
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex flex-col sm:flex-row">
              <div className="flex flex-col gap-1 border-b p-3 sm:border-b-0 sm:border-r">
                <span className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quick Select
                </span>
                {PERIOD_OPTIONS.filter((p) => p.value !== 'custom').map((preset) => (
                  <Button
                    key={preset.days}
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal"
                    onClick={() => {
                      onChange(getPresetRange(preset.days), preset.days)
                      setOpen(false)
                    }}
                  >
                    {preset.label}
                  </Button>
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
                  disabled={(date: Date) => date > new Date() || date < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
