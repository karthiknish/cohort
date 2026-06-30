'use client';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { useCallback, useMemo, useState } from 'react';
import { notifySuccess } from '@/lib/notifications';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
import { buildProjectTasksRoute } from '@/lib/project-routes';
import { useDebouncedValue } from '@/shared/hooks/use-debounce';
import { formatStatusLabel, loadStoredViewMode, projectMatchesContext, PROJECTS_VIEW_MODE_STORAGE_KEY, SORT_OPTIONS, type SortDirection, type SortField, type StatusFilter, type ViewMode, } from '../components/utils';
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/projects';
import { useProjectsData } from './use-projects-data';
import { useProjectsMilestones } from './use-projects-milestones';
import { useProjectsMutations } from './use-projects-mutations';
export function useProjectsPageController() {
    const searchParams = useUrlSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    const { selectedClient, selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const workspaceId = user?.agencyId ?? null;
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchInput, setSearchInput] = useState('');
    const [viewMode, setViewModeState] = useState<ViewMode>(() => loadStoredViewMode());
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const debouncedQuery = useDebouncedValue(searchInput, 350);
    const focusedProject = ({ id: searchParams.get('projectId'), name: searchParams.get('projectName') });
    const { projects, setProjects, loading, loadingMore, error, hasMoreProjects, handleLoadMore, handleRefresh: resetProjectsPagination, } = useProjectsData({
        workspaceId,
        userId: user?.id,
        isPreviewMode,
        selectedClientId,
        statusFilter,
        debouncedSearchQuery: debouncedQuery,
    });
    const { milestonesByProject, milestonesLoading, milestonesError, loadMilestones, handleMilestoneCreated, } = useProjectsMilestones({
        workspaceId,
        userId: user?.id,
        isPreviewMode,
        selectedClientId,
        viewMode,
        projects,
    });
    const mutations = useProjectsMutations({
        workspaceId,
        userId: user?.id,
        isPreviewMode,
        setProjects,
    });
    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(PROJECTS_VIEW_MODE_STORAGE_KEY, mode);
        }
    };
    useKeyboardShortcut({
        combo: 'mod+f',
        callback: () => {
            document.getElementById('project-search')?.focus();
        },
    });
    useKeyboardShortcut({
        combo: 'mod+shift+n',
        callback: () => {
            document.getElementById('create-project-trigger')?.click();
        },
    });
    const focusedProjects = (() => {
        if (!focusedProject.id && !focusedProject.name) {
            return projects;
        }
        return projects.filter((project) => projectMatchesContext(project, focusedProject.id, focusedProject.name));
    })();
    const sortedProjects = (() => {
        const sorted = [...focusedProjects];
        sorted.sort((left, right) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = left.name.localeCompare(right.name);
                    break;
                case 'status':
                    comparison = PROJECT_STATUSES.indexOf(left.status) - PROJECT_STATUSES.indexOf(right.status);
                    break;
                case 'taskCount':
                    comparison = left.taskCount - right.taskCount;
                    break;
                case 'createdAt':
                    comparison =
                        new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime();
                    break;
                default:
                    comparison =
                        new Date(left.updatedAt ?? 0).getTime() - new Date(right.updatedAt ?? 0).getTime();
                    break;
            }
            return sortDirection === 'desc' ? -comparison : comparison;
        });
        return sorted;
    })();
    const statusCounts = projects.reduce<Record<ProjectStatus, number>>((accumulator, project) => {
        accumulator[project.status] = (accumulator[project.status] ?? 0) + 1;
        return accumulator;
    }, { planning: 0, active: 0, on_hold: 0, completed: 0 });
    const openTaskTotal = projects.reduce((total, project) => total + project.openTaskCount, 0);
    const taskTotal = projects.reduce((total, project) => total + project.taskCount, 0);
    const completionRate = (() => {
        if (projects.length === 0) {
            return 0;
        }
        return Math.round((statusCounts.completed / projects.length) * 100);
    })();
    const initialLoading = loading && projects.length === 0;
    const hasActiveFilters = statusFilter !== 'all' ||
        debouncedQuery.trim().length > 0 ||
        Boolean(focusedProject.id || focusedProject.name);
    const hasVisibleProjects = sortedProjects.length > 0;
    const focusedProjectRecord = projects.find((project) => projectMatchesContext(project, focusedProject.id, focusedProject.name)) ?? null;
    const focusedProjectTasksHref = focusedProjectRecord?.id
        ? buildProjectTasksRoute({
            projectId: focusedProjectRecord.id,
            projectName: focusedProjectRecord.name,
            clientId: focusedProjectRecord.clientId,
            clientName: focusedProjectRecord.clientName,
        })
        : focusedProject.id
            ? buildProjectTasksRoute({ projectId: focusedProject.id, projectName: focusedProject.name })
            : null;
    const portfolioLabel = selectedClient?.name ? `${selectedClient.name} workspace` : 'all workspaces';
    const clearFocusedProject = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('projectId');
        params.delete('projectName');
        const next = params.toString();
        router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    };
    const toggleSortDirection = () => {
        setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
    };
    const clearAllFilters = () => {
        setSearchInput('');
        setStatusFilter('all');
        setSortField('updatedAt');
        setSortDirection('desc');
        clearFocusedProject();
    };
    const setStatusFilterAndReset = (value: StatusFilter) => {
        setStatusFilter(value);
    };
    const activeFilterLabels = (() => {
        const labels: string[] = [];
        if (statusFilter !== 'all') {
            labels.push(formatStatusLabel(statusFilter));
        }
        if (debouncedQuery.trim()) {
            labels.push(`Search: “${debouncedQuery.trim()}”`);
        }
        if (focusedProject.id || focusedProject.name) {
            labels.push('Linked project');
        }
        if (sortField !== 'updatedAt' || sortDirection !== 'desc') {
            const sortLabel = SORT_OPTIONS.find((option) => option.value === sortField)?.label ?? sortField;
            labels.push(`Sort: ${sortLabel} (${sortDirection === 'asc' ? 'asc' : 'desc'})`);
        }
        return labels;
    })();
    const handleRefreshProjects = () => {
        resetProjectsPagination();
        notifySuccess({
            title: 'Projects refreshed',
            message: 'Fetching the latest project list.',
        });
    };
    return useMemo(() => ({
        activeFilterLabels,
        clearAllFilters,
        clearFocusedProject,
        completionRate,
        debouncedSearchQuery: debouncedQuery,
        deleteDialogOpen: mutations.deleteDialogOpen,
        deleting: mutations.deleting,
        editDialogOpen: mutations.editDialogOpen,
        error,
        focusedProject,
        focusedProjectRecord,
        focusedProjectTasksHref,
        handleDeleteProject: mutations.handleDeleteProject,
        handleLoadMore,
        handleMilestoneCreated,
        handleProjectCreated: mutations.handleProjectCreated,
        handleProjectUpdated: mutations.handleProjectUpdated,
        handleRefreshProjects,
        handleUpdateStatus: mutations.handleUpdateStatus,
        hasActiveFilters,
        hasMoreProjects,
        hasVisibleProjects,
        initialLoading,
        loadMilestones,
        loading,
        loadingMore,
        milestonesByProject,
        milestonesError,
        milestonesLoading,
        openDeleteDialog: mutations.openDeleteDialog,
        openEditDialog: mutations.openEditDialog,
        openTaskTotal,
        pendingStatusUpdates: mutations.pendingStatusUpdates,
        portfolioLabel,
        projectToDelete: mutations.projectToDelete,
        projectToEdit: mutations.projectToEdit,
        projects,
        searchInput,
        setDeleteDialogOpen: mutations.setDeleteDialogOpen,
        setEditDialogOpen: mutations.setEditDialogOpen,
        setSearchInput,
        setSortField,
        setStatusFilter,
        setStatusFilterAndReset,
        setViewMode,
        sortDirection,
        sortField,
        sortedProjects,
        statusCounts,
        statusFilter,
        taskTotal,
        toggleSortDirection,
        viewMode,
    }), [
        activeFilterLabels,
        clearAllFilters,
        clearFocusedProject,
        completionRate,
        debouncedQuery,
        mutations,
        error,
        focusedProject,
        focusedProjectRecord,
        focusedProjectTasksHref,
        handleLoadMore,
        handleMilestoneCreated,
        handleRefreshProjects,
        hasActiveFilters,
        hasMoreProjects,
        hasVisibleProjects,
        initialLoading,
        loadMilestones,
        loading,
        loadingMore,
        milestonesByProject,
        milestonesError,
        milestonesLoading,
        openTaskTotal,
        portfolioLabel,
        projects,
        searchInput,
        setSearchInput,
        setSortField,
        setStatusFilter,
        setStatusFilterAndReset,
        setViewMode,
        sortDirection,
        sortField,
        sortedProjects,
        statusCounts,
        statusFilter,
        taskTotal,
        toggleSortDirection,
        viewMode,
    ]);
}
