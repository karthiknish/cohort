'use client'

import { useState } from 'react'
import { Mail, Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import type { CollaborationMessage } from '@/types/collaboration'

interface ShareMessageButtonProps {
  message: CollaborationMessage
  onShare: (platform: 'email') => Promise<void>
  sharedTo?: Array<'email'>
}

export function ShareMessageButton({ message, onShare, sharedTo = [] }: ShareMessageButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const handleShare = async () => {
    if (isSharing) return

    setIsSharing(true)
    setShareError(null)

    try {
      await onShare('email')
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Failed to share')
    } finally {
      setIsSharing(false)
    }
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
            {isSharedToEmail && <span className="ml-auto text-xs text-green-600">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {shareError && (
        <span className="text-xs text-red-500">{shareError}</span>
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
            <div className="flex items-center justify-center w-5 h-5 text-blue-500">
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
