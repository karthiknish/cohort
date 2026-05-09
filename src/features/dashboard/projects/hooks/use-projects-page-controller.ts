'use client'

import { useMutation as useTanstackMutation } from '@tanstack/react-query'
import { useMutation, useQuery } from 'convex/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts'
import { projectMilestonesApi, projectsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { buildProjectTasksRoute } from '@/lib/project-routes'
import { getPreviewProjectMilestones, getPreviewProjects } from '@/lib/preview-data'
import { emitDashboardRefresh } from '@/lib/refresh-bus'
import { type MilestoneRecord, MILESTONE_STATUSES } from '@/types/milestones'
import { type ProjectRecord, type ProjectStatus, PROJECT_STATUSES } from '@/types/projects'

import {
  type SortDirection,
  type SortField,
  type StatusFilter,
  type ViewMode,
  filterProjectsByQuery,
  formatStatusLabel,
  projectMatchesContext,
  useDebouncedValue,
} from '../components'

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && PROJECT_STATUSES.includes(value as ProjectStatus)
}

function isMilestoneStatus(value: unknown): value is MilestoneRecord['status'] {
  return typeof value === 'string' && MILESTONE_STATUSES.includes(value as MilestoneRecord['status'])
}

function mapProjectRecord(row: unknown): ProjectRecord {
  const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null
  const status = isProjectStatus(record?.status) ? record.status : 'planning'
  const tags = Array.isArray(record?.tags)
    ? record.tags.filter((tag): tag is string => typeof tag === 'string')
    : []

  return {
    id: String(record?.legacyId ?? ''),
    name: String(record?.name ?? ''),
    description: typeof record?.description === 'string' ? record.description : null,
    status,
    clientId: typeof record?.clientId === 'string' ? record.clientId : null,
    clientName: typeof record?.clientName === 'string' ? record.clientName : null,
    startDate: typeof record?.startDateMs === 'number' ? new Date(record.startDateMs).toISOString() : null,
    endDate: typeof record?.endDateMs === 'number' ? new Date(record.endDateMs).toISOString() : null,
    tags,
    ownerId: typeof record?.ownerId === 'string' ? record.ownerId : null,
    createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
    updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
    taskCount: 0,
    openTaskCount: 0,
    recentActivityAt: null,
    deletedAt: typeof record?.deletedAtMs === 'number' ? new Date(record.deletedAtMs).toISOString() : null,
  }
}

function mapMilestoneRecord(row: unknown): MilestoneRecord {
  const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null

  return {
    id: String(record?.legacyId ?? ''),
    projectId: String(record?.projectId ?? ''),
    title: String(record?.title ?? ''),
    description: typeof record?.description === 'string' ? record.description : null,
    status: isMilestoneStatus(record?.status) ? record.status : 'planned',
    startDate: typeof record?.startDateMs === 'number' ? new Date(record.startDateMs).toISOString() : null,
    endDate: typeof record?.endDateMs === 'number' ? new Date(record.endDateMs).toISOString() : null,
    ownerId: typeof record?.ownerId === 'string' ? record.ownerId : null,
    order: typeof record?.order === 'number' ? record.order : null,
    createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
    updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
  }
}

