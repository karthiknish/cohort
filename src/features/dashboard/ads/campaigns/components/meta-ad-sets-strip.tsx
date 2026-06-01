'use client';
import { useCallback } from 'react';
import { Loader2, Pause, Play } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
export type MetaAdSetRow = {
    id: string;
    name: string;
    status: string;
};
type MetaAdSetsStripProps = {
    adSets: MetaAdSetRow[];
    togglingId: string | null;
    onToggleStatus: (adSet: MetaAdSetRow) => void;
};
function isAdSetActive(status: string): boolean {
    const normalized = status.toUpperCase();
    return normalized === 'ACTIVE' || normalized === 'ENABLED';
}
export function MetaAdSetsStrip({ adSets, togglingId, onToggleStatus }: MetaAdSetsStripProps) {
    const handleToggle = (adSet: MetaAdSetRow) => () => {
        onToggleStatus(adSet);
    };
    if (adSets.length === 0)
        return null;
    return (<div className="border-b border-border/50 px-6 py-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Ad sets
      </p>
      <ul className="flex flex-wrap gap-2">
        {adSets.map((adSet) => {
            const active = isAdSetActive(adSet.status);
            const busy = togglingId === adSet.id;
            return (<li key={adSet.id} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/15 px-2.5 py-1.5">
              <span className="max-w-[12rem] truncate text-sm font-medium">{adSet.name}</span>
              <Badge variant={active ? 'default' : 'secondary'} className="text-[10px] capitalize">
                {adSet.status.toLowerCase()}
              </Badge>
              <Button type="button" variant="ghost" size="icon" className={cn('size-7 shrink-0', busy && 'pointer-events-none opacity-60')} disabled={busy} onClick={handleToggle(adSet)} aria-label={active ? `Pause ${adSet.name}` : `Activate ${adSet.name}`}>
                {busy ? (<Loader2 className="size-3.5 animate-spin" aria-hidden/>) : active ? (<Pause className="size-3.5" aria-hidden/>) : (<Play className="size-3.5" aria-hidden/>)}
              </Button>
            </li>);
        })}
      </ul>
    </div>);
}
