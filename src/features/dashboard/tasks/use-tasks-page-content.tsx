'use client';
import { useQuery } from 'convex/react';
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { dynamic } from '@/shared/ui/dynamic';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { formatAssigneeList, formatDate, clientRosterAssigneeNames, mergeTaskParticipants, resolveAssigneeUserIds, ProjectFilterBanner, TaskBulkToolbar, TaskFilters, type TaskParticipant, TasksHeader, TaskViewControls, useDebouncedValue, useTaskFilters, useTaskForm, useTasks, } from '@/features/dashboard/tasks';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { TasksPageSkeleton } from '@/features/dashboard/tasks/tasks-page-skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { useNavigationContext } from '@/shared/contexts/navigation-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts';
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab';
import { usersApi } from '@/lib/convex-api';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { buildCategoryCountChart, } from '@/lib/export/cohorts-spreadsheet-charts';
import { buildTaskListFilters } from './hooks/task-list-filters';
import { TASKS_THEME } from './tasks-theme';
import { isFeatureEnabled } from '@/lib/features';
import { exportToCsv } from '@/lib/export/export-to-spreadsheet';
import { notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import type { TaskPriority, TaskStatus } from '@/types/tasks';
import { useTasksDocumentImport } from './use-tasks-document-import';
import { TasksDocumentImportOverlay } from './tasks-document-import-overlay';
import { TasksDocumentImportReviewSheet } from './tasks-document-import-review-sheet';
import { TaskParticipantsProvider } from './task-participants-context';
import { TaskBoardErrorBoundary } from './task-board-error-boundary';
const TaskList = dynamic(() => import('@/features/dashboard/tasks/task-list').then((mod) => mod.TaskList), {
    loading: () => <div className="p-6 text-sm text-muted-foreground">Loading tasks…</div>,
});
const TaskKanban = dynamic(() => import('@/features/dashboard/tasks/task-kanban').then((mod) => mod.TaskKanban), {
    loading: () => <div className="p-6 text-sm text-muted-foreground">Loading board…</div>,
    ssr: false,
});
const CreateTaskSheet = dynamic(() => import('@/features/dashboard/tasks/task-form-sheets').then((mod) => mod.CreateTaskSheet), { ssr: false });
const EditTaskSheet = dynamic(() => import('@/features/dashboard/tasks/task-form-sheets').then((mod) => mod.EditTaskSheet), { ssr: false });
const DeleteTaskDialog = dynamic(() => import('@/features/dashboard/tasks/delete-task-dialog').then((mod) => mod.DeleteTaskDialog), { ssr: false });
const ONE_MINUTE_MS = 60 * 1000;
let nowSnapshot = 0;
let nowIntervalId: ReturnType<typeof setInterval> | undefined;
const nowSubscribers = new Set<() => void>();
function startNowClock() {
    if (nowIntervalId !== undefined) {
        return;
    }
    nowSnapshot = Date.now();
    nowIntervalId = setInterval(() => {
        nowSnapshot = Date.now();
        for (const callback of nowSubscribers) {
            callback();
        }
    }, ONE_MINUTE_MS);
}
function stopNowClock() {
    if (nowIntervalId !== undefined && nowSubscribers.size === 0) {
        clearInterval(nowIntervalId);
        nowIntervalId = undefined;
    }
}
function subscribeNowClock(callback: () => void) {
    nowSubscribers.add(callback);
    startNowClock();
    return () => {
        nowSubscribers.delete(callback);
        stopNowClock();
    };
}
function getNowSnapshot() {
    return nowSnapshot;
}
function getServerNowSnapshot() {
    return 0;
}
function useNowMs() {
    return useSyncExternalStore(subscribeNowClock, getNowSnapshot, getServerNowSnapshot);
}
export type TasksPageClientProps = {
    initialProjectId?: string | null;
    initialProjectName?: string | null;
    initialClientId?: string | null;
    initialClientName?: string | null;
    initialAction?: string | null;
    initialSearchParamsString?: string;
};
export function useTasksPageContent({ initialAction, initialClientId, initialClientName, initialProjectId, initialProjectName, initialSearchParamsString }: TasksPageClientProps) {
    const { replace } = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
    const { selectedClient, selectedClientId, clients } = useClientContext();
    const { setProjectContext } = useNavigationContext();
    const { isPreviewMode } = usePreview();
    const taskTabs = usePersistedTab({
        param: 'tab',
        defaultValue: 'all-tasks',
        allowedValues: ['all-tasks', 'my-tasks'] as const,
        storageNamespace: 'dashboard:tasks',
        syncToUrl: true,
    });
    const normalizedAction = initialAction ?? null;
    const normalizedClientId = initialClientId ?? null;
    const normalizedClientName = initialClientName ?? null;
    const normalizedProjectId = initialProjectId ?? null;
    const normalizedProjectName = initialProjectName ?? null;
    const normalizedSearchParamsString = initialSearchParamsString ?? '';
    const projectFilter = ({
        id: normalizedProjectId,
        name: normalizedProjectName,
    });
    const routeClientContext = (() => {
        if (!normalizedClientId && !normalizedClientName)
            return null;
        return {
            id: normalizedClientId,
            name: normalizedClientName,
        };
    })();
    const effectiveTaskClient = (() => {
        if (selectedClient)
            return selectedClient;
        const routeId = routeClientContext?.id;
        if (!routeId)
            return null;
        return clients.find((client) => client.id === routeId) ?? null;
    })();
    const taskFormClient = effectiveTaskClient ?? routeClientContext;
    const taskFormClientId = effectiveTaskClient?.id ?? selectedClientId ?? routeClientContext?.id ?? undefined;
    const taskWorkspaceId = effectiveTaskClient?.workspaceId ?? user?.agencyId ?? null;
    const newTaskDisabledReason = (() => {
        if (authLoading)
            return null;
        if (!user?.id)
            return 'Sign in to create tasks.';
        if (!taskFormClientId) {
            return 'Select a client from the workspace switcher, or open Tasks from a client record, before creating a task.';
        }
        return null;
    })();
    const actionParam = normalizedAction;
    const searchParamsString = normalizedSearchParamsString;
    const projectContextKey = isFeatureEnabled('BIDIRECTIONAL_NAV') && projectFilter.id && projectFilter.name
        ? `${projectFilter.id}|${projectFilter.name}`
        : null;
    useEffect(() => {
        if (!projectContextKey || !projectFilter.id || !projectFilter.name)
            return;
        setProjectContext(projectFilter.id, projectFilter.name);
    }, [projectContextKey, projectFilter.id, projectFilter.name, setProjectContext]);
    const clearProjectFilter = () => {
        const params = new URLSearchParams(searchParamsString);
        params.delete('projectId');
        params.delete('projectName');
        const next = params.toString();
        replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    };
    const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all');
    const [selectedAssignee, setSelectedAssignee] = useState('all');
    const [selectedPriority, setSelectedPriority] = useState<'all' | TaskPriority>('all');
    const [rawSearchQuery, setRawSearchQuery] = useState('');
    const debouncedQuery = useDebouncedValue(rawSearchQuery, 300);
    const listFilters = buildTaskListFilters({
        selectedStatus,
        searchQuery: debouncedQuery,
        activeTab: taskTabs.value,
        userId: user?.id,
        selectedAssignee,
        projectId: projectFilter.id,
    });
    // Tasks data hook
    const { tasks, loading, loadingMore, error, retryCount, pendingStatusUpdates, nextCursor, handleLoadMore, handleRefresh, handleQuickStatusChange, handleDeleteTask, handleCreateTask, handleUpdateTask, handleBulkUpdate, handleBulkDelete, } = useTasks({
        userId: user?.id,
        clientId: taskFormClientId ?? undefined,
        authLoading,
        isPreviewMode,
        workspaceId: taskWorkspaceId,
        listFilters,
    });
    const workspaceMembers = useQuery(usersApi.listWorkspaceMembers, taskWorkspaceId && !isPreviewMode
        ? {
            workspaceId: taskWorkspaceId,
            limit: 500,
        }
        : 'skip') as TaskParticipant[] | undefined;
    const clientRosterNames = clientRosterAssigneeNames(effectiveTaskClient ?? selectedClient);
    const rosterProfiles = useQuery(usersApi.resolveProfilesForNames, taskWorkspaceId && clientRosterNames.length > 0 && !isPreviewMode
        ? {
            workspaceId: taskWorkspaceId,
            names: clientRosterNames,
        }
        : 'skip') as TaskParticipant[] | undefined;
    const workspaceMembersQueryError = useConvexQueryError({
        data: workspaceMembers,
        skipped: !taskWorkspaceId || isPreviewMode,
        fallbackMessage: 'Unable to load workspace members.',
    });
    const rosterProfilesQueryError = useConvexQueryError({
        data: rosterProfiles,
        skipped: !taskWorkspaceId || clientRosterNames.length === 0 || isPreviewMode,
        fallbackMessage: 'Unable to load client assignees.',
    });
    const participantsQueryError = mergeQueryErrors(workspaceMembersQueryError, rosterProfilesQueryError);
    const displayError = mergeQueryErrors(error, participantsQueryError);
    const taskParticipants = (() => {
        const clientTeamMembers = (effectiveTaskClient?.teamMembers ?? selectedClient?.teamMembers ?? []).map((member) => ({
            name: member.name,
            role: member.role,
        }));
        if (clientTeamMembers.length > 0 || (rosterProfiles?.length ?? 0) > 0) {
            return mergeTaskParticipants([
                clientTeamMembers,
                workspaceMembers ?? [],
                rosterProfiles ?? [],
            ]);
        }
        return mergeTaskParticipants([workspaceMembers ?? []]);
    })();
    // Filters hook
    const filters = useTaskFilters({
        tasks,
        userId: user?.id,
        userName: user?.name,
        participants: taskParticipants,
        selectedClient,
        selectedClientId: selectedClientId ?? undefined,
        projectFilterId: projectFilter.id,
        projectFilterName: projectFilter.name,
        activeTab: taskTabs.value,
        setActiveTab: (next) => taskTabs.setValue(next as 'all-tasks' | 'my-tasks'),
        serverListFilters: listFilters,
        selectedStatus,
        setSelectedStatus,
        searchQuery: debouncedQuery,
        setSearchQuery: setRawSearchQuery,
        selectedAssignee,
        setSelectedAssignee,
        selectedPriority,
        setSelectedPriority,
    });
    const [rawSelectedTaskIds, setRawSelectedTaskIds] = useState<Set<string>>(new Set());
    const [bulkState, setBulkState] = useState<{
        active: boolean;
        label: string;
        progress: number;
    }>({
        active: false,
        label: '',
        progress: 0,
    });
    // Form management hook
    const form = useTaskForm({
        selectedClient: taskFormClient,
        selectedClientId: taskFormClientId,
        projectContext: projectFilter,
        userId: user?.id,
        participants: taskParticipants,
        initialCreateOpen: actionParam === 'create',
        onCreateOpenChange: (open) => {
            if (open || actionParam !== 'create')
                return;
            const params = new URLSearchParams(searchParamsString);
            params.delete('action');
            const next = params.toString();
            replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
        },
        onCreateTask: handleCreateTask,
        onUpdateTask: handleUpdateTask,
    });
    // Keyboard shortcuts
    useKeyboardShortcut({
        combo: 'mod+f',
        callback: () => {
            document.getElementById('task-search')?.focus();
        },
    });
    useKeyboardShortcut({
        combo: 'mod+n',
        callback: () => {
            if (newTaskDisabledReason)
                return;
            form.handleCreateOpenChange(true);
        },
        enabled: !form.isCreateOpen && !newTaskDisabledReason,
    });
    // Export handler
    const [isExporting, setIsExporting] = useState(false);
    const handleExport = async () => {
        if (filters.filteredTasks.length === 0 || isExporting)
            return;
        setIsExporting(true);
        try {
            const exportRows = filters.filteredTasks.map((task) => ({
                Title: task.title,
                Status: task.status,
                Priority: task.priority,
                Client: task.client || 'Internal',
                'Assigned To': formatAssigneeList(task.assignedTo ?? [], taskParticipants),
                'Due Date': task.dueDate ? formatDate(task.dueDate) : 'No due date',
                Description: task.description || '',
            }));
            const charts = [
                buildCategoryCountChart(exportRows, 'Status', 'Tasks by status', 'pie'),
                buildCategoryCountChart(exportRows, 'Priority', 'Tasks by priority', 'bar'),
            ].filter((chart): chart is NonNullable<typeof chart> => chart !== null);
            await exportToCsv(exportRows, `tasks-export-${new Date().toISOString().split('T')[0]}.xlsx`, undefined, {
                title: 'Tasks export',
                subtitle: `${filters.filteredTasks.length} task${filters.filteredTasks.length === 1 ? '' : 's'}`,
                charts,
            });
            notifySuccess({
                title: 'Export complete',
                message: `Exported ${filters.filteredTasks.length} task${filters.filteredTasks.length === 1 ? '' : 's'} to Excel.`,
            });
            setIsExporting(false);
        }
        catch (exportError) {
            reportConvexFailure({
                error: exportError,
                context: 'useTasksPageContent:handleExport',
                title: 'Export failed',
                fallbackMessage: 'Could not build the spreadsheet.',
            });
            setIsExporting(false);
        }
    };
    const handleNewTaskClick = () => {
        form.handleCreateOpenChange(true);
    };
    // Delete confirmation handler
    const handleConfirmDelete = async () => {
        if (!form.deletingTask)
            return;
        form.setDeleting(true);
        const success = await handleDeleteTask(form.deletingTask);
        form.setDeleting(false);
        if (success) {
            form.handleDeleteClose();
            // Also close the edit sheet if it happens to be open for this task
            if (form.editingTask?.id === form.deletingTask.id) {
                form.handleEditClose();
            }
        }
    };
    const handleEditDialogOpenChange = (open: boolean) => {
        if (!open) {
            form.handleEditClose();
        }
    };
    const handleDeleteDialogOpenChange = (open: boolean) => {
        if (!open) {
            form.handleDeleteClose();
        }
    };
    const visibleTasks = filters.sortedTasks;
    const selectedTaskIds = (() => {
        if (filters.viewMode === 'board')
            return new Set<string>();
        if (rawSelectedTaskIds.size === 0)
            return rawSelectedTaskIds;
        const visibleIds = new Set(visibleTasks.map((task) => task.id));
        const next = new Set<string>();
        rawSelectedTaskIds.forEach((id) => {
            if (visibleIds.has(id)) {
                next.add(id);
            }
        });
        return next;
    })();
    const selectedTasks = (() => {
        if (selectedTaskIds.size === 0)
            return [];
        const selectedMap = new Set(selectedTaskIds);
        return visibleTasks.filter((task) => selectedMap.has(task.id));
    })();
    const hasSelection = selectedTasks.length > 0;
    const handleToggleTaskSelection = (taskId: string, checked: boolean) => {
        setRawSelectedTaskIds((current) => {
            const next = new Set(current);
            if (checked) {
                next.add(taskId);
            }
            else {
                next.delete(taskId);
            }
            return next;
        });
    };
    const handleSelectAllVisible = () => {
        setRawSelectedTaskIds(new Set(visibleTasks.map((task) => task.id)));
    };
    const handleClearSelection = () => {
        setRawSelectedTaskIds(new Set());
    };
    const handleSelectHighPriority = () => {
        const filtered = visibleTasks.filter((task) => task.priority === 'high' || task.priority === 'urgent');
        setRawSelectedTaskIds(new Set(filtered.map((task) => task.id)));
    };
    const handleSelectDueSoon = () => {
        const now = Date.now();
        const cutoff = now + 7 * 24 * 60 * 60 * 1000;
        const filtered = visibleTasks.filter((task) => {
            if (!task.dueDate)
                return false;
            const ts = Date.parse(task.dueDate);
            if (Number.isNaN(ts))
                return false;
            return ts >= now && ts <= cutoff;
        });
        setRawSelectedTaskIds(new Set(filtered.map((task) => task.id)));
    };
    const highPriorityCount = visibleTasks.filter((task) => task.priority === 'high' || task.priority === 'urgent').length;
    const now = useNowMs();
    const dueSoonCount = useMemo(() => {
        const cutoff = now + 7 * 24 * 60 * 60 * 1000;
        return visibleTasks.filter((task) => {
            if (!task.dueDate)
                return false;
            const ts = Date.parse(task.dueDate);
            if (Number.isNaN(ts))
                return false;
            return ts >= now && ts <= cutoff;
        }).length;
    }, [now, visibleTasks]);
    const handleBulkStatusChange = async (status: TaskStatus) => {
        if (!hasSelection)
            return;
        const ids = Array.from(selectedTaskIds);
        setBulkState({ active: true, label: 'Updating status', progress: 0 });
        const ok = await handleBulkUpdate(ids, { status });
        setBulkState({ active: false, label: '', progress: 0 });
        if (ok)
            setRawSelectedTaskIds(new Set());
    };
    const handleBulkAssign = async (assignees: string[]) => {
        if (!hasSelection)
            return;
        const normalized = assignees.flatMap((entry) => {
            const trimmed = entry.trim();
            if (trimmed.length === 0)
                return [];
            const byId = taskParticipants.find((participant) => participant.id === trimmed);
            if (byId?.id)
                return [byId.id];
            const byName = taskParticipants.find((participant) => participant.name.trim().toLowerCase() === trimmed.toLowerCase());
            if (byName?.id)
                return [byName.id];
            return resolveAssigneeUserIds(`@[${trimmed}]`, taskParticipants);
        });
        const ids = Array.from(selectedTaskIds);
        setBulkState({ active: true, label: 'Updating assignees', progress: 0 });
        const ok = await handleBulkUpdate(ids, { assignedTo: normalized });
        setBulkState({ active: false, label: '', progress: 0 });
        if (ok)
            setRawSelectedTaskIds(new Set());
    };
    const handleBulkDueDate = async (date: string | null) => {
        if (!hasSelection)
            return;
        const normalized = date && !Number.isNaN(Date.parse(date)) ? date : null;
        const ids = Array.from(selectedTaskIds);
        setBulkState({ active: true, label: 'Updating due dates', progress: 0 });
        const ok = await handleBulkUpdate(ids, { dueDate: normalized ?? undefined });
        setBulkState({ active: false, label: '', progress: 0 });
        if (ok)
            setRawSelectedTaskIds(new Set());
    };
    const handleBulkDeleteAction = async () => {
        if (!hasSelection)
            return;
        const ids = Array.from(selectedTaskIds);
        setBulkState({ active: true, label: 'Deleting tasks', progress: 0 });
        const ok = await handleBulkDelete(ids);
        setBulkState({ active: false, label: '', progress: 0 });
        if (ok)
            setRawSelectedTaskIds(new Set());
    };
    const initialLoading = loading && tasks.length === 0;
    const scopeLabel = selectedClient?.name ?? (selectedClientId ? 'Selected client' : null);
    const scopeHelper = selectedClient
        ? `Tasks for ${selectedClient.name}`
        : 'All clients in this workspace';
    const emptyStateMessage = filters.activeTab === 'my-tasks'
        ? 'No tasks are assigned to you yet. Switch to All Tasks to see team-owned work.'
        : 'Get started by creating your first task.';
    const showFilteredEmpty = filters.selectedStatus !== 'all' ||
        debouncedQuery.trim().length > 0 ||
        (filters.activeTab === 'all-tasks' && filters.selectedAssignee !== 'all');
    const handleClearListFilters = () => {
        filters.resetListFilters();
        setRawSearchQuery('');
    };
    const handlePriorityChange = (value: string) => {
        setSelectedPriority(value as 'all' | TaskPriority);
    };
    const handleSummaryStatusClick = (status: TaskStatus) => {
        if (filters.selectedStatus === status) {
            filters.handleStatusChange('all');
        }
        else {
            filters.handleStatusChange(status);
        }
    };
    const documentImport = useTasksDocumentImport({
        workspaceId: taskWorkspaceId ? String(taskWorkspaceId) : null,
        userId: user?.id,
        participants: taskParticipants,
        clientId: taskFormClientId,
        clientName: taskFormClient?.name ?? undefined,
        projectId: projectFilter.id ?? undefined,
        projectName: projectFilter.name ?? undefined,
        disabledReason: newTaskDisabledReason,
        isPreviewMode,
        onCreateTask: handleCreateTask,
    });
    return (<TooltipProvider>
      <TaskParticipantsProvider participants={taskParticipants}>
      <div className={cn(DASHBOARD_THEME.layout.container, TASKS_THEME.page, 'relative flex flex-col flex-1 min-h-0')} {...documentImport.importDragHandlers}>
        <TasksDocumentImportOverlay phase={documentImport.phase} statusMessage={documentImport.statusMessage} errorMessage={documentImport.errorMessage} visible={documentImport.overlayVisible} onCancel={documentImport.handleCancel}/>

        <TasksDocumentImportReviewSheet open={documentImport.reviewOpen} documentSummary={documentImport.documentSummary} proposedTasks={documentImport.proposedTasks} participants={taskParticipants} attachSourceDocuments={documentImport.attachSourceDocuments} onAttachSourceDocumentsChange={documentImport.setAttachSourceDocuments} onUpdateTask={documentImport.updateProposedTask} onConfirm={documentImport.handleConfirmReview} onDiscard={documentImport.handleDismissReview}/>

        <div className="shrink-0">
          <TasksHeader loading={loading} retryCount={retryCount} onRefresh={handleRefresh} onNewTaskClick={handleNewTaskClick} scopeLabel={scopeLabel} scopeHelper={scopeHelper} newTaskDisabledReason={newTaskDisabledReason}/>
        </div>

        <Tabs defaultValue="all-tasks" value={filters.activeTab} onValueChange={filters.setActiveTab} className="space-y-0 flex flex-col flex-1 min-h-0">
          <div className={cn(TASKS_THEME.workspace, 'flex flex-col flex-1 min-h-0 overflow-hidden rounded-2xl ring-1 ring-border/40')}>
            <div className={cn(TASKS_THEME.rail, 'sticky top-0 z-10 shrink-0 backdrop-blur-md')}>
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
                    {filters.sortedTasks.length} of {tasks.length}
                  </span>
                ) : null}
              </div>
              <TaskViewControls viewMode={filters.viewMode} onViewModeChange={filters.setViewMode} onExport={handleExport} canExport={filters.sortedTasks.length > 0} isExporting={isExporting} exportDisabledReason={filters.sortedTasks.length === 0 ? 'No tasks to export' : undefined}/>
            </div>

            <div className="flex flex-col flex-1 min-h-0">
              <TaskFilters searchQuery={rawSearchQuery} onSearchChange={setRawSearchQuery} selectedStatus={filters.selectedStatus} onStatusChange={filters.handleStatusChange} selectedAssignee={filters.selectedAssignee} onAssigneeChange={filters.handleAssigneeChange} assigneeOptions={filters.assigneeOptions} showAssigneeFilter={filters.activeTab === 'all-tasks'} selectedPriority={selectedPriority} onPriorityChange={handlePriorityChange} sortField={filters.sortField} onSortFieldChange={filters.setSortField} sortDirection={filters.sortDirection} onSortDirectionToggle={filters.toggleSortDirection} hasActiveFilters={filters.hasActiveFilters} activeFilterCount={filters.activeFilterCount} onClearFilters={handleClearListFilters}/>

              <ProjectFilterBanner projectId={projectFilter.id} projectName={projectFilter.name} onClear={clearProjectFilter}/>

              {filters.viewMode !== 'board' && (<TaskBulkToolbar selectedCount={selectedTasks.length} totalVisible={visibleTasks.length} hasSelection={hasSelection} bulkActive={bulkState.active} bulkLabel={bulkState.label} bulkProgress={bulkState.progress} onSelectAll={handleSelectAllVisible} onClearSelection={handleClearSelection} onSelectHighPriority={handleSelectHighPriority} onSelectDueSoon={handleSelectDueSoon} highPriorityCount={highPriorityCount} dueSoonCount={dueSoonCount} onBulkStatusChange={handleBulkStatusChange} onBulkAssign={handleBulkAssign} onBulkDueDate={handleBulkDueDate} onBulkDelete={handleBulkDeleteAction}/>)}

              <div className={cn(TASKS_THEME.content, 'p-0', filters.viewMode === 'list' && 'bg-muted/[0.18] flex-1 overflow-y-auto pb-24', filters.viewMode === 'board' && 'min-h-0 flex-1 overflow-hidden')}>
              <PageSkeletonBoundary loading={initialLoading} loadingContent={<TasksPageSkeleton />} className="flex flex-col flex-1 min-h-0">
              {filters.viewMode === 'board' ? (<TaskBoardErrorBoundary onSwitchToList={() => filters.setViewMode('list')}><TaskKanban tasks={filters.sortedTasks} loading={loading} initialLoading={initialLoading} error={displayError} pendingStatusUpdates={pendingStatusUpdates} onEdit={form.handleEditOpen} onDelete={form.handleDeleteClick} onQuickStatusChange={handleQuickStatusChange} onRefresh={handleRefresh} loadingMore={loadingMore} hasMore={Boolean(nextCursor)} onLoadMore={handleLoadMore} emptyStateMessage={emptyStateMessage} showEmptyStateFiltered={showFilteredEmpty} onEmptyClearFilters={handleClearListFilters} onEmptyCreateTask={handleNewTaskClick} workspaceId={user?.agencyId ?? null} userId={user?.id ?? null} userName={user?.name ?? null} userRole={user?.role ?? null} participants={taskParticipants}/></TaskBoardErrorBoundary>) : (<TaskList tasks={filters.sortedTasks} loading={loading} initialLoading={initialLoading} error={displayError} pendingStatusUpdates={pendingStatusUpdates} onEdit={form.handleEditOpen} onDelete={form.handleDeleteClick} onQuickStatusChange={handleQuickStatusChange} onRefresh={handleRefresh} loadingMore={loadingMore} hasMore={Boolean(nextCursor)} onLoadMore={handleLoadMore} emptyStateMessage={emptyStateMessage} showEmptyStateFiltered={showFilteredEmpty} onEmptyClearFilters={handleClearListFilters} onEmptyCreateTask={handleNewTaskClick} selectedTaskIds={selectedTaskIds} onToggleTaskSelection={handleToggleTaskSelection} workspaceId={user?.agencyId ?? null} userId={user?.id ?? null} userName={user?.name ?? null} userRole={user?.role ?? null} participants={taskParticipants}/>)}
              </PageSkeletonBoundary>
              </div>
            </div>
          </div>
        </Tabs>

        {/* Create Task Sheet */}
        <CreateTaskSheet open={form.isCreateOpen} onOpenChange={form.handleCreateOpenChange} formState={form.formState} setFormState={form.setFormState} creating={form.creating} createError={form.createError} onSubmit={form.handleCreateSubmit} participants={taskParticipants} pendingAttachments={form.createAttachments} onAddAttachments={form.handleCreateAttachmentsAdd} onRemoveAttachment={form.handleCreateAttachmentRemove}/>

        {/* Edit Task Sheet */}
        <EditTaskSheet open={form.isEditOpen} onOpenChange={handleEditDialogOpenChange} taskId={form.editingTask?.id ?? null} formState={form.editFormState} setFormState={form.setEditFormState} updating={form.updating} updateError={form.updateError} onSubmit={form.handleEditSubmit} currentWorkspaceId={user?.agencyId ?? null} currentUserId={user?.id ?? null} currentUserName={user?.name ?? null} currentUserRole={user?.role ?? null} participants={taskParticipants}/>

        {/* Delete Confirmation Dialog */}
        <DeleteTaskDialog open={form.isDeleteDialogOpen} onOpenChange={handleDeleteDialogOpenChange} task={form.deletingTask} deleting={form.deleting} onConfirm={handleConfirmDelete}/>


      </div>
      </TaskParticipantsProvider>
    </TooltipProvider>);
}
