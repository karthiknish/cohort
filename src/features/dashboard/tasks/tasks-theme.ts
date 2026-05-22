import { DASHBOARD_WORKSPACE_THEME } from '@/lib/dashboard-workspace-theme'

/** Tasks workspace surfaces — extends shared dashboard workspace tokens. */
export const TASKS_THEME = {
  ...DASHBOARD_WORKSPACE_THEME,
  summaryCard: DASHBOARD_WORKSPACE_THEME.summaryStrip,
  rail: DASHBOARD_WORKSPACE_THEME.workspaceRail,
  segmented: DASHBOARD_WORKSPACE_THEME.segmentedList,
  sheet: {
    content: 'flex size-full flex-col border-l border-border/70 bg-card p-0 shadow-xl sm:max-w-md',
    header:
      'shrink-0 space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-5 pr-12',
    body: 'flex-1 space-y-5 overflow-y-auto p-5',
    footer: 'shrink-0 flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end',
  },
  dialog: {
    content: 'gap-0 overflow-hidden p-0 sm:max-w-[32rem]',
    header:
      'space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 px-5 pb-4 pt-5 pr-12 text-left',
    body: 'space-y-5 p-5',
    footer: 'flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end',
  },
  viewDialog: {
    shell: 'flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl',
    header:
      'shrink-0 space-y-3 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/20 px-6 pb-4 pt-5 pr-14',
    tabsRail: 'shrink-0 border-b border-border/50 bg-muted/10 px-6 py-3',
    tabList: 'grid h-10 w-full grid-cols-2 gap-0.5',
    tabTrigger:
      'h-9 w-full gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border/50',
    body: 'min-h-0 flex-1 overflow-hidden',
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
