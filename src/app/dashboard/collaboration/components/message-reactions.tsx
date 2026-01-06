'use client'

import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { CollaborationReaction } from '@/types/collaboration'

export interface MessageReactionsProps {
  reactions: CollaborationReaction[]
  currentUserId?: string | null
  pendingEmoji?: string | null
  disabled?: boolean
  onToggle: (emoji: string) => void
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
        {reactions.map((reaction) => {
          const isPendingReaction = pendingEmoji === reaction.emoji
          const isActive = Boolean(currentUserId && reaction.userIds.includes(currentUserId))
          
          return (
            <Tooltip key={reaction.emoji}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant={isActive ? 'secondary' : 'outline'}
                  className={cn(
                    'h-7 rounded-full px-2.5 text-xs transition-all hover:scale-105',
                    isActive && 'border-primary/30 bg-primary/10 hover:bg-primary/20'
                  )}
                  disabled={disabled}
                  aria-pressed={isActive}
                  onClick={() => onToggle(reaction.emoji)}
                >
                  <span className="flex items-center gap-1.5">
                    {isPendingReaction ? (
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                    ) : (
                      <span className="text-base leading-none">{reaction.emoji}</span>
                    )}
                    <span className="font-medium tabular-nums leading-none">
                      {reaction.count}
                    </span>
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {isActive ? 'Remove your reaction' : 'Add reaction'}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </div>
  )
}
