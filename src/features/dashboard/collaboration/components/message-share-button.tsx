'use client'

import { useState } from 'react'
import { Mail, Share2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/ui/tooltip'

import type { CollaborationMessage } from '@/types/collaboration'

interface ShareMessageButtonProps {
  message: CollaborationMessage
  onShare: (platform: 'email') => Promise<void>
  sharedTo?: Array<'email'>
}

const EMPTY_SHARED_TO: Array<'email'> = []

export function ShareMessageButton({ message, onShare, sharedTo = EMPTY_SHARED_TO }: ShareMessageButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const handleShare = async () => {
    if (isSharing) return

    setIsSharing(true)
    setShareError(null)

    await onShare('email')
      .catch((error) => {
        setShareError(error instanceof Error ? error.message : 'Failed to share')
      })
      .finally(() => {
        setIsSharing(false)
      })
  }

  const isSharedToEmail = sharedTo.includes('email')

  return (
    <TooltipProvider delayDuration={200}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={isSharing}
                aria-label={`Share message from ${message.senderName ?? 'sender'} via email`}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Share message
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => void handleShare()}
            disabled={isSharing || isSharedToEmail}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            <span>Share via Email</span>
            {isSharedToEmail && <span className="ml-auto text-xs text-success">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {shareError && (
        <span className="text-xs text-destructive">{shareError}</span>
      )}
    </TooltipProvider>
  )
}

interface SharedPlatformIconsProps {
  sharedTo: Array<'email'>
}

export function SharedPlatformIcons({ sharedTo }: SharedPlatformIconsProps) {
  if (!sharedTo || sharedTo.length === 0) return null

  if (!sharedTo.includes('email')) {
    return null
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="text-xs text-muted-foreground">Shared via:</span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex h-5 w-5 items-center justify-center text-info">
              <Mail className="h-4 w-4" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Shared via Email
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
