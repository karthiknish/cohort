'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface AgentModeButtonProps {
  onClick: () => void
  isOpen: boolean
  className?: string
}

export function AgentModeButton({ onClick, isOpen, className }: AgentModeButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            size="icon"
            className={cn(
              'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300',
              'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
              'hover:scale-105 hover:shadow-xl',
              isOpen && 'rotate-45 bg-destructive hover:bg-destructive/90',
              className
            )}
            aria-label={isOpen ? 'Close Agent Mode' : 'Open Agent Mode'}
          >
            <Sparkles className={cn('h-6 w-6 transition-transform', isOpen && 'rotate-45')} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isOpen ? 'Close Agent Mode' : 'Agent Mode - Chat or speak to navigate'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