export function useProjectsPageController() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()

  const softDeleteProject = useMutation(projectsApi.softDelete)
  const updateProject = useMutation(projectsApi.update)
  const workspaceId = user?.agencyId ?? null

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
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<ProjectRecord | null>(null)
  const [pendingStatusUpdates, setPendingStatusUpdates] = useState<Set<string>>(new Set())

  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedQuery = useDebouncedValue(searchInput, 350)

  const focusedProject = useMemo(
    () => ({ id: searchParams.get('projectId'), name: searchParams.get('projectName') }),
    [searchParams]
  )

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
  ) as Array<unknown> | undefined

  const milestonesRealtime = useQuery(
    projectMilestonesApi.listByProjectIds,
    isPreviewMode || viewMode !== 'gantt' || !workspaceId || !user?.id
      ? 'skip'
      : {
          workspaceId,
          projectIds: projects.map((project) => project.id),
        }
  ) as Record<string, unknown[]> | undefined

  const loadProjects = useCallback(async (): Promise<number> => {
    if (isPreviewMode) {
      let previewProjects = getPreviewProjects(selectedClientId)

      if (statusFilter !== 'all') {
        previewProjects = previewProjects.filter((project) => project.status === statusFilter)
      }

      setProjects(previewProjects)
      setLoading(false)
      setError(null)
      setRetryCount(0)
      return previewProjects.length
    }

    if (!user?.id || !workspaceId) {
      setProjects([])
      setLoading(false)
      setError(null)
      setRetryCount(0)
      return 0
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setLoading(true)
    setError(null)

    if (!projectsRealtime) {
      setLoading(false)
      return 0
    }

    const mapped = (Array.isArray(projectsRealtime) ? projectsRealtime : []).map(mapProjectRecord)

    setProjects(mapped)
    setError(null)
    setRetryCount(0)
    setLoading(false)
    return mapped.length
  }, [isPreviewMode, projectsRealtime, selectedClientId, statusFilter, user?.id, workspaceId])

  const loadMilestones = useCallback(async (projectIds: string[]) => {
    if (viewMode !== 'gantt') return

    setMilestonesLoading(true)
    setMilestonesError(null)

    try {
      if (isPreviewMode) {
        setMilestonesByProject(getPreviewProjectMilestones(selectedClientId, projectIds))
        return
      }

      if (!milestonesRealtime) {
        setMilestonesByProject({})
        return
      }

      const mapped: Record<string, MilestoneRecord[]> = {}
      const projectIdSet = new Set(projectIds)

      for (const [projectId, rows] of Object.entries(milestonesRealtime)) {
        if (projectIdSet.size > 0 && !projectIdSet.has(projectId)) {
          continue
        }

        mapped[projectId] = (Array.isArray(rows) ? rows : []).map(mapMilestoneRecord)
      }

      setMilestonesByProject(mapped)
    } catch (err) {
      logError(err, 'ProjectsPage:loadMilestones')
      setMilestonesError(asErrorMessage(err))
      setMilestonesByProject({})
    } finally {
      setMilestonesLoading(false)
    }
  }, [isPreviewMode, milestonesRealtime, selectedClientId, viewMode])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadProjects()
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [loadProjects])

  useEffect(() => {
    if (viewMode !== 'gantt') return

    const frame = requestAnimationFrame(() => {
      void loadMilestones(projects.map((project) => project.id))
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [loadMilestones, projects, viewMode])

  useKeyboardShortcut({
    combo: 'mod+k',
    callback: () => {
      const searchNode = document.getElementById('project-search')
      searchNode?.focus()
    },
  })

  useKeyboardShortcut({
    combo: 'mod+shift+n',
    callback: () => {
      document.getElementById('create-project-trigger')?.click()
    },
  })

  const handleProjectCreated = useCallback((project: ProjectRecord) => {
    setProjects((prev) => [project, ...prev])
  }, [])

  const handleProjectUpdated = useCallback((updatedProject: ProjectRecord) => {
    setProjects((prev) => prev.map((project) => (project.id === updatedProject.id ? updatedProject : project)))
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

    if (!workspaceId) {
      toast({ title: 'Deletion failed', description: 'Missing workspace', variant: 'destructive' })
      setDeleting(false)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      return
    }

    await softDeleteProject({
      workspaceId,
      legacyId: projectToDelete.id,
      deletedAtMs: Date.now(),
    })
      .then(() => {
        setProjects((prev) => prev.filter((project) => project.id !== projectToDelete.id))
        emitDashboardRefresh({ reason: 'project-mutated', clientId: projectToDelete.clientId ?? null })
        toast({ title: 'Project deleted', description: `"${projectToDelete.name}" has been permanently removed.` })
      })
      .catch((mutationError) => {
        logError(mutationError, 'ProjectsPage:handleDeleteProject')
        toast({ title: 'Deletion failed', description: asErrorMessage(mutationError), variant: 'destructive' })
      })
      .finally(() => {
        setDeleting(false)
        setDeleteDialogOpen(false)
        setProjectToDelete(null)
      })
  }, [isPreviewMode, projectToDelete, softDeleteProject, toast, user?.id, workspaceId])

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

      setProjects((prev) => prev.map((current) => (current.id === project.id ? { ...current, status: newStatus } : current)))

      return {
        clientId: project.clientId ?? null,
        previousStatus: project.status,
        projectId: project.id,
      }
    },
    onError: (mutationError, _variables, context) => {
      if (!context) return

      logError(mutationError, 'ProjectsPage:updateStatusMutation')
      setProjects((prev) => prev.map((project) => (
        project.id === context.projectId ? { ...project, status: context.previousStatus } : project
      )))

      toast({ title: 'Status update failed', description: asErrorMessage(mutationError), variant: 'destructive' })
    },
    onSuccess: (_data, variables) => {
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

  const handleUpdateStatus = useCallback(async (project: ProjectRecord, newStatus: ProjectStatus) => {
    if (isPreviewMode) {
      setProjects((prev) => prev.map((current) => (current.id === project.id ? { ...current, status: newStatus } : current)))
      toast({
        title: 'Preview mode',
        description: `Status changed to ${formatStatusLabel(newStatus)} (not saved).`,
      })
      return
    }

    if (!user?.id) return
    if (pendingStatusUpdates.has(project.id) || updateStatusMutation.isPending) return

    await updateStatusMutation.mutateAsync({ project, newStatus })
  }, [isPreviewMode, pendingStatusUpdates, toast, updateStatusMutation, user?.id])

  const openDeleteDialog = useCallback((project: ProjectRecord) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }, [])

  const focusedProjects = useMemo(() => {
    if (!focusedProject.id && !focusedProject.name) return projects
    return projects.filter((project) => projectMatchesContext(project, focusedProject.id, focusedProject.name))
  }, [focusedProject.id, focusedProject.name, projects])

  const searchedProjects = useMemo(
    () => filterProjectsByQuery(focusedProjects, debouncedQuery),
    [debouncedQuery, focusedProjects]
  )

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
          comparison = new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
          break
        default:
          comparison = new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime()
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

  const openTaskTotal = useMemo(() => projects.reduce((total, project) => total + project.openTaskCount, 0), [projects])
  const taskTotal = useMemo(() => projects.reduce((total, project) => total + project.taskCount, 0), [projects])
  const completionRate = useMemo(() => {
    if (projects.length === 0) return 0
    return Math.round((statusCounts.completed / projects.length) * 100)
  }, [projects.length, statusCounts.completed])

  const initialLoading = loading && projects.length === 0
  const hasActiveFilters = statusFilter !== 'all' || debouncedQuery.trim().length > 0 || Boolean(focusedProject.id || focusedProject.name)
  const hasVisibleProjects = sortedProjects.length > 0

  const focusedProjectRecord = useMemo(
    () => projects.find((project) => projectMatchesContext(project, focusedProject.id, focusedProject.name)) ?? null,
    [focusedProject.id, focusedProject.name, projects]
  )

  const focusedProjectTasksHref = focusedProjectRecord?.id
    ? buildProjectTasksRoute({
        projectId: focusedProjectRecord.id,
        projectName: focusedProjectRecord.name,
        clientId: focusedProjectRecord.clientId,
        clientName: focusedProjectRecord.clientName,
      })
    : focusedProject.id
      ? buildProjectTasksRoute({ projectId: focusedProject.id, projectName: focusedProject.name })
      : null

  const portfolioLabel = selectedClient?.name ? `${selectedClient.name} workspace` : 'all workspaces'

  const clearFocusedProject = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('projectId')
    params.delete('projectName')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }, [])

  const clearAllFilters = useCallback(() => {
    setSearchInput('')
    setStatusFilter('all')
    setSortField('updatedAt')
    setSortDirection('desc')
    clearFocusedProject()
  }, [clearFocusedProject])

  const handleRefreshProjects = useCallback(async () => {
    try {
      const count = await loadProjects()
      toast({
        title: 'Projects refreshed',
        description: `${count} project${count !== 1 ? 's' : ''} loaded successfully.`,
      })
    } catch (refreshError) {
      logError(refreshError, 'ProjectsPage:handleRefreshProjects')
      toast({ title: 'Refresh failed', description: asErrorMessage(refreshError), variant: 'destructive' })
    }
  }, [loadProjects, toast])

  return {
    clearAllFilters,
    clearFocusedProject,
    completionRate,
    debouncedSearchQuery: debouncedQuery,
    deleteDialogOpen,
    deleting,
    editDialogOpen,
    error,
    focusedProject,
    focusedProjectRecord,
    focusedProjectTasksHref,
    handleDeleteProject,
    handleMilestoneCreated,
    handleProjectCreated,
    handleProjectUpdated,
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
    openTaskTotal,
    pendingStatusUpdates,
    portfolioLabel,
    projectToDelete,
    projectToEdit,
    projects,
    retryCount,
    searchInput,
    setDeleteDialogOpen,
    setEditDialogOpen,
    setSearchInput,
    setSortField,
    setStatusFilter,
    setViewMode,
    sortDirection,
    sortField,
    sortedProjects,
    statusCounts,
    statusFilter,
    taskTotal,
    toggleSortDirection,
    viewMode,
  }
}