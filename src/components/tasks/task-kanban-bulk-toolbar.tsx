'use client'

import { useState } from 'react'
import { CheckSquare, X, Trash2, User, Calendar, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'
import { TaskStatus, TaskPriority, TASK_STATUSES, TASK_PRIORITIES } from '@/types/tasks'
import { formatStatusLabel, formatPriorityLabel } from './task-types'

type TaskKanbanBulkToolbarProps = {
  selectedCount: number
  totalVisible: number
  bulkActive: boolean
  bulkLabel: string
  bulkProgress: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkStatusChange?: (status: TaskStatus) => void
  onBulkAssign?: (assignees: string[]) => void
  onBulkDueDate?: (date: string | null) => void
  onBulkDelete?: () => void
}

export function TaskKanbanBulkToolbar({
  selectedCount,
  totalVisible,
  bulkActive,
  bulkLabel,
  bulkProgress,
  onSelectAll,
  onClearSelection,
  onBulkStatusChange,
  onBulkAssign,
  onBulkDueDate,
  onBulkDelete,
}: TaskKanbanBulkToolbarProps) {
  const [assigneeInput, setAssigneeInput] = useState('')

  if (selectedCount === 0 && !bulkActive) {
    return (
      <div className="flex items-center justify-between px-1 py-2 border-b border-muted/20">
        <button
          onClick={onSelectAll}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <CheckSquare className="h-3.5 w-3.5" />
          Select all visible
        </button>
        <span className="text-xs text-muted-foreground">
          {totalVisible} {totalVisible === 1 ? 'task' : 'tasks'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-2 border-b border-muted/20 bg-primary/5">
      <div className="flex items-center gap-3">
        {bulkActive ? (
          <div className="flex items-center gap-2 text-sm">
            <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
            <span className="font-medium">{bulkLabel}...</span>
            <Badge variant="outline" className="h-5">
              {bulkProgress}%
            </Badge>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'} selected
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="h-7 text-xs"
              disabled={selectedCount === totalVisible}
            >
              Select all ({totalVisible})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-7 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </>
        )}
      </div>

      {!bulkActive && (
        <div className="flex items-center gap-1.5">
          {/* Bulk status change */}
          {onBulkStatusChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Set Status
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                {TASK_STATUSES.filter(s => s !== 'archived').map((status) => (
                  <button
                    key={status}
                    onClick={() => onBulkStatusChange(status)}
                    className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    {formatStatusLabel(status)}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          )}

          {/* Bulk assign */}
          {onBulkAssign && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <User className="h-3 w-3" />
                  Assign
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="end">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Assign to (comma-separated names)</p>
                  <input
                    type="text"
                    placeholder="Alice, Bob, ..."
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (assigneeInput.trim()) {
                          onBulkAssign(assigneeInput.split(',').map(s => s.trim()))
                          setAssigneeInput('')
                        }
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (assigneeInput.trim()) {
                        onBulkAssign(assigneeInput.split(',').map(s => s.trim()))
                        setAssigneeInput('')
                      }
                    }}
                    className="w-full h-7"
                  >
                    Assign
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Bulk due date */}
          {onBulkDueDate && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Calendar className="h-3 w-3" />
                  Due Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                <button
                  onClick={() => onBulkDueDate(null)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Clear due date
                </button>
                <button
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0]!
                    onBulkDueDate(today)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]!
                    onBulkDueDate(tomorrow)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => {
                    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]!
                    onBulkDueDate(nextWeek)
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
                >
                  Next week
                </button>
              </PopoverContent>
            </Popover>
          )}

          {/* Bulk delete */}
          {onBulkDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              className="h-7 text-xs text-destructive hover:text-destructive gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
