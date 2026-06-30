'use client';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
export interface SummaryCardProps {
    label: string;
    value: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description?: string;
    onClick?: () => void;
    active?: boolean;
}
export function SummaryCard({ label, value, icon: Icon, description, onClick, active }: SummaryCardProps) {
    const inner = (<Card className={cn('overflow-hidden border-border/60 bg-background/80 shadow-sm transition-all', onClick && 'hover:border-primary/20 hover:bg-muted/20 hover:shadow-md', active && 'border-primary/30 ring-2 ring-primary/15 ring-offset-2 ring-offset-card')}>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-primary">
          <Icon className="size-5" aria-hidden/>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
          {description ? (<p className="mt-0.5 text-xs text-muted-foreground">{description}</p>) : null}
        </div>
      </CardContent>
    </Card>);
    if (!onClick) {
        return inner;
    }
    return (<button type="button" onClick={onClick} className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-pressed={active}>
      {inner}
    </button>);
}
