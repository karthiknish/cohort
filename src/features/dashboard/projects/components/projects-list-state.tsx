'use client'

import { useCallback } from 'react'
import { FolderKanban, LoaderCircle, Plus, RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'

import { ProjectCard } from './project-card'
import { ProjectKanban } from './project-kanban'
import { ProjectRow } from './project-row'
import { PROJECTS_THEME } from './projects-theme'

export type ProjectsListStateProps = {
  error: string | null
  hasActiveFilters: boolean
  hasVisibleProjects: boolean
  initialLoading: boolean
  loading: boolean
  onClearAllFilters: () => void
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
  onClearFocusAndFilters: () => void
}

export function ProjectsListState({
  error,
  hasActiveFilters,
  hasVisibleProjects,
  initialLoading,
  loading,
  onClearAllFilters,
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
  onClearFocusAndFilters,
}: ProjectsListStateProps) {
  const openCreateProject = useCallback(() => {
    document.getElementById('create-project-trigger')?.click()
  }, [])

  if (initialLoading) {
    return (
      <div className="space-y-3 py-2">
        {['project-skeleton-1', 'project-skeleton-2', 'project-skeleton-3', 'project-skeleton-4'].map((key) => (
          <Skeleton key={key} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center">
        <TriangleAlert className="mx-auto size-10 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh} disabled={loading}>
          {loading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
          Try again
        </Button>
      </div>
    )
  }

  if (projects.length === 0 && !hasActiveFilters) {
    return (
      <div className={PROJECTS_THEME.emptyPanel}>
        <FolderKanban className="size-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">No projects yet</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Create a project to group tasks, timelines, and collaboration. New projects use the client selected in the
          header.
        </p>
        <Button type="button" className={cn(getButtonClasses('primary'), 'mt-6 gap-2')} onClick={openCreateProject}>
          <Plus className="size-4" aria-hidden />
          New project
        </Button>
      </div>
    )
  }

  if (!hasVisibleProjects && hasActiveFilters) {
    return (
      <div className={PROJECTS_THEME.emptyPanel}>
        <FolderKanban className="size-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No matching projects</h3>
        <p className="mt-1 text-sm text-muted-foreground">Try a different search or reset filters.</p>
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
    return (
      <div className={PROJECTS_THEME.emptyPanel}>
        <FolderKanban className="size-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Nothing in this view</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Filters, search, or a deep link may be hiding results.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClearFocusAndFilters}>
            Reset search & filters
          </Button>
          <Button type="button" size="sm" onClick={openCreateProject}>
            <Plus className="mr-2 size-4" aria-hidden />
            New project
          </Button>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3 py-2">
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
      <div className="grid gap-4 py-2 sm:grid-cols-2 xl:grid-cols-3">
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
