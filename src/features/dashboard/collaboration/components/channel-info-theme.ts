import { cn } from '@/lib/utils'

/** Channel / group info modal — dossier-style workspace surface */
export const CHANNEL_INFO_THEME = {
  hero: cn(
    'relative overflow-hidden border-b border-border/50 px-5 pb-5 pt-6',
    'bg-linear-to-br from-primary/[0.08] via-card to-info/[0.04]',
  ),
  heroGlow:
    'pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-primary/15 blur-3xl',
  heroTitle: 'text-xl font-semibold tracking-tight text-foreground',
  heroSubtitle: 'text-sm text-muted-foreground',
  statChip: cn(
    'inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1',
    'text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground',
  ),
  tabList: cn(
    'mx-4 mt-4 grid h-10 w-auto grid-cols-3 rounded-xl bg-muted/50 p-1',
  ),
  tabTrigger: cn(
    'rounded-lg px-2 py-1.5 text-xs font-semibold data-[state=active]:shadow-sm',
  ),
  sectionEyebrow: 'text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/75',
  memberRow: cn(
    'flex items-center gap-3 rounded-xl border border-transparent p-2.5',
    'transition-[border-color,background-color] hover:border-border/50 hover:bg-muted/30',
    'motion-reduce:transition-none',
  ),
  settingsCard: cn(
    'rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm ring-1 ring-border/30',
  ),
} as const
