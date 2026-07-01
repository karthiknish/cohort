'use client';
import { cn } from '@/lib/utils';
export function ProposalDraftStatusStrip({ autosaveLabel, autosaveStatus, draftId, }: {
    autosaveLabel: string;
    autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
    draftId: string | null;
}) {
    return (<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <div className={cn('size-2 shrink-0 rounded-full', autosaveStatus === 'saving'
            ? 'animate-pulse bg-primary'
            : autosaveStatus === 'error'
                ? 'bg-destructive'
                : autosaveStatus === 'idle'
                    ? 'bg-warning'
                    : 'bg-success')} aria-hidden/>
        <span>{autosaveLabel}</span>
      </div>
      <span className="font-mono text-[10px] tracking-tight text-muted-foreground/80">
        {draftId ? `Draft · ${draftId.slice(0, 8).toUpperCase()}` : 'New draft'}
      </span>
    </div>);
}
