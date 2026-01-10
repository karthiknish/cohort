'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  TriangleAlert,
  ArrowDown,
  ArrowUp,
  Briefcase,

  FolderKanban,
  LayoutGrid,
  List,
  ListChecks,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Users,
  CircleX,
  ChartGantt,
  Columns3,
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { apiFetch } from '@/lib/api-client'
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
  STATUS_FILTERS,
  SORT_OPTIONS,
  RETRY_CONFIG,
  sleep,
  calculateBackoffDelay,
  isNetworkError,
  formatStatusLabel,
  useDebouncedValue,
  getErrorMessage,
} from './components'

type ProjectResponse = {
  projects?: ProjectRecord[]
}

export default function ProjectsPage() {
  const { user, getIdToken } = useAuth()
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

  const loadProjects = useCallback(async (retryAttempt = 0) => {
    // Use preview data when in preview mode
    if (isPreviewMode) {
      let previewProjects = getPreviewProjects(selectedClientId)

      // Apply status filter
      if (statusFilter !== 'all') {
        previewProjects = previewProjects.filter((p) => p.status === statusFilter)
      }

      // Apply search filter
      if (debouncedQuery.trim().length > 0) {
        const query = debouncedQuery.trim().toLowerCase()
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

    if (!user?.id) {
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
      const params = new URLSearchParams()
      params.set('includeStats', 'true')
      if (selectedClientId) {
        params.set('clientId', selectedClientId)
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      if (debouncedQuery.trim().length > 0) {
        params.set('query', debouncedQuery.trim())
      }

      const queryString = params.toString()
      const data = await apiFetch<ProjectResponse>(`/api/projects${queryString ? `?${queryString}` : ''}`, {
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      })
      setProjects(Array.isArray(data.projects) ? data.projects : [])
      setError(null)
      setRetryCount(0)
    } catch (fetchError: unknown) {
      // Ignore abort errors
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return
      }

      console.error('Failed to fetch projects', fetchError)
      const message = getErrorMessage(fetchError, 'Unable to load projects')

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
  }, [debouncedQuery, getIdToken, isPreviewMode, selectedClientId, statusFilter, user?.id, toast])

  const loadMilestones = useCallback(async (projectIds: string[]) => {
    if (!user?.id || projectIds.length === 0) {
      setMilestonesByProject({})
      setMilestonesError(null)
      return
    }

    setMilestonesLoading(true)
    setMilestonesError(null)
    try {
      const params = new URLSearchParams()
      params.set('projectIds', projectIds.join(','))
      const data = await apiFetch<{ milestones: Record<string, MilestoneRecord[]> }>(
        `/api/projects/milestones?${params.toString()}`
      )
      setMilestonesByProject(data.milestones ?? {})
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load milestones'
      setMilestonesError(message)
      setMilestonesByProject({})
    } finally {
      setMilestonesLoading(false)
    }
  }, [getIdToken, user?.id])

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
    if (viewMode !== 'gantt') return
    const ids = projects.map((p) => p.id)
    void loadMilestones(ids)
  }, [viewMode, projects, loadMilestones])

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
      await apiFetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      })

      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      emitDashboardRefresh({ reason: 'project-mutated', clientId: projectToDelete.clientId ?? null })
      toast({
        title: 'Project deleted',
        description: `"${projectToDelete.name}" has been permanently removed.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project'
      toast({ title: 'Deletion failed', description: message, variant: 'destructive' })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }, [projectToDelete, isPreviewMode, user?.id, getIdToken, toast])

  const handleUpdateStatus = useCallback(async (project: ProjectRecord, newStatus: ProjectStatus) => {
    // In preview mode, just update local state (won't persist)
    if (isPreviewMode) {
      setProjects((prev) => prev.map((p) =>
        p.id === project.id ? { ...p, status: newStatus } : p
      ))
      toast({
        title: 'Preview mode',
        description: `Status changed to ${formatStatusLabel(newStatus)} (not saved).`,
      })
      return
    }

    if (!user?.id) return

    // Prevent duplicate updates
    if (pendingStatusUpdates.has(project.id)) return

    // Optimistic update
    const previousStatus = project.status
    setProjects((prev) => prev.map((p) =>
      p.id === project.id ? { ...p, status: newStatus } : p
    ))
    setPendingStatusUpdates((prev) => new Set(prev).add(project.id))

    try {
      const updatedProject = await apiFetch<ProjectRecord>(`/api/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })

      setProjects((prev) => prev.map((p) => p.id === project.id ? updatedProject : p))
      emitDashboardRefresh({ reason: 'project-mutated', clientId: updatedProject.clientId ?? null })
      toast({
        title: 'Status updated',
        description: `"${project.name}" is now ${formatStatusLabel(newStatus)}.`,
      })
    } catch (error) {
      // Rollback optimistic update
      setProjects((prev) => prev.map((p) =>
        p.id === project.id ? { ...p, status: previousStatus } : p
      ))
      const message = error instanceof Error ? error.message : 'Failed to update project'
      toast({ title: 'Status update failed', description: message, variant: 'destructive' })
    } finally {
      setPendingStatusUpdates((prev) => {
        const next = new Set(prev)
        next.delete(project.id)
        return next
      })
    }
  }, [isPreviewMode, user?.id, getIdToken, toast, pendingStatusUpdates])

  const openDeleteDialog = useCallback((project: ProjectRecord) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }, [])

  // Sort projects
  const sortedProjects = useMemo(() => {
    const sorted = [...projects]
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
  }, [projects, sortField, sortDirection])

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
            <div className="flex items-center rounded-md border bg-background p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'board' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('board')}
                    aria-label="Kanban view"
                  >
                    <Columns3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Kanban view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'gantt' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode('gantt')}
                    aria-label="Gantt view"
                  >
                    <ChartGantt className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Gantt view</TooltipContent>
              </Tooltip>
            </div>
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
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="project-search"
                    placeholder="Search projects..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="pl-9"
                    aria-label="Search projects"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger className="sm:w-40" aria-label="Filter by status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTERS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value === 'all' ? 'All statuses' : formatStatusLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                    <SelectTrigger className="sm:w-36" aria-label="Sort by">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleSortDirection}
                        className="h-10 w-10"
                        aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                      >
                        {sortDirection === 'asc' ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'}
                    </TooltipContent>
                  </Tooltip>
                </div>
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
