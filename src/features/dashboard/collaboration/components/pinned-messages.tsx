'use client'

import { useCallback, useState } from 'react'

import { LoaderCircle, Pin, PinOff } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { useMutation } from 'convex/react'
import { api as generatedApi } from '/_generated/api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useToast } from '@/shared/ui/use-toast'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'

import { formatRelativeTime } from '../utils'

interface PinnedMessagesProps {
  messages: CollaborationMessage[]
  workspaceId: string | null
  userId: string | null
  onMessageClick?: (messageId: string) => void
  className?: string
  showEmptyState?: boolean
}

/**
 * Displays a list of pinned messages in the channel
 */
export function PinnedMessages({
  messages,
  workspaceId,
  onMessageClick,
  className,
  showEmptyState = false,
}: PinnedMessagesProps) {
  const pinnedMessages = messages.filter((m) => m.isPinned && !m.isDeleted)

  if (pinnedMessages.length === 0) {
    return showEmptyState ? (
      <div className={cn('overflow-hidden', className)}>
        <div className="flex items-center gap-2 border-b border-muted/20 px-4 py-3">
          <Pin className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Pinned Messages</h3>
        </div>
        <div className="p-3">
          <EmptyState
            icon={Pin}
            title="No pinned messages"
            description="Pin important messages to keep them easy to find."
            variant="inline"
            className="rounded-lg border-dashed bg-muted/10 px-3 py-3 [&_p:last-child]:text-xs"
          />
        </div>
      </div>
    ) : null
  }

  return (
    <div className={cn('overflow-hidden border-b bg-muted/30', className)}>
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
        <Pin className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">
          Pinned Messages ({pinnedMessages.length})
        </h3>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y">
        {pinnedMessages.map((message) => (
          <PinnedMessageItem
            key={message.id}
            message={message}
            workspaceId={workspaceId}
            onClick={onMessageClick}
          />
        ))}
      </div>
    </div>
  )
}

interface PinnedMessageItemProps {
  message: CollaborationMessage
  workspaceId: string | null
  onClick?: (messageId: string) => void
}

function PinnedMessageItem({ message, workspaceId, onClick }: PinnedMessageItemProps) {
  const { toast } = useToast()
  const unpinMessage = useMutation(generatedApi.collaborationMessages.unpinMessage)

  const [isUnpinning, setIsUnpinning] = useState(false)

  const handleUnpin = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!workspaceId || isUnpinning) return

      setIsUnpinning(true)
      await unpinMessage({
        workspaceId: String(workspaceId),
        legacyId: message.id,
      })
        .then(() => {
          toast({
            title: 'Message unpinned',
            description: 'The message has been removed from pinned messages.',
          })
        })
        .catch((error) => {
          logError(error, 'PinnedMessageItem:handleUnpin')
          toast({
            title: 'Failed to unpin message',
            description: asErrorMessage(error),
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsUnpinning(false)
        })
    },
    [workspaceId, message.id, unpinMessage, isUnpinning, toast]
  )

  const handleClick = useCallback(() => {
    onClick?.(message.id)
  }, [message.id, onClick])

  return (
    <div className="group flex items-start gap-3 p-3 transition-colors hover:bg-muted/50">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-start gap-3 text-left"
        onClick={handleClick}
        aria-label={`Open pinned message from ${message.senderName}`}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-2 ring-background">
          {message.senderName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{message.senderName}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{message.content}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{message.pinnedAt && formatRelativeTime(message.pinnedAt)}</span>
            {message.attachments && message.attachments.length > 0 ? (
              <span className="text-xs text-muted-foreground">📎 {message.attachments.length}</span>
            ) : null}
            {message.reactions && message.reactions.length > 0 ? (
              <span className="text-xs text-muted-foreground">{message.reactions.reduce((sum, r) => sum + r.count, 0)} reactions</span>
            ) : null}
          </div>
        </div>
      </button>

      <div className="shrink-0">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  onClick={handleUnpin}
                  disabled={isUnpinning || !workspaceId}
                  aria-label="Unpin message"
                >
                  {isUnpinning ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <PinOff className="h-4 w-4" aria-hidden />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Unpin message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
      </div>
    </div>
  )
}

/**
 * Pin/unpin button for individual messages
 */
export function PinMessageButton({
  message,
  workspaceId,
  userId,
  onPinChange,
  variant = 'icon',
  className,
}: {
  message: CollaborationMessage
  workspaceId: string | null
  userId: string | null
  onPinChange?: (messageId: string, isPinned: boolean) => void
  variant?: 'icon' | 'button'
  className?: string
}) {
  const { toast } = useToast()
  const pinMessageMutation = useMutation(generatedApi.collaborationMessages.pinMessage)
  const unpinMessageMutation = useMutation(generatedApi.collaborationMessages.unpinMessage)

  const [isLoading, setIsLoading] = useState(false)

  const isPinned = message.isPinned ?? false

  const handleTogglePin = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (!workspaceId || isLoading) return

      setIsLoading(true)
      const mutation = isPinned
        ? unpinMessageMutation({
            workspaceId: String(workspaceId),
            legacyId: message.id,
          }).then(() => {
            toast({
              title: 'Message unpinned',
              description: 'The message has been removed from pinned messages.',
            })
            onPinChange?.(message.id, false)
          })
        : pinMessageMutation({
            workspaceId: String(workspaceId),
            legacyId: message.id,
            userId: String(userId),
          }).then(() => {
            toast({
              title: 'Message pinned',
              description: 'The message has been pinned to the channel.',
            })
            onPinChange?.(message.id, true)
          })

      await mutation
        .catch((error) => {
          logError(error, 'PinMessageButton:handleTogglePin')
          toast({
            title: 'Failed to update pin',
            description: asErrorMessage(error),
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    },
    [workspaceId, userId, message.id, isPinned, pinMessageMutation, unpinMessageMutation, isLoading, toast, onPinChange]
  )

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant={isPinned ? 'default' : 'outline'}
        size="sm"
        onClick={handleTogglePin}
        disabled={isLoading}
        className={cn('gap-2', className)}
      >
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : isPinned ? (
          <PinOff className="h-4 w-4" />
        ) : (
          <Pin className="h-4 w-4" />
        )}
        {isPinned ? 'Unpin' : 'Pin'}
      </Button>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('h-7 w-7', isPinned && 'text-primary', className)}
            onClick={handleTogglePin}
            disabled={isLoading}
            aria-label={isPinned ? 'Unpin message' : 'Pin message'}
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : isPinned ? (
              <Pin className="h-4 w-4 fill-primary" aria-hidden />
            ) : (
              <Pin className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isPinned ? 'Unpin from channel' : 'Pin to channel'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Pinned message badge shown on message cards
 */
export function PinnedMessageBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium',
        className
      )}
    >
      <Pin className="h-3 w-3" />
      <span>Pinned</span>
    </div>
  )
}
