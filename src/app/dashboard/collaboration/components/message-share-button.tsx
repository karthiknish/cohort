'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { CollaborationMessage } from '@/types/collaboration'

// Official Slack logo
function SlackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 127 127" className={className}>
      <path fill="#E01E5A" d="M27.2 80.0c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2v13.2zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z"/>
      <path fill="#36C5F0" d="M47 27.0c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2v13.2H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H13.9C6.6 60.1.7 54.2.7 46.9s5.9-13.2 13.2-13.2H47z"/>
      <path fill="#2EB67D" d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V13.8C66.9 6.5 72.8.6 80.1.6s13.2 5.9 13.2 13.2v33.1z"/>
      <path fill="#ECB22E" d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H80.1z"/>
    </svg>
  )
}

// Official Microsoft Teams logo
function TeamsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 2228.6 2073.2" className={className}>
      <path fill="#5059C9" d="M1554.6 0v518.4h518.4V0h-518.4zM1036.2 155.4c-285.3 0-517.4 232.1-517.4 517.4 0 285.3 232.1 517.4 517.4 517.4 285.3 0 517.4-232.1 517.4-517.4 0-285.3-232.1-517.4-517.4-517.4z"/>
      <path fill="#7B83EB" d="M0 1020.8c0 285.3 232.1 517.4 517.4 517.4s517.4-232.1 517.4-517.4c0-285.3-232.1-517.4-517.4-517.4S0 735.5 0 1020.8z"/>
      <path fill="#5059C9" d="M1036.2 1039.1h941.8v1034.1h-941.8z"/>
      <path fill="#7B83EB" d="M1554.6 518.4h674v1034.1h-674z"/>
      <circle fill="#fff" cx="1036.2" cy="672.8" r="287.1"/>
      <path fill="#fff" d="M1276.7 1387.5c0 128.6-104.3 232.9-232.9 232.9s-232.9-104.3-232.9-232.9c0-128.6 104.3-232.9 232.9-232.9 128.5 0 232.9 104.3 232.9 232.9"/>
    </svg>
  )
}

// Official WhatsApp logo
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

interface ShareMessageButtonProps {
  message: CollaborationMessage
  onShare: (platform: 'slack' | 'teams' | 'whatsapp') => Promise<void>
  sharedTo?: Array<'slack' | 'teams' | 'whatsapp'>
}

export function ShareMessageButton({ message, onShare, sharedTo = [] }: ShareMessageButtonProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const handleShare = async (platform: 'slack' | 'teams' | 'whatsapp') => {
    if (isSharing) return
    
    setIsSharing(true)
    setShareError(null)
    
    try {
      await onShare(platform)
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Failed to share')
    } finally {
      setIsSharing(false)
    }
  }

  const isSharedToSlack = sharedTo.includes('slack')
  const isSharedToTeams = sharedTo.includes('teams')
  const isSharedToWhatsApp = sharedTo.includes('whatsapp')

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
            onClick={() => handleShare('slack')}
            disabled={isSharing || isSharedToSlack}
            className="gap-2"
          >
            <SlackIcon className="h-4 w-4" />
            <span>Share to Slack</span>
            {isSharedToSlack && <span className="ml-auto text-xs text-green-600">✓</span>}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleShare('teams')}
            disabled={isSharing || isSharedToTeams}
            className="gap-2"
          >
            <TeamsIcon className="h-4 w-4" />
            <span>Share to Teams</span>
            {isSharedToTeams && <span className="ml-auto text-xs text-green-600">✓</span>}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => handleShare('whatsapp')}
            disabled={isSharing || isSharedToWhatsApp}
            className="gap-2"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>Share to WhatsApp</span>
            {isSharedToWhatsApp && <span className="ml-auto text-xs text-green-600">✓</span>}
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
  sharedTo: Array<'slack' | 'teams' | 'whatsapp'>
}

export function SharedPlatformIcons({ sharedTo }: SharedPlatformIconsProps) {
  if (!sharedTo || sharedTo.length === 0) return null

  return (
    <div className="flex items-center gap-1 mt-1">
      <span className="text-xs text-muted-foreground">Shared to:</span>
      <div className="flex items-center gap-1">
        {sharedTo.includes('slack') && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-5 h-5">
                  <SlackIcon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Shared to Slack
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {sharedTo.includes('teams') && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-5 h-5">
                  <TeamsIcon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Shared to Teams
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {sharedTo.includes('whatsapp') && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-5 h-5 text-[#25D366]">
                  <WhatsAppIcon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Shared to WhatsApp
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
