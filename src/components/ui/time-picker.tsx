'use client'

import { useMemo } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type TimePickerProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  minuteStep?: number
  className?: string
  id?: string
}

function parseTimeValue(value: string | null | undefined) {
  const match = /^(?:([01][0-9]|2[0-3])):([0-5][0-9])$/.exec(value ?? '')
  if (!match) {
    return { hour24: 9, minute: 0 }
  }

  return {
    hour24: Number(match[1]),
    minute: Number(match[2]),
  }
}

function to12HourParts(hour24: number) {
  const period = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 || 12
  return { hour12, period }
}

function to24Hour(hour12: number, period: 'AM' | 'PM') {
  const normalizedHour = hour12 % 12
  return period === 'PM' ? normalizedHour + 12 : normalizedHour
}

function formatTimeValue(hour24: number, minute: number) {
  return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  minuteStep = 15,
  className,
  id,
}: TimePickerProps) {
  const { hour24, minute } = parseTimeValue(value)
  const { hour12, period } = to12HourParts(hour24)

  const minuteOptions = useMemo(() => {
    const normalizedStep = Number.isFinite(minuteStep) && minuteStep > 0 ? Math.min(60, minuteStep) : 15
    const options = new Set<number>()

    for (let currentMinute = 0; currentMinute < 60; currentMinute += normalizedStep) {
      options.add(currentMinute)
    }

    options.add(minute)
    return Array.from(options).sort((left, right) => left - right)
  }, [minute, minuteStep])

  const hourValue = String(hour12)
  const minuteValue = minute.toString().padStart(2, '0')

  return (
    <div id={id} className={cn('grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2', className)}>
      <Select
        value={hourValue}
        onValueChange={(nextHour) => onChange(formatTimeValue(to24Hour(Number(nextHour), period as 'AM' | 'PM'), minute))}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Hour" className="min-w-0">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, index) => index + 1).map((hourOption) => (
            <SelectItem key={hourOption} value={String(hourOption)}>
              {hourOption}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={minuteValue}
        onValueChange={(nextMinute) => onChange(formatTimeValue(hour24, Number(nextMinute)))}
        disabled={disabled}
      >
        <SelectTrigger aria-label="Minutes" className="min-w-0">
          <SelectValue placeholder="Minutes" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((minuteOption) => {
            const optionValue = minuteOption.toString().padStart(2, '0')
            return (
              <SelectItem key={optionValue} value={optionValue}>
                {optionValue}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <Select
        value={period}
        onValueChange={(nextPeriod) => onChange(formatTimeValue(to24Hour(hour12, nextPeriod as 'AM' | 'PM'), minute))}
        disabled={disabled}
      >
        <SelectTrigger aria-label="AM or PM" className="w-[88px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}