'use client'

import { Check, CheckCheck, Clock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { CollaborationMessage } from '@/types/collaboration'

interface MessageReadReceiptsProps {
  message: CollaborationMessage
  currentUserId: string | null
  channelMemberCount?: number
  readByNames?: string[] // Names of users who read the message
  className?: string
}

type ReadStatus = 'sent' | 'delivered' | 'read' | 'read_by_all'

/**
 * Displays read receipt status for a message
 * Shows single check for sent, double check for delivered/read, filled double check for read
 */
export function MessageReadReceipts({
  message,
  currentUserId,
  channelMemberCount = 0,
  readByNames = [],
  className,
}: MessageReadReceiptsProps) {
  // Don't show read receipts for own messages or deleted messages
  if (message.senderId === currentUserId || message.isDeleted) {
    return null
  }

  const readBy = message.readBy ?? []
  const deliveredTo = message.deliveredTo ?? []
  const readCount = readBy.length

  // Determine status
  let status: ReadStatus = 'sent'
  if (readCount > 0) {
    status = 'read'
  } else if (deliveredTo.length > 0) {
    status = 'delivered'
  }

  // Check if all channel members have read
  if (channelMemberCount > 0 && readCount >= channelMemberCount - 1) {
    status = 'read_by_all'
  }

  // Don't show for own messages (handled above) or if no read receipts
  if (status === 'sent' && readBy.length === 0 && deliveredTo.length === 0) {
    return null
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('flex items-center gap-0.5 text-muted-foreground', className)}>
            {status === 'sent' && <Clock className="h-3.5 w-3.5 text-muted-foreground" />}
            {status === 'delivered' && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
            {status === 'read' && <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />}
            {status === 'read_by_all' && (
              <CheckCheck className="h-3.5 w-3.5 text-primary fill-primary" />
            )}
            {readCount > 0 && (
              <span className="text-xs text-muted-foreground">{readCount}</span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          {readCount === 0 && <p>Delivered</p>}
          {readCount === 1 && (
            <p>
              Read by <strong>{readByNames[0] || '1 person'}</strong>
            </p>
          )}
          {readCount === 2 && (
            <p>
              Read by <strong>{readByNames[0] || '1 person'}</strong> and{' '}
              <strong>{readByNames[1] || '1 other'}</strong>
            </p>
          )}
          {readCount === 3 && (
            <p>
              Read by <strong>{readByNames[0]}</strong>, <strong>{readByNames[1]}</strong>, and{' '}
              <strong>{readByNames[2]}</strong>
            </p>
          )}
          {readCount > 3 && (
            <p>
              Read by <strong>{readByNames[0]}</strong>, <strong>{readByNames[1]}</strong>, and{' '}
              <strong>{readCount - 2} others</strong>
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Compact read receipt indicator for message list view
 */
export function CompactReadReceipt({
  message,
  currentUserId,
  className,
}: {
  message: CollaborationMessage
  currentUserId: string | null
  className?: string
}) {
  if (message.senderId === currentUserId || message.isDeleted) {
    return null
  }

  const readBy = message.readBy ?? []
  if (readBy.length === 0) return null

  return (
    <span
      className={cn(
        'flex items-center gap-0.5 text-xs text-muted-foreground',
        'bg-muted/50 px-1.5 py-0.5 rounded-full',
        className
      )}
    >
      <CheckCheck className="h-3 w-3" />
      <span>{readBy.length}</span>
    </span>
  )
}

/**
 * Read receipt detail panel shown in message hover/selection
 */
export function ReadReceiptDetail({
  message,
  channelMembers,
  className,
}: {
  message: CollaborationMessage
  channelMembers?: Array<{ id: string; name: string; avatarUrl?: string }>
  className?: string
}) {
  const readBy = message.readBy ?? []
  const deliveredTo = message.deliveredTo ?? []

  if (readBy.length === 0 && deliveredTo.length === 0) {
    return (
      <div className={cn('text-xs text-muted-foreground', className)}>
        Not yet delivered to anyone
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {readBy.length > 0 && (
        <div>
          <p className="text-xs font-medium text-foreground mb-1">
            Read by {readBy.length}
          </p>
          <div className="flex flex-wrap gap-1">
            {readBy.map((userId) => {
              const member = channelMembers?.find((m) => m.id === userId)
              return (
                <span
                  key={userId}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                >
                  {member?.name || userId}
                </span>
              )
            })}
          </div>
        </div>
      )}
      {deliveredTo.length > readBy.length && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Delivered but not read ({deliveredTo.length - readBy.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {deliveredTo
              .filter((id) => !readBy.includes(id))
              .map((userId) => {
                const member = channelMembers?.find((m) => m.id === userId)
                return (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                  >
                    {member?.name || userId}
                  </span>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Delivery status indicator for sender's own messages
 * Shows when the message was sent, delivered, and read
 */
export function MessageDeliveryStatus({
  message,
  currentUserId,
  channelMemberCount = 0,
  memberNames,
  className,
}: {
  message: CollaborationMessage
  currentUserId: string | null
  channelMemberCount?: number
  memberNames?: Record<string, string> // Map of userId to name
  className?: string
}) {
  // Only show for own messages
  if (message.senderId !== currentUserId || message.isDeleted) {
    return null
  }

  const readBy = message.readBy ?? []
  const deliveredTo = message.deliveredTo ?? []
  const readCount = readBy.length
  const deliveredCount = deliveredTo.length

  // Determine delivery status
  let status: 'sent' | 'delivered' | 'read' = 'sent'
  let tooltipText = 'Sent'

  if (readCount > 0) {
    status = 'read'
    if (readCount === 1) {
      const firstName = readBy[0] ? memberNames?.[readBy[0]] : 'someone'
      tooltipText = `Read by ${firstName}`
    } else if (readCount === 2) {
      const firstName = readBy[0] ? memberNames?.[readBy[0]] : 'someone'
      const secondName = readBy[1] ? memberNames?.[readBy[1]] : 'someone else'
      tooltipText = `Read by ${firstName} and ${secondName}`
    } else {
      tooltipText = `Read by ${readCount} people`
    }
  } else if (deliveredCount > 0) {
    status = 'delivered'
    tooltipText = `Delivered to ${deliveredCount} ${deliveredCount === 1 ? 'person' : 'people'}`
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('flex items-center gap-0.5 text-muted-foreground', className)}>
            {status === 'sent' && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
            {status === 'delivered' && (
              <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            {status === 'read' && (
              <CheckCheck className="h-3.5 w-3.5 text-primary fill-primary" />
            )}
            {(readCount > 0 || deliveredCount > 0) && (
              <span className="text-xs text-muted-foreground">
                {readCount > 0 ? readCount : deliveredCount}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
