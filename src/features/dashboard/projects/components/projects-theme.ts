import { cn } from '@/lib/utils'

/** Shared surfaces and rhythm for the projects portfolio UI. */
export const PROJECTS_THEME = {
  page: 'mx-auto max-w-7xl space-y-6 pb-12',
  summaryStrip:
    'rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-4 py-4 shadow-sm sm:px-5',
  workspace:
    'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-border/40',
  workspaceRail:
    'flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 lg:flex-row lg:items-center lg:justify-between',
  toolbar: 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
  content: 'px-4 pb-4 pt-2',
  emptyPanel:
    'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-16 text-center',
  segmented:
    'inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm',
  segmentedItem: (active: boolean) =>
    cn(
      'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors',
      active
        ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
    ),
  focusBanner: 'rounded-xl border border-primary/15 bg-primary/5 px-4 py-3',
} as const
