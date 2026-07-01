'use client';
import { useCallback } from 'react';
import { dynamic } from '@/shared/ui/dynamic';
import { ProjectFilterBanner, TaskBulkToolbar, TaskFilters, type TaskParticipant, TaskViewControls, } from '@/features/dashboard/tasks';
import { cn } from '@/lib/utils';
import type { SortField } from './task-types';
import type { TaskPriority, TaskRecord, TaskStatus } from '@/types/tasks';
import { Card, CardAction, CardContent, CardHeader } from '@/shared/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { TASKS_THEME } from './tasks-theme';
import { TaskBoardErrorBoundary } from './task-board-error-boundary';
import { TasksPageSkeleton } from './tasks-page-skeleton';
const TaskList = dynamic(() => import('@/features/dashboard/tasks/task-list').then((mod) => mod.TaskList), {
    loading: () => <div className="p-6 text-sm text-muted-foreground">Loading tasks…</div>,
});
const TaskKanban = dynamic(() => import('@/features/dashboard/tasks/task-kanban').then((mod) => mod.TaskKanban), {
    loading: () => <div className="p-6 text-sm text-muted-foreground">Loading board…</div>,
    ssr: false,
});
export function TasksPageFallback() {
    return <TasksPageSkeleton />;
}
export function TasksPageWorkspace({ filters, rawSearchQuery, onSearchChange, projectFilter, onClearProjectFilter, visibleTasks, selectedTasks, selectedTaskIds, hasSelection, bulkState, onSelectAllVisible, onClearSelection, onSelectHighPriority, onSelectDueSoon, onBulkStatusChange, onBulkAssign, onBulkDueDate, onBulkDelete, initialLoading, loading, displayError, pendingStatusUpdates, onEdit, onDelete, onQuickStatusChange, onRefresh, loadingMore, hasMore, onLoadMore, emptyStateMessage, showFilteredEmpty, onClearListFilters, onNewTaskClick, tasksCount, workspaceId, userId, userName, userRole, participants, onExport, onToggleTaskSelection, }: {
    filters: {
        activeTab: string;
        setActiveTab: (value: string) => void;
        viewMode: 'list' | 'grid' | 'board';
        setViewMode: (mode: 'list' | 'grid' | 'board') => void;
        selectedStatus: TaskStatus | 'all';
        handleStatusChange: (status: TaskStatus | 'all') => void;
        selectedAssignee: string;
        handleAssigneeChange: (assignee: string) => void;
        assigneeOptions: string[];
        selectedPriority: 'all' | TaskPriority;
        setSelectedPriority: (priority: 'all' | TaskPriority) => void;
        sortField: SortField;
        setSortField: (field: SortField) => void;
        sortDirection: 'asc' | 'desc';
        toggleSortDirection: () => void;
        hasActiveFilters: boolean;
        activeFilterCount: number;
        taskCounts: Record<TaskStatus, number>;
        sortedTasks: TaskRecord[];
    };
    rawSearchQuery: string;
    onSearchChange: (value: string) => void;
    projectFilter: {
        id: string | null;
        name: string | null;
    };
    onClearProjectFilter: () => void;
    visibleTasks: TaskRecord[];
    selectedTasks: TaskRecord[];
    selectedTaskIds: Set<string>;
    hasSelection: boolean;
    bulkState: {
        active: boolean;
        label: string;
        progress: number;
    };
    onSelectAllVisible: () => void;
    onClearSelection: () => void;
    onSelectHighPriority: () => void;
    onSelectDueSoon: () => void;
    onBulkStatusChange: (status: TaskStatus) => void;
    onBulkAssign: (assignees: string[]) => void;
    onBulkDueDate: (date: string | null) => void;
    onBulkDelete: () => void;
    initialLoading: boolean;
    loading: boolean;
    displayError: string | null;
    pendingStatusUpdates: Set<string>;
    onEdit: (task: TaskRecord) => void;
    onDelete: (task: TaskRecord) => void;
    onQuickStatusChange: (task: TaskRecord, status: TaskStatus) => void;
    onRefresh: () => void;
    loadingMore: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    emptyStateMessage: string;
    showFilteredEmpty: boolean;
    onClearListFilters: () => void;
    onNewTaskClick: () => void;
    tasksCount: number;
    workspaceId: string | null;
    userId: string | null;
    userName: string | null;
    userRole: string | null;
    participants: TaskParticipant[];
    onExport: () => void;
    onToggleTaskSelection: (taskId: string, checked: boolean) => void;
}) {
    const handleFilterStatusChange = (status: string) => filters.handleStatusChange(status as TaskStatus | 'all');
    return (<>
      <Tabs defaultValue="all-tasks" value={filters.activeTab} onValueChange={filters.setActiveTab} className="space-y-0">
        <Card className={cn(TASKS_THEME.workspace, 'rounded-2xl ring-1 ring-border/40')}>
          <CardHeader className={cn(TASKS_THEME.rail, 'sticky top-0 z-10 space-y-0 backdrop-blur-md')}>
            <div className="flex items-center gap-2">
              <TabsList className={TASKS_THEME.tabList}>
                <TabsTrigger value="all-tasks" className={TASKS_THEME.tabTrigger}>
                  All tasks
                </TabsTrigger>
                <TabsTrigger value="my-tasks" className={TASKS_THEME.tabTrigger}>
                  My tasks
                </TabsTrigger>
              </TabsList>
              {!initialLoading && !displayError ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {filters.sortedTasks.length} of {tasksCount}
                </span>
              ) : null}
            </div>
            <CardAction>
              <TaskViewControls viewMode={filters.viewMode} onViewModeChange={filters.setViewMode} onExport={onExport} canExport={filters.sortedTasks.length > 0} isExporting={false}/>
            </CardAction>
          </CardHeader>

          <div>
            <TaskFilters searchQuery={rawSearchQuery} onSearchChange={onSearchChange} selectedStatus={filters.selectedStatus} onStatusChange={handleFilterStatusChange} selectedAssignee={filters.selectedAssignee} onAssigneeChange={filters.handleAssigneeChange} assigneeOptions={filters.assigneeOptions} showAssigneeFilter={filters.activeTab === 'all-tasks'} selectedPriority={filters.selectedPriority} onPriorityChange={(value) => filters.setSelectedPriority(value as 'all' | TaskPriority)} sortField={filters.sortField} onSortFieldChange={filters.setSortField} sortDirection={filters.sortDirection} onSortDirectionToggle={filters.toggleSortDirection} hasActiveFilters={filters.hasActiveFilters} activeFilterCount={filters.activeFilterCount} onClearFilters={onClearListFilters}/>

            <ProjectFilterBanner projectId={projectFilter.id} projectName={projectFilter.name} onClear={onClearProjectFilter}/>

            {filters.viewMode !== 'board' ? (<TaskBulkToolbar selectedCount={selectedTasks.length} totalVisible={visibleTasks.length} hasSelection={hasSelection} bulkActive={bulkState.active} bulkLabel={bulkState.label} bulkProgress={bulkState.progress} onSelectAll={onSelectAllVisible} onClearSelection={onClearSelection} onSelectHighPriority={onSelectHighPriority} onSelectDueSoon={onSelectDueSoon} onBulkStatusChange={onBulkStatusChange} onBulkAssign={onBulkAssign} onBulkDueDate={onBulkDueDate} onBulkDelete={onBulkDelete}/>) : null}

            <CardContent className={cn(TASKS_THEME.content, 'p-0', filters.viewMode === 'list' && TASKS_THEME.contentList)}>
              {filters.viewMode === 'board' ? (<TaskBoardErrorBoundary onSwitchToList={() => filters.setViewMode('list')}><TaskKanban tasks={filters.sortedTasks} loading={loading} initialLoading={initialLoading} error={displayError} pendingStatusUpdates={pendingStatusUpdates} onEdit={onEdit} onDelete={onDelete} onQuickStatusChange={onQuickStatusChange} onRefresh={onRefresh} loadingMore={loadingMore} hasMore={hasMore} onLoadMore={onLoadMore} emptyStateMessage={emptyStateMessage} showEmptyStateFiltered={showFilteredEmpty} onEmptyClearFilters={onClearListFilters} onEmptyCreateTask={onNewTaskClick} workspaceId={workspaceId} userId={userId} userName={userName} userRole={userRole} participants={participants}/></TaskBoardErrorBoundary>) : (<TaskList tasks={filters.sortedTasks} viewMode={filters.viewMode} loading={loading} initialLoading={initialLoading} error={displayError} pendingStatusUpdates={pendingStatusUpdates} onEdit={onEdit} onDelete={onDelete} onQuickStatusChange={onQuickStatusChange} onRefresh={onRefresh} loadingMore={loadingMore} hasMore={hasMore} onLoadMore={onLoadMore} emptyStateMessage={emptyStateMessage} showEmptyStateFiltered={showFilteredEmpty} onEmptyClearFilters={onClearListFilters} onEmptyCreateTask={onNewTaskClick} selectedTaskIds={selectedTaskIds} onToggleTaskSelection={onToggleTaskSelection} workspaceId={workspaceId} userId={userId} userName={userName} userRole={userRole} participants={participants}/>)}
            </CardContent>
          </div>
        </Card>
      </Tabs>
    </>);
}
