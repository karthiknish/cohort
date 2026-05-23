'use client'

import { reportConvexFailure } from '@/lib/handle-convex-error'
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
import { useToast } from '@/shared/ui/use-toast'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { ClientRelativeTime } from '@/shared/components/client-relative-time'
import { cn } from '@/lib/utils'
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
  onResultClick?: (messageId: string, channelId: string, threadRootId?: string | null) => void
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
  const { toast } = useToast()
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
        logError(error, 'CrossChannelSearch:handleSearch')
        setResults([])
        reportConvexFailure({
        error: error,
        context: 'cross-channel-search.tsx:catch',
        title: 'Search failed',
        fallbackMessage: 'Search failed',
        })
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

  const handleToggleAttachment = useCallback(() => {
    setHasAttachment((current) => !current)
  }, [])

  const handleToggleLink = useCallback(() => {
    setHasLink((current) => !current)
  }, [])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      const threadRootId =
        result.message.threadRootId?.trim() ||
        result.message.parentMessageId?.trim() ||
        null
      onResultClick?.(result.message.id, result.channel.id, threadRootId)
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
    handleToggleAttachment,
    handleToggleLink,
  }
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
  onQueryChange: React.ChangeEventHandler<HTMLInputElement>
  onKeyDown: (event: React.KeyboardEvent) => void
  onSearch: () => void | Promise<void>
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search messages…"
          value={query}
          onChange={onQueryChange}
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
          <CrossChannelSearchFilterButton
            key={type}
            variant={filterState.selectedChannelType === type ? 'default' : 'outline'}
            size="sm"
            onSelect={onChannelTypeChange}
            value={type}
            className="capitalize"
          >
            {type}
          </CrossChannelSearchFilterButton>
        ))}
      </div>

      <Button
        type="button"
        variant={filterState.hasAttachment ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleAttachment}
        className="gap-1"
      >
        <Paperclip className="size-3" />
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
          <X className="size-3" />
          Clear
        </Button>
      ) : null}
    </div>
  )
}

interface CrossChannelSearchFilterButtonProps {
  variant: 'default' | 'outline'
  size: 'sm'
  onSelect: (value: CollaborationChannelType | 'all') => void
  value: CollaborationChannelType | 'all'
  className?: string
  children: string
}

function CrossChannelSearchFilterButton({
  variant,
  size,
  onSelect,
  value,
  className,
  children,
}: CrossChannelSearchFilterButtonProps) {
  const onSelectFilter = useCallback(() => {
    onSelect(value)
  }, [onSelect, value])

  return (
    <Button type="button" variant={variant} size={size} onClick={onSelectFilter} className={className}>
      {children}
    </Button>
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
          <Search className="mb-4 size-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No messages found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : null}

      {results.length === 0 && !query ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 size-12 text-muted-foreground/50" />
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
            onSelect={onResultClick}
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
    handleToggleAttachment,
    handleToggleLink,
  } = useCrossChannelSearchController({ onSearch, onResultClick })

  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }, [setQuery])

  const handleSearchClick = useCallback(() => {
    void handleSearch()
  }, [handleSearch])

  const dialogTrigger =
    trigger ?? (
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="size-4" />
          Search
        </Button>
      </DialogTrigger>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {dialogTrigger}
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
          onQueryChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onSearch={handleSearchClick}
        />

        <CrossChannelSearchFilters
          filterState={filterState}
          hasActiveFilters={hasActiveFilters}
          onChannelTypeChange={setSelectedChannelType}
          onToggleAttachment={handleToggleAttachment}
          onToggleLink={handleToggleLink}
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
  onSelect: (result: SearchResult) => void
}

function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const { message, channel, highlights } = result
  const onSelectSearchResult = useCallback(() => {
    onSelect(result)
  }, [onSelect, result])

  return (
    <button
      type="button"
      onClick={onSelectSearchResult}
      className="w-full text-left p-3 hover:bg-muted/50 rounded-lg transition-colors group"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="size-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-primary flex-shrink-0">
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
            {message.createdAt ? (
              <ClientRelativeTime value={message.createdAt} className="text-xs text-muted-foreground" />
            ) : null}
          </div>

          <p className="text-sm line-clamp-2 mt-1">{message.content}</p>

          {/* Message metadata */}
          <div className="flex items-center gap-3 mt-1.5">
            {message.attachments && message.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="size-3" />
                {message.attachments.length}
              </span>
            )}
            {message.mentions && message.mentions.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <AtSign className="size-3" />
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
                  className="px-1.5 py-0.5 bg-accent/10 text-primary text-xs rounded"
                >
                  {highlight}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
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

  const onQuickSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setValue('')
  }, [])

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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onQuickSearchChange}
        className="pl-9"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  )
}
