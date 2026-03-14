'use client'

import { AtSign, ChevronRight, FileText, Paperclip, Search, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { CollaborationChannelType, CollaborationMessage } from '@/types/collaboration'

interface ChannelOption {
  id: string
  name: string
  type: CollaborationChannelType
}

interface SearchResult {
  message: CollaborationMessage
  channel: ChannelOption
  highlights: string[]
}

interface CrossChannelSearchProps {
  onSearch: (query: CrossChannelSearchQuery) => Promise<SearchResult[]>
  onResultClick?: (messageId: string, channelId: string) => void
  trigger?: React.ReactNode
}

type CrossChannelSearchFilterState = {
  selectedChannelType: CollaborationChannelType | 'all'
  hasAttachment: boolean
  hasLink: boolean
}

export interface CrossChannelSearchQuery {
  query: string
  channelType?: CollaborationChannelType
  channelId?: string
  sender?: string
  hasAttachment?: boolean
  hasLink?: boolean
  beforeDate?: string
  afterDate?: string
}

function useCrossChannelSearchController({
  onSearch,
  onResultClick,
}: Pick<CrossChannelSearchProps, 'onSearch' | 'onResultClick'>) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedChannelType, setSelectedChannelType] = useState<CollaborationChannelType | 'all'>('all')
  const [hasAttachment, setHasAttachment] = useState(false)
  const [hasLink, setHasLink] = useState(false)

  const filterState = useMemo<CrossChannelSearchFilterState>(
    () => ({
      selectedChannelType,
      hasAttachment,
      hasLink,
    }),
    [hasAttachment, hasLink, selectedChannelType]
  )

  const hasActiveFilters =
    selectedChannelType !== 'all' || hasAttachment || hasLink

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isSearching) return

    setIsSearching(true)
    await onSearch({
      query: query.trim(),
      channelType: selectedChannelType === 'all' ? undefined : selectedChannelType,
      hasAttachment: hasAttachment || undefined,
      hasLink: hasLink || undefined,
    })
      .then((searchResults) => {
        setResults(searchResults)
      })
      .catch((error) => {
        console.error('Search failed:', error)
      })
      .finally(() => {
        setIsSearching(false)
      })
  }, [hasAttachment, hasLink, isSearching, onSearch, query, selectedChannelType])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void handleSearch()
      }
    },
    [handleSearch]
  )

  const clearFilters = useCallback(() => {
    setSelectedChannelType('all')
    setHasAttachment(false)
    setHasLink(false)
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    clearFilters()
  }, [clearFilters])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      onResultClick?.(result.message.id, result.channel.id)
      setOpen(false)
      setQuery('')
      setResults([])
    },
    [onResultClick]
  )

  return {
    open,
    setOpen,
    query,
    setQuery,
    isSearching,
    results,
    filterState,
    hasActiveFilters,
    handleSearch,
    handleKeyDown,
    handleResultClick,
    clearFilters,
    clearSearch,
    setSelectedChannelType,
    setHasAttachment,
    setHasLink,
  }
}

function SearchTriggerButton({ trigger }: { trigger?: React.ReactNode }) {
  return trigger || (
    <Button variant="outline" size="sm" className="gap-2">
      <Search className="h-4 w-4" />
      Search
    </Button>
  )
}

function CrossChannelSearchBar({
  query,
  isSearching,
  onQueryChange,
  onKeyDown,
  onSearch,
}: {
  query: string
  isSearching: boolean
  onQueryChange: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onSearch: () => void
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onKeyDown}
          className="pl-9"
        />
      </div>
      <Button onClick={onSearch} disabled={!query.trim() || isSearching}>
        {isSearching ? 'Searching…' : 'Search'}
      </Button>
    </div>
  )
}

