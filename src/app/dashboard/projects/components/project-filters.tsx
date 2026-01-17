'use client'

import { ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { SortDirection, SortField, StatusFilter, STATUS_FILTERS, SORT_OPTIONS, formatStatusLabel } from './index'

interface ProjectFiltersProps {
  statusFilter: StatusFilter
  sortField: SortField
  sortDirection: SortDirection
  onStatusChange: (value: StatusFilter) => void
  onSortFieldChange: (value: SortField) => void
  onToggleSortDirection: () => void
}

export function ProjectFilters({
  statusFilter,
  sortField,
  sortDirection,
  onStatusChange,
  onSortFieldChange,
  onToggleSortDirection,
}: ProjectFiltersProps) {
  return (
    <div className="flex items-center gap-1">
      <Select value={statusFilter} onValueChange={(value: StatusFilter) => onStatusChange(value)}>
        <SelectTrigger className="sm:w-40" aria-label="Filter by status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTERS.map((value) => (
            <SelectItem key={value} value={value}>
              {value === 'all' ? 'All statuses' : formatStatusLabel(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sortField} onValueChange={(value: SortField) => onSortFieldChange(value)}>
        <SelectTrigger className="sm:w-36" aria-label="Sort by">
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
            onClick={onToggleSortDirection}
            className="h-10 w-10"
            aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
