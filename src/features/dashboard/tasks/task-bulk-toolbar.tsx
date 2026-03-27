"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CalendarClock, CheckSquare, Filter, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Progress } from '@/shared/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Calendar } from '@/shared/ui/calendar'
import { Checkbox } from '@/shared/ui/checkbox'
import { cn } from '@/lib/utils'
import { isTaskDueDateDisabled } from './task-types'
import { TASK_STATUSES } from '@/types/tasks'
import type { TaskStatus } from '@/types/tasks'

export type TaskBulkToolbarProps = {
  selectedCount: number
  totalVisible: number
  hasSelection: boolean
  bulkActive: boolean
  bulkLabel: string
  bulkProgress: number
  onSelectAll: () => void
  onClearSelection: () => void
  onSelectHighPriority: () => void
  onSelectDueSoon: () => void
  onBulkStatusChange: (status: TaskStatus) => void
  onBulkAssign: (assignees: string[]) => void
  onBulkDueDate: (date: string | null) => void
  onBulkDelete: () => void
}

function parseAssignees(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

export function TaskBulkToolbar({
  selectedCount,
  totalVisible,
  hasSelection,
  bulkActive,
  bulkLabel,
  bulkProgress,
  onSelectAll,
  onClearSelection,
  onSelectHighPriority,
  onSelectDueSoon,
  onBulkStatusChange,
  onBulkAssign,
  onBulkDueDate,
  onBulkDelete,
}: TaskBulkToolbarProps) {
  const [assignInput, setAssignInput] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const masterRef = useRef<HTMLInputElement | null>(null)

  const selectAllLabel = useMemo(() => {
    if (selectedCount === totalVisible) return 'All visible selected'
    return `Select all (${totalVisible})`
  }, [selectedCount, totalVisible])

  const masterChecked = hasSelection && selectedCount === totalVisible
  const masterIndeterminate = hasSelection && selectedCount > 0 && selectedCount < totalVisible

  const handleMasterChange = useCallback(() => {
    if (hasSelection && selectedCount === totalVisible) {
      onClearSelection()
    } else {
      onSelectAll()
    }
  }, [hasSelection, onClearSelection, onSelectAll, selectedCount, totalVisible])

  const handleStatusChange = useCallback((value: string) => {
    onBulkStatusChange(value as TaskStatus)
  }, [onBulkStatusChange])

  const handleAssignInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAssignInput(event.target.value)
  }, [])

  const handleAssignClick = useCallback(() => {
    onBulkAssign(parseAssignees(assignInput))
  }, [assignInput, onBulkAssign])

  const handleUpdateDueDate = useCallback(() => {
    onBulkDueDate(dueDate ? format(dueDate, 'yyyy-MM-dd') : null)
  }, [dueDate, onBulkDueDate])

  const handleClearDate = useCallback(() => {
    setDueDate(undefined)
    onBulkDueDate(null)
  }, [onBulkDueDate])

  useEffect(() => {
    if (masterRef.current) {
      masterRef.current.indeterminate = masterIndeterminate
    }
  }, [masterIndeterminate])

  return (
    <div className="space-y-3 border-b border-muted/40 bg-muted/10 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-2 rounded-md border border-muted/60 bg-background px-3 py-2">
          <Checkbox
            ref={masterRef}
            checked={masterChecked}
            onChange={handleMasterChange}
            aria-label={selectAllLabel}
          />
          <span className="font-medium text-foreground">{selectedCount} selected</span>
          <span className="text-muted-foreground">of {totalVisible}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onSelectAll} disabled={bulkActive}>
            <CheckSquare className="mr-2 h-4 w-4" />
            {selectAllLabel}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection} disabled={!hasSelection || bulkActive}>
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={onSelectHighPriority} disabled={bulkActive}>
            <Filter className="mr-2 h-4 w-4" /> High priority
          </Button>
          <Button variant="secondary" size="sm" onClick={onSelectDueSoon} disabled={bulkActive}>
            <CalendarClock className="mr-2 h-4 w-4" /> Due soon
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select onValueChange={handleStatusChange} disabled={!hasSelection || bulkActive}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status === 'todo' && 'To do'}
                  {status === 'in-progress' && 'In progress'}
                  {status === 'review' && 'Review'}
                  {status === 'completed' && 'Completed'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="bulk-assign" className="text-xs text-muted-foreground">
            Assign to
          </Label>
          <Input
            id="bulk-assign"
            value={assignInput}
            onChange={handleAssignInputChange}
            placeholder="Comma-separated names"
            className="h-9 w-[220px]"
            disabled={!hasSelection || bulkActive}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleAssignClick}
            disabled={!hasSelection || bulkActive}
          >
            Apply
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Due date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'w-[160px] h-9 justify-start text-left font-normal',
                  !dueDate && 'text-muted-foreground'
                )}
                disabled={!hasSelection || bulkActive}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                disabled={isTaskDueDateDisabled}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            variant="outline"
            onClick={handleUpdateDueDate}
            disabled={!hasSelection || bulkActive || !dueDate}
          >
            Update
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearDate}
            disabled={!hasSelection || bulkActive}
          >
            Clear date
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={onBulkDelete}
            disabled={!hasSelection || bulkActive}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {bulkActive && (
        <div className="flex flex-col gap-2 rounded-md border border-muted/50 bg-background px-3 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{bulkLabel}</span>
            <span className="font-medium text-foreground">{Math.round(bulkProgress)}%</span>
          </div>
          <Progress value={bulkProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}
