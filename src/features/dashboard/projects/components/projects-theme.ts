import { DASHBOARD_WORKSPACE_THEME } from '@/lib/dashboard-workspace-theme';
/** Projects portfolio surfaces — extends shared dashboard workspace tokens. */
export const PROJECTS_THEME = {
    ...DASHBOARD_WORKSPACE_THEME,
    summaryStrip: DASHBOARD_WORKSPACE_THEME.summaryStrip,
    workspaceRail: DASHBOARD_WORKSPACE_THEME.workspaceRail,
    toolbar: 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
    content: 'px-4 pb-4 pt-2',
    segmented: DASHBOARD_WORKSPACE_THEME.segmentedList,
    segmentedItem: DASHBOARD_WORKSPACE_THEME.segmentedButton,
    focusBanner: 'rounded-xl border border-primary/15 bg-primary/5 px-4 py-3',
    sheet: {
        content: 'flex size-full flex-col border-l border-border/70 bg-card p-0 shadow-xl sm:max-w-lg',
        header: 'shrink-0 space-y-1 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-5 pr-12',
        body: 'flex-1 space-y-5 overflow-y-auto overscroll-y-contain p-5',
        footer: 'shrink-0 flex flex-col-reverse gap-2 border-t border-border/60 bg-muted/15 px-5 py-4 sm:flex-row sm:justify-end',
    },
} as const;
