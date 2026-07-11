'use client';
import { useCallback, useMemo } from 'react';
import { Briefcase, CircleX, ListChecks, LoaderCircle, Plus, RefreshCw, Users } from 'lucide-react';
import { Link } from '@/shared/ui/link';
import { CreateProjectSheet } from '@/features/dashboard/projects/create-project-dialog';
import { EditProjectDialog } from '@/features/dashboard/projects/edit-project-dialog';
import { ProjectsDocumentImportOverlay } from '@/features/dashboard/projects/projects-document-import-overlay';
import { ProjectsDocumentImportReviewSheet } from '@/features/dashboard/projects/projects-document-import-review-sheet';
import { useProjectsDocumentImport } from '@/features/dashboard/projects/use-projects-document-import';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/shared/ui/alert-dialog';
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
import { GanttView } from './gantt-view';
import { ProjectActiveFilters } from './project-active-filters';
import { ProjectFilters } from './project-filters';
import { ProjectsListState } from './projects-list-state';
import { ProjectSearch } from './project-search';
import { ProjectStatusPills } from './project-status-pills';
import { PROJECTS_THEME } from './projects-theme';
import { SummaryCard } from './summary-card';
import { ViewModeSelector } from './view-mode-selector';
import type { StatusFilter } from './utils';
import { useProjectsPageContext } from './projects-page-provider';

export function ProjectsPageShell() {
    const { handleProjectCreated } = useProjectsPageContext();
    const { user } = useAuth();
    const { clients, selectedClient, selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const workspaceId = selectedClient?.workspaceId ?? user?.agencyId ?? null;
    const documentImport = useProjectsDocumentImport({
        workspaceId,
        ownerId: user?.id,
        clients,
        preferredClientId: selectedClientId,
        preferredClientName: selectedClient?.name ?? null,
        disabledReason: isPreviewMode
            ? 'Document import is unavailable in preview mode.'
            : !workspaceId || !user?.id
                ? 'Sign in to import projects from documents.'
                : null,
        isPreviewMode,
        onProjectCreated: handleProjectCreated,
    });
    return (<TooltipProvider>
      <div className={cn(DASHBOARD_THEME.layout.container, PROJECTS_THEME.page)} {...documentImport.importDragHandlers}>
        <ProjectsDocumentImportOverlay phase={documentImport.phase} statusMessage={documentImport.statusMessage} errorMessage={documentImport.errorMessage} visible={documentImport.overlayVisible} onCancel={documentImport.handleCancel}/>

        <ProjectsDocumentImportReviewSheet open={documentImport.reviewOpen} documentSummary={documentImport.documentSummary} proposedProjects={documentImport.proposedProjects} clients={clients} preferredClientName={selectedClient?.name ?? null} onUpdateProject={documentImport.updateProposedProject} onConfirm={documentImport.handleConfirmReview} onDiscard={documentImport.handleDismissReview}/>

        <ProjectsHeaderSection />
        <ProjectsDialogs />
        <ProjectsSummarySection />
        <ProjectsBacklogSection />
      </div>
    </TooltipProvider>);
}

function ProjectsHeaderSection() {
    const { handleProjectCreated, handleRefreshProjects, loading, portfolioLabel, projects, setViewMode, viewMode, } = useProjectsPageContext();
    const handleRefreshProjectsClick = useCallback(() => {
        void handleRefreshProjects();
    }, [handleRefreshProjects]);
    return (<DashboardPageHero>
      <div className="min-w-0 space-y-2">
        <div className="flex items-center gap-3">
          <div className={getIconContainerClasses('medium')}>
            <Briefcase className="size-6" aria-hidden/>
          </div>
          <div className="min-w-0">
            <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.projects?.title ?? 'Projects'}</h1>
            <p className={cn(DASHBOARD_THEME.layout.subtitle, 'mt-1 max-w-2xl text-sm leading-relaxed')}>
              Portfolio for <span className="font-medium text-foreground">{portfolioLabel}</span>
              {projects.length > 0 ? (<span>
                  {' '}
                  · {projects.length} project{projects.length === 1 ? '' : 's'}
                </span>) : null}
              <span className="block text-xs text-muted-foreground">
                Drop a PDF, Word file, or image anywhere on this page to import projects with AI.
              </span>
            </p>
          </div>
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <KeyboardShortcutBadge combo="mod+f" className="origin-left scale-90"/>
            Search backlog
          </span>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <KeyboardShortcutBadge combo="mod+shift+n" className="origin-left scale-90"/>
            New project
          </span>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <Link href="/dashboard/tasks" className="font-medium text-primary underline-offset-4 hover:underline">
            Open tasks
          </Link>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <span>Drop a PDF or image anywhere to import projects with AI</span>
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <ViewModeSelector viewMode={viewMode} onChange={setViewMode}/>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={handleRefreshProjectsClick} className={cn(getButtonClasses('outline'), 'h-9 gap-1.5')} disabled={loading} aria-label="Refresh projects">
              {loading ? (<LoaderCircle className={cn('size-4', DASHBOARD_THEME.animations.spin)}/>) : (<RefreshCw className="size-4"/>)}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh projects list</TooltipContent>
        </Tooltip>
        <CreateProjectSheet onProjectCreated={handleProjectCreated}/>
      </div>
    </DashboardPageHero>);
}

