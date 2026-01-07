'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Building2, FolderKanban, Users, User, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

export type MentionType = 'client' | 'project' | 'team' | 'user'

export interface MentionItem {
  id: string
  name: string
  type: MentionType
  subtitle?: string
}

interface MentionDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: MentionItem) => void
  searchQuery: string
  position?: { top: number; left: number }
  clients?: Array<{ id: string; name: string; company?: string }>
  projects?: Array<{ id: string; name: string; status?: string }>
  teams?: Array<{ id: string; name: string; memberCount?: number }>
  users?: Array<{ id: string; name: string; email?: string; role?: string }>
  isLoading?: boolean
}

const MENTION_CATEGORIES = [
  { type: 'client' as MentionType, label: 'Clients', icon: Building2 },
  { type: 'project' as MentionType, label: 'Projects', icon: FolderKanban },
  { type: 'team' as MentionType, label: 'Teams', icon: Users },
  { type: 'user' as MentionType, label: 'Users', icon: User },
]

function getTypeIcon(type: MentionType) {
  switch (type) {
    case 'client':
      return <Building2 className="h-3.5 w-3.5 text-blue-500" />
    case 'project':
      return <FolderKanban className="h-3.5 w-3.5 text-green-500" />
    case 'team':
      return <Users className="h-3.5 w-3.5 text-purple-500" />
    case 'user':
      return <User className="h-3.5 w-3.5 text-orange-500" />
  }
}

function getTypeColor(type: MentionType): string {
  switch (type) {
    case 'client':
      return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    case 'project':
      return 'bg-green-500/10 text-green-700 border-green-500/20'
    case 'team':
      return 'bg-purple-500/10 text-purple-700 border-purple-500/20'
    case 'user':
      return 'bg-orange-500/10 text-orange-700 border-orange-500/20'
  }
}

export function MentionDropdown({
  isOpen,
  onClose,
  onSelect,
  searchQuery,
  clients = [],
  projects = [],
  teams = [],
  users = [],
  isLoading = false,
}: MentionDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState<MentionType | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Build filtered items list
  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase()
    const items: MentionItem[] = []

    // Filter and add clients
    clients
      .filter((c) => c.name.toLowerCase().includes(query))
      .forEach((c) => items.push({ id: c.id, name: c.name, type: 'client', subtitle: c.company }))

    // Filter and add projects
    projects
      .filter((p) => p.name.toLowerCase().includes(query))
      .forEach((p) => items.push({ id: p.id, name: p.name, type: 'project', subtitle: p.status }))

    // Filter and add teams
    teams
      .filter((t) => t.name.toLowerCase().includes(query))
      .forEach((t) =>
        items.push({
          id: t.id,
          name: t.name,
          type: 'team',
          subtitle: t.memberCount ? `${t.memberCount} members` : undefined,
        })
      )

    // Filter and add users
    users
      .filter((u) => u.name.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query))
      .forEach((u) => items.push({ id: u.id, name: u.name, type: 'user', subtitle: u.role || u.email }))

    // If active category, filter further
    if (activeCategory) {
      return items.filter((item) => item.type === activeCategory)
    }

    return items
  }, [searchQuery, clients, projects, teams, users, activeCategory])

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems.length, searchQuery])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            onSelect(filteredItems[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'Tab':
          e.preventDefault()
          // Cycle through categories
          const categoryOrder: (MentionType | null)[] = [null, 'client', 'project', 'team', 'user']
          const currentIdx = categoryOrder.indexOf(activeCategory)
          setActiveCategory(categoryOrder[(currentIdx + 1) % categoryOrder.length])
          break
      }
    },
    [isOpen, filteredItems, selectedIndex, onSelect, onClose, activeCategory]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border bg-background shadow-lg"
      >
        {/* Category tabs */}
        <div className="flex items-center gap-1 border-b bg-muted/30 px-2 py-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              activeCategory === null ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            All
          </button>
          {MENTION_CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => setActiveCategory(cat.type)}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                activeCategory === cat.type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <cat.icon className="h-3 w-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items list */}
        <ScrollArea className="max-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="p-1">
              {filteredItems.map((item, index) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => onSelect(item)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors',
                    index === selectedIndex ? 'bg-primary/10' : 'hover:bg-muted'
                  )}
                >
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-md border', getTypeColor(item.type))}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.type}</span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Help text */}
        <div className="border-t bg-muted/20 px-3 py-1.5">
          <p className="text-[10px] text-muted-foreground">
            <kbd className="rounded bg-muted px-1 py-0.5 text-[9px]">↑↓</kbd> Navigate{' '}
            <kbd className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]">Enter</kbd> Select{' '}
            <kbd className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]">Tab</kbd> Categories{' '}
            <kbd className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px]">Esc</kbd> Close
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Styled mention pill component for display in messages
export function MentionPill({ item }: { item: MentionItem }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-medium',
        getTypeColor(item.type)
      )}
    >
      {getTypeIcon(item.type)}
      @{item.name}
    </span>
  )
}

// Format mention for display in input
export function formatMention(item: MentionItem): string {
  return `@[${item.name}](${item.type}:${item.id})`
}

// Parse mentions from text
export function parseMentions(text: string): { cleanText: string; mentions: MentionItem[] } {
  const mentionRegex = /@\[([^\]]+)\]\((\w+):([^)]+)\)/g
  const mentions: MentionItem[] = []
  let cleanText = text

  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      name: match[1],
      type: match[2] as MentionType,
      id: match[3],
    })
    cleanText = cleanText.replace(match[0], `@${match[1]}`)
  }

  return { cleanText, mentions }
}
