'use client';
export function AgentMessageDayDivider({ label }: {
    label: string;
}) {
    return (<div className="flex items-center gap-3 py-1" aria-label={label}>
      <hr className="h-px flex-1 border-0 bg-border/60" aria-hidden/>
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" suppressHydrationWarning>
        {label}
      </span>
      <hr className="h-px flex-1 border-0 bg-border/60" aria-hidden/>
    </div>);
}
