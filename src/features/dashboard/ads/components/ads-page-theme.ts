import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'

/** Paid-media workspace — command-center surfaces aligned with dashboard tokens. */
export const ADS_PAGE_THEME = {
  hero: cn(
    'relative overflow-hidden rounded-2xl border border-border/50',
    'bg-linear-to-br from-primary/[0.07] via-card/80 to-info/[0.05]',
    'px-5 py-5 sm:px-6 sm:py-6',
    'shadow-sm ring-1 ring-border/40',
  ),
  heroGlow:
    'pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/12 blur-3xl',
  sectionEyebrow: 'text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80',
  sectionTitle: 'text-lg font-semibold tracking-tight text-foreground',
  sectionDescription: 'max-w-2xl text-sm leading-relaxed text-muted-foreground',
  surfaceCard: cn(
    DASHBOARD_THEME.cards.base,
    'overflow-hidden border-border/60 shadow-sm ring-1 ring-border/30',
  ),
  surfaceCardHighlight: cn(
    'overflow-hidden rounded-2xl border border-primary/15',
    'bg-linear-to-br from-primary/[0.05] via-card to-background',
    'shadow-sm ring-1 ring-primary/10',
  ),
  kpiTile: cn(
    'rounded-2xl border border-border/60 bg-card/90 p-5',
    'shadow-sm transition-[border-color,box-shadow] hover:border-primary/20 hover:shadow-md',
    'motion-reduce:transition-none',
  ),
  kpiLabel: 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
  kpiValue: 'text-2xl font-semibold tracking-tight tabular-nums text-foreground',
  providerTile: cn(
    'relative overflow-hidden rounded-2xl border border-border/60 bg-card/95',
    'shadow-sm transition-[border-color,box-shadow,opacity]',
    'hover:shadow-md motion-reduce:transition-none',
  ),
  emptyState: cn(
    'flex flex-col items-center justify-center gap-4 rounded-2xl',
    'border border-dashed border-border/70 bg-muted/15 p-10 text-center',
  ),
  mobileTabs: 'grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1',
  mobileTabTrigger: 'gap-1.5 rounded-lg text-xs sm:text-sm data-[state=active]:shadow-sm',
  advancedPanel: cn(
    'overflow-hidden rounded-2xl border border-border/60',
    'bg-card/50 shadow-sm ring-1 ring-border/30',
  ),
  /** Campaign & creative detail routes */
  innerContainer: 'mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-20 pt-2 sm:px-6',
  stickyTabBar: cn(
    'sticky top-0 z-10 -mx-4 border-b border-border/50 bg-background/90 px-4 py-3',
    'backdrop-blur-md supports-backdrop-filter:bg-background/75 sm:-mx-6 sm:px-6',
  ),
  innerHero: cn(
    'relative overflow-hidden rounded-2xl border border-border/50',
    'bg-linear-to-br from-primary/[0.06] via-card/90 to-info/[0.04]',
    'px-5 py-5 sm:px-6 sm:py-6',
    'shadow-sm ring-1 ring-border/40',
  ),
  innerHeroGlow:
    'pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl',
  chartCard: cn(
    'overflow-hidden rounded-2xl border border-border/60 bg-card/95',
    'shadow-sm ring-1 ring-border/30',
  ),
  chartCardHeader: 'border-b border-border/50 pb-4',
  sectionBlock: 'space-y-5',
  sectionHeader: 'space-y-1 border-b border-border/50 pb-4',
} as const
