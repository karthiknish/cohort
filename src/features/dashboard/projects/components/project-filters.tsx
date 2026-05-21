'use client'

import { useCallback } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

import { type SortDirection, type SortField, SORT_OPTIONS } from './utils'

interface ProjectFiltersProps {
  sortField: SortField
  sortDirection: SortDirection
  onSortFieldChange: (value: SortField) => void
  onToggleSortDirection: () => void
}

export function ProjectFilters({
  sortField,
  sortDirection,
  onSortFieldChange,
  onToggleSortDirection,
}: ProjectFiltersProps) {
  const handleSortFieldChange = useCallback(
    (value: string) => onSortFieldChange(value as SortField),
    [onSortFieldChange]
  )

  return (
    <div className="flex items-center gap-1">
      <Select value={sortField} onValueChange={handleSortFieldChange}>
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
