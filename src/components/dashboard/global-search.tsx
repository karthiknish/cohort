'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Search, X, FileText, MessageSquare, Users, FolderOpen, Hash, Clock } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type SearchResultType = 'tasks' | 'projects' | 'messages' | 'clients' | 'files' | 'proposals' | 'invoices'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  description?: string
  url: string
  relevance?: number
  metadata?: {
    status?: string
    priority?: string
    createdAt?: string
    clientName?: string
    assignee?: string
  }
}

interface GlobalSearchProps {
  trigger?: React.ReactNode
  searchFunctions?: {
    tasks?: (query: string) => Promise<SearchResult[]>
    projects?: (query: string) => Promise<SearchResult[]>
    messages?: (query: string) => Promise<SearchResult[]>
    clients?: (query: string) => Promise<SearchResult[]>
    files?: (query: string) => Promise<SearchResult[]>
    proposals?: (query: string) => Promise<SearchResult[]>
    invoices?: (query: string) => Promise<SearchResult[]>
  }
  onResultClick?: (result: SearchResult) => void
  shortcut?: string
}

const SEARCH_TYPE_ICONS: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  tasks: FileText,
  projects: FolderOpen,
  messages: MessageSquare,
  clients: Users,
  files: FileText,
  proposals: FileText,
  invoices: FileText,
}

const SEARCH_TYPE_LABELS: Record<SearchResultType, string> = {
  tasks: 'Task',
  projects: 'Project',
  messages: 'Message',
  clients: 'Client',
  files: 'File',
  proposals: 'Proposal',
  invoices: 'Invoice',
}

/**
 * Global search dialog with keyboard shortcut support
 */
export function GlobalSearch({
  trigger,
  searchFunctions = {},
  onResultClick,
  shortcut = 'Cmd+K',
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedType, setSelectedType] = useState<SearchResultType | 'all'>('all')

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const keyCombo = isMac ? e.metaKey && e.key === 'k' : e.ctrlKey && e.key === 'k'

      if (keyCombo) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setSelectedType('all')
    }
  }, [open])

  // Perform search
  const performSearch = useCallback(async () => {
    if (!query.trim() || isSearching) return

    setIsSearching(true)

    try {
      const searchPromises = Object.entries(searchFunctions).map(async ([type, fn]) => {
        if (fn && (selectedType === 'all' || selectedType === type)) {
          const typeResults = await fn(query.trim())
          return typeResults.map((r) => ({ ...r, type: type as SearchResultType }))
        }
        return []
      })

      const allResults = await Promise.all(searchPromises)
      const flattened = allResults.flat()

      // Sort by relevance if available
      const sorted = flattened.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0))

      setResults(sorted)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query, selectedType, searchFunctions, isSearching])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Group results by type
  const groupedResults = useMemo(() => {
    const grouped: Record<string, SearchResult[]> = {}
    results.forEach((result) => {
      if (!grouped[result.type]) {
        grouped[result.type] = []
      }
      grouped[result.type]!.push(result)
    })
    return grouped
  }, [results])

  const resultTypes = useMemo(() => {
    return Object.keys(groupedResults) as SearchResultType[]
  }, [groupedResults])

  const defaultTrigger = (
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="gap-2">
        <Search className="h-4 w-4" />
        Search
        <kbd className="ml-1 hidden sm:inline-flex h-5 px-1.5 bg-muted rounded text-xs font-medium text-muted-foreground opacity-70">
          {shortcut}
        </kbd>
      </Button>
    </DialogTrigger>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger || defaultTrigger}
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-0">
        {/* Search input */}
        <div className="flex items-center gap-2 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all items..."
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault()
                setOpen(false)
              }
            }}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Type filters */}
        {resultTypes.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 border-b">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={cn(
                'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                selectedType === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              )}
            >
              All ({results.length})
            </button>
            {resultTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                  selectedType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {SEARCH_TYPE_LABELS[type]} ({groupedResults[type]?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {isSearching && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2">Searching...</span>
            </div>
          )}

          {!isSearching && query.trim().length < 2 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Type to search</p>
              <p className="text-xs text-muted-foreground mt-1">
                Search across tasks, projects, messages, and more
              </p>
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedResults)
                .filter(([_, items]) => selectedType === 'all' || selectedType === _)
                .map(([type, items]) => {
                  const IconComponent = SEARCH_TYPE_ICONS[type as SearchResultType]
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {SEARCH_TYPE_LABELS[type as SearchResultType]}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {items.length}
                        </Badge>
                      </div>
                      {items.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onClick={() => {
                            onResultClick?.(result)
                            setOpen(false)
                          }}
                        />
                      ))}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Footer with hint */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">
                  Enter
                </kbd>
                Open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px]">
                  Esc
                </kbd>
                Close
              </span>
            </div>
            {results.length > 0 && (
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface SearchResultItemProps {
  result: SearchResult
  onClick: () => void
}

function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const IconComponent = SEARCH_TYPE_ICONS[result.type]

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <IconComponent className="h-4 w-4 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium line-clamp-1">{result.title}</p>
          {result.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {result.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1">
            {result.metadata?.status && (
              <Badge variant="outline" className="text-xs">
                {result.metadata.status}
              </Badge>
            )}
            {result.metadata?.priority && (
              <span className="text-xs text-muted-foreground">
                {result.metadata.priority}
              </span>
            )}
            {result.metadata?.createdAt && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(new Date(result.metadata.createdAt))}
              </span>
            )}
            {result.metadata?.clientName && (
              <span className="text-xs text-muted-foreground">
                {result.metadata.clientName}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

/**
 * Quick search input for inline use
 */
export function QuickSearchInput({
  onSearch,
  placeholder = 'Search...',
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

import type { ComponentType } from 'react'
