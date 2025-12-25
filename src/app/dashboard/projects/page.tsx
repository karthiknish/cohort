'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { 
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Briefcase, 
  Calendar, 
  CheckCircle2,
  Clock, 
  FolderKanban,
  LayoutGrid, 
  List, 
  ListChecks, 
  Loader2, 
  MessageSquare, 
  MoreHorizontal, 
  PauseCircle,
  Pencil,
  Plus, 
  RefreshCw, 
  Search, 
  Tag, 
  Trash2, 
  Users,
  XCircle,
  ChartGantt,
  Columns3,
} from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { CreateMilestoneDialog } from '@/components/projects/create-milestone-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatUserFacingErrorMessage } from '@/lib/user-friendly-error'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { formatRelativeTime } from '../collaboration/utils'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/hooks/use-keyboard-shortcuts'
import { MILESTONE_STATUSES, type MilestoneRecord } from '@/types/milestones'

type ProjectResponse = {
  projects?: ProjectRecord[]
}

type StatusFilter = 'all' | ProjectStatus
type SortField = 'updatedAt' | 'createdAt' | 'name' | 'status' | 'taskCount'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'list' | 'grid' | 'board' | 'gantt'

const STATUS_FILTERS: StatusFilter[] = ['all', ...PROJECT_STATUSES]

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-800',
  active: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-amber-100 text-amber-800',
  completed: 'bg-muted text-muted-foreground',
}

const STATUS_ICONS: Record<ProjectStatus, React.ComponentType<{ className?: string }>> = {
  planning: FolderKanban,
  active: CheckCircle2,
  on_hold: AlertTriangle,
  completed: CheckCircle2,
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'taskCount', label: 'Task count' },
]

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * delay * 0.3
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelayMs)
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  if (error instanceof Error && (
    error.message.includes('network') ||
    error.message.includes('Network') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Connection')
  )) {
    return true
  }
  return false
}

