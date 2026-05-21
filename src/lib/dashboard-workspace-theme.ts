import { cn } from '@/lib/utils'

/** Shared layout tokens for dashboard feature pages (tasks, projects, collaboration inbox). */
export const DASHBOARD_WORKSPACE_THEME = {
  page: 'mx-auto max-w-7xl space-y-6 pb-12',
  summaryStrip:
    'rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 px-4 py-4 shadow-sm sm:px-5',
  workspace:
    'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-border/40',
  workspaceRail:
    'flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
  filterBar:
    'flex flex-col gap-3 border-b border-border/50 bg-background/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
  content: 'relative min-h-[14rem]',
  contentList: 'bg-muted/[0.18]',
  footer: 'flex items-center justify-between border-t border-border/60 bg-muted/10 px-4 py-2.5 text-xs text-muted-foreground',
  emptyPanel:
    'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-16 text-center',
  segmentedList: 'inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm',
  segmentedButton: (active: boolean) =>
    cn(
      'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors',
      active
        ? 'bg-background text-foreground shadow-sm ring-1 ring-border/50'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
    ),
  tabList: 'h-9 gap-0 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm',
  tabTrigger:
    'h-8 rounded-md px-3 text-xs font-medium data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none',
  projectPill:
    'inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-foreground',
} as const
