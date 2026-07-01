'use client';

import { useCallback, useMemo } from 'react';
import { Briefcase, CircleX, ListChecks, LoaderCircle, Plus, RefreshCw, Users } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { CreateProjectSheet } from '@/features/dashboard/projects/create-project-dialog';
import { EditProjectDialog } from '@/features/dashboard/projects/edit-project-dialog';
import { ProjectsDocumentImportOverlay } from '@/features/dashboard/projects/projects-document-import-overlay';
import { ProjectsDocumentImportReviewSheet } from '@/features/dashboard/projects/projects-document-import-review-sheet';
import { useProjectsDocumentImport } from '@/features/dashboard/projects/use-projects-document-import';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { DashboardPageHero } from '@/shared/components/dashboard-page-hero';
import { Button } from '@/shared/ui/button';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { ProjectsPageSkeleton } from './projects-page-skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts';
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses, getIconContainerClasses } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { ProjectActiveFilters } from './project-active-filters';
import { ProjectDetailDrawer } from './project-detail-drawer';
import { ProjectFilters } from './project-filters';
import { ProjectSearch } from './project-search';
import { ProjectStatusPills } from './project-status-pills';
import { ProjectsListState } from './projects-list-state';
import { SavedViewsSelector } from './saved-views-selector';
import { SummaryCard } from './summary-card';
import { ViewModeSelector } from './view-mode-selector';
import { PROJECTS_THEME } from './projects-theme';
import type { StatusFilter } from '../types';
import { useProjectsPageContext } from './projects-page-provider';
import { useMilestoneMutations } from '../hooks/use-milestone-mutations';

export function ProjectsDashboard() {
  const {
    initialLoading,
    handleProjectCreated,
  } = useProjectsPageContext();
  const { user } = useAuth();
  const { clients, selectedClient, selectedClientId } = useClientContext();
  const { isPreviewMode } = usePreview();

  const documentImport = useProjectsDocumentImport({
    workspaceId: user?.agencyId ?? null,
    ownerId: user?.id,
    clients,
    preferredClientId: selectedClientId,
    preferredClientName: selectedClient?.name ?? null,
    disabledReason: isPreviewMode
      ? 'Document import is unavailable in preview mode.'
      : !user?.agencyId || !user?.id
        ? 'Sign in to import projects from documents.'
        : null,
    isPreviewMode,
    onProjectCreated: handleProjectCreated,
  });

  return (
    <TooltipProvider>
      <PageSkeletonBoundary loading={initialLoading} loadingContent={<ProjectsPageSkeleton />}>
        <div
          className={cn(DASHBOARD_THEME.layout.container, PROJECTS_THEME.page)}
          {...documentImport.importDragHandlers}
        >
          <ProjectsDocumentImportOverlay
            phase={documentImport.phase}
            statusMessage={documentImport.statusMessage}
            errorMessage={documentImport.errorMessage}
            visible={documentImport.overlayVisible}
            onCancel={documentImport.handleCancel}
          />

          <ProjectsDocumentImportReviewSheet
            open={documentImport.reviewOpen}
            documentSummary={documentImport.documentSummary}
            proposedProjects={documentImport.proposedProjects}
            clients={clients}
            preferredClientName={selectedClient?.name ?? null}
            onUpdateProject={documentImport.updateProposedProject}
            onConfirm={documentImport.handleConfirmReview}
            onDiscard={documentImport.handleDismissReview}
          />

          <ProjectsHeaderSection />
          <ProjectsDialogs />
          <ProjectsSummarySection />
          <ProjectsBacklogSection />
          <ProjectsDetailDrawerSection />
        </div>
      </PageSkeletonBoundary>
    </TooltipProvider>
  );
}