function ProjectsDialogs() {
    const { deleteDialogOpen, deleting, editDialogOpen, handleDeleteProject, handleProjectUpdated, projectToDelete, projectToEdit, setDeleteDialogOpen, setEditDialogOpen, } = useProjectsPageContext();
    return (<>
      <EditProjectDialog project={projectToEdit} open={editDialogOpen} onOpenChange={setEditDialogOpen} onProjectUpdated={handleProjectUpdated}/>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CircleX className="size-5 text-destructive"/>
              Delete project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}&quot;? This action cannot be undone.
              All associated tasks and collaboration history will remain but will no longer be linked to this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);
}

function ProjectsSummarySection() {
    const { completionRate, openTaskTotal, projects, setStatusFilterAndReset, statusCounts, statusFilter, taskTotal, } = useProjectsPageContext();
    const completionStyle = useMemo(() => ({ width: `${completionRate}%` }), [completionRate]);
    const filterByStatus = useCallback((value: StatusFilter) => setStatusFilterAndReset(value), [setStatusFilterAndReset]);
    const handleFilterAll = useCallback(() => {
        filterByStatus('all');
    }, [filterByStatus]);
    const handleFilterActive = useCallback(() => {
        filterByStatus('active');
    }, [filterByStatus]);
    return (<section className="space-y-4" aria-label="Portfolio summary">
      <div className={PROJECTS_THEME.summaryStrip}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total projects" icon={Briefcase} value={projects.length} description={statusCounts.completed > 0 ? `${statusCounts.completed} completed` : 'All initiatives'} onClick={handleFilterAll} active={statusFilter === 'all'}/>
          <SummaryCard label="Active focus" icon={ListChecks} value={statusCounts.active} description={`${statusCounts.planning} in planning`} onClick={handleFilterActive} active={statusFilter === 'active'}/>
          <SummaryCard label="Open tasks" icon={Users} value={openTaskTotal} description={taskTotal > 0 ? `${taskTotal - openTaskTotal} closed` : 'Waiting for tasks'}/>
          <div className="flex min-w-0 items-center gap-4 rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Portfolio health
                </p>
                <span className="text-sm font-semibold tabular-nums text-info">{completionRate}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                <div className="h-full rounded-full bg-linear-to-r from-info to-primary motion-chromatic-slow" style={completionStyle}/>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Share of projects marked completed</p>
            </div>
          </div>
        </div>
      </div>

      <ProjectStatusPills statusFilter={statusFilter} statusCounts={statusCounts} totalCount={projects.length} onStatusChange={filterByStatus}/>
    </section>);
}

