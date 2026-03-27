'use client'

import { useCallback } from 'react'
import { LoaderCircle } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'
import { cn } from '@/lib/utils'
import type { CollaborationReaction } from '@/types/collaboration'

export interface MessageReactionsProps {
  reactions: CollaborationReaction[]
  currentUserId?: string | null
  pendingEmoji?: string | null
  disabled?: boolean
  onToggle: (emoji: string) => void
}

function ReactionButton({
  reaction,
  currentUserId,
  pendingEmoji,
  disabled,
  onToggle,
}: {
  reaction: CollaborationReaction
  currentUserId?: string | null
  pendingEmoji?: string | null
  disabled: boolean
  onToggle: (emoji: string) => void
}) {
  const isPendingReaction = pendingEmoji === reaction.emoji
  const isActive = Boolean(currentUserId && reaction.userIds.includes(currentUserId))

  const handleClick = useCallback(() => {
    onToggle(reaction.emoji)
  }, [onToggle, reaction.emoji])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant={isActive ? 'secondary' : 'outline'}
          className={cn(
            'h-7 rounded-full px-2.5 text-xs transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] hover:scale-105',
            isActive && 'border-primary/30 bg-primary/10 hover:bg-primary/20'
          )}
          disabled={disabled}
          aria-pressed={isActive}
          onClick={handleClick}
        >
          <span className="flex items-center gap-1.5">
            {isPendingReaction ? (
              <LoaderCircle className="h-3 w-3 animate-spin" />
            ) : (
              <span className="text-base leading-none">{reaction.emoji}</span>
            )}
            <span className="font-medium tabular-nums leading-none">{reaction.count}</span>
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {isActive ? 'Remove your reaction' : 'Add reaction'}
      </TooltipContent>
    </Tooltip>
  )
}

export function MessageReactions({
  reactions,
  currentUserId,
  pendingEmoji,
  disabled = false,
  onToggle,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-1">
      <TooltipProvider delayDuration={300}>
        {reactions.map((reaction) => (
          <ReactionButton
            key={reaction.emoji}
            reaction={reaction}
            currentUserId={currentUserId}
            pendingEmoji={pendingEmoji}
            disabled={disabled}
            onToggle={onToggle}
          />
        ))}
      </TooltipProvider>
    </div>
  )
}
