'use client'

import { Repeat, Calendar, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RecurrenceRule } from '@/types/tasks'
import { formatRecurrenceLabel } from './task-types'

type RecurrenceEditorProps = {
  value: RecurrenceRule
  endDate: string | null
  onChange: (rule: RecurrenceRule, endDate: string | null) => void
  disabled?: boolean
  showLabel?: boolean
}

export function RecurrenceEditor({
  value,
  endDate,
  onChange,
  disabled = false,
  showLabel = true,
}: RecurrenceEditorProps) {
  return (
    <div className="space-y-3">
      {showLabel && (
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm">Repeat</Label>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Select
          value={value}
          disabled={disabled}
          onValueChange={(v) => onChange(v as RecurrenceRule, endDate)}
        >
          <SelectTrigger className={cn('flex-1', value !== 'none' && 'border-primary/50')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Does not repeat</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Every 2 weeks</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>

        {value !== 'none' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {endDate ? 'End date set' : 'Set end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              <div className="space-y-2">
                <Label className="text-xs">Repeat until (optional)</Label>
                <Input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => onChange(value, e.target.value || null)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {endDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(value, null)}
                    className="w-full h-7 text-xs"
                  >
                    Remove end date
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {value !== 'none' && (
        <div className="flex items-start gap-2 p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-md text-xs text-blue-700 dark:text-blue-300">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>
            New tasks will be created automatically based on this recurrence pattern.
            {endDate && ` Recurring until ${new Date(endDate).toLocaleDateString()}.`}
          </p>
        </div>
      )}
    </div>
  )
}

// Recurrence badge for display
export function RecurrenceBadge({
  rule,
  endDate,
  className,
}: {
  rule: RecurrenceRule
  endDate?: string | null
  className?: string
}) {
  if (rule === 'none') return null

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 bg-green-50/50 text-green-600 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800',
        className
      )}
    >
      <Repeat className="h-2.5 w-2.5" />
      {formatRecurrenceLabel(rule)}
    </Badge>
  )
}

// Calculate next occurrence date
export function getNextOccurrence(
  dueDate: string,
  rule: RecurrenceRule,
  endDate?: string | null
): Date | null {
  if (rule === 'none' || !dueDate) return null

  const baseDate = new Date(dueDate)
  const now = new Date()
  const end = endDate ? new Date(endDate) : null

  // Find next occurrence after today
  let next = new Date(baseDate)
  while (next <= now) {
    switch (rule) {
      case 'daily':
        next.setDate(next.getDate() + 1)
        break
      case 'weekly':
        next.setDate(next.getDate() + 7)
        break
      case 'biweekly':
        next.setDate(next.getDate() + 14)
        break
      case 'monthly':
        next.setMonth(next.getMonth() + 1)
        break
      case 'quarterly':
        next.setMonth(next.getMonth() + 3)
        break
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1)
        break
    }

    // Check if past end date
    if (end && next > end) {
      return null
    }
  }

  return next
}

// Display next occurrence
export function NextOccurrenceDisplay({
  dueDate,
  rule,
  endDate,
}: {
  dueDate: string
  rule: RecurrenceRule
  endDate?: string | null
}) {
  const next = getNextOccurrence(dueDate, rule, endDate)

  if (!next) {
    return (
      <div className="text-xs text-muted-foreground">
        {endDate ? 'Recurrence ended' : 'No future occurrences'}
      </div>
    )
  }

  return (
    <div className="text-xs text-muted-foreground">
      Next: <span className="font-medium">{next.toLocaleDateString()}</span>
    </div>
  )
}

// Series info display
export function RecurringSeriesInfo({
  rule,
  startDate,
  endDate,
  count,
}: {
  rule: RecurrenceRule
  startDate: string
  endDate?: string | null
  count?: number
}) {
  return (
    <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Repeat className="h-4 w-4" />
        <span>Recurring Series</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Frequency:</span>
          <span className="ml-1 font-medium">{formatRecurrenceLabel(rule)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Started:</span>
          <span className="ml-1 font-medium">{new Date(startDate).toLocaleDateString()}</span>
        </div>
        {endDate && (
          <div>
            <span className="text-muted-foreground">Ends:</span>
            <span className="ml-1 font-medium">{new Date(endDate).toLocaleDateString()}</span>
          </div>
        )}
        {count !== undefined && (
          <div>
            <span className="text-muted-foreground">Occurrences:</span>
            <span className="ml-1 font-medium">{count}</span>
          </div>
        )}
      </div>
    </div>
  )
}
