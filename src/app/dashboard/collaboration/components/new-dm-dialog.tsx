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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useQuery } from 'convex/react'

import { usePreview } from '@/contexts/preview-context'
import { api } from '@/lib/convex-api'
import { getPreviewCollaborationParticipants } from '@/lib/preview-data'

interface NewDMDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserSelect: (user: { id: string; name: string; role?: string | null }) => Promise<void>
  workspaceId: string | null
  currentUserId: string | null
  currentUserRole: string | null | undefined
}

type DmParticipant = {
  id: string
  name?: string
  email?: string
  role?: string | null
}

export function NewDMDialog({
  open,
  onOpenChange,
  onUserSelect,
  workspaceId,
  currentUserId,
  currentUserRole,
}: NewDMDialogProps) {
  const { isPreviewMode } = usePreview()
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const dmParticipants = useQuery(
    api.users.listDMParticipants,
    !isPreviewMode && workspaceId && currentUserId
      ? { workspaceId, currentUserId, currentUserRole: currentUserRole ?? null }
      : 'skip'
  )

  const filteredUsers = useMemo(() => {
    const participants = isPreviewMode
      ? getPreviewCollaborationParticipants()
          .filter((participant) => participant.id !== currentUserId)
          .map((participant) => ({
            id: participant.id,
            name: participant.name,
            email: participant.email,
            role: participant.role,
          }))
      : (Array.isArray(dmParticipants) ? (dmParticipants as DmParticipant[]) : [])

    return participants
      .filter((member) => {
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase()
        return (
          member.name?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query)
        )
      })
  }, [currentUserId, dmParticipants, isPreviewMode, searchQuery])

  const handleUserClick = async (user: { id: string; name?: string; role?: string | null }) => {
    setIsCreating(true)
    await onUserSelect({
      id: user.id,
      name: user.name ?? 'Unknown User',
      role: user.role,
    }).finally(() => {
      setIsCreating(false)
      setSearchQuery('')
    })
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
            placeholder="Search teammates…"
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
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserClick(user)}
                  disabled={isCreating}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:bg-muted/50 disabled:opacity-50"
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
