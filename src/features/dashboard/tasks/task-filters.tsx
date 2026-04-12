'use client'

import { useCallback } from 'react'
import { Search, ArrowUp, ArrowDown, FilterX } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { SORT_OPTIONS } from './task-types'
import type { SortField, SortDirection } from './task-types'

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
  hasActiveFilters?: boolean
  onClearFilters?: () => void
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
  hasActiveFilters = false,
  onClearFilters,
}: TaskFiltersProps) {
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }, [onSearchChange])

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        onSearchChange('')
      }
    },
    [onSearchChange],
  )

  const handleSortFieldChange = useCallback((value: string) => {
    onSortFieldChange(value as SortField)
  }, [onSortFieldChange])

  return (
    <div className="flex flex-col gap-3 border-b border-border/50 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full min-w-0 flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            id="task-search"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search title or description…"
            className="border-border/60 pl-9 shadow-sm"
            aria-label="Search tasks"
          />
        </div>
        {hasActiveFilters && onClearFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 border-border/60"
            onClick={onClearFilters}
          >
            <FilterX className="h-4 w-4" aria-hidden />
            Clear filters
          </Button>
        ) : null}
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
          <Select value={sortField} onValueChange={handleSortFieldChange}>
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
