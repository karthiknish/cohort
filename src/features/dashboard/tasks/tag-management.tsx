'use client'

import { useState, useCallback, useMemo } from 'react'
import { Tag, X, Plus, Hash } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn } from '@/lib/utils'

type TagManagementProps = {
  availableTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onTagCreate?: (tag: string) => void
  className?: string
}

type TagStyle = {
  chip: string
  dot: string
}

// Semantic shadcn token assignments for tags.
const TAG_STYLES: TagStyle[] = [
  { chip: 'border-transparent bg-destructive/10 text-destructive dark:bg-destructive/15', dot: 'bg-destructive' },
  { chip: 'border-transparent bg-primary/10 text-primary dark:bg-primary/15', dot: 'bg-primary' },
  { chip: 'border-transparent bg-secondary text-secondary-foreground', dot: 'bg-secondary-foreground' },
  { chip: 'border-transparent bg-accent text-accent-foreground', dot: 'bg-accent-foreground' },
  { chip: 'border-border bg-background text-foreground', dot: 'bg-foreground' },
  { chip: 'border-border bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
]

// Get consistent color for a tag based on its name
function getTagColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const style = TAG_STYLES[Math.abs(hash) % TAG_STYLES.length]
  return style?.chip || 'border-border bg-muted text-muted-foreground'
}

// Get the background color class for a tag (the first part before the space)
function getTagBgColor(tag: string): string {
  const color = getTagColor(tag)
  const parts = color.split(' ')
  return parts[0] ?? 'bg-muted'
}

function getTagDotColor(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  const style = TAG_STYLES[Math.abs(hash) % TAG_STYLES.length]
  return style?.dot || 'bg-muted-foreground'
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

  const handleNewTagInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagInput(event.target.value)
  }, [])

  const handleClearSelection = useCallback(() => {
    onTagsChange([])
  }, [onTagsChange])

  const handleTagFilterChange = useCallback((tag: string | null) => {
    onTagsChange(tag ? [tag] : [])
    setOpen(false)
  }, [onTagsChange])

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {/* Selected tags */}
      {selectedTags.map((tag) => (
        <SelectedTagBadge key={tag} tag={tag} onRemove={handleRemoveTag} />
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
                placeholder="New tag…"
                value={newTagInput}
                onChange={handleNewTagInputChange}
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
                    sortedAvailableTags.map((tag) => (
                      <AvailableTagButton
                        key={tag}
                        tag={tag}
                        selected={selectedTags.includes(tag)}
                        onToggle={handleToggleTag}
                      />
                    ))
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
          <TagFilterOptionButton
            label="All tags"
            selected={!selectedTag}
            tag={null}
            selectedTag={selectedTag}
            onTagChange={onTagChange}
          />
          {availableTags.map((tag) => (
            <TagFilterOptionButton
              key={tag}
              label={tag}
              selected={selectedTag === tag}
              dotClassName={getTagBgColor(tag)}
              tag={tag}
              selectedTag={selectedTag}
              onTagChange={onTagChange}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SelectedTagBadge({
  tag,
  onRemove,
}: {
  tag: string
  onRemove: (tag: string, event: React.MouseEvent) => void
}) {
  const handleRemove = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    onRemove(tag, event)
  }, [onRemove, tag])

  return (
    <Badge
      className={cn('gap-1 pr-1 motion-chromatic hover:pr-2', getTagColor(tag))}
    >
      <Hash className="h-2.5 w-2.5" />
      {tag}
      <button type="button" onClick={handleRemove} className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/20">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

function AvailableTagButton({
  tag,
  selected,
  onToggle,
}: {
  tag: string
  selected: boolean
  onToggle: (tag: string) => void
}) {
  const handleClick = useCallback(() => {
    onToggle(tag)
  }, [onToggle, tag])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        selected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
      )}
    >
      <div className={cn('h-2 w-2 rounded-full shrink-0', getTagDotColor(tag))} />
      <span className="flex-1 truncate">{tag}</span>
      {selected ? <span className="text-xs">✓</span> : null}
    </button>
  )
}

function TagFilterOptionButton({
  label,
  selected,
  dotClassName,
  tag,
  selectedTag,
  onTagChange,
}: {
  label: string
  selected: boolean
  dotClassName?: string
  tag: string | null
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
}) {
  const handleClick = useCallback(() => {
    onTagChange(tag === selectedTag ? null : tag)
  }, [onTagChange, selectedTag, tag])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        selected ? 'bg-muted' : 'hover:bg-muted'
      )}
    >
      {dotClassName ? <div className={cn('h-2 w-2 shrink-0 rounded-full', dotClassName)} /> : null}
      <span className="truncate">{label}</span>
    </button>
  )
}
