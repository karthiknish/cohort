'use client'

import {
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown,
  Trash2,
  Check,
  PinOff,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ACTIVITY_LABELS, type StatusFilter } from '../types'
import type { ActivityType, SortOption, DateRangeOption } from '../types'

interface ActivityFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  typeFilter: ActivityType | 'all'
  onTypeFilterChange: (filter: ActivityType | 'all') => void
  dateRange: DateRangeOption
  onDateRangeChange: (range: DateRangeOption) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkDismiss: () => void
  onMarkAllAsRead: () => void
  onClearAllPins: () => void
  className?: string
}

export function ActivityFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDismiss,
  onMarkAllAsRead,
  onClearAllPins,
  className,
}: ActivityFiltersProps) {
  const hasActiveFilters = typeFilter !== 'all' || dateRange !== 'all' || statusFilter !== 'all' || searchQuery

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Search */}
      <div className="relative flex-1 md:max-w-sm">
        <svg
          className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          id="activity-search"
          placeholder="Search activity... (⌘K)"
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={(v) => onTypeFilterChange(v as ActivityType | 'all')}
        >
          <SelectTrigger className="w-[180px]" aria-label="Filter by type">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="task_completed">Tasks</SelectItem>
            <SelectItem value="message_posted">Messages</SelectItem>
            <SelectItem value="project_updated">Projects</SelectItem>
            <SelectItem value="client_added">Clients</SelectItem>
            <SelectItem value="invoice_sent">Invoices</SelectItem>
            <SelectItem value="proposal_created">Proposals</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select
          value={dateRange}
          onValueChange={(v) => onDateRangeChange(v as DateRangeOption)}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by date">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="pinned">Pinned</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Sort options">
              {sortBy === 'newest' ? (
                <SortDesc className="h-4 w-4 mr-1" />
              ) : (
                <SortAsc className="h-4 w-4 mr-1" />
              )}
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onSortChange('newest')}>
              <SortDesc className="h-4 w-4 mr-2" />
              Newest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('oldest')}>
              <SortAsc className="h-4 w-4 mr-2" />
              Oldest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('type')}>Type</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange('entity')}>
              Entity name
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk actions (when items selected) */}
        {selectedCount > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedCount} selected
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClearSelection}>
                Clear selection
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onBulkDismiss}>
                <Trash2 className="h-4 w-4 mr-2" />
                Dismiss all
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMarkAllAsRead}>
                <Check className="h-4 w-4 mr-2" />
                Mark all as read
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* More filters */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" aria-label="More options">
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Quick filters</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={selectedCount === totalCount && totalCount > 0}
              onCheckedChange={onSelectAll}
            >
              Select all ({totalCount})
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onClearAllPins}>
              <PinOff className="h-4 w-4 mr-2" />
              Clear all pins
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-sm px-4 py-2 bg-muted/30">
          <span className="text-muted-foreground">Active filters:</span>
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {ACTIVITY_LABELS[typeFilter]}
              <button
                type="button"
                onClick={() => onTypeFilterChange('all')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                aria-label="Remove type filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Date: {dateRange}
              <button
                type="button"
                onClick={() => onDateRangeChange('all')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                aria-label="Remove date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 capitalize">
              Status: {statusFilter}
              <button
                type="button"
                onClick={() => onStatusFilterChange('all')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                aria-label="Remove status filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
