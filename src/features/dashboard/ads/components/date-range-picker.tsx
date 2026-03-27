'use client'

import { useState } from 'react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { CalendarIcon, ChevronDown } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Calendar } from '@/shared/ui/calendar'
import { cn } from '@/lib/utils'

type DayPickerRange = {
  from: Date
  to: Date
}

export interface DateRange {
  start: Date
  end: Date
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const

function getPresetRange(days: number): DateRange {
  const end = endOfDay(new Date())
  const start = startOfDay(subDays(end, days - 1))
  return { start, end }
}

function formatDateRange(range: DateRange): string {
  const startStr = format(range.start, 'MMM d')
  const endStr = format(range.end, 'MMM d, yyyy')
  return `${startStr} – ${endStr}`
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const dateRange: DayPickerRange = {
    from: value.start,
    to: value.end,
  }

  const handleSelect = (range: Partial<DayPickerRange> | undefined) => {
    if (range?.from && range?.to) {
      onChange({
        start: startOfDay(range.from),
        end: endOfDay(range.to),
      })
    }
  }

  const handlePresetSelect = (days: number) => {
    onChange(getPresetRange(days))
    setOpen(false)
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-fit justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(value)}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-col gap-1 border-b p-3 sm:border-b-0 sm:border-r">
              <span className="mb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Presets
              </span>
              {PRESETS.map((preset) => (
                <Button
                  key={preset.days}
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal"
                  onClick={() => handlePresetSelect(preset.days)}
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
                disabled={(date: Date) => date > new Date()}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
