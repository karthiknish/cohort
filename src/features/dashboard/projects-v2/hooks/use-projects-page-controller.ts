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
import type { ProjectRecord } from '@/types/projects';
import type { SortDirection, SortField, StatusFilter, ViewMode } from '../types';
import { formatStatusLabel, SORT_OPTIONS } from '../utils/project-formatters';
import {
  computeCompletionRate,
  computeStatusCounts,
  hasActiveFilterState,
  projectMatchesContext,
  sortProjects,
} from '../utils/project-filters';
import { useProjects } from '../api/use-projects';
import { useProjectMilestones } from '../api/use-project-milestones';
import { useProjectMutations } from '../api/use-project-mutations';
import { useViewMode } from './use-view-mode';
import { useSavedViews, type SavedViewSnapshot } from './use-saved-views';
import { useProjectDetailDrawer } from './use-project-detail-drawer';

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
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const debouncedQuery = useDebouncedValue(searchInput, 350);
  const { viewMode, setViewMode } = useViewMode();
  const { savedViews, saveView, deleteView } = useSavedViews();
  const { drawerState, openDrawer, closeDrawer, toggleDrawer } = useProjectDetailDrawer();

  const focusedProjectId = searchParams.get('projectId');
  const focusedProjectName = searchParams.get('projectName');
  const focusedProject = useMemo(
    () => ({ id: focusedProjectId, name: focusedProjectName }),
    [focusedProjectId, focusedProjectName],
  );

  const {
    projects,
    setProjects,
    loading,
    initialLoading,
    loadingMore,
    error,
    hasMoreProjects,
    handleLoadMore,
    handleRefresh: resetProjectsPagination,
  } = useProjects({
    workspaceId,
    userId: user?.id,
    isPreviewMode,
    selectedClientId,
    statusFilter,
    debouncedSearchQuery: debouncedQuery,
  });

  const { milestonesByProject, milestonesLoading, milestonesError, loadMilestones, handleMilestoneCreated } =
    useProjectMilestones({
      workspaceId,
      userId: user?.id,
      isPreviewMode,
      selectedClientId,
      viewMode,
      projects,
    });

  const mutations = useProjectMutations({
    workspaceId,
    userId: user?.id,
    isPreviewMode,
    setProjects,
  });

  // Keyboard shortcuts
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

  // Derived state
  const focusedProjects = useMemo(() => {
    if (!focusedProject.id && !focusedProject.name) return projects;
    return projects.filter((project) =>
      projectMatchesContext(project, focusedProject.id, focusedProject.name),
    );
  }, [projects, focusedProject.id, focusedProject.name]);

  const sortedProjects = useMemo(
    () => sortProjects(focusedProjects, sortField, sortDirection),
    [focusedProjects, sortField, sortDirection],
  );

  const statusCounts = useMemo(() => computeStatusCounts(projects), [projects]);
  const openTaskTotal = useMemo(
    () => projects.reduce((total, project) => total + project.openTaskCount, 0),
    [projects],
  );
  const taskTotal = useMemo(
    () => projects.reduce((total, project) => total + project.taskCount, 0),
    [projects],
  );
  const completionRate = useMemo(
    () => computeCompletionRate(projects, statusCounts),
    [projects, statusCounts],
  );

  const hasActiveFilters = hasActiveFilterState(
    statusFilter,
    debouncedQuery,
    focusedProject.id,
    focusedProject.name,
  );
  const hasVisibleProjects = sortedProjects.length > 0;

  const focusedProjectRecord =
    projects.find((project) =>
      projectMatchesContext(project, focusedProject.id, focusedProject.name),
    ) ?? null;

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

  const clearFocusedProject = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('projectId');
    params.delete('projectName');
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const toggleSortDirection = useCallback(() => {
    setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchInput('');
    setStatusFilter('all');
    setSortField('updatedAt');
    setSortDirection('desc');
    clearFocusedProject();
  }, [clearFocusedProject]);

  const setStatusFilterAndReset = useCallback((value: StatusFilter) => {
    setStatusFilter(value);
  }, []);

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (statusFilter !== 'all') labels.push(formatStatusLabel(statusFilter));
    if (debouncedQuery.trim()) labels.push(`Search: "${debouncedQuery.trim()}"`);
    if (focusedProject.id || focusedProject.name) labels.push('Linked project');
    if (sortField !== 'updatedAt' || sortDirection !== 'desc') {
      const sortLabel = SORT_OPTIONS.find((option) => option.value === sortField)?.label ?? sortField;
      labels.push(`Sort: ${sortLabel} (${sortDirection === 'asc' ? 'asc' : 'desc'})`);
    }
    return labels;
  }, [statusFilter, debouncedQuery, focusedProject.id, focusedProject.name, sortField, sortDirection]);

  const handleRefreshProjects = useCallback(() => {
    resetProjectsPagination();
    notifySuccess({
      title: 'Projects refreshed',
      message: 'Fetching the latest project list.',
    });
  }, [resetProjectsPagination]);

  // Saved views
  const applySavedView = useCallback(
    (view: SavedViewSnapshot & { name: string }) => {
      setStatusFilter(view.statusFilter);
      setSortField(view.sortField);
      setSortDirection(view.sortDirection);
      setSearchInput(view.searchQuery);
      setViewMode(view.viewMode);
      clearFocusedProject();
    },
    [clearFocusedProject, setViewMode],
  );

  const handleSaveView = useCallback(
    (name: string) => {
      return saveView(name, {
        statusFilter,
        sortField,
        sortDirection,
        searchQuery: searchInput,
        viewMode,
      });
    },
    [saveView, statusFilter, sortField, sortDirection, searchInput, viewMode],
  );

  return useMemo(
    () => ({
      // Data
      projects,
      sortedProjects,
      loading,
      loadingMore,
      initialLoading,
      error,
      hasMoreProjects,
      handleLoadMore,
      handleRefreshProjects,
      // Filters
      statusFilter,
      setStatusFilter,
      setStatusFilterAndReset,
      searchInput,
      setSearchInput,
      debouncedSearchQuery: debouncedQuery,
      sortField,
      setSortField,
      sortDirection,
      toggleSortDirection,
      hasActiveFilters,
      hasVisibleProjects,
      activeFilterLabels,
      clearAllFilters,
      // View mode
      viewMode,
      setViewMode,
      // Summary
      statusCounts,
      openTaskTotal,
      taskTotal,
      completionRate,
      portfolioLabel,
      // Focused project
      focusedProject,
      focusedProjectRecord,
      focusedProjectTasksHref,
      clearFocusedProject,
      // Milestones
      milestonesByProject,
      milestonesLoading,
      milestonesError,
      loadMilestones,
      handleMilestoneCreated,
      // Mutations
      ...mutations,
      // Saved views
      savedViews,
      handleSaveView,
      applySavedView,
      deleteView,
      // Detail drawer
      drawerState,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [
      projects,
      sortedProjects,
      loading,
      loadingMore,
      initialLoading,
      error,
      hasMoreProjects,
      handleLoadMore,
      handleRefreshProjects,
      statusFilter,
      setStatusFilterAndReset,
      searchInput,
      debouncedQuery,
      sortField,
      sortDirection,
      toggleSortDirection,
      hasActiveFilters,
      hasVisibleProjects,
      activeFilterLabels,
      clearAllFilters,
      viewMode,
      setViewMode,
      statusCounts,
      openTaskTotal,
      taskTotal,
      completionRate,
      portfolioLabel,
      focusedProject,
      focusedProjectRecord,
      focusedProjectTasksHref,
      clearFocusedProject,
      milestonesByProject,
      milestonesLoading,
      milestonesError,
      loadMilestones,
      handleMilestoneCreated,
      mutations,
      savedViews,
      handleSaveView,
      applySavedView,
      deleteView,
      drawerState,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    ],
  );
}

export type ProjectsPageController = ReturnType<typeof useProjectsPageController>;