function ProjectsHeaderSection() {
  const {
    handleProjectCreated,
    handleRefreshProjects,
    loading,
    portfolioLabel,
    projects,
    setViewMode,
    viewMode,
    savedViews,
    handleSaveView,
    applySavedView,
    deleteView,
  } = useProjectsPageContext();
  const handleRefreshProjectsClick = () => {
    void handleRefreshProjects();
  };
  return (
    <DashboardPageHero>
      <div className="min-w-0 space-y-2">
        <div className="flex items-center gap-3">
          <div className={getIconContainerClasses('medium')}>
            <Briefcase className="size-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className={DASHBOARD_THEME.layout.title}>
              {PAGE_TITLES.projects?.title ?? 'Projects'}
            </h1>
            <p className={cn(DASHBOARD_THEME.layout.subtitle, 'mt-1 max-w-2xl text-sm leading-relaxed')}>
              Portfolio for <span className="font-medium text-foreground">{portfolioLabel}</span>
              {projects.length > 0 ? (
                <span>
                  {' '}
                  · {projects.length} project{projects.length === 1 ? '' : 's'}
                </span>
              ) : null}
              <span className="block text-xs text-muted-foreground">
                Drop a PDF, Word file, or image anywhere on this page to import projects with AI.
              </span>
            </p>
          </div>
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <KeyboardShortcutBadge combo="mod+f" className="origin-left scale-90" />
            Search backlog
          </span>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <KeyboardShortcutBadge combo="mod+shift+n" className="origin-left scale-90" />
            New project
          </span>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <Link
            href="/dashboard/tasks"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Open tasks
          </Link>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <span>Drop a PDF or image anywhere to import projects with AI</span>
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <SavedViewsSelector
          savedViews={savedViews}
          onSaveView={handleSaveView}
          onApplyView={applySavedView}
          onDeleteView={deleteView}
        />
        <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshProjectsClick}
              className={cn(getButtonClasses('outline'), 'h-9 gap-1.5')}
              disabled={loading}
              aria-label="Refresh projects"
            >
              {loading ? (
                <LoaderCircle className={cn('size-4', DASHBOARD_THEME.animations.spin)} />
              ) : (
                <RefreshCw className="size-4" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh projects list</TooltipContent>
        </Tooltip>
        <CreateProjectSheet onProjectCreated={handleProjectCreated} />
      </div>
    </DashboardPageHero>
  );
}

function ProjectsDialogs() {
  const {
    deleteDialogOpen,
    deleting,
    editDialogOpen,
    handleDeleteProject,
    handleProjectUpdated,
    projectToDelete,
    projectToEdit,
    setDeleteDialogOpen,
    setEditDialogOpen,
  } = useProjectsPageContext();
  return (
    <>
      <EditProjectDialog
        project={projectToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProjectUpdated={handleProjectUpdated}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CircleX className="size-5 text-destructive" />
              Delete project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}&quot;? This action cannot be
              undone. All associated tasks and collaboration history will remain but will no longer be linked
              to this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProjectsSummarySection() {
  const {
    completionRate,
    openTaskTotal,
    projects,
    setStatusFilterAndReset,
    statusCounts,
    statusFilter,
    taskTotal,
  } = useProjectsPageContext();
  const completionStyle = { width: `${completionRate}%` };
  const filterByStatus = (value: StatusFilter) => setStatusFilterAndReset(value);
  return (
    <section className="space-y-4" aria-label="Portfolio summary">
      <Card className={cn(PROJECTS_THEME.summaryStrip, 'border-border/60 bg-gradient-to-br from-card via-card to-muted/20')}>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
          <SummaryCard
            label="Total projects"
            icon={Briefcase}
            value={projects.length}
            description={statusCounts.completed > 0 ? `${statusCounts.completed} completed` : 'All initiatives'}
            onClick={() => filterByStatus('all')}
            active={statusFilter === 'all'}
          />
          <SummaryCard
            label="Active focus"
            icon={ListChecks}
            value={statusCounts.active}
            description={`${statusCounts.planning} in planning`}
            onClick={() => filterByStatus('active')}
            active={statusFilter === 'active'}
          />
          <SummaryCard
            label="Open tasks"
            icon={Users}
            value={openTaskTotal}
            description={taskTotal > 0 ? `${taskTotal - openTaskTotal} closed` : 'Waiting for tasks'}
          />
          <Card className="flex min-w-0 items-center gap-4 rounded-xl border-border/60 bg-background/80 p-4 shadow-sm">
            <CardContent className="min-w-0 flex-1 p-0">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Portfolio health
                </p>
                <span className="text-sm font-semibold tabular-nums text-info">{completionRate}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-linear-to-r from-info to-primary motion-chromatic-slow"
                  style={completionStyle}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Share of projects marked completed</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <ProjectStatusPills
        statusFilter={statusFilter}
        statusCounts={statusCounts}
        totalCount={projects.length}
        onStatusChange={filterByStatus}
      />
    </section>
  );
}

function ProjectsBacklogSection() {
  const {
    activeFilterLabels,
    clearFocusedProject,
    clearAllFilters,
    error,
    focusedProject,
    focusedProjectRecord,
    focusedProjectTasksHref,
    handleMilestoneCreated,
    handleLoadMore,
    handleRefreshProjects,
    handleUpdateStatus,
    hasActiveFilters,
    hasMoreProjects,
    hasVisibleProjects,
    debouncedSearchQuery,
    initialLoading,
    loadMilestones,
    loading,
    loadingMore,
    milestonesByProject,
    milestonesError,
    milestonesLoading,
    openDeleteDialog,
    openEditDialog,
    openDrawer,
    pendingStatusUpdates,
    projects,
    searchInput,
    setSearchInput,
    setSortField,
    sortDirection,
    sortField,
    sortedProjects,
    toggleSortDirection,
    viewMode,
  } = useProjectsPageContext();

  const { user } = useAuth();
  const { isPreviewMode } = usePreview();
  const { moveMilestone, updateMilestoneDetails } = useMilestoneMutations({
    workspaceId: user?.agencyId ?? null,
    isPreviewMode,
    onMilestoneUpdated: handleMilestoneCreated,
  });

  const handleMilestoneRefresh = () => {
    void loadMilestones(projects.map((project) => project.id));
  };
  const handleRefreshProjectsClick = () => {
    void handleRefreshProjects();
  };
  const handleSearchClear = () => {
    setSearchInput('');
  };

  return (
    <Card className={cn(PROJECTS_THEME.workspace, 'rounded-2xl ring-1 ring-border/40')} aria-label="Project backlog" role="region">
      <CardHeader className={cn(PROJECTS_THEME.workspaceRail, 'space-y-0')}>
        <div className="min-w-0 space-y-0.5">
          <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Backlog</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Search and sort update after you pause typing.
            {projects.length > 0 ? (
              <span className="tabular-nums" aria-live="polite">
                {' '}
                ·{' '}
                {searchInput.trim() !== debouncedSearchQuery.trim()
                  ? 'Matching…'
                  : (
                    <>
                      Showing <span className="font-medium text-foreground">{sortedProjects.length}</span> of{' '}
                      <span className="font-medium text-foreground">{projects.length}</span>
                    </>
                  )}
              </span>
            ) : null}
          </CardDescription>
        </div>
        <CardAction className={cn(PROJECTS_THEME.toolbar, 'w-full lg:max-w-2xl lg:justify-end')}>
          <ProjectSearch
            value={searchInput}
            onChange={setSearchInput}
            isDebouncing={searchInput !== debouncedSearchQuery}
          />
          <ProjectFilters
            sortField={sortField}
            sortDirection={sortDirection}
            onSortFieldChange={setSortField}
            onToggleSortDirection={toggleSortDirection}
          />
        </CardAction>
      </CardHeader>

      <div className="space-y-3 border-b border-border/50 bg-background/90 px-4 py-3">
        <ProjectActiveFilters labels={activeFilterLabels} onClearAll={clearAllFilters} />

        {focusedProject.id || focusedProject.name ? (
          <div className={PROJECTS_THEME.focusBanner}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Linked project
                  {focusedProjectRecord?.name
                    ? `: ${focusedProjectRecord.name}`
                    : focusedProject.name
                      ? `: ${focusedProject.name}`
                      : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  Opened from a task or cross-link. Clear to see the full portfolio.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {focusedProjectTasksHref ? (
                  <Button asChild type="button" size="sm" variant="outline">
                    <Link href={focusedProjectTasksHref}>Related tasks</Link>
                  </Button>
                ) : null}
                <Button type="button" size="sm" variant="ghost" onClick={clearFocusedProject}>
                  Show all
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <CardContent className={cn(PROJECTS_THEME.content, 'p-0', viewMode === 'list' && 'bg-muted/[0.15]')}>
        <ProjectsListState
          error={error}
          hasActiveFilters={hasActiveFilters}
          hasVisibleProjects={hasVisibleProjects}
          initialLoading={initialLoading}
          loading={loading}
          onClearAllFilters={clearAllFilters}
          onDelete={openDeleteDialog}
          onEdit={openEditDialog}
          hasMoreProjects={hasMoreProjects}
          loadingMore={loadingMore}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefreshProjectsClick}
          onSearchClear={handleSearchClear}
          onUpdateStatus={handleUpdateStatus}
          onViewDetails={(project) => openDrawer(project.id)}
          pendingStatusUpdates={pendingStatusUpdates}
          projects={projects}
          searchInput={searchInput}
          sortedProjects={sortedProjects}
          viewMode={viewMode}
          onClearFocusAndFilters={clearAllFilters}
          milestonesByProject={milestonesByProject}
          milestonesLoading={milestonesLoading}
          milestonesError={milestonesError}
          onMilestoneRefresh={handleMilestoneRefresh}
          onMilestoneCreated={handleMilestoneCreated}
          onMilestoneUpdated={handleMilestoneCreated}
          onMoveMilestone={moveMilestone}
          onUpdateMilestone={updateMilestoneDetails}
        />
      </CardContent>
    </Card>
  );
}

function ProjectsDetailDrawerSection() {
  const {
    drawerState,
    closeDrawer,
    openEditDialog,
    openDeleteDialog,
    handleUpdateStatus,
    projects,
    milestonesByProject,
    pendingStatusUpdates,
  } = useProjectsPageContext();

  const project = useMemo(
    () => projects.find((p) => p.id === drawerState.projectId) ?? null,
    [projects, drawerState.projectId],
  );

  const milestones = drawerState.projectId ? milestonesByProject[drawerState.projectId] : undefined;

  return (
    <ProjectDetailDrawer
      project={project}
      open={drawerState.open}
      onOpenChange={(open) => {
        if (!open) closeDrawer();
      }}
      onEdit={(p) => {
        closeDrawer();
        setTimeout(() => openEditDialog(p), 250);
      }}
      onDelete={(p) => {
        closeDrawer();
        setTimeout(() => openDeleteDialog(p), 250);
      }}
      onUpdateStatus={handleUpdateStatus}
      milestones={milestones}
      pendingStatusUpdate={project ? pendingStatusUpdates.has(project.id) : false}
    />
  );
}