function CrossChannelSearchFilters({
  filterState,
  hasActiveFilters,
  onChannelTypeChange,
  onToggleAttachment,
  onToggleLink,
  onClear,
}: {
  filterState: CrossChannelSearchFilterState
  hasActiveFilters: boolean
  onChannelTypeChange: (value: CollaborationChannelType | 'all') => void
  onToggleAttachment: () => void
  onToggleLink: () => void
  onClear: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex gap-1">
        {(['all', 'team', 'client', 'project'] as const).map((type) => (
          <Button
            key={type}
            type="button"
            variant={filterState.selectedChannelType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChannelTypeChange(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      <Button
        type="button"
        variant={filterState.hasAttachment ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleAttachment}
        className="gap-1"
      >
        <Paperclip className="h-3 w-3" />
        Has attachment
      </Button>

      <Button
        type="button"
        variant={filterState.hasLink ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleLink}
        className="gap-1"
      >
        🔗 Has link
      </Button>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="gap-1 text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}

function CrossChannelSearchResults({
  query,
  isSearching,
  results,
  onResultClick,
}: {
  query: string
  isSearching: boolean
  results: SearchResult[]
  onResultClick: (result: SearchResult) => void
}) {
  return (
    <div className="flex-1 overflow-y-auto -mx-6 px-6">
      {results.length === 0 && query && !isSearching ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No messages found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : null}

      {results.length === 0 && !query ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Search across all channels</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Type a message content, sender name, or use filters
          </p>
        </div>
      ) : null}

      <div className="space-y-1">
        {results.map((result) => (
          <SearchResultItem
            key={`${result.channel.id}-${result.message.id}`}
            result={result}
            onClick={() => onResultClick(result)}
          />
        ))}
      </div>
    </div>
  )
}

function CrossChannelSearchResultsFooter({ count }: { count: number }) {
  if (count === 0) return null

  return (
    <div className="border-t pt-3 text-sm text-muted-foreground">
      Found {count} result{count !== 1 ? 's' : ''}
    </div>
  )
}

/**
 * Cross-channel message search dialog with advanced filters
 */
export function CrossChannelSearch({
  onSearch,
  onResultClick,
  trigger,
}: CrossChannelSearchProps) {
  const {
    open,
    setOpen,
    query,
    setQuery,
    isSearching,
    results,
    filterState,
    hasActiveFilters,
    handleSearch,
    handleKeyDown,
    handleResultClick,
    clearSearch,
    setSelectedChannelType,
    setHasAttachment,
    setHasLink,
  } = useCrossChannelSearchController({ onSearch, onResultClick })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SearchTriggerButton trigger={trigger} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
          <DialogDescription>
            Search across all channels for messages, attachments, and more.
          </DialogDescription>
        </DialogHeader>

        <CrossChannelSearchBar
          query={query}
          isSearching={isSearching}
          onQueryChange={setQuery}
          onKeyDown={handleKeyDown}
          onSearch={() => {
            void handleSearch()
          }}
        />

        <CrossChannelSearchFilters
          filterState={filterState}
          hasActiveFilters={hasActiveFilters}
          onChannelTypeChange={setSelectedChannelType}
          onToggleAttachment={() => setHasAttachment((current) => !current)}
          onToggleLink={() => setHasLink((current) => !current)}
          onClear={clearSearch}
        />

        <CrossChannelSearchResults
          query={query}
          isSearching={isSearching}
          results={results}
          onResultClick={handleResultClick}
        />

        <CrossChannelSearchResultsFooter count={results.length} />
      </DialogContent>
    </Dialog>
  )
}

interface SearchResultItemProps {
  result: SearchResult
  onClick: () => void
}

function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const { message, channel, highlights } = result

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 hover:bg-muted/50 rounded-lg transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
          {message.senderName.charAt(0).toUpperCase()}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{message.senderName}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {channel.type}
            </Badge>
            <span className="text-xs text-muted-foreground">{channel.name}</span>
            {message.createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(new Date(message.createdAt))}
              </span>
            )}
          </div>

          <p className="text-sm line-clamp-2 mt-1">{message.content}</p>

          {/* Message metadata */}
          <div className="flex items-center gap-3 mt-1.5">
            {message.attachments && message.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {message.attachments.length}
              </span>
            )}
            {message.mentions && message.mentions.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <AtSign className="h-3 w-3" />
                {message.mentions.length}
              </span>
            )}
            {message.reactions && message.reactions.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {message.reactions.map((r) => r.emoji).join(' ')}
              </span>
            )}
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {highlights.slice(0, 3).map((highlight) => (
                <span
                  key={`${result.message.id}-${highlight}`}
                  className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
      </div>
    </button>
  )
}

/**
 * Quick search input for inline use
 */
export function QuickSearchInput({
  onSearch,
  placeholder = 'Search messages...',
  className,
}: {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}) {
  const [value, setValue] = useState('')

  const handleSubmit = useCallback(
    (e: { preventDefault: () => void }) => {
      e.preventDefault()
      if (value.trim()) {
        onSearch(value.trim())
      }
    },
    [value, onSearch]
  )

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )
}