function ProjectsBacklogSection() {
    const { activeFilterLabels, clearFocusedProject, clearAllFilters, error, focusedProject, focusedProjectRecord, focusedProjectTasksHref, handleMilestoneCreated, handleLoadMore, handleRefreshProjects, handleUpdateStatus, hasActiveFilters, hasMoreProjects, hasVisibleProjects, debouncedSearchQuery, initialLoading, loadMilestones, loading, loadingMore, milestonesByProject, milestonesError, milestonesLoading, openDeleteDialog, openEditDialog, pendingStatusUpdates, projects, searchInput, setSearchInput, setSortField, sortDirection, sortField, sortedProjects, toggleSortDirection, viewMode, } = useProjectsPageContext();
    const handleMilestoneRefresh = useCallback(() => {
        void loadMilestones(projects.map((project) => project.id));
    }, [loadMilestones, projects]);
    const handleRefreshProjectsClick = useCallback(() => {
        void handleRefreshProjects();
    }, [handleRefreshProjects]);
    const handleSearchClear = useCallback(() => {
        setSearchInput('');
    }, [setSearchInput]);
    return (<section className={PROJECTS_THEME.workspace} aria-label="Project backlog">
      <div className={PROJECTS_THEME.workspaceRail}>
        <div className="min-w-0 space-y-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Backlog</h2>
          <p className="text-xs text-muted-foreground">
            Search and sort update after you pause typing.
            {projects.length > 0 ? (<span className="tabular-nums" aria-live="polite">
                {' '}
                ·{' '}
                {searchInput.trim() !== debouncedSearchQuery.trim() ? ('Matching…') : (<>
                    Showing <span className="font-medium text-foreground">{sortedProjects.length}</span> of{' '}
                    <span className="font-medium text-foreground">{projects.length}</span>
                  </>)}
              </span>) : null}
          </p>
        </div>
        <div className={cn(PROJECTS_THEME.toolbar, 'w-full lg:max-w-2xl lg:justify-end')}>
          <ProjectSearch value={searchInput} onChange={setSearchInput}/>
          <ProjectFilters sortField={sortField} sortDirection={sortDirection} onSortFieldChange={setSortField} onToggleSortDirection={toggleSortDirection}/>
        </div>
      </div>

      <div className="space-y-3 border-b border-border/50 bg-background/90 px-4 py-3">
        <ProjectActiveFilters labels={activeFilterLabels} onClearAll={clearAllFilters}/>

        {focusedProject.id || focusedProject.name ? (<div className={PROJECTS_THEME.focusBanner}>
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
                {focusedProjectTasksHref ? (<Button asChild type="button" size="sm" variant="outline">
                    <Link href={focusedProjectTasksHref}>Related tasks</Link>
                  </Button>) : null}
                <Button type="button" size="sm" variant="ghost" onClick={clearFocusedProject}>
                  Show all
                </Button>
              </div>
            </div>
          </div>) : null}
      </div>

      <div className={cn(PROJECTS_THEME.content, viewMode === 'list' && 'bg-muted/[0.15]')}>
        <PageSkeletonBoundary loading={initialLoading} loadingContent={<ProjectsPageSkeleton />}>
        {viewMode === 'gantt' ? (<GanttView projects={sortedProjects} milestones={milestonesByProject} loading={milestonesLoading} error={milestonesError} onRefresh={handleMilestoneRefresh} onMilestoneCreated={handleMilestoneCreated}/>) : (<ProjectsListState error={error} hasActiveFilters={hasActiveFilters} hasVisibleProjects={hasVisibleProjects} initialLoading={initialLoading} loading={loading} onClearAllFilters={clearAllFilters} onDelete={openDeleteDialog} onEdit={openEditDialog} hasMoreProjects={hasMoreProjects} loadingMore={loadingMore} onLoadMore={handleLoadMore} onRefresh={handleRefreshProjectsClick} onSearchClear={handleSearchClear} onUpdateStatus={handleUpdateStatus} pendingStatusUpdates={pendingStatusUpdates} projects={projects} searchInput={searchInput} sortedProjects={sortedProjects} viewMode={viewMode} onClearFocusAndFilters={clearAllFilters}/>)}
        </PageSkeletonBoundary>
      </div>
    </section>);
}
