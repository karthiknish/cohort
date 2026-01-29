'use client'

import { useState, useCallback, useMemo } from 'react'
import { Filter, Funnel, X, Save, RotateCcw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export interface FilterConfig {
  id: string
  name: string
  filters: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface AdvancedFilterProps {
  availableFilters?: Array<{
    key: string
    label: string
    type: 'text' | 'select' | 'multiselect' | 'date' | 'number'
    options?: Array<{ value: string; label: string }>
  }>
  onFilterChange: (filters: Record<string, any>) => void
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  activeFiltersCount?: number
  savedFilters?: FilterConfig[]
  onSaveFilter?: (config: FilterConfig) => void
  onLoadFilter?: (config: FilterConfig) => void
  onDeleteFilter?: (id: string) => void
  className?: string
}

const PRESET_FILTERS = [
  { id: 'recent-urgent', label: 'Recent & Urgent', filters: { priority: 'urgent', dateRange: '7d' } },
  { id: 'my-tasks', label: 'My Tasks', filters: { assignee: 'me', status: ['todo', 'in-progress'] } },
  { id: 'this-week', label: 'This Week', filters: { dateRange: '7d' } },
  { id: 'this-month', label: 'This Month', filters: { dateRange: '30d' } },
]

/**
 * Advanced filtering panel with saved configurations
 */
export function AdvancedFilter({
  availableFilters = [],
  onFilterChange,
  onSortChange,
  activeFiltersCount = 0,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  className,
}: AdvancedFilterProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({})
  const [filterName, setFilterName] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const activeFilterCount = Object.keys(currentFilters).length + activeFiltersCount

  const applyFilter = useCallback((key: string, value: any) => {
    setCurrentFilters((prev) => {
      const newFilters = { ...prev }
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete newFilters[key]
      } else {
        newFilters[key] = value
      }
      return newFilters
    })
  }, [])

  const clearAllFilters = useCallback(() => {
    setCurrentFilters({})
    onFilterChange({})
  }, [onFilterChange])

  const applyFilters = useCallback(() => {
    onFilterChange(currentFilters)
    if (onSortChange && sortBy) {
      onSortChange(sortBy, sortOrder)
    }
    setOpen(false)
  }, [currentFilters, sortBy, sortOrder, onFilterChange, onSortChange])

  const saveCurrentConfig = useCallback(() => {
    if (!filterName.trim()) {
      toast({
        title: 'Filter name required',
        description: 'Please enter a name for this filter configuration.',
        variant: 'destructive',
      })
      return
    }

    const config: FilterConfig = {
      id: `custom-${Date.now()}`,
      name: filterName,
      filters: { ...currentFilters },
      sortBy,
      sortOrder,
    }

    onSaveFilter?.(config)
    setFilterName('')
    toast({
      title: 'Filter saved',
      description: `Your filter "${filterName}" has been saved.`,
    })
  }, [currentFilters, filterName, sortBy, sortOrder, onSaveFilter, toast])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Filter button with badge */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>
              Configure multiple filters to find exactly what you need.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Saved filters */}
            {savedFilters.length > 0 && (
              <div className="space-y-2">
                <Label>Saved Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((filter) => (
                    <Badge
                      key={filter.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => {
                        setCurrentFilters(filter.filters)
                        if (filter.sortBy) {
                          setSortBy(filter.sortBy)
                          setSortOrder(filter.sortOrder ?? 'desc')
                        }
                        applyFilters()
                      }}
                    >
                      {filter.name}
                    </Badge>
                  ))}
                </div>
                {onDeleteFilter && (
                  <div className="flex gap-2">
                    {savedFilters.map((filter) => (
                      <Button
                        key={filter.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteFilter(filter.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Filter fields */}
            {availableFilters.map((filter) => (
              <div key={filter.key} className="space-y-2">
                <Label>{filter.label}</Label>
                {filter.type === 'text' && (
                  <Input
                    value={currentFilters[filter.key] || ''}
                    onChange={(e) => applyFilter(filter.key, e.target.value)}
                    placeholder={`Search ${filter.label.toLowerCase()}...`}
                  />
                )}

                {filter.type === 'select' && (
                  <Select
                    value={currentFilters[filter.key] || ''}
                    onValueChange={(value) => applyFilter(filter.key, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      {filter.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {filter.type === 'multiselect' && (
                  <div className="space-y-1">
                    {filter.options?.map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${filter.key}-${option.value}`}
                          checked={(currentFilters[filter.key] || []).includes(option.value)}
                          onCheckedChange={(checked) => {
                            const current = currentFilters[filter.key] || []
                            applyFilter(
                              filter.key,
                              checked
                                ? [...current, option.value]
                                : current.filter((v: any) => v !== option.value)
                            )
                          }}
                        />
                        <label
                          htmlFor={`${filter.key}-${option.value}`}
                          className="text-sm cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Sort options */}
            {onSortChange && (
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="updatedAt">Last Updated</SelectItem>
                      <SelectItem value="title">Name</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={Object.keys(currentFilters).length === 0}
            >
              Clear All
            </Button>

            <div className="flex gap-2">
              {onSaveFilter && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Filter name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="w-40"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveCurrentConfig}
                    disabled={!filterName.trim()}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              )}

              <Button type="button" size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Filter pills bar showing active filters
 */
export function ActiveFiltersBar({
  filters,
  onRemove,
  onClearAll,
  className,
}: {
  filters: Record<string, any>
  onRemove: (key: string) => void
  onClearAll: () => void
  className?: string
}) {
  const entries = Object.entries(filters)

  if (entries.length === 0) return null

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="text-xs text-muted-foreground">Active filters:</span>
      {entries.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className="gap-1 pr-1"
          onClick={() => onRemove(key)}
        >
          {key}: {Array.isArray(value) ? value.join(', ') : value}
          <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
        </Badge>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  )
}
