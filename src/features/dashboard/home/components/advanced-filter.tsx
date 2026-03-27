'use client'

import { useState, useCallback } from 'react'
import { Filter, X, Save } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Checkbox } from '@/shared/ui/checkbox'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/shared/ui/use-toast'

type FilterValue = string | number | null | string[]
type FilterMap = Record<string, FilterValue>

function getStringFilterValue(value: FilterValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

function getStringArrayFilterValue(value: FilterValue | undefined): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export interface FilterConfig {
  id: string
  name: string
  filters: FilterMap
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
  onFilterChange: (filters: FilterMap) => void
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  activeFiltersCount?: number
  savedFilters?: FilterConfig[]
  onSaveFilter?: (config: FilterConfig) => void
  onLoadFilter?: (config: FilterConfig) => void
  onDeleteFilter?: (id: string) => void
  className?: string
}

const EMPTY_AVAILABLE_FILTERS: Array<{
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date' | 'number'
  options?: Array<{ value: string; label: string }>
}> = []

const EMPTY_SAVED_FILTERS: FilterConfig[] = []

/**
 * Advanced filtering panel with saved configurations
 */
export function AdvancedFilter({
  availableFilters = EMPTY_AVAILABLE_FILTERS,
  onFilterChange,
  onSortChange,
  activeFiltersCount = 0,
  savedFilters = EMPTY_SAVED_FILTERS,
  onSaveFilter,
  onDeleteFilter,
  className,
}: AdvancedFilterProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<FilterMap>({})
  const [filterName, setFilterName] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const activeFilterCount = Object.keys(currentFilters).length + activeFiltersCount

  const applyFilter = useCallback((key: string, value: FilterValue) => {
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

  const handleLoadSavedFilter = useCallback(
    (config: FilterConfig) => {
      setCurrentFilters(config.filters)
      setSortBy(config.sortBy ?? '')
      setSortOrder(config.sortOrder ?? 'desc')
      onFilterChange(config.filters)

      if (onSortChange && config.sortBy) {
        onSortChange(config.sortBy, config.sortOrder ?? 'desc')
      }

      setOpen(false)
    },
    [onFilterChange, onSortChange]
  )

  const handleFilterNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(e.target.value)
  }, [])

  const handleSortOrderChange = useCallback((value: string) => {
    setSortOrder(value as 'asc' | 'desc')
  }, [])

  const handleDeleteSavedFilter = useCallback(
    (id: string) => {
      onDeleteFilter?.(id)
    },
    [onDeleteFilter]
  )

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
                    <SavedFilterButton
                      key={filter.id}
                      filter={filter}
                      onApply={handleLoadSavedFilter}
                    >
                      {filter.name}
                    </SavedFilterButton>
                  ))}
                </div>
                {onDeleteFilter && (
                  <div className="flex gap-2">
                    {savedFilters.map((filter) => (
                      <SavedFilterDeleteButton
                        key={filter.id}
                        filterId={filter.id}
                        onDelete={handleDeleteSavedFilter}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Filter fields */}
            {availableFilters.map((filter) => (
              <AdvancedFilterField
                key={filter.key}
                filter={filter}
                value={currentFilters[filter.key]}
                onChange={applyFilter}
              />
            ))}

            {/* Sort options */}
            {onSortChange && (
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sort by…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="updatedAt">Last Updated</SelectItem>
                      <SelectItem value="title">Name</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={handleSortOrderChange}>
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
                    placeholder="Filter name…"
                    value={filterName}
                    onChange={handleFilterNameChange}
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
  filters: FilterMap
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
        <ActiveFilterBadge key={key} filterKey={key} value={value} onRemove={onRemove} />
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

interface SavedFilterButtonProps {
  filter: FilterConfig
  onApply: (config: FilterConfig) => void
  children: string
}

function SavedFilterButton({ filter, onApply, children }: SavedFilterButtonProps) {
  const handleClick = useCallback(() => {
    onApply(filter)
  }, [filter, onApply])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-6 rounded-full px-2 text-xs"
      onClick={handleClick}
    >
      {children}
    </Button>
  )
}

interface SavedFilterDeleteButtonProps {
  filterId: string
  onDelete: (id: string) => void
}

function SavedFilterDeleteButton({ filterId, onDelete }: SavedFilterDeleteButtonProps) {
  const handleClick = useCallback(() => {
    onDelete(filterId)
  }, [filterId, onDelete])

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleClick}>
      <X className="h-3 w-3" />
    </Button>
  )
}

interface AdvancedFilterFieldProps {
  filter: {
    key: string
    label: string
    type: 'text' | 'select' | 'multiselect' | 'date' | 'number'
    options?: Array<{ value: string; label: string }>
  }
  value: FilterValue | undefined
  onChange: (key: string, value: FilterValue) => void
}

function AdvancedFilterField({ filter, value, onChange }: AdvancedFilterFieldProps) {
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(filter.key, e.target.value)
    },
    [filter.key, onChange]
  )

  const handleSelectChange = useCallback(
    (nextValue: string) => {
      onChange(filter.key, nextValue)
    },
    [filter.key, onChange]
  )

  const handleMultiSelectChange = useCallback(
    (optionValue: string, checked: boolean) => {
      const currentValues = getStringArrayFilterValue(value)
      onChange(
        filter.key,
        checked
          ? [...currentValues, optionValue]
          : currentValues.filter((currentValue) => currentValue !== optionValue)
      )
    },
    [filter.key, onChange, value]
  )

  return (
    <div className="space-y-2">
      <Label>{filter.label}</Label>
      {filter.type === 'text' && (
        <Input
          value={getStringFilterValue(value)}
          onChange={handleTextChange}
          placeholder={`Search ${filter.label.toLowerCase()}...`}
        />
      )}

      {filter.type === 'select' && (
        <Select value={getStringFilterValue(value)} onValueChange={handleSelectChange}>
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
            <FilterMultiSelectOption
              key={option.value}
              filterKey={filter.key}
              option={option}
              checked={getStringArrayFilterValue(value).includes(option.value)}
              onChange={handleMultiSelectChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface FilterMultiSelectOptionProps {
  filterKey: string
  option: { value: string; label: string }
  checked: boolean
  onChange: (optionValue: string, checked: boolean) => void
}

function FilterMultiSelectOption({ filterKey, option, checked, onChange }: FilterMultiSelectOptionProps) {
  const handleCheckedChange = useCallback(
    (nextChecked: boolean | 'indeterminate') => {
      onChange(option.value, nextChecked === true)
    },
    [onChange, option.value]
  )

  return (
    <div className="flex items-center gap-2">
      <Checkbox id={`${filterKey}-${option.value}`} checked={checked} onCheckedChange={handleCheckedChange} />
      <label htmlFor={`${filterKey}-${option.value}`} className="text-sm cursor-pointer">
        {option.label}
      </label>
    </div>
  )
}

interface ActiveFilterBadgeProps {
  filterKey: string
  value: FilterValue
  onRemove: (key: string) => void
}

function ActiveFilterBadge({ filterKey, value, onRemove }: ActiveFilterBadgeProps) {
  const handleRemove = useCallback(() => {
    onRemove(filterKey)
  }, [filterKey, onRemove])

  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      {filterKey}: {Array.isArray(value) ? value.join(', ') : value}
      <button
        type="button"
        onClick={handleRemove}
        className="rounded p-0.5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Remove ${filterKey} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}
