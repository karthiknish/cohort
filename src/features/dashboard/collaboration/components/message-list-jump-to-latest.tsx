'use client';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/shared/ui/button';
type MessageListJumpToLatestProps = {
    visible: boolean;
    onClick: () => void;
};
export function MessageListJumpToLatest({ visible, onClick }: MessageListJumpToLatestProps) {
    if (!visible) {
        return null;
    }
    return (<div className="pointer-events-none absolute bottom-4 right-4 z-10">
      <Button type="button" size="sm" variant="outline" className="pointer-events-auto gap-1.5 text-foreground shadow-md ring-1 ring-border/60 hover:bg-muted/80" onClick={onClick} aria-label="Jump to latest messages">
        <ArrowDown className="size-3.5" aria-hidden/>
        Latest
      </Button>
    </div>);
}
