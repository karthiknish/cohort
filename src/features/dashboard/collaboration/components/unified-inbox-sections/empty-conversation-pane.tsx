'use client';
import { Hash, MessageCircle, Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
export function EmptyConversationPane({ channelCount, dmCount, onNewDM, }: {
    channelCount: number;
    dmCount: number;
    onNewDM?: () => void;
}) {
    return (<div className="relative flex min-h-[min(60dvh,480px)] flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-muted/20 via-background to-background px-4 py-10 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"/>
      <div className="relative max-w-md text-center">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-primary ring-1 ring-primary/15">
          <Sparkles className="size-8"/>
        </div>
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Pick a conversation</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose a channel or direct message in the inbox to read the thread, react, and reply in context.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="gap-1.5 border-muted/60 bg-background/80">
            <Hash className="size-3"/>
            {channelCount} channel{channelCount === 1 ? '' : 's'}
          </Badge>
          <Badge variant="outline" className="gap-1.5 border-muted/60 bg-background/80">
            <MessageCircle className="size-3"/>
            {dmCount} DM{dmCount === 1 ? '' : 's'}
          </Badge>
        </div>
        {onNewDM ? (<Button type="button" className="mt-8 gap-2 shadow-sm" onClick={onNewDM}>
            <Plus className="size-4"/>
            Start a direct message
          </Button>) : null}
        <p className="mt-4 text-[11px] text-muted-foreground/80">
          Tip: <kbd className="rounded border border-muted/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">⌘/Ctrl</kbd>{' '}
          + <kbd className="rounded border border-muted/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">K</kbd> focuses inbox search.
        </p>
      </div>
    </div>);
}
