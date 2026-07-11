import { cn } from '@/lib/utils';

/** Channel / group info modal — clean, flat, single-surface dialog */
export const CHANNEL_INFO_THEME = {
    hero: cn('relative border-b border-border/30 px-5 pb-6 pt-6', 'bg-background'),
    heroTitle: 'text-2xl font-semibold tracking-tight text-foreground',
    heroSubtitle: 'text-sm text-muted-foreground',
    statChip: 'inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80',
    sectionEyebrow: 'text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/75',
    memberRow: cn(
        'flex items-center gap-3 rounded-xl p-2.5',
        'transition-[background-color] hover:bg-muted/40',
        'motion-reduce:transition-none',
    ),
    tabList: cn(
        'grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1',
        'sm:grid-cols-4',
    ),
    tabTrigger: cn(
        'gap-1.5 rounded-md text-xs data-[active]:bg-primary data-[active]:text-primary-foreground data-[active]:shadow-none',
        'sm:text-sm',
    ),
} as const;
