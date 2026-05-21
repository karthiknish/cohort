import { DASHBOARD_WORKSPACE_THEME } from '@/lib/dashboard-workspace-theme'

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
} as const
