'use client'

import { Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type PresenceStatus = 'online' | 'away' | 'offline' | 'busy'

interface UserPresenceIndicatorProps {
  status: PresenceStatus
  showLabel?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Visual indicator showing a user's online/presence status
 */
export function UserPresenceIndicator({
  status,
  showLabel = false,
  className,
  size = 'md',
}: UserPresenceIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  }

  const statusClasses: Record<PresenceStatus, string> = {
    online: 'bg-emerald-500 fill-emerald-500',
    away: 'bg-amber-500 fill-amber-500',
    offline: 'bg-gray-400 fill-gray-400',
    busy: 'bg-red-500 fill-red-500',
  }

  const statusLabels: Record<PresenceStatus, string> = {
    online: 'Online',
    away: 'Away',
    offline: 'Offline',
    busy: 'Do not disturb',
  }

  const indicator = (
    <Circle className={cn(sizeClasses[size], statusClasses[status], className)} />
  )

  if (showLabel) {
    return (
      <div className="flex items-center gap-1.5">
        {indicator}
        <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
      </div>
    )
  }

  return indicator
}

interface UserAvatarWithPresenceProps {
  src?: string
  alt: string
  fallback: string
  status?: PresenceStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

/**
 * Avatar component with presence indicator overlay
 */
export function UserAvatarWithPresence({
  src,
  alt,
  fallback,
  status = 'offline',
  size = 'md',
  className,
  onClick,
}: UserAvatarWithPresenceProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  const indicatorSizes = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-3.5 w-3.5',
  }

  const indicatorPositions = {
    sm: 'bottom-0 right-0',
    md: 'bottom-0 right-0',
    lg: 'bottom-1 right-1',
  }

  return (
    <div
      className={cn('relative inline-flex flex-shrink-0', className)}
      onClick={onClick}
    >
      {/* Avatar */}
      <div
        className={cn(
          sizeClasses[size],
          'rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary ring-2 ring-background'
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{fallback}</span>
        )}
      </div>

      {/* Presence indicator */}
      {status !== 'offline' && (
        <span
          className={cn(
            'absolute rounded-full ring-2 ring-background',
            indicatorSizes[size],
            indicatorPositions[size],
            status === 'online' && 'bg-emerald-500',
            status === 'away' && 'bg-amber-500',
            status === 'busy' && 'bg-red-500'
          )}
        />
      )}
    </div>
  )
}

interface ChannelPresenceListProps {
  members: Array<{
    id: string
    name: string
    avatarUrl?: string
    status?: PresenceStatus
    role?: string
  }>
  title?: string
  maxVisible?: number
  className?: string
}

/**
 * List showing online/present users in a channel
 */
export function ChannelPresenceList({
  members,
  title = 'Online',
  maxVisible = 5,
  className,
}: ChannelPresenceListProps) {
  // Filter to only show online or away users
  const onlineMembers = members.filter(
    (m) => m.status === 'online' || m.status === 'away' || m.status === 'busy'
  )

  if (onlineMembers.length === 0) {
    return null
  }

  const displayMembers = onlineMembers.slice(0, maxVisible)
  const remainingCount = onlineMembers.length - maxVisible

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="text-xs text-muted-foreground">{title}:</span>
      <div className="flex -space-x-1">
        {displayMembers.map((member) => (
          <TooltipProvider key={member.id} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary ring-2 ring-background">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span>{member.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'absolute bottom-0 right-0 h-2 w-2 rounded-full ring-1 ring-background',
                      member.status === 'online' && 'bg-emerald-500',
                      member.status === 'away' && 'bg-amber-500',
                      member.status === 'busy' && 'bg-red-500'
                    )}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="text-sm">
                  <p className="font-medium">{member.name}</p>
                  {member.role && (
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground">+{remainingCount}</span>
      )}
    </div>
  )
}

interface TypingIndicatorProps {
  users: Array<{ name: string }>
  className?: string
}

/**
 * Shows which users are currently typing
 */
export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null

  const getText = () => {
    if (users.length === 1) {
      return `${users[0]?.name} is typing...`
    } else if (users.length === 2) {
      return `${users[0]?.name} and ${users[1]?.name} are typing...`
    } else {
      return `${users[0]?.name} and ${users.length - 1} others are typing...`
    }
  }

  return (
    <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
      <div className="flex gap-0.5">
        <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
        <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
        <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
      </div>
      <span>{getText()}</span>
    </div>
  )
}

interface PresenceBadgeProps {
  status: PresenceStatus
  lastSeen?: string
  className?: string
}

/**
 * Badge showing user presence with optional "last seen" time
 */
export function PresenceBadge({ status, lastSeen, className }: PresenceBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <UserPresenceIndicator status={status} size="sm" />
      <span className="text-xs text-muted-foreground">
        {status === 'online' && 'Online now'}
        {status === 'away' && 'Away'}
        {status === 'busy' && 'Busy'}
        {status === 'offline' && lastSeen && `Last seen ${lastSeen}`}
      </span>
    </div>
  )
}
