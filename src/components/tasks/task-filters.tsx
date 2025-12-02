'use client'

import { Search, ArrowUp, ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { SortField, SortDirection, SORT_OPTIONS } from './task-types'

export type TaskFiltersProps = {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  selectedAssignee: string
  onAssigneeChange: (assignee: string) => void
  assigneeOptions: string[]
  showAssigneeFilter: boolean
  sortField: SortField
  onSortFieldChange: (field: SortField) => void
  sortDirection: SortDirection
  onSortDirectionToggle: () => void
}

export function TaskFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedAssignee,
  onAssigneeChange,
  assigneeOptions,
  showAssigneeFilter,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionToggle,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="task-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[130px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in-progress">In progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        {showAssigneeFilter && (
          <Select value={selectedAssignee} onValueChange={onAssigneeChange}>
            <SelectTrigger className="w-[150px]" aria-label="Filter by assignee">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {assigneeOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-1">
          <Select value={sortField} onValueChange={(value: SortField) => onSortFieldChange(value)}>
            <SelectTrigger className="w-[130px]" aria-label="Sort by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onSortDirectionToggle}
                className="h-10 w-10"
                aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
