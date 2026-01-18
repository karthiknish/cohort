'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useMutation as useTanstackMutation } from '@tanstack/react-query'
import {
  TriangleAlert,
  Briefcase,
  FolderKanban,
  ListChecks,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Users,
  CircleX,
} from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { usePreview } from '@/contexts/preview-context'
import { useToast } from '@/components/ui/use-toast'
import { getPreviewProjects } from '@/lib/preview-data'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { projectMilestonesApi, projectsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { emitDashboardRefresh } from '@/lib/refresh-bus'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/hooks/use-keyboard-shortcuts'
import type { MilestoneRecord } from '@/types/milestones'

// Import extracted components
import {
  ProjectCard,
  ProjectRow,
  ProjectKanban,
  SummaryCard,
  GanttView,
  StatusFilter,
  SortField,
  SortDirection,
  ViewMode,
  RETRY_CONFIG,
  sleep,
  calculateBackoffDelay,
  isNetworkError,
  formatStatusLabel,
  useDebouncedValue,
  ProjectFilters,
  ProjectSearch,
  ViewModeSelector,
} from './components'

type ProjectResponse = {
  projects?: ProjectRecord[]
}

export default function ProjectsPage() {
  const { user } = useAuth()

  const softDeleteProject = useMutation(projectsApi.softDelete)
  const updateProject = useMutation(projectsApi.update)
  const workspaceId = user?.agencyId ?? null
  const { selectedClient, selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<ProjectRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [milestonesByProject, setMilestonesByProject] = useState<Record<string, MilestoneRecord[]>>({})
  const [milestonesLoading, setMilestonesLoading] = useState(false)
  const [milestonesError, setMilestonesError] = useState<string | null>(null)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<ProjectRecord | null>(null)

  // Optimistic update tracking
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Set<string>>(new Set())

  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null)

  const debouncedQuery = useDebouncedValue(searchInput, 350)

  const projectsRealtime = useQuery(
    projectsApi.list,
    isPreviewMode || !workspaceId || !user?.id
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          limit: 100,
        }
  ) as Array<any> | undefined

  const milestonesRealtime = useQuery(
    projectMilestonesApi.listByProjectIds,
    isPreviewMode || viewMode !== 'gantt' || !workspaceId || !user?.id
      ? 'skip'
      : {
          workspaceId,
          projectIds: projects.map((p) => p.id),
        }
  ) as Record<string, Array<any>> | undefined

  const loadProjects = useCallback(async (retryAttempt = 0) => {
    // Use preview data when in preview mode
    if (isPreviewMode) {
      let previewProjects = getPreviewProjects(selectedClientId)

      if (statusFilter !== 'all') {
        previewProjects = previewProjects.filter((p) => p.status === statusFilter)
      }

      const trimmedQuery = debouncedQuery.trim()
      if (trimmedQuery) {
        const query = trimmedQuery.toLowerCase()
        previewProjects = previewProjects.filter((p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }

      setProjects(previewProjects)
      setLoading(false)
      setError(null)
      return
    }

    if (!user?.id || !workspaceId) {
      setProjects([])
      setLoading(false)
      setError(null)
      return
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    if (retryAttempt === 0) {
      setError(null)
    }

    try {
      if (!projectsRealtime) {
        return
      }

      const rows = Array.isArray(projectsRealtime) ? projectsRealtime : []

      const mapped: ProjectRecord[] = rows.map((row: any) => ({
        id: String(row.legacyId),
        name: String(row.name ?? ''),
        description: typeof row.description === 'string' ? row.description : null,
        status: row.status as ProjectStatus,
        clientId: typeof row.clientId === 'string' ? row.clientId : null,
        clientName: typeof row.clientName === 'string' ? row.clientName : null,
        startDate: typeof row.startDateMs === 'number' ? new Date(row.startDateMs).toISOString() : null,
        endDate: typeof row.endDateMs === 'number' ? new Date(row.endDateMs).toISOString() : null,
        tags: Array.isArray(row.tags) ? row.tags : [],
        ownerId: typeof row.ownerId === 'string' ? row.ownerId : null,
        createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
        updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
        taskCount: 0,
        openTaskCount: 0,
        recentActivityAt: null,
        deletedAt: typeof row.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null,
      }))

      setProjects(mapped)
      setError(null)
      setRetryCount(0)
    } catch (fetchError: unknown) {
      // Ignore abort errors
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return
      }

      logError(fetchError, 'ProjectsPage:loadProjects')
      const message = asErrorMessage(fetchError)

      // Retry on network errors
      if (retryAttempt < RETRY_CONFIG.maxRetries && isNetworkError(fetchError)) {
        const delay = calculateBackoffDelay(retryAttempt)
        console.warn(`[Projects] Network error, retrying in ${delay}ms (attempt ${retryAttempt + 1}/${RETRY_CONFIG.maxRetries})`)
        setRetryCount(retryAttempt + 1)
        await sleep(delay)
        return loadProjects(retryAttempt + 1)
      }

      setProjects([])
      setError(message)
      toast({
        title: 'Failed to load projects',
        description: `${message}. Please check your connection and try again.`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, isPreviewMode, selectedClientId, statusFilter, user?.id, workspaceId, toast, projectsRealtime])

  const loadMilestones = useCallback(async (_projectIds: string[]) => {
    // Milestones are realtime via Convex; this function is effectively a no-op.
    return
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  useEffect(() => {
    if (isPreviewMode || viewMode !== 'gantt') return

    setMilestonesLoading(true)
    setMilestonesError(null)

    if (!milestonesRealtime) {
      return
    }

    try {
      const mapped: Record<string, MilestoneRecord[]> = {}

      for (const [projectId, rows] of Object.entries(milestonesRealtime)) {
        const list = Array.isArray(rows) ? rows : []
        mapped[projectId] = list.map((row: any) => ({
          id: String(row.legacyId),
          projectId: String(row.projectId),
          title: String(row.title ?? ''),
          description: typeof row.description === 'string' ? row.description : null,
          status: row.status,
          startDate: typeof row.startDateMs === 'number' ? new Date(row.startDateMs).toISOString() : null,
          endDate: typeof row.endDateMs === 'number' ? new Date(row.endDateMs).toISOString() : null,
          ownerId: typeof row.ownerId === 'string' ? row.ownerId : null,
          order: typeof row.order === 'number' ? row.order : null,
          createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
          updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
        }))
      }

      setMilestonesByProject(mapped)
    } catch (err) {
      logError(err, 'ProjectsPage:milestonesEffect')
      setMilestonesError(asErrorMessage(err))
      setMilestonesByProject({})
    } finally {
      setMilestonesLoading(false)
    }
  }, [isPreviewMode, viewMode, milestonesRealtime])

  // Keyboard shortcuts
  useKeyboardShortcut({
    combo: 'mod+k',
    callback: () => {
      const searchInput = document.getElementById('project-search')
      searchInput?.focus()
    },
  })

  useKeyboardShortcut({
    combo: 'mod+shift+n',
    callback: () => {
      // Trigger is handled by the CreateProjectDialog
    },
  })

  const handleProjectCreated = useCallback((project: ProjectRecord) => {
    setProjects((prev) => [project, ...prev])
  }, [])

  const handleProjectUpdated = useCallback((updatedProject: ProjectRecord) => {
    setProjects((prev) => prev.map((p) => p.id === updatedProject.id ? updatedProject : p))
  }, [])

  const handleMilestoneCreated = useCallback((milestone: MilestoneRecord) => {
    setMilestonesByProject((prev) => {
      const existing = prev[milestone.projectId] ?? []
      return { ...prev, [milestone.projectId]: [...existing, milestone] }
    })
  }, [])

  const openEditDialog = useCallback((project: ProjectRecord) => {
    setProjectToEdit(project)
    setEditDialogOpen(true)
  }, [])

  const handleDeleteProject = useCallback(async () => {
    if (!projectToDelete) return

    // In preview mode, show info toast and close dialog
    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: 'Changes are not saved in preview mode. Exit preview to make real changes.',
      })
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      return
    }

    if (!user?.id) return

    setDeleting(true)
    try {
      if (!workspaceId) throw new Error('Missing workspace')
      await softDeleteProject({
        workspaceId,
        legacyId: projectToDelete.id,
        deletedAtMs: Date.now(),
      })

      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      emitDashboardRefresh({ reason: 'project-mutated', clientId: projectToDelete.clientId ?? null })
      toast({
        title: 'Project deleted',
        description: `"${projectToDelete.name}" has been permanently removed.`,
      })
    } catch (error) {
      logError(error, 'ProjectsPage:handleDeleteProject')
      toast({ title: 'Deletion failed', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }, [projectToDelete, isPreviewMode, user?.id, workspaceId, softDeleteProject, toast])

  const updateStatusMutation = useTanstackMutation({
    mutationFn: async ({ project, newStatus }: { project: ProjectRecord; newStatus: ProjectStatus }) => {
      if (!workspaceId) throw new Error('Missing workspace')

      await updateProject({
        workspaceId,
        legacyId: project.id,
        status: newStatus,
        updatedAtMs: Date.now(),
      })

      return { project, newStatus }
    },
    onMutate: async ({ project, newStatus }: { project: ProjectRecord; newStatus: ProjectStatus }) => {
      setPendingStatusUpdates((prev) => {
        const next = new Set(prev)
        next.add(project.id)
        return next
      })

      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p)))

      return { projectId: project.id, previousStatus: project.status, clientId: project.clientId ?? null, projectName: project.name }
    },
    onError: (error, variables, context) => {
      if (!context) return

      logError(error, 'ProjectsPage:updateStatusMutation')
      setProjects((prev) => prev.map((p) => (p.id === context.projectId ? { ...p, status: context.previousStatus } : p)))

      toast({ title: 'Status update failed', description: asErrorMessage(error), variant: 'destructive' })
    },
    onSuccess: (_data, variables, _context) => {
      emitDashboardRefresh({ reason: 'project-mutated', clientId: variables.project.clientId ?? null })
      toast({
        title: 'Status updated',
        description: `"${variables.project.name}" is now ${formatStatusLabel(variables.newStatus)}.`,
      })
    },
    onSettled: (_data, _error, variables) => {
      setPendingStatusUpdates((prev) => {
        const next = new Set(prev)
        next.delete(variables.project.id)
        return next
      })
    },
  })

  const handleUpdateStatus = useCallback(
    async (project: ProjectRecord, newStatus: ProjectStatus) => {
      // In preview mode, just update local state (won't persist)
      if (isPreviewMode) {
        setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, status: newStatus } : p)))
        toast({
          title: 'Preview mode',
          description: `Status changed to ${formatStatusLabel(newStatus)} (not saved).`,
        })
        return
      }

      if (!user?.id) return

      if (pendingStatusUpdates.has(project.id) || updateStatusMutation.isPending) return

      await updateStatusMutation.mutateAsync({ project, newStatus })
    },
    [isPreviewMode, pendingStatusUpdates, toast, updateStatusMutation, user?.id]
  )

  const openDeleteDialog = useCallback((project: ProjectRecord) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }, [])

  // Sort projects
  const searchedProjects = useMemo(() => {
    if (!projects.length) return []

    const trimmedQuery = debouncedQuery.trim()
    if (!trimmedQuery) {
      return projects
    }

    const query = trimmedQuery.toLowerCase()
    return projects.filter((project) =>
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      project.tags.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [debouncedQuery, projects])

  const sortedProjects = useMemo(() => {
    const sorted = [...searchedProjects]
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'status':
          comparison = PROJECT_STATUSES.indexOf(a.status) - PROJECT_STATUSES.indexOf(b.status)
          break
        case 'taskCount':
          comparison = a.taskCount - b.taskCount
          break
        case 'createdAt':
          comparison = (new Date(a.createdAt ?? 0).getTime()) - (new Date(b.createdAt ?? 0).getTime())
          break
        case 'updatedAt':
        default:
          comparison = (new Date(a.updatedAt ?? 0).getTime()) - (new Date(b.updatedAt ?? 0).getTime())
          break
      }

      return sortDirection === 'desc' ? -comparison : comparison
    })

    return sorted
  }, [searchedProjects, sortDirection, sortField])

  const statusCounts = useMemo(() => {
    return projects.reduce<Record<ProjectStatus, number>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1
      return acc
    }, { planning: 0, active: 0, on_hold: 0, completed: 0 })
  }, [projects])

  const openTaskTotal = useMemo(() => {
    return projects.reduce((total, project) => total + project.openTaskCount, 0)
  }, [projects])

  const taskTotal = useMemo(() => {
    return projects.reduce((total, project) => total + project.taskCount, 0)
  }, [projects])

  const completionRate = useMemo(() => {
    if (projects.length === 0) return 0
    return Math.round((statusCounts.completed / projects.length) * 100)
  }, [projects.length, statusCounts.completed])

  const initialLoading = loading && projects.length === 0

  const portfolioLabel = selectedClient?.name ? `${selectedClient.name} workspace` : 'all workspaces'

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => prev === 'asc' ? 'desc' : 'asc')
  }, [])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Portfolio overview for {portfolioLabel}.
              {retryCount > 0 && (
                <span className="ml-2 text-amber-600">
                  (Retrying... attempt {retryCount}/{RETRY_CONFIG.maxRetries})
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ViewModeSelector viewMode={viewMode} onChange={setViewMode} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void loadProjects().then(() => {
                      if (!error) {
                        toast({
                          title: 'Projects refreshed',
                          description: `${projects.length} project${projects.length !== 1 ? 's' : ''} loaded successfully.`,
                        })
                      }
                    })
                  }}
                  className="inline-flex items-center gap-2"
                  disabled={loading}
                  aria-label="Refresh projects"
                >
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh projects list</TooltipContent>
            </Tooltip>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </div>

        {/* Edit Project Dialog */}
        <EditProjectDialog
          project={projectToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onProjectUpdated={handleProjectUpdated}
        />

        {/* Delete Confirmation Dialog */}
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
                {deleting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <Card className="overflow-hidden border-muted/50 bg-background shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-5 p-5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-none">Portfolio Health</p>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{completionRate}%</span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-muted/60 bg-background">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg">Project backlog</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  Search, filter, and review current initiatives.
                  <span className="hidden sm:flex items-center gap-1">
                    ( <KeyboardShortcutBadge combo="mod+k" className="scale-75 origin-left" /> to search )
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
            <Separator />
          </CardHeader>
          <CardContent>
            {viewMode !== 'gantt' && (
              <>
                {initialLoading && (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} className="h-28 w-full" />
                    ))}
                  </div>
                )}

                {!initialLoading && error && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
                    <TriangleAlert className="mx-auto h-10 w-10 text-destructive/60" />
                    <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => void loadProjects()}
                      disabled={loading}
                    >
                      {loading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Try again
                    </Button>
                  </div>
                )}

                {!initialLoading && !error && projects.length === 0 && (
                  <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
                    <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">No projects yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first project to start tracking work.
                    </p>
                    <div className="mt-4">
                      <CreateProjectDialog onProjectCreated={handleProjectCreated} />
                    </div>
                  </div>
                )}

                {!initialLoading && !error && projects.length > 0 && viewMode === 'list' && (
                  <div className="space-y-4">
                    {sortedProjects.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        onDelete={openDeleteDialog}
                        onEdit={openEditDialog}
                        onUpdateStatus={handleUpdateStatus}
                        isPendingUpdate={pendingStatusUpdates.has(project.id)}
                      />
                    ))}
                  </div>
                )}

                {!initialLoading && !error && projects.length > 0 && viewMode === 'grid' && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {sortedProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onDelete={openDeleteDialog}
                        onEdit={openEditDialog}
                        onUpdateStatus={handleUpdateStatus}
                        isPendingUpdate={pendingStatusUpdates.has(project.id)}
                      />
                    ))}
                  </div>
                )}

                {!initialLoading && !error && projects.length > 0 && viewMode === 'board' && (
                  <ProjectKanban
                    projects={projects}
                    pendingStatusUpdates={pendingStatusUpdates}
                    onUpdateStatus={handleUpdateStatus}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                )}
              </>
            )}

            {viewMode === 'gantt' && (
              <GanttView
                projects={sortedProjects}
                milestones={milestonesByProject}
                loading={milestonesLoading}
                error={milestonesError}
                onRefresh={() => void loadMilestones(projects.map((p) => p.id))}
                onMilestoneCreated={handleMilestoneCreated}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
