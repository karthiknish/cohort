'use client'

import { useCallback, useState } from 'react'
import { Search, ArrowUp, ArrowDown, Filter, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
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
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value)
    },
    [onSearchChange],
  )

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        onSearchChange('')
      }
    },
    [onSearchChange],
  )

  const handleSortFieldChange = useCallback(
    (value: string) => {
      onSortFieldChange(value as SortField)
    },
    [onSortFieldChange],
  )

  return (
    <div className="flex flex-col gap-2 border-b border-border/80 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="task-search"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search tasks"
          className="h-8 border-border/60 bg-background pl-8 text-sm shadow-none"
          aria-label="Search tasks"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-border/60 bg-background font-normal shadow-none"
            >
              <Filter className="h-3.5 w-3.5" aria-hidden />
              Filters
              {hasActiveFilters ? (
                <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                  !
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 space-y-3 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Refine list
            </p>
            <Select value={selectedStatus} onValueChange={onStatusChange}>
              <SelectTrigger className="h-8 w-full" aria-label="Filter by status">
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
            {showAssigneeFilter ? (
              <Select value={selectedAssignee} onValueChange={onAssigneeChange}>
                <SelectTrigger className="h-8 w-full" aria-label="Filter by assignee">
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
            ) : null}
            <div className="flex gap-1">
              <Select value={sortField} onValueChange={handleSortFieldChange}>
                <SelectTrigger className="h-8 flex-1" aria-label="Sort by">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onSortDirectionToggle}
                aria-label={sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}
              >
                {sortDirection === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {hasActiveFilters && onClearFilters ? (
              <Button type="button" variant="ghost" size="sm" className="h-8 w-full" onClick={onClearFilters}>
                Clear filters
              </Button>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
