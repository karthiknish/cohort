'use client';
import { Sparkles } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import { chromaticTransitionNormalClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
interface AgentModeButtonProps {
    onClick: () => void;
    isOpen: boolean;
    className?: string;
}
export function AgentModeButton({ onClick, isOpen, className }: AgentModeButtonProps) {
    return (<TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onClick} size="icon" id="agent-mode-launcher" className={cn('relative fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] right-4 z-50 size-14 rounded-full shadow-lg ring-2 ring-background sm:bottom-6 sm:right-6', chromaticTransitionNormalClass, 'bg-gradient-to-br from-primary via-primary to-primary/85', 'hover:scale-[1.04] hover:shadow-xl hover:ring-primary/20', !isOpen && 'before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-primary/20 before:blur-md before:content-[""]', isOpen && 'rotate-45 bg-destructive hover:bg-destructive/90 hover:ring-destructive/30', className)} aria-label={isOpen ? 'Close Agent Mode' : 'Open Agent Mode'}>
            <Sparkles className={cn('size-6 transition-transform duration-200', isOpen && '-rotate-45')}/>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isOpen ? 'Close Agent Mode' : 'Agent Mode — chat or speak to navigate (⌘⇧A)'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>);
}
