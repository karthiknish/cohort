'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { SORT_OPTIONS } from '../utils/project-formatters';
import type { SortDirection, SortField } from '../types';

interface ProjectFiltersProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortFieldChange: (value: SortField) => void;
  onToggleSortDirection: () => void;
}

export function ProjectFilters({
  sortField,
  sortDirection,
  onSortFieldChange,
  onToggleSortDirection,
}: ProjectFiltersProps) {
  const handleSortFieldChange = (value: string) => onSortFieldChange(value as SortField);
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Select value={sortField} onValueChange={handleSortFieldChange}>
        <SelectTrigger
          className="h-9 w-[9.5rem] border-border/60 bg-background text-xs shadow-sm"
          aria-label="Sort by"
        >
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleSortDirection}
            className="size-9 shrink-0 border-border/60 shadow-sm"
            aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortDirection === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}</TooltipContent>
      </Tooltip>
    </div>
  );
}
