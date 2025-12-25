"use client"

import { useMemo, useRef, useState, useEffect } from 'react'
import { CalendarClock, CheckSquare, Filter, ListChecks, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskStatus, TASK_STATUSES } from '@/types/tasks'

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
  const [dueDate, setDueDate] = useState('')
  const masterRef = useRef<HTMLInputElement | null>(null)

  const selectAllLabel = useMemo(() => {
    if (selectedCount === totalVisible) return 'All visible selected'
    return `Select all (${totalVisible})`
  }, [selectedCount, totalVisible])

  const masterChecked = hasSelection && selectedCount === totalVisible
  const masterIndeterminate = hasSelection && selectedCount > 0 && selectedCount < totalVisible

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
            onChange={() => (hasSelection && selectedCount === totalVisible ? onClearSelection() : onSelectAll())}
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
          <Select onValueChange={(value) => onBulkStatusChange(value as TaskStatus)} disabled={!hasSelection || bulkActive}>
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
            onChange={(event) => setAssignInput(event.target.value)}
            placeholder="Comma-separated names"
            className="h-9 w-[220px]"
            disabled={!hasSelection || bulkActive}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => onBulkAssign(parseAssignees(assignInput))}
            disabled={!hasSelection || bulkActive}
          >
            Apply
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor="bulk-due" className="text-xs text-muted-foreground">
            Due date
          </Label>
          <Input
            id="bulk-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="h-9 w-[160px]"
            disabled={!hasSelection || bulkActive}
          />
          <Button size="sm" variant="outline" onClick={() => onBulkDueDate(dueDate || null)} disabled={!hasSelection || bulkActive}>
            Update
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setDueDate(''); onBulkDueDate(null) }} disabled={!hasSelection || bulkActive}>
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
