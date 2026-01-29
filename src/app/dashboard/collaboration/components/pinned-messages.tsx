'use client'

import { Pin, PinOff, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'
import { useCallback, useState } from 'react'
import { formatRelativeTime } from '../utils'

interface PinnedMessagesProps {
  messages: CollaborationMessage[]
  workspaceId: string | null
  userId: string | null
  onMessageClick?: (messageId: string) => void
  className?: string
}

/**
 * Displays a list of pinned messages in the channel
 */
export function PinnedMessages({
  messages,
  workspaceId,
  userId,
  onMessageClick,
  className,
}: PinnedMessagesProps) {
  const pinnedMessages = messages.filter((m) => m.isPinned && !m.isDeleted)

  if (pinnedMessages.length === 0) {
    return null
  }

  return (
    <div className={cn('border-b bg-muted/30', className)}>
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/50">
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
            userId={userId}
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
  userId: string | null
  onClick?: (messageId: string) => void
}

function PinnedMessageItem({ message, workspaceId, userId, onClick }: PinnedMessageItemProps) {
  const { toast } = useToast()
  const pinMessage = useMutation((collaborationApi as any).pinMessage)
  const unpinMessage = useMutation((collaborationApi as any).unpinMessage)

  const [isPinning, setIsPinning] = useState(false)
  const [isUnpinning, setIsUnpinning] = useState(false)

  const handleUnpin = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!workspaceId || isUnpinning) return

      setIsUnpinning(true)
      try {
        await unpinMessage({
          workspaceId: String(workspaceId),
          legacyId: message.id,
        })
        toast({
          title: 'Message unpinned',
          description: 'The message has been removed from pinned messages.',
        })
      } catch (error) {
        logError(error, 'PinnedMessageItem:handleUnpin')
        toast({
          title: 'Failed to unpin message',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      } finally {
        setIsUnpinning(false)
      }
    },
    [workspaceId, message.id, unpinMessage, isUnpinning, toast]
  )

  const handleClick = useCallback(() => {
    onClick?.(message.id)
  }, [message.id, onClick])

  return (
    <div
      className="group flex gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      {/* Sender avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary ring-2 ring-background">
        {message.senderName.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              {message.senderName}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {message.content}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {message.pinnedAt && formatRelativeTime(message.pinnedAt)}
              </span>
              {message.attachments && message.attachments.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  📎 {message.attachments.length}
                </span>
              )}
              {message.reactions && message.reactions.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {message.reactions.reduce((sum, r) => sum + r.count, 0)} reactions
                </span>
              )}
            </div>
          </div>

          {/* Unpin button */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleUnpin}
                  disabled={isUnpinning}
                >
                  {isUnpinning ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                  <span className="sr-only">Unpin message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Unpin message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
  const pinMessageMutation = useMutation((collaborationApi as any).pinMessage)
  const unpinMessageMutation = useMutation((collaborationApi as any).unpinMessage)

  const [isLoading, setIsLoading] = useState(false)

  const isPinned = message.isPinned ?? false

  const handleTogglePin = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (!workspaceId || isLoading) return

      setIsLoading(true)
      try {
        if (isPinned) {
          await unpinMessageMutation({
            workspaceId: String(workspaceId),
            legacyId: message.id,
          })
          toast({
            title: 'Message unpinned',
            description: 'The message has been removed from pinned messages.',
          })
          onPinChange?.(message.id, false)
        } else {
          await pinMessageMutation({
            workspaceId: String(workspaceId),
            legacyId: message.id,
            userId: String(userId),
          })
          toast({
            title: 'Message pinned',
            description: 'The message has been pinned to the channel.',
          })
          onPinChange?.(message.id, true)
        }
      } catch (error) {
        logError(error, 'PinMessageButton:handleTogglePin')
        toast({
          title: 'Failed to update pin',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [workspaceId, userId, message.id, isPinned, pinMessageMutation, unpinMessageMutation, isLoading, toast, onPinChange]
  )

  if (variant === 'button') {
    return (
      <Button
        type="button"
        variant={isPinned ? 'default' : 'outline'}
        size="sm"
        onClick={(e) => handleTogglePin(e)}
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
            onClick={(e) => handleTogglePin(e)}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : isPinned ? (
              <Pin className="h-4 w-4 fill-primary" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
            <span className="sr-only">{isPinned ? 'Unpin message' : 'Pin message'}</span>
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
