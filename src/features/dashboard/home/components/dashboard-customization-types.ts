export type DashboardWidget = {
    id: string;
    title: string;
    description?: string;
    component: string;
    size: 'small' | 'medium' | 'large';
    visible: boolean;
    collapsible: boolean;
    collapsed?: boolean;
    category: 'analytics' | 'tasks' | 'collaboration' | 'projects' | 'admin';
};
export const DEFAULT_WIDGETS: DashboardWidget[] = [
    {
        id: 'stats-cards',
        title: 'Stats Overview',
        component: 'StatsCards',
        size: 'large',
        visible: true,
        collapsible: false,
        category: 'analytics',
    },
    {
        id: 'performance-chart',
        title: 'Performance Chart',
        component: 'PerformanceChart',
        size: 'large',
        visible: true,
        collapsible: false,
        category: 'analytics',
    },
    {
        id: 'attention-summary',
        title: 'Attention Summary',
        component: 'AttentionSummaryCard',
        size: 'medium',
        visible: true,
        collapsible: true,
        category: 'admin',
    },
    {
        id: 'activity-feed',
        title: 'Recent Activity',
        component: 'ActivityWidget',
        size: 'medium',
        visible: true,
        collapsible: true,
        category: 'collaboration',
    },
    {
        id: 'quick-actions',
        title: 'Quick Actions',
        component: 'QuickActions',
        size: 'small',
        visible: true,
        collapsible: false,
        category: 'admin',
    },
    {
        id: 'tasks-kanban',
        title: 'Task Board',
        component: 'MiniTaskKanban',
        size: 'medium',
        visible: true,
        collapsible: true,
        category: 'tasks',
    },
    {
        id: 'tasks-list',
        title: 'Upcoming Tasks',
        component: 'TasksCard',
        size: 'small',
        visible: true,
        collapsible: true,
        category: 'tasks',
    },
    {
        id: 'platform-comparison',
        title: 'Platform Comparison',
        component: 'PlatformComparisonSummaryCard',
        size: 'small',
        visible: true,
        collapsible: true,
        category: 'analytics',
    },
    {
        id: 'ad-insights',
        title: 'Ad Insights',
        component: 'AdInsightsWidget',
        size: 'medium',
        visible: true,
        collapsible: true,
        category: 'analytics',
    },
    {
        id: 'workspace-comparison',
        title: 'Workspace Comparison',
        component: 'WorkspaceComparison',
        size: 'medium',
        visible: true,
        collapsible: true,
        category: 'analytics',
    },
    {
        id: 'workspace-trends',
        title: 'Workspace Trends',
        component: 'WorkspaceTrendsCard',
        size: 'medium',
        visible: true,
        collapsible: true,
        category: 'analytics',
    },
];
