'use client'

import { useMemo, useState } from 'react'
import { format, subDays, startOfDay, endOfDay, isValid, parseISO } from 'date-fns'
import { CalendarIcon, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

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

function getMatchingPreset(range: DateRange): number | null {
  const today = endOfDay(new Date())
  const diffDays = Math.round((today.getTime() - startOfDay(range.start).getTime()) / (1000 * 60 * 60 * 24)) + 1
  const isEndToday = format(range.end, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  
  if (!isEndToday) return null
  
  const match = PRESETS.find(p => p.days === diffDays)
  return match?.days ?? null
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [error, setError] = useState<string | null>(null)

  const matchingPreset = useMemo(() => getMatchingPreset(value), [value])

  const handlePresetSelect = (days: number) => {
    onChange(getPresetRange(days))
    setIsCustomOpen(false)
    setError(null)
  }

  const handleCustomOpen = () => {
    setCustomStart(format(value.start, 'yyyy-MM-dd'))
    setCustomEnd(format(value.end, 'yyyy-MM-dd'))
    setIsCustomOpen(true)
    setError(null)
  }

  const handleApplyCustom = () => {
    const start = parseISO(customStart)
    const end = parseISO(customEnd)

    if (!isValid(start) || !isValid(end)) {
      setError('Please enter valid dates')
      return
    }

    if (start > end) {
      setError('Start date must be before end date')
      return
    }

    if (end > new Date()) {
      setError('End date cannot be in the future')
      return
    }

    onChange({ start: startOfDay(start), end: endOfDay(end) })
    setIsCustomOpen(false)
    setError(null)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-start text-left font-normal', className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{formatDateRange(value)}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {PRESETS.map((preset) => (
          <DropdownMenuItem
            key={preset.days}
            onClick={() => handlePresetSelect(preset.days)}
            className={cn(
              'cursor-pointer',
              matchingPreset === preset.days && 'bg-accent'
            )}
          >
            {preset.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {!isCustomOpen ? (
          <DropdownMenuItem onClick={handleCustomOpen} className="cursor-pointer">
            Custom range...
          </DropdownMenuItem>
        ) : (
          <div className="p-2 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="h-8"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="h-8"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCustomOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleApplyCustom} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