export default function ProjectsPage() {
  const { user, getIdToken } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
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
      const token = await getIdToken()
      const params = new URLSearchParams()
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
      const response = await fetch(`/api/projects${queryString ? `?${queryString}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        let message = 'Unable to load projects'
        try {
          const payload = (await response.json()) as { error?: string }
          if (payload?.error) {
            message = payload.error
          }
        } catch {
          // ignore JSON parse errors
        }
        
        // Retry on server errors
        if (response.status >= 500 && retryAttempt < RETRY_CONFIG.maxRetries) {
          const delay = calculateBackoffDelay(retryAttempt)
          console.warn(`[Projects] Server error, retrying in ${delay}ms (attempt ${retryAttempt + 1}/${RETRY_CONFIG.maxRetries})`)
          await sleep(delay)
          return loadProjects(retryAttempt + 1)
        }
        
        throw new Error(message)
      }

      const data = (await response.json()) as ProjectResponse
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
        title: '❌ Failed to load projects',
        description: `${message}. Please check your connection and try again.`,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery, getIdToken, selectedClientId, statusFilter, user?.id, toast])

  const loadMilestones = useCallback(async (projectIds: string[]) => {
    if (!user?.id || projectIds.length === 0) {
      setMilestonesByProject({})
      setMilestonesError(null)
      return
    }

    setMilestonesLoading(true)
    setMilestonesError(null)
    try {
      const token = await getIdToken()
      const params = new URLSearchParams()
      params.set('projectIds', projectIds.join(','))
      const response = await fetch(`/api/projects/milestones?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        let message = 'Unable to load milestones'
        try {
          const payload = (await response.json()) as { error?: string }
          if (payload?.error) message = payload.error
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const data = (await response.json()) as { milestones?: Record<string, MilestoneRecord[]> }
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
    if (!projectToDelete || !user?.id) return

    setDeleting(true)
    try {
      const token = await getIdToken()
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        let message = 'Failed to delete project'
        try {
          const data = await response.json() as { error?: string }
          if (data.error) message = data.error
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id))
      toast({
        title: '🗑️ Project deleted',
        description: `"${projectToDelete.name}" has been permanently removed.`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete project'
      toast({ title: '❌ Deletion failed', description: message, variant: 'destructive' })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }, [projectToDelete, user?.id, getIdToken, toast])

  const handleUpdateStatus = useCallback(async (project: ProjectRecord, newStatus: ProjectStatus) => {
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
      const token = await getIdToken()
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        let message = 'Failed to update project'
        try {
          const data = await response.json() as { error?: string }
          if (data.error) message = data.error
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const data = await response.json() as { project: ProjectRecord }
      setProjects((prev) => prev.map((p) => p.id === project.id ? data.project : p))
      toast({
        title: '✅ Status updated',
        description: `"${project.name}" is now ${formatStatusLabel(newStatus)}.`,
      })
    } catch (error) {
      // Rollback optimistic update
      setProjects((prev) => prev.map((p) => 
        p.id === project.id ? { ...p, status: previousStatus } : p
      ))
      const message = error instanceof Error ? error.message : 'Failed to update project'
      toast({ title: '❌ Status update failed', description: message, variant: 'destructive' })
    } finally {
      setPendingStatusUpdates((prev) => {
        const next = new Set(prev)
        next.delete(project.id)
        return next
      })
    }
  }, [user?.id, getIdToken, toast, pendingStatusUpdates])

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

  // Keyboard shortcuts
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
                          title: '🔄 Projects refreshed',
                          description: `${projects.length} project${projects.length !== 1 ? 's' : ''} loaded successfully.`,
                        })
                      }
                    })
                  }}
                  className="inline-flex items-center gap-2"
                  disabled={loading}
                  aria-label="Refresh projects"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
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
                <XCircle className="h-5 w-5 text-destructive" />
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
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            caption={statusCounts.completed > 0 ? `${statusCounts.completed} completed` : 'Tracking active and planned work'}
          />
          <SummaryCard
            label="Active"
            icon={ListChecks}
            value={statusCounts.active}
            caption={`${statusCounts.planning} planning · ${statusCounts.on_hold} on hold`}
          />
          <SummaryCard
            label="Open tasks"
            icon={Users}
            value={openTaskTotal}
            caption={taskTotal > 0 ? `${taskTotal - openTaskTotal} closed` : 'Waiting for assignments'}
          />
          <Card className="border-muted/60 bg-background">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">{completionRate}%</div>
              <Progress value={completionRate} className="mt-2 h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {statusCounts.completed} of {projects.length} projects
              </p>
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
                    <AlertTriangle className="mx-auto h-10 w-10 text-destructive/60" />
                    <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => void loadProjects()}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      Try again
                    </Button>
                  </div>
                )}

                {!initialLoading && !error && projects.length === 0 && (
                  <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
                    <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/40" />
                    <h3 className="mt-4 text-lg font-medium text-foreground">No projects yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {statusFilter !== 'all' || debouncedQuery
                        ? 'No projects match the current filters. Try adjusting your search or filter.'
                        : 'Get started by creating your first project.'}
                    </p>
                    {statusFilter === 'all' && !debouncedQuery && (
                      <CreateProjectDialog
                        onProjectCreated={handleProjectCreated}
                        trigger={
                          <Button className="mt-4 gap-2">
                            <Plus className="h-4 w-4" />
                            Create your first project
                          </Button>
                        }
                      />
                    )}
                  </div>
                )}

                {!initialLoading && !error && sortedProjects.length > 0 && (
                  viewMode === 'board' ? (
                    <ProjectKanban
                      projects={sortedProjects}
                      pendingStatusUpdates={pendingStatusUpdates}
                      onUpdateStatus={handleUpdateStatus}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
                    />
                  ) : (
                    <ScrollArea className="max-h-[640px]">
                      <div className={viewMode === 'grid' ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pr-4" : "space-y-4 pr-4"}>
                        {sortedProjects.map((project) => (
                          viewMode === 'grid' ? (
                            <ProjectCard 
                              key={project.id} 
                              project={project} 
                              onDelete={openDeleteDialog}
                              onEdit={openEditDialog}
                              onUpdateStatus={handleUpdateStatus}
                              isPendingUpdate={pendingStatusUpdates.has(project.id)}
                            />
                          ) : (
                            <ProjectRow 
                              key={project.id} 
                              project={project}
                              onDelete={openDeleteDialog}
                              onEdit={openEditDialog}
                              onUpdateStatus={handleUpdateStatus}
                              isPendingUpdate={pendingStatusUpdates.has(project.id)}
                            />
                          )
                        ))}
                      </div>
                    </ScrollArea>
                  )
                )}
                
                {!initialLoading && !error && projects.length > 0 && (
                  <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                    <span>
                      Showing {sortedProjects.length} project{sortedProjects.length !== 1 ? 's' : ''}
                    </span>
                    {loading && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Updating...
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

            {viewMode === 'gantt' && (
              <GanttView
                projects={sortedProjects}
                milestones={milestonesByProject}
                loading={milestonesLoading || initialLoading}
                error={error ?? milestonesError}
                onRefresh={() => void loadProjects()}
                onMilestoneCreated={handleMilestoneCreated}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

function ProjectCard({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: { 
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  isPendingUpdate?: boolean
}) {
  const tasksQuery = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
  })
  const tasksHref = `/dashboard/tasks?${tasksQuery.toString()}`
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
  const StatusIcon = STATUS_ICONS[project.status]

  return (
    <div className={cn(
      "flex flex-col justify-between rounded-md border border-muted/40 bg-background p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md",
      isPendingUpdate && "opacity-75 pointer-events-none"
    )}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{project.name}</h3>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className={cn(STATUS_CLASSES[project.status], "gap-1")}>
                  {isPendingUpdate ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  {formatStatusLabel(project.status)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {isPendingUpdate ? 'Updating status...' : 'Click menu to change status'}
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(project)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs font-medium text-muted-foreground" disabled>
                  Change status
                </DropdownMenuItem>
                {PROJECT_STATUSES.filter((s) => s !== project.status).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onUpdateStatus(project, status)}>
                    {formatStatusLabel(status)}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {project.clientName && (
          project.clientId ? (
            <Link href={`/dashboard/clients?clientId=${project.clientId}`} className="hover:underline">
              <p className="text-xs font-medium text-muted-foreground">{project.clientName}</p>
            </Link>
          ) : (
            <p className="text-xs font-medium text-muted-foreground">{project.clientName}</p>
          )
        )}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">{project.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ListChecks className="h-3.5 w-3.5" />
            <span>{project.openTaskCount} open tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{project.recentActivityAt ? formatRelativeTime(project.recentActivityAt) : 'No activity'}</span>
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{project.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-muted/40">
        <Button asChild size="sm" variant="ghost" className="flex-1 h-8 text-xs">
          <Link href={tasksHref} prefetch>
            Tasks
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button asChild size="sm" variant="ghost" className="flex-1 h-8 text-xs">
          <Link href={collaborationHref} prefetch>
            Chat
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ProjectRow({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: { 
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  isPendingUpdate?: boolean
}) {
  const tasksQuery = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
  })
  const tasksHref = `/dashboard/tasks?${tasksQuery.toString()}`
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
  const StatusIcon = STATUS_ICONS[project.status]

  return (
    <div className={cn(
      "rounded-md border border-muted/40 bg-background p-4 shadow-sm transition-all",
      isPendingUpdate && "opacity-75 pointer-events-none"
    )}>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{project.name}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge variant="secondary" className={cn(STATUS_CLASSES[project.status], "cursor-pointer hover:opacity-80 gap-1")}>
                  {isPendingUpdate ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  {formatStatusLabel(project.status)}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem className="text-xs font-medium text-muted-foreground" disabled>
                  Change status
                </DropdownMenuItem>
                {PROJECT_STATUSES.filter((s) => s !== project.status).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onUpdateStatus(project, status)}>
                    {formatStatusLabel(status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {project.clientName ? (
              project.clientId ? (
                <Link href={`/dashboard/clients?clientId=${project.clientId}`}>
                  <Badge variant="outline" className="border-dashed hover:bg-muted cursor-pointer">
                    {project.clientName}
                  </Badge>
                </Link>
              ) : (
                <Badge variant="outline" className="border-dashed">
                  {project.clientName}
                </Badge>
              )
            ) : null}
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              {formatTaskSummary(project.openTaskCount, project.taskCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateRange(project.startDate, project.endDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {project.recentActivityAt ? `Updated ${formatRelativeTime(project.recentActivityAt)}` : 'No recent activity'}
            </span>
          </div>
          {project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="inline-flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-3 text-xs text-muted-foreground">
          <div className="text-right">
            <p>Created {formatDate(project.createdAt)}</p>
            <p>Updated {formatDate(project.updatedAt)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => onEdit(project)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={tasksHref} prefetch>
                <ListChecks className="h-4 w-4" />
                View tasks
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href={collaborationHref} prefetch>
                <MessageSquare className="h-4 w-4" />
                Open discussion
              </Link>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2 text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(project)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

type ProjectKanbanProps = {
  projects: ProjectRecord[]
  pendingStatusUpdates: Set<string>
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  onEdit: (project: ProjectRecord) => void
  onDelete: (project: ProjectRecord) => void
}

function ProjectKanban({ projects, pendingStatusUpdates, onUpdateStatus, onEdit, onDelete }: ProjectKanbanProps) {
  const columns = PROJECT_STATUSES.map((status) => {
    const items = projects.filter((project) => project.status === status)
    return { status, items }
  })

  return (
    <div className="space-y-4 pr-2">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, items }) => {
          const StatusIcon = STATUS_ICONS[status]
          return (
            <div key={status} className="flex flex-col gap-3 rounded-md border border-muted/50 bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  {formatStatusLabel(status)}
                </div>
                <Badge variant="outline" className="bg-background text-xs">
                  {items.length}
                </Badge>
              </div>

              {items.length === 0 ? (
                <div className="rounded-md border border-dashed border-muted/50 bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                  No projects in this column
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((project) => (
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
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string
  value: number
  caption: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}) {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  )
}

function formatStatusLabel(status: ProjectStatus | StatusFilter): string {
  if (status === 'all') {
    return 'All statuses'
  }
  return status
    .replace('_', ' ')
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatTaskSummary(open: number, total: number): string {
  if (total === 0) {
    return 'Create a task or import from a template'
  }
  if (open === 0) {
    return `${total} tasks • all closed`
  }
  return `${open} of ${total} open`
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatDateRange(start: string | null, end: string | null): string {
  const startLabel = formatDate(start)
  const endLabel = formatDate(end)
  if (startLabel === '—' && endLabel === '—') {
    return 'Timeline TBA'
  }
  if (startLabel !== '—' && endLabel === '—') {
    return `Started ${startLabel}`
  }
  if (startLabel === '—' && endLabel !== '—') {
    return `Due ${endLabel}`
  }
  return `${startLabel} – ${endLabel}`
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

function getErrorMessage(error: unknown, fallback: string): string {
  return formatUserFacingErrorMessage(error, fallback)
}

type GanttViewProps = {
  projects: ProjectRecord[]
  milestones: Record<string, MilestoneRecord[]>
  loading: boolean
  error: string | null
  onRefresh: () => void
  onMilestoneCreated: (milestone: MilestoneRecord) => void
}

function GanttView({ projects, milestones, loading, error, onRefresh, onMilestoneCreated }: GanttViewProps) {
  const allMilestones = useMemo(() => Object.values(milestones).flat(), [milestones])
  const { start, end } = useMemo(() => computeTimelineRange(projects, allMilestones), [projects, allMilestones])
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const dayWidth = 18
  const timelineWidth = Math.max(totalDays * dayWidth, 640)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh data
        </Button>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No projects to chart</h3>
        <p className="mt-1 text-sm text-muted-foreground">Create a project to see it on the timeline.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Showing {projects.length} project{projects.length !== 1 ? 's' : ''} with {allMilestones.length} milestones
        </span>
        <div className="flex items-center gap-2 text-xs">
          {MILESTONE_STATUSES.map((status) => (
            <div key={status} className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: milestoneStatusColor(status) }}
              />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] items-start gap-2">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">Projects</div>
          {projects.map((project) => (
            <div key={project.id} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
              <div className="flex items-center gap-2 truncate">
                <StatusPill status={project.status} />
                <span className="truncate" title={project.name}>{project.name}</span>
              </div>
              <CreateMilestoneDialog
                projects={[project]}
                defaultProjectId={project.id}
                onCreated={onMilestoneCreated}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Add milestone">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full overflow-hidden rounded-md border">
            <div className="border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
              Timeline
            </div>
            <div className="relative">
              <div
                className="relative bg-background"
                style={{ width: timelineWidth }}
              >
                <TimelineGrid start={start} totalDays={totalDays} dayWidth={dayWidth} />
                <TodayMarker start={start} dayWidth={dayWidth} />
                <div className="divide-y">
                  {projects.map((project) => (
                    <div key={project.id} className="relative h-16">
                      {renderMilestonesForProject(project.id, milestones[project.id] ?? [], start, dayWidth, totalDays)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderMilestonesForProject(
  projectId: string,
  milestoneList: MilestoneRecord[],
  start: Date,
  dayWidth: number,
  totalDays: number,
) {
  if (milestoneList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No milestones yet
      </div>
    )
  }

  return milestoneList.map((milestone) => {
    const { left, width, startLabel, endLabel } = computeBarMetrics(milestone, start, dayWidth, totalDays)
    const color = milestoneStatusColor(milestone.status)
    return (
      <div
        key={milestone.id}
        className="absolute top-2 flex h-10 items-center rounded-md px-3 text-xs text-primary-foreground shadow-sm"
        style={{ left, width, backgroundColor: color, minWidth: 64 }}
        title={`${milestone.title} • ${startLabel} → ${endLabel}`}
      >
        <div className="flex flex-col truncate">
          <span className="font-medium truncate text-[13px]">{milestone.title}</span>
          <span className="text-[11px] opacity-80">{startLabel} → {endLabel}</span>
        </div>
      </div>
    )
  })
}

function computeBarMetrics(milestone: MilestoneRecord, chartStart: Date, dayWidth: number, totalDays: number) {
  const startDate = parseDate(milestone.startDate) ?? chartStart
  const endDate = parseDate(milestone.endDate) ?? startDate
  const safeEnd = endDate < startDate ? startDate : endDate

  const offsetDays = Math.max(0, Math.floor((startDate.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24)))
  const durationDays = Math.max(1, Math.floor((safeEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const clampedDuration = Math.min(durationDays, totalDays - offsetDays)

  const left = offsetDays * dayWidth + 4
  const width = clampedDuration * dayWidth - 8

  return {
    left,
    width,
    startLabel: formatShortDate(startDate),
    endLabel: formatShortDate(safeEnd),
  }
}

function TimelineGrid({ start, totalDays, dayWidth }: { start: Date; totalDays: number; dayWidth: number }) {
  const formatter = useMemo(() => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }), [])
  const weeks = Math.ceil(totalDays / 7)
  return (
    <div className="relative">
      <div className="flex border-b text-[11px] text-muted-foreground">
        {Array.from({ length: weeks }).map((_, index) => {
          const weekStart = addDays(start, index * 7)
          const label = `${formatter.format(weekStart)}`
          return (
            <div
              key={index}
              className="border-r px-2 py-1"
              style={{ width: Math.min(7, totalDays - index * 7) * dayWidth }}
            >
              Week {index + 1} • {label}
            </div>
          )
        })}
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: totalDays }).map((_, index) => (
          <div
            key={index}
            className="absolute top-0 h-full border-r last:border-r-0"
            style={{ left: index * dayWidth, width: dayWidth }}
          />
        ))}
      </div>
    </div>
  )
}

function TodayMarker({ start, dayWidth }: { start: Date; dayWidth: number }) {
  const today = new Date()
  const offsetDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (offsetDays < 0) return null
  const left = offsetDays * dayWidth
  return (
    <div className="pointer-events-none absolute inset-y-0" style={{ left }}>
      <div className="absolute inset-y-0 w-px bg-amber-500" />
      <div className="absolute -top-6 -ml-8 rounded-md bg-amber-500 px-2 py-1 text-[11px] font-medium text-amber-50 shadow">
        Today
      </div>
    </div>
  )
}

function computeTimelineRange(projects: ProjectRecord[], milestones: MilestoneRecord[]) {
  const dates: Date[] = []
  projects.forEach((project) => {
    const maybeStart = parseDate(project.startDate)
    const maybeEnd = parseDate(project.endDate)
    if (maybeStart) dates.push(maybeStart)
    if (maybeEnd) dates.push(maybeEnd)
  })
  milestones.forEach((milestone) => {
    const maybeStart = parseDate(milestone.startDate)
    const maybeEnd = parseDate(milestone.endDate)
    if (maybeStart) dates.push(maybeStart)
    if (maybeEnd) dates.push(maybeEnd)
  })

  const today = new Date()
  const start = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : today
  const end = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(today, 30)

  // Add padding for readability
  const paddedStart = addDays(start, -7)
  const paddedEnd = addDays(end, 7)

  if (paddedEnd <= paddedStart) {
    return { start: paddedStart, end: addDays(paddedStart, 30) }
  }

  return { start: paddedStart, end: paddedEnd }
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

function milestoneStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#22c55e'
    case 'in_progress':
      return '#3b82f6'
    case 'blocked':
      return '#f97316'
    case 'planned':
    default:
      return '#6366f1'
  }
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const Icon = STATUS_ICONS[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium',
      STATUS_CLASSES[status]
    )}>
      <Icon className="h-3 w-3" />
      {formatStatusLabel(status)}
    </span>
  )
}

