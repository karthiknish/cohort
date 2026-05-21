import { cn } from '@/lib/utils'

/** Shared surfaces and rhythm for the tasks workspace UI. */
export const TASKS_THEME = {
  page: 'mx-auto max-w-7xl space-y-6 pb-12',
  summaryCard:
    'rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-muted/20 px-4 py-4 shadow-sm sm:px-5',
  workspace:
    'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-border/40',
  rail:
    'flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
  filterBar:
    'flex flex-col gap-3 border-b border-border/50 bg-background/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
  content: 'relative min-h-[14rem]',
  contentList: 'bg-muted/[0.18]',
  footer: 'flex items-center justify-between border-t border-border/60 bg-muted/10 px-4 py-2.5 text-xs text-muted-foreground',
  segmented:
    'inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-background/80 p-0.5 shadow-sm',
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
  emptyPanel:
    'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/10 px-6 py-16 text-center',
  projectPill:
    'inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs text-foreground',
  sheet: {
    content: 'flex h-full w-full flex-col border-l border-border/70 bg-card p-0 shadow-xl sm:max-w-md',
    header:
      'shrink-0 space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-5 py-5 pr-12',
    body: 'flex-1 space-y-5 overflow-y-auto px-5 py-5',
    footer: 'shrink-0 flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end',
  },
  dialog: {
    content: 'gap-0 overflow-hidden p-0 sm:max-w-[32rem]',
    header:
      'space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-5 pb-4 pt-5 pr-12 text-left',
    body: 'space-y-5 px-5 py-5',
    footer: 'flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end',
  },
  viewDialog: {
    shell: 'flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
    header:
      'shrink-0 space-y-3 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/20 px-6 pb-4 pt-5 pr-14',
    tabsRail: 'shrink-0 border-b border-border/50 px-6 py-3',
    body: 'min-h-0 flex-1',
    scroll: 'px-6 pb-5 pt-4',
    footer: 'shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/15 px-6 py-4 sm:flex-row sm:items-center sm:justify-between',
  },
  formSection: 'space-y-3.5 rounded-xl border border-border/60 bg-muted/10 p-4 shadow-sm',
  formSectionTitle: 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
  field: 'space-y-1.5',
  label: 'text-xs font-medium text-foreground',
  hint: 'text-[11px] leading-relaxed text-muted-foreground',
  contextChip:
    'flex min-h-9 items-center rounded-lg border border-border/60 bg-background px-3 text-sm text-foreground shadow-sm',
  input: 'h-9 border-border/60 bg-background text-sm shadow-sm',
  textarea: 'min-h-[5.5rem] resize-y border-border/60 bg-background text-sm shadow-sm',
  selectTrigger: 'h-9 border-border/60 bg-background text-sm shadow-sm',
  error: 'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
  footerPrimary: 'h-9 min-w-[7.5rem] font-medium',
} as const
