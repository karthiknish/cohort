'use client'

import { useState, useMemo } from 'react'
import { Search, User, Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useQuery } from 'convex/react'
import { api } from '@/lib/convex-api'

interface NewDMDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserSelect: (user: { id: string; name: string; role?: string | null }) => Promise<void>
  workspaceId: string | null
  currentUserId: string | null
}

export function NewDMDialog({
  open,
  onOpenChange,
  onUserSelect,
  workspaceId,
  currentUserId,
}: NewDMDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const workspaceMembers = useQuery(
    (api as any).users.listWorkspaceMembers,
    workspaceId ? { workspaceId } : 'skip'
  )

  const filteredUsers = useMemo(() => {
    if (!workspaceMembers) return []
    
    return workspaceMembers
      .filter((member: any) => member._id !== currentUserId)
      .filter((member: any) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
          member.name?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query)
        )
      })
  }, [workspaceMembers, currentUserId, searchQuery])

  const handleUserClick = async (user: { _id: string; name?: string | null; role?: string | null }) => {
    setIsCreating(true)
    try {
      await onUserSelect({
        id: user._id,
        name: user.name ?? 'Unknown User',
        role: user.role,
      })
    } finally {
      setIsCreating(false)
      setSearchQuery('')
    }
  }

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
          <DialogDescription>
            Select a teammate to start a conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teammates..."
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[300px] mt-4">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No teammates match your search.' : 'No teammates available.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 pr-4">
              {filteredUsers.map((user: any) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => handleUserClick(user)}
                  disabled={isCreating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all hover:bg-muted/50 disabled:opacity-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {user.name ?? 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {user.role && (
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  )}
                  {isCreating && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
