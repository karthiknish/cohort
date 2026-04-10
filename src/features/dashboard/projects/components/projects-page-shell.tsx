'use client'

import { useCallback, useMemo } from 'react'
import { Briefcase, CircleX, FolderKanban, ListChecks, LoaderCircle, RefreshCw, TriangleAlert, Users } from 'lucide-react'
import Link from 'next/link'

import { CreateProjectDialog } from '@/features/dashboard/projects/create-project-dialog'
import { EditProjectDialog } from '@/features/dashboard/projects/edit-project-dialog'
import { ProjectReadinessPanel } from '@/features/dashboard/workforce/project-readiness-panel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'
import { DASHBOARD_THEME, PAGE_TITLES, getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'

import { GanttView } from './gantt-view'
import { ProjectCard } from './project-card'
import { ProjectFilters } from './project-filters'
import { ProjectKanban } from './project-kanban'
import { ProjectRow } from './project-row'
import { ProjectSearch } from './project-search'
import { ProjectsPageSkeleton } from './projects-page-skeleton'
import { ProjectsSchedulingPanel } from './projects-scheduling-panel'
import { SummaryCard } from './summary-card'
import { ViewModeSelector } from './view-mode-selector'
import { RETRY_CONFIG } from './utils'
import { useProjectsPageContext } from './projects-page-provider'

export function ProjectsPageShell() {
  const { initialLoading } = useProjectsPageContext()
  const loadingContent = useMemo(() => <ProjectsPageSkeleton />, [])

  return (
    <TooltipProvider>
      <BoneyardSkeletonBoundary
        name="dashboard-projects-page"
        loading={initialLoading}
        loadingContent={loadingContent}
      >
        <div className={DASHBOARD_THEME.layout.container}>
          <ProjectsHeaderSection />
          <ProjectsDialogs />
          <ProjectsSummarySection />
          <ProjectReadinessPanel />
          <ProjectsSchedulingPanel />
          <ProjectsBacklogSection />
        </div>
      </BoneyardSkeletonBoundary>
    </TooltipProvider>
  )
}

function ProjectsHeaderSection() {
  const {
    handleProjectCreated,
    handleRefreshProjects,
    loading,
    portfolioLabel,
    retryCount,
    setViewMode,
    viewMode,
  } = useProjectsPageContext()
  const handleRefreshProjectsClick = useCallback(() => {
    void handleRefreshProjects()
  }, [handleRefreshProjects])

  return (
    <div className={DASHBOARD_THEME.layout.header}>
      <div>
        <h1 className={DASHBOARD_THEME.layout.title}>{PAGE_TITLES.projects?.title ?? 'Projects'}</h1>
        <p className={DASHBOARD_THEME.layout.subtitle}>
          Portfolio overview for {portfolioLabel}.
          {retryCount > 0 ? (
            <span className="ml-2 text-warning">
              (Retrying… attempt {retryCount}/{RETRY_CONFIG.maxRetries})
            </span>
          ) : null}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              onClick={handleRefreshProjectsClick}
              className={cn(getButtonClasses('outline'), 'inline-flex items-center gap-2')}
              disabled={loading}
              aria-label="Refresh projects"
            >
              {loading ? <LoaderCircle className={cn('h-4 w-4', DASHBOARD_THEME.animations.spin)} /> : <RefreshCw className="h-4 w-4" />}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh projects list</TooltipContent>
        </Tooltip>
        <CreateProjectDialog onProjectCreated={handleProjectCreated} />
      </div>
    </div>
  )
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
  } = useProjectsPageContext()

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
              <CircleX className="h-5 w-5 text-destructive" />
              Delete project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{projectToDelete?.name}&quot;? This action cannot be undone.
              All associated tasks and collaboration history will remain but will no longer be linked to this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ProjectsSummarySection() {
  const { completionRate, openTaskTotal, projects, statusCounts, taskTotal } = useProjectsPageContext()
  const completionStyle = useMemo(() => ({ width: `${completionRate}%` }), [completionRate])

  return (
    <div className={DASHBOARD_THEME.stats.container}>
      <SummaryCard
        label="Total projects"
        icon={Briefcase}
        value={projects.length}
        description={statusCounts.completed > 0 ? `${statusCounts.completed} completed` : 'All initiatives'}
      />
      <SummaryCard
        label="Active Focus"
        icon={ListChecks}
        value={statusCounts.active}
        description={`${statusCounts.planning} in planning`}
      />
      <SummaryCard
        label="Open tasks"
        icon={Users}
        value={openTaskTotal}
        description={taskTotal > 0 ? `${taskTotal - openTaskTotal} closed` : 'Waiting for tasks'}
      />
      <Card className={cn(DASHBOARD_THEME.stats.card, 'overflow-hidden')}>
        <CardContent className="flex min-w-0 items-center gap-5 p-5">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <p className={DASHBOARD_THEME.stats.label}>Portfolio Health</p>
              <span className="text-sm font-bold text-info">{completionRate}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-slow)] ease-[var(--motion-ease-out)] motion-reduce:transition-none"
                style={completionStyle}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProjectsBacklogSection() {
  const {
    clearFocusedProject,
    clearAllFilters,
    error,
    focusedProject,
    focusedProjectRecord,
    focusedProjectTasksHref,
    handleMilestoneCreated,
    handleProjectCreated,
    handleRefreshProjects,
    handleUpdateStatus,
    hasActiveFilters,
    hasVisibleProjects,
    initialLoading,
    loadMilestones,
    loading,
    milestonesByProject,
    milestonesError,
    milestonesLoading,
    openDeleteDialog,
    openEditDialog,
    pendingStatusUpdates,
    projects,
    searchInput,
    setSearchInput,
    setSortField,
    setStatusFilter,
    sortDirection,
    sortField,
    sortedProjects,
    statusFilter,
    toggleSortDirection,
    viewMode,
  } = useProjectsPageContext()
  const handleMilestoneRefresh = useCallback(() => {
    void loadMilestones(projects.map((project) => project.id))
  }, [loadMilestones, projects])

  const handleRefreshProjectsClick = useCallback(() => {
    void handleRefreshProjects()
  }, [handleRefreshProjects])

  const handleSearchClear = useCallback(() => {
    setSearchInput('')
  }, [setSearchInput])

  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg">Project backlog</CardTitle>
            <CardDescription className="flex items-center gap-1.5">
              Search, filter, and review current initiatives.
              <span className="hidden items-center gap-1 sm:flex">
                ( <KeyboardShortcutBadge combo="mod+k" className="origin-left scale-75" /> to search )
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <ProjectSearch value={searchInput} onChange={setSearchInput} />
            <ProjectFilters
              statusFilter={statusFilter}
              sortField={sortField}
              sortDirection={sortDirection}
              onStatusChange={setStatusFilter}
              onSortFieldChange={setSortField}
              onToggleSortDirection={toggleSortDirection}
            />
          </div>
        </div>

        {focusedProject.id || focusedProject.name ? (
          <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Showing linked project{focusedProjectRecord?.name ? `: ${focusedProjectRecord.name}` : focusedProject.name ? `: ${focusedProject.name}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  This view was opened from a related task or cross-link. Clear it to return to the full portfolio.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {focusedProjectTasksHref ? (
                  <Button asChild type="button" size="sm" variant="outline">
                    <Link href={focusedProjectTasksHref}>Open related tasks</Link>
                  </Button>
                ) : null}
                <Button type="button" size="sm" variant="ghost" onClick={clearFocusedProject}>
                  Show all projects
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <Separator />
      </CardHeader>

      <CardContent>
        {viewMode === 'gantt' ? (
          <GanttView
            projects={sortedProjects}
            milestones={milestonesByProject}
            loading={milestonesLoading}
            error={milestonesError}
            onRefresh={handleMilestoneRefresh}
            onMilestoneCreated={handleMilestoneCreated}
          />
        ) : (
          <ProjectsListState
            error={error}
            hasActiveFilters={hasActiveFilters}
            hasVisibleProjects={hasVisibleProjects}
            initialLoading={initialLoading}
            loading={loading}
            onClearAllFilters={clearAllFilters}
            onCreateProject={handleProjectCreated}
            onDelete={openDeleteDialog}
            onEdit={openEditDialog}
            onRefresh={handleRefreshProjectsClick}
            onSearchClear={handleSearchClear}
            onUpdateStatus={handleUpdateStatus}
            pendingStatusUpdates={pendingStatusUpdates}
            projects={projects}
            searchInput={searchInput}
            sortedProjects={sortedProjects}
            viewMode={viewMode}
          />
        )}
      </CardContent>
    </Card>
  )
}

type ProjectsListStateProps = {
  error: string | null
  hasActiveFilters: boolean
  hasVisibleProjects: boolean
  initialLoading: boolean
  loading: boolean
  onClearAllFilters: () => void
  onCreateProject: (project: ProjectRecord) => void
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onRefresh: () => void
  onSearchClear: () => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => Promise<void>
  pendingStatusUpdates: Set<string>
  projects: ProjectRecord[]
  searchInput: string
  sortedProjects: ProjectRecord[]
  viewMode: 'list' | 'grid' | 'board'
}

function ProjectsListState({
  error,
  hasActiveFilters,
  hasVisibleProjects,
  initialLoading,
  loading,
  onClearAllFilters,
  onCreateProject,
  onDelete,
  onEdit,
  onRefresh,
  onSearchClear,
  onUpdateStatus,
  pendingStatusUpdates,
  projects,
  searchInput,
  sortedProjects,
  viewMode,
}: ProjectsListStateProps) {
  if (initialLoading) {
    return (
      <div className="space-y-4">
        {['project-skeleton-1', 'project-skeleton-2', 'project-skeleton-3', 'project-skeleton-4'].map((key) => (
          <Skeleton key={key} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh} disabled={loading}>
          {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Try again
        </Button>
      </div>
    )
  }

  if (projects.length === 0 && !hasActiveFilters) {
    return (
      <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No projects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">Create your first project to start tracking work.</p>
        <div className="mt-4">
          <CreateProjectDialog onProjectCreated={onCreateProject} />
        </div>
      </div>
    )
  }

  if (!hasVisibleProjects && hasActiveFilters) {
    return (
      <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No matching projects</h3>
        <p className="mt-1 text-sm text-muted-foreground">Try a different search or reset your filters to see more work.</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {searchInput ? (
            <Button type="button" variant="outline" size="sm" onClick={onSearchClear}>
              Clear search
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={onClearAllFilters}>
            Reset filters
          </Button>
        </div>
      </div>
    )
  }

  if (!hasVisibleProjects) {
    return null
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {sortedProjects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateStatus={onUpdateStatus}
            isPendingUpdate={pendingStatusUpdates.has(project.id)}
          />
        ))}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={onDelete}
            onEdit={onEdit}
            onUpdateStatus={onUpdateStatus}
            isPendingUpdate={pendingStatusUpdates.has(project.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <ProjectKanban
      projects={sortedProjects}
      pendingStatusUpdates={pendingStatusUpdates}
      onUpdateStatus={onUpdateStatus}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}
