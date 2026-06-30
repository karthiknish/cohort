'use client';
import { useCallback, type ReactNode } from 'react';
import { History, Maximize2, PanelRight, PictureInPicture2, Sparkles, SquarePen, X, } from 'lucide-react';
import { AnimatePresence, m } from '@/shared/ui/motion';
import { layoutLabel, type AgentPanelLayout } from '@/lib/agent-panel-layout';
import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/shared/hooks/use-agent-mode';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { ConnectionIndicator } from './agent-mode-panel-composer';
import { AGENT_PANEL_SURFACE } from './agent-mode-panel-message-constants';
export function AgentModeHeader({ connectionStatus, conversationId, activeConversationTitle, messagesCount, showHistory, panelLayout, onClose, onStartNewChat, onToggleHistory, onSetPanelLayout, }: {
    connectionStatus: ConnectionStatus;
    conversationId: string | null;
    activeConversationTitle?: string | null;
    messagesCount: number;
    showHistory: boolean;
    panelLayout?: AgentPanelLayout;
    onClose: () => void;
    onStartNewChat: () => void;
    onToggleHistory: () => void;
    onSetPanelLayout?: (layout: AgentPanelLayout) => void;
}) {
    const LayoutIcon = panelLayout === 'fullscreen' ? Maximize2 : panelLayout === 'compact' ? PictureInPicture2 : PanelRight;
    const handlePanelLayoutChange = (value: string) => {
        if (value === 'compact' || value === 'docked' || value === 'fullscreen') {
            onSetPanelLayout?.(value);
        }
    };
    return (<div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-primary/[0.06] via-background to-background px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
          <Sparkles className="size-4 text-primary" aria-hidden/>
        </div>
        <div className="min-w-0">
          <span id="agent-mode-dialog-title" className="block text-sm font-semibold tracking-tight">
            Agent Mode
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {activeConversationTitle?.trim()
            ? activeConversationTitle
            : conversationId
                ? 'Active conversation'
                : 'Workspace assistant'}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {conversationId || messagesCount > 0 ? (<Button variant="outline" size="sm" onClick={onStartNewChat} className="h-8 gap-1.5 rounded-full px-3 text-xs">
            <SquarePen className="size-3.5"/>
            New
          </Button>) : null}

        <AnimatePresence>
          {connectionStatus !== 'connected' ? <ConnectionIndicator status={connectionStatus}/> : null}
        </AnimatePresence>

        <Button variant="ghost" size="icon" onClick={onToggleHistory} className={cn('size-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring', showHistory && 'bg-muted')} aria-label="Toggle chat history" title="Chat history (⌘⇧H)">
          <History className="size-4"/>
        </Button>

        {onSetPanelLayout && panelLayout ? (<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Panel layout: ${layoutLabel(panelLayout)}`} title={`Layout: ${layoutLabel(panelLayout)}`}>
                <LayoutIcon className="size-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuRadioGroup value={panelLayout} onValueChange={handlePanelLayoutChange}>
                <DropdownMenuRadioItem value="compact">Compact floating</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="docked">Docked (keep dashboard visible)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="fullscreen">Full screen</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>) : null}

        <Button variant="ghost" size="icon" onClick={onClose} className="size-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring" aria-label="Close Agent Mode">
          <X className="size-4"/>
        </Button>
      </div>
    </div>);
}
export function AgentEmptyState({ children }: {
    children: ReactNode;
}) {
    return (<div className={cn('flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8 sm:px-6', AGENT_PANEL_SURFACE)}>
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 flex size-16 items-center justify-center">
            <span className="absolute inset-0 rounded-2xl bg-primary/15 blur-lg" aria-hidden/>
            <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/25">
              <Sparkles className="size-8 text-primary" aria-hidden/>
            </div>
          </div>
          <p className="text-xl font-semibold tracking-tight">What can I help with?</p>
          <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Ask in plain language, attach files for context, or type{' '}
            <kbd className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[11px]">@</kbd> to
            mention clients, projects, or teammates.
          </p>
        </div>

        {children}
      </div>
    </div>);
}
