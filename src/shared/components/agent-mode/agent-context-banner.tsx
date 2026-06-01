'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import { BarChart3, Briefcase, FileText, LayoutGrid, ListChecks, Megaphone, Users } from 'lucide-react';
import type { AgentContextChip, AgentDashboardShortcut } from '@/lib/agent-context';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
const SHORTCUT_ICONS = {
    tasks: ListChecks,
    projects: Briefcase,
    analytics: BarChart3,
    ads: Megaphone,
    proposals: FileText,
    clients: Users,
    meetings: LayoutGrid,
} as const;
type AgentContextBannerProps = {
    chips: AgentContextChip[];
    shortcuts: AgentDashboardShortcut[];
    disabled?: boolean;
    onShortcutPrompt: (prompt: string) => void;
};
function AgentShortcutButton({ shortcut, disabled, onShortcutPrompt, }: {
    shortcut: AgentDashboardShortcut;
    disabled?: boolean;
    onShortcutPrompt: (prompt: string) => void;
}) {
    const Icon = shortcut.icon && shortcut.icon in SHORTCUT_ICONS ? SHORTCUT_ICONS[shortcut.icon] : null;
    const onRunShortcutPrompt = () => {
        onShortcutPrompt(shortcut.prompt);
    };
    return (<Button type="button" variant="outline" size="sm" disabled={disabled} className={cn('h-7 gap-1.5 rounded-full px-2.5 text-xs')} onClick={onRunShortcutPrompt}>
      {Icon ? <Icon className="size-3" aria-hidden/> : null}
      {shortcut.label}
    </Button>);
}
export function AgentContextBanner({ chips, shortcuts, disabled, onShortcutPrompt }: AgentContextBannerProps) {
    if (chips.length === 0 && shortcuts.length === 0) {
        return null;
    }
    return (<div className="shrink-0 space-y-2.5 border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent px-4 py-3">
      {chips.length > 0 ? (<div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">Context</span>
          {chips.map((chip) => chip.href ? (<Badge key={chip.id} variant="secondary" className="rounded-full font-normal" asChild>
                <Link href={chip.href}>{chip.label}</Link>
              </Badge>) : (<Badge key={chip.id} variant="secondary" className="rounded-full font-normal">
                {chip.label}
              </Badge>))}
        </div>) : null}

      <div className="flex flex-wrap gap-1.5">
        {shortcuts.map((shortcut) => (<AgentShortcutButton key={shortcut.id} shortcut={shortcut} disabled={disabled} onShortcutPrompt={onShortcutPrompt}/>))}
      </div>
    </div>);
}
