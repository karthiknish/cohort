'use client'

import { useState, useCallback, useMemo } from 'react'
import { Tag, X, Plus, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type TagManagementProps = {
  availableTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onTagCreate?: (tag: string) => void
  className?: string
}

// Color assignments for tags (consistent colors per tag)
const TAG_COLORS = [
  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400',
]

// Get consistent color for a tag based on its name
function getTagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
  return color || 'bg-gray-100 text-gray-700'
}

// Get the background color class for a tag (the first part before the space)
function getTagBgColor(tag: string): string {
  const color = getTagColor(tag)
  const parts = color.split(' ')
  return parts[0] ?? 'bg-gray-100'
}

export function TagManagement({
  availableTags,
  selectedTags,
  onTagsChange,
  onTagCreate,
  className,
}: TagManagementProps) {
  const [open, setOpen] = useState(false)
  const [newTagInput, setNewTagInput] = useState('')

  // Sort tags: selected first, then alphabetically
  const sortedAvailableTags = useMemo(() => {
    return [...availableTags].sort((a, b) => {
      const aSelected = selectedTags.includes(a)
      const bSelected = selectedTags.includes(b)
      if (aSelected && !bSelected) return -1
      if (!aSelected && bSelected) return 1
      return a.localeCompare(b)
    })
  }, [availableTags, selectedTags])

  const handleToggleTag = useCallback((tag: string) => {
    const isSelected = selectedTags.includes(tag)
    if (isSelected) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }, [selectedTags, onTagsChange])

  const handleRemoveTag = useCallback((tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onTagsChange(selectedTags.filter((t) => t !== tag))
  }, [selectedTags, onTagsChange])

  const handleAddNewTag = useCallback(() => {
    const trimmed = newTagInput.trim().toLowerCase()
    if (!trimmed) return

    if (onTagCreate && !availableTags.includes(trimmed)) {
      onTagCreate(trimmed)
    }

    if (!selectedTags.includes(trimmed)) {
      onTagsChange([...selectedTags, trimmed])
    }

    setNewTagInput('')
  }, [newTagInput, selectedTags, availableTags, onTagsChange, onTagCreate])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddNewTag()
    }
  }, [handleAddNewTag])

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Selected tags */}
      {selectedTags.map((tag) => (
        <Badge
          key={tag}
          className={cn('gap-1 pr-1 transition-all hover:pr-2', getTagColor(tag))}
        >
          <Hash className="h-2.5 w-2.5" />
          {tag}
          <button
            type="button"
            onClick={(e) => handleRemoveTag(tag, e)}
            className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Tag picker popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add Tag
            {selectedTags.length > 0 && (
              <span className="ml-1 text-muted-foreground">({selectedTags.length})</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* New tag input */}
            <div className="flex gap-2">
              <Input
                placeholder="New tag..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                onClick={handleAddNewTag}
                disabled={!newTagInput.trim()}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Available tags */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Available Tags
              </p>
              <ScrollArea className="h-48">
                <div className="space-y-1 pr-2">
                  {sortedAvailableTags.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No tags yet. Create one above!
                    </p>
                  ) : (
                    sortedAvailableTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors',
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className={cn(
                            'h-2 w-2 rounded-full shrink-0',
                            getTagBgColor(tag)
                          )} />
                          <span className="flex-1 truncate">{tag}</span>
                          {isSelected && (
                            <span className="text-xs">✓</span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Quick tag selector for filters
export function TagFilter({
  availableTags,
  selectedTag,
  onTagChange,
  className,
}: {
  availableTags: string[]
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-1.5', selectedTag && 'border-primary/50', className)}
        >
          <Tag className="h-3.5 w-3.5" />
          {selectedTag || 'All tags'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-0.5">
          <button
            onClick={() => {
              onTagChange(null)
              setOpen(false)
            }}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors',
              !selectedTag ? 'bg-muted' : 'hover:bg-muted'
            )}
          >
            <span>All tags</span>
          </button>
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                onTagChange(tag === selectedTag ? null : tag)
                setOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-sm transition-colors',
                selectedTag === tag ? 'bg-muted' : 'hover:bg-muted'
              )}
            >
              <div className={cn(
                'h-2 w-2 rounded-full shrink-0',
                getTagBgColor(tag)
              )} />
              <span className="truncate">{tag}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
