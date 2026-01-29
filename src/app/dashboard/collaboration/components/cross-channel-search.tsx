'use client'

import { useState, useCallback, useMemo } from 'react'
import { Search, X, ChevronRight, FileText, AtSign, Paperclip, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { CollaborationMessage, CollaborationChannelType } from '@/types/collaboration'

type SearchFilter = 'all' | 'from' | 'hasAttachment' | 'hasLink' | 'date'

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
  channels: ChannelOption[]
  onSearch: (query: CrossChannelSearchQuery) => Promise<SearchResult[]>
  onResultClick?: (messageId: string, channelId: string) => void
  trigger?: React.ReactNode
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

/**
 * Cross-channel message search dialog with advanced filters
 */
export function CrossChannelSearch({
  channels,
  onSearch,
  onResultClick,
  trigger,
}: CrossChannelSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedChannelType, setSelectedChannelType] = useState<CollaborationChannelType | 'all'>('all')
  const [hasAttachment, setHasAttachment] = useState(false)
  const [hasLink, setHasLink] = useState(false)

  // Group channels by type
  const channelsByType = useMemo(() => {
    const grouped: Record<string, ChannelOption[]> = {
      all: channels,
      team: channels.filter((c) => c.type === 'team'),
      client: channels.filter((c) => c.type === 'client'),
      project: channels.filter((c) => c.type === 'project'),
    }
    return grouped
  }, [channels])

  const handleSearch = useCallback(async () => {
    if (!query.trim() || isSearching) return

    setIsSearching(true)
    try {
      const searchResults = await onSearch({
        query: query.trim(),
        channelType: selectedChannelType === 'all' ? undefined : selectedChannelType,
        hasAttachment: hasAttachment || undefined,
        hasLink: hasLink || undefined,
      })
      setResults(searchResults)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }, [query, selectedChannelType, hasAttachment, hasLink, isSearching, onSearch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      onResultClick?.(result.message.id, result.channel.id)
      setOpen(false)
      // Reset search
      setQuery('')
      setResults([])
    },
    [onResultClick]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
    setSelectedChannelType('all')
    setHasAttachment(false)
    setHasLink(false)
  }, [])

  // Filter channels based on selected type
  const availableChannels = selectedChannelType === 'all' ? channels : channelsByType[selectedChannelType] || []

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search Messages</DialogTitle>
          <DialogDescription>
            Search across all channels for messages, attachments, and more.
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={!query.trim() || isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Channel type filter */}
          <div className="flex gap-1">
            {(['all', 'team', 'client', 'project'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={selectedChannelType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedChannelType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Attachment filter */}
          <Button
            type="button"
            variant={hasAttachment ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHasAttachment(!hasAttachment)}
            className="gap-1"
          >
            <Paperclip className="h-3 w-3" />
            Has attachment
          </Button>

          {/* Link filter */}
          <Button
            type="button"
            variant={hasLink ? 'default' : 'outline'}
            size="sm"
            onClick={() => setHasLink(!hasLink)}
            className="gap-1"
          >
            🔗 Has link
          </Button>

          {/* Clear filters */}
          {(selectedChannelType !== 'all' || hasAttachment || hasLink) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {results.length === 0 && query && !isSearching && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No messages found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {results.length === 0 && !query && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Search across all channels</p>
              <p className="text-xs text-muted-foreground mt-1">
                Type a message content, sender name, or use filters
              </p>
            </div>
          )}

          <div className="space-y-1">
            {results.map((result) => (
              <SearchResultItem
                key={`${result.channel.id}-${result.message.id}`}
                result={result}
                onClick={() => handleResultClick(result)}
              />
            ))}
          </div>
        </div>

        {/* Results count */}
        {results.length > 0 && (
          <div className="border-t pt-3 text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        )}
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
              {highlights.slice(0, 3).map((highlight, i) => (
                <span
                  key={i}
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
    (e: React.FormEvent) => {
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
