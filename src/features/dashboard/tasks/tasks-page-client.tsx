'use client'

import { useQuery } from 'convex/react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import {
  formatDate,
  mergeTaskParticipants,
  ProjectFilterBanner,
  TaskBulkToolbar,
  TaskFilters,
  type TaskParticipant,
  TaskResultsCount,
  TasksHeader,
  TaskSummaryCards,
  TaskViewControls,
  useDebouncedValue,
  useTaskFilters,
  useTaskForm,
  useTasks,
} from '@/features/dashboard/tasks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useNavigationContext } from '@/shared/contexts/navigation-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/shared/hooks/use-keyboard-shortcuts'
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab'
import { usersApi } from '@/lib/convex-api'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { isFeatureEnabled } from '@/lib/features'
import { exportToCsv } from '@/lib/utils'
import type { TaskStatus } from '@/types/tasks'

import { TasksPageSkeleton } from './tasks-page-skeleton'

const TaskList = dynamic(() => import('@/features/dashboard/tasks/task-list').then((mod) => mod.TaskList), {
  loading: () => <div className="p-6 text-sm text-muted-foreground">Loading tasks…</div>,
})

const TaskKanban = dynamic(
  () => import('@/features/dashboard/tasks/task-kanban').then((mod) => mod.TaskKanban),
  {
    loading: () => <div className="p-6 text-sm text-muted-foreground">Loading board…</div>,
    ssr: false,
  }
)

const CreateTaskSheet = dynamic(
  () => import('@/features/dashboard/tasks/task-form-sheets').then((mod) => mod.CreateTaskSheet),
  { ssr: false }
)

const EditTaskSheet = dynamic(
  () => import('@/features/dashboard/tasks/task-form-sheets').then((mod) => mod.EditTaskSheet),
  { ssr: false }
)

const DeleteTaskDialog = dynamic(
  () => import('@/features/dashboard/tasks/delete-task-dialog').then((mod) => mod.DeleteTaskDialog),
  { ssr: false }
)

const TASKS_PAGE_FALLBACK = <TasksPageFallback />

type TasksPageClientProps = {
  initialProjectId?: string | null
  initialProjectName?: string | null
  initialClientId?: string | null
  initialClientName?: string | null
  initialAction?: string | null
  initialSearchParamsString?: string
}

export default function TasksPageClient({
  initialProjectId = null,
  initialProjectName = null,
  initialClientId = null,
  initialClientName = null,
  initialAction = null,
  initialSearchParamsString = '',
}: TasksPageClientProps) {
  return (
    <Suspense fallback={TASKS_PAGE_FALLBACK}>
      <TasksPageContent
        initialAction={initialAction}
        initialClientId={initialClientId}
        initialClientName={initialClientName}
        initialProjectId={initialProjectId}
        initialProjectName={initialProjectName}
        initialSearchParamsString={initialSearchParamsString}
      />
    </Suspense>
  )
}

function TasksPageFallback() {
  return (
    <div className={DASHBOARD_THEME.layout.container}>
      <Card className={DASHBOARD_THEME.cards.base}>
        <CardContent className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          Loading tasks…
        </CardContent>
      </Card>
    </div>
  )
}

function TasksPageContent({
  initialAction,
  initialClientId,
  initialClientName,
  initialProjectId,
  initialProjectName,
  initialSearchParamsString,
}: TasksPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { setProjectContext } = useNavigationContext()
  const { isPreviewMode } = usePreview()

  const taskTabs = usePersistedTab({
    param: 'tab',
    defaultValue: 'all-tasks',
    allowedValues: useMemo(() => ['all-tasks', 'my-tasks'] as const, []),
    storageNamespace: 'dashboard:tasks',
    syncToUrl: true,
  })

  const normalizedAction = initialAction ?? null
  const normalizedClientId = initialClientId ?? null
  const normalizedClientName = initialClientName ?? null
  const normalizedProjectId = initialProjectId ?? null
  const normalizedProjectName = initialProjectName ?? null
  const normalizedSearchParamsString = initialSearchParamsString ?? ''

  const projectFilter = useMemo(() => ({
    id: normalizedProjectId,
    name: normalizedProjectName,
  }), [normalizedProjectId, normalizedProjectName])

  const routeClientContext = useMemo(() => {
    if (!normalizedClientId && !normalizedClientName) return null
    return {
      id: normalizedClientId,
      name: normalizedClientName,
    }
  }, [normalizedClientId, normalizedClientName])

  const taskFormClient = selectedClient ?? routeClientContext
  const taskFormClientId = selectedClientId ?? routeClientContext?.id ?? undefined
  const actionParam = normalizedAction
  const searchParamsString = normalizedSearchParamsString

  // Sync navigation context from URL project filters.
  useEffect(() => {
    if (isFeatureEnabled('BIDIRECTIONAL_NAV') && projectFilter.id && projectFilter.name) {
      setProjectContext(projectFilter.id, projectFilter.name)
    }
  }, [projectFilter.id, projectFilter.name, setProjectContext])

  const clearProjectFilter = useCallback(() => {
    const params = new URLSearchParams(searchParamsString)
    params.delete('projectId')
    params.delete('projectName')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParamsString])

  // Tasks data hook
  const {
    tasks,
    loading,
    loadingMore,
    error,
    retryCount,
    pendingStatusUpdates,
    handleLoadMore,
    handleRefresh,
    handleQuickStatusChange,
    handleDeleteTask,
    handleCreateTask,
    handleUpdateTask,
    handleBulkUpdate,
    handleBulkDelete,
    nextCursor,
  } = useTasks({
    userId: user?.id,
    clientId: selectedClientId ?? undefined,
    authLoading,
    isPreviewMode,
    workspaceId: user?.agencyId ?? null,
  })

  const workspaceMembers = useQuery(
    usersApi.listWorkspaceMembers,
    user?.agencyId && !isPreviewMode
      ? {
          workspaceId: user.agencyId,
          limit: 500,
        }
      : 'skip'
  ) as TaskParticipant[] | undefined

  const platformUsers = useQuery(
    usersApi.listAllUsers,
    user?.agencyId && !isPreviewMode
      ? {
          limit: 500,
        }
      : 'skip'
  ) as TaskParticipant[] | undefined

  const taskParticipants = useMemo(() => {
    const platformAdmins = (platformUsers ?? []).filter((member) => member.role?.toLowerCase() === 'admin')

    return mergeTaskParticipants([
      selectedClient?.teamMembers ?? [],
      workspaceMembers ?? [],
      platformAdmins,
    ])
  }, [platformUsers, selectedClient?.teamMembers, workspaceMembers])

  // Debounced search for filters
  const [rawSearchQuery, setRawSearchQuery] = useState('')
  const debouncedQuery = useDebouncedValue(rawSearchQuery, 300)

  // Filters hook
  const filters = useTaskFilters({
    tasks,
    userName: user?.name,
    selectedClient,
    selectedClientId: selectedClientId ?? undefined,
    projectFilterId: projectFilter.id,
    projectFilterName: projectFilter.name,
    activeTab: taskTabs.value,
    setActiveTab: (next) => taskTabs.setValue(next as 'all-tasks' | 'my-tasks'),
  })

  const [rawSelectedTaskIds, setRawSelectedTaskIds] = useState<Set<string>>(new Set())
  const [bulkState, setBulkState] = useState<{ active: boolean; label: string; progress: number }>({
    active: false,
    label: '',
    progress: 0,
  })

  // Sync debounced search
  useEffect(() => {
    filters.setSearchQuery(debouncedQuery)
  }, [debouncedQuery, filters])

  // Form management hook
  const form = useTaskForm({
    selectedClient: taskFormClient,
    selectedClientId: taskFormClientId,
    projectContext: projectFilter,
    userId: user?.id,
    initialCreateOpen: actionParam === 'create',
    onCreateOpenChange: (open) => {
      if (open || actionParam !== 'create') return

      const params = new URLSearchParams(searchParamsString)
      params.delete('action')
      const next = params.toString()
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    },
    onCreateTask: handleCreateTask,
    onUpdateTask: handleUpdateTask,
  })
  const { setFormState } = form

  // Update form when client changes
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      clientId: taskFormClient?.id ?? null,
      clientName: taskFormClient?.name ?? '',
      projectId: projectFilter.id,
      projectName: projectFilter.name ?? '',
    }))
  }, [projectFilter.id, projectFilter.name, setFormState, taskFormClient?.id, taskFormClient?.name])

  // Keyboard shortcuts
  useKeyboardShortcut({
    combo: 'mod+k',
    callback: () => {
      document.getElementById('task-search')?.focus()
    },
  })

  // Export handler
  const handleExport = useCallback(() => {
    if (filters.filteredTasks.length === 0) return

    const data = filters.filteredTasks.map((task) => ({
      Title: task.title,
      Status: task.status,
      Priority: task.priority,
      Client: task.client || 'Internal',
      'Assigned To': (task.assignedTo ?? []).join(', '),
      'Due Date': task.dueDate ? formatDate(task.dueDate) : 'No due date',
      Description: task.description || '',
    }))

    exportToCsv(data, `tasks-export-${new Date().toISOString().split('T')[0]}.csv`)
  }, [filters.filteredTasks])

  const handleNewTaskClick = useCallback(() => {
    form.handleCreateOpenChange(true)
  }, [form])

  // Delete confirmation handler
  const handleConfirmDelete = useCallback(async () => {
    if (!form.deletingTask) return

    form.setDeleting(true)
    const success = await handleDeleteTask(form.deletingTask)
    form.setDeleting(false)

    if (success) {
      form.handleDeleteClose()
    }
  }, [form, handleDeleteTask])

  const handleEditDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      form.handleEditClose()
    }
  }, [form])

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      form.handleDeleteClose()
    }
  }, [form])

  const visibleTasks = filters.sortedTasks

  const selectedTaskIds = useMemo(() => {
    if (filters.viewMode === 'board') return new Set<string>()

    if (rawSelectedTaskIds.size === 0) return rawSelectedTaskIds

    const visibleIds = new Set(visibleTasks.map((task) => task.id))
    const next = new Set<string>()
    rawSelectedTaskIds.forEach((id) => {
      if (visibleIds.has(id)) {
        next.add(id)
      }
    })
    return next
  }, [filters.viewMode, rawSelectedTaskIds, visibleTasks])

  const selectedTasks = useMemo(() => {
    if (selectedTaskIds.size === 0) return []
    const selectedMap = new Set(selectedTaskIds)
    return visibleTasks.filter((task) => selectedMap.has(task.id))
  }, [selectedTaskIds, visibleTasks])

  const hasSelection = selectedTasks.length > 0

  const handleToggleTaskSelection = useCallback((taskId: string, checked: boolean) => {
    setRawSelectedTaskIds((current) => {
      const next = new Set(current)
      if (checked) {
        next.add(taskId)
      } else {
        next.delete(taskId)
      }
      return next
    })
  }, [])

  const handleSelectAllVisible = useCallback(() => {
    setRawSelectedTaskIds(new Set(visibleTasks.map((task) => task.id)))
  }, [visibleTasks])

  const handleClearSelection = useCallback(() => {
    setRawSelectedTaskIds(new Set())
  }, [])

  const handleSelectHighPriority = useCallback(() => {
    const filtered = visibleTasks.filter((task) => task.priority === 'high' || task.priority === 'urgent')
    setRawSelectedTaskIds(new Set(filtered.map((task) => task.id)))
  }, [visibleTasks])

  const handleSelectDueSoon = useCallback(() => {
    const now = Date.now()
    const cutoff = now + 7 * 24 * 60 * 60 * 1000
    const filtered = visibleTasks.filter((task) => {
      if (!task.dueDate) return false
      const ts = Date.parse(task.dueDate)
      if (Number.isNaN(ts)) return false
      return ts >= now && ts <= cutoff
    })
    setRawSelectedTaskIds(new Set(filtered.map((task) => task.id)))
  }, [visibleTasks])


  const handleBulkStatusChange = useCallback(
    async (status: TaskStatus) => {
      if (!hasSelection) return
      const ids = Array.from(selectedTaskIds)
      setBulkState({ active: true, label: 'Updating status', progress: 0 })
      await handleBulkUpdate(ids, { status })
      setBulkState({ active: false, label: '', progress: 0 })
      setRawSelectedTaskIds(new Set())
    },
    [handleBulkUpdate, hasSelection, selectedTaskIds],
  )

  const handleBulkAssign = useCallback(
    async (assignees: string[]) => {
      if (!hasSelection) return
      const normalized = assignees.map((name) => name.trim()).filter((name) => name.length > 0)
      const ids = Array.from(selectedTaskIds)
      setBulkState({ active: true, label: 'Updating assignees', progress: 0 })
      await handleBulkUpdate(ids, { assignedTo: normalized })
      setBulkState({ active: false, label: '', progress: 0 })
      setRawSelectedTaskIds(new Set())
    },
    [handleBulkUpdate, hasSelection, selectedTaskIds],
  )

  const handleBulkDueDate = useCallback(
    async (date: string | null) => {
      if (!hasSelection) return
      const normalized = date && !Number.isNaN(Date.parse(date)) ? date : null
      const ids = Array.from(selectedTaskIds)
      setBulkState({ active: true, label: 'Updating due dates', progress: 0 })
      await handleBulkUpdate(ids, { dueDate: normalized ?? undefined })
      setBulkState({ active: false, label: '', progress: 0 })
      setRawSelectedTaskIds(new Set())
    },
    [handleBulkUpdate, hasSelection, selectedTaskIds],
  )

  const handleBulkDeleteAction = useCallback(async () => {
    if (!hasSelection) return
    const ids = Array.from(selectedTaskIds)
    setBulkState({ active: true, label: 'Deleting tasks', progress: 0 })
    await handleBulkDelete(ids)
    setBulkState({ active: false, label: '', progress: 0 })
    setRawSelectedTaskIds(new Set())
  }, [handleBulkDelete, hasSelection, selectedTaskIds])


  const initialLoading = loading && tasks.length === 0
  const loadingContent = useMemo(() => <TasksPageSkeleton />, [])

  const scopeLabel = selectedClient?.name ?? (selectedClientId ? 'Selected client' : 'All clients')
  const scopeHelper = selectedClient ? 'Scoped to the selected client' : 'Showing tasks across all clients'
  const emptyStateMessage = filters.activeTab === 'my-tasks'
    ? 'No tasks are assigned to you yet. Switch to All Tasks to see team-owned work.'
    : 'Get started by creating your first task.'

  return (
    <TooltipProvider>
      <BoneyardSkeletonBoundary
        name="dashboard-tasks-page"
        loading={initialLoading}
        loadingContent={loadingContent}
      >
      <div className={DASHBOARD_THEME.layout.container}>
        {/* Header */}
        <TasksHeader
          loading={loading}
          retryCount={retryCount}
          onRefresh={handleRefresh}
          onNewTaskClick={handleNewTaskClick}
          scopeLabel={scopeLabel}
          scopeHelper={scopeHelper}
        />

        {/* Summary Cards */}
        {initialLoading ? (
          <div className={DASHBOARD_THEME.stats.container}>
            {['task-stats-1', 'task-stats-2', 'task-stats-3', 'task-stats-4'].map((key) => (
              <Card key={key} className={DASHBOARD_THEME.cards.base}>
                <CardContent className="flex items-center gap-3 p-4">
                  <Skeleton className={DASHBOARD_THEME.skeletons.avatar} />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <TaskSummaryCards
            taskCounts={filters.taskCounts}
          />
        )}

        {/* Main Content */}
        <Tabs
          defaultValue="all-tasks"
          value={filters.activeTab}
          onValueChange={filters.setActiveTab}
          className="space-y-4"
        >
          <div className={DASHBOARD_THEME.layout.header}>
            <TabsList className={DASHBOARD_THEME.tabs.list}>
              <TabsTrigger className={DASHBOARD_THEME.tabs.trigger} value="all-tasks">All Tasks</TabsTrigger>
              <TabsTrigger className={DASHBOARD_THEME.tabs.trigger} value="my-tasks">My Tasks</TabsTrigger>
            </TabsList>
            <TaskViewControls
              viewMode={filters.viewMode}
              onViewModeChange={filters.setViewMode}
              onExport={handleExport}
              canExport={filters.sortedTasks.length > 0}
            />
          </div>

          <Card className={DASHBOARD_THEME.cards.base}>
            <CardHeader className={DASHBOARD_THEME.cards.header}>
              <CardTitle>
                {filters.activeTab === 'my-tasks' ? 'My Assignments' : 'All Tasks'}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                {filters.activeTab === 'my-tasks'
                  ? 'Tasks assigned specifically to you.'
                  : 'Search, filter, and monitor active work across the agency.'}
                <span className="hidden sm:flex items-center gap-1">
                  ( <KeyboardShortcutBadge combo="mod+k" className="scale-75 origin-left" /> to search )
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Filters */}
              <TaskFilters
                searchQuery={rawSearchQuery}
                onSearchChange={setRawSearchQuery}
                selectedStatus={filters.selectedStatus}
                onStatusChange={filters.handleStatusChange}
                selectedAssignee={filters.selectedAssignee}
                onAssigneeChange={filters.handleAssigneeChange}
                assigneeOptions={filters.assigneeOptions}
                showAssigneeFilter={filters.activeTab === 'all-tasks'}
                sortField={filters.sortField}
                onSortFieldChange={filters.setSortField}
                sortDirection={filters.sortDirection}
                onSortDirectionToggle={filters.toggleSortDirection}
              />

              {/* Project filter banner */}
              <ProjectFilterBanner
                projectId={projectFilter.id}
                projectName={projectFilter.name}
                onClear={clearProjectFilter}
              />

              {filters.viewMode !== 'board' && (
                <TaskBulkToolbar
                  selectedCount={selectedTasks.length}
                  totalVisible={visibleTasks.length}
                  hasSelection={hasSelection}
                  bulkActive={bulkState.active}
                  bulkLabel={bulkState.label}
                  bulkProgress={bulkState.progress}
                  onSelectAll={handleSelectAllVisible}
                  onClearSelection={handleClearSelection}
                  onSelectHighPriority={handleSelectHighPriority}
                  onSelectDueSoon={handleSelectDueSoon}
                  onBulkStatusChange={handleBulkStatusChange}
                  onBulkAssign={handleBulkAssign}
                  onBulkDueDate={handleBulkDueDate}
                  onBulkDelete={handleBulkDeleteAction}
                />
              )}

              {/* Task List / Kanban */}
              {filters.viewMode === 'board' ? (
                <TaskKanban
                  tasks={filters.sortedTasks}
                  loading={loading}
                  initialLoading={initialLoading}
                  error={error}
                  pendingStatusUpdates={pendingStatusUpdates}
                  onEdit={form.handleEditOpen}
                  onDelete={form.handleDeleteClick}
                  onQuickStatusChange={handleQuickStatusChange}
                  onRefresh={handleRefresh}
                  loadingMore={loadingMore}
                  hasMore={!!nextCursor}
                  onLoadMore={handleLoadMore}
                  emptyStateMessage={emptyStateMessage}
                  showEmptyStateFiltered={filters.selectedStatus !== 'all' || !!debouncedQuery}
                  workspaceId={user?.agencyId ?? null}
                  userId={user?.id ?? null}
                  userName={user?.name ?? null}
                  userRole={user?.role ?? null}
                  participants={taskParticipants}
                />
              ) : (
                <TaskList
                  tasks={filters.sortedTasks}
                  viewMode={filters.viewMode}
                  loading={loading}
                  initialLoading={initialLoading}
                  error={error}
                  pendingStatusUpdates={pendingStatusUpdates}
                  onEdit={form.handleEditOpen}
                  onDelete={form.handleDeleteClick}
                  onQuickStatusChange={handleQuickStatusChange}
                  onRefresh={handleRefresh}
                  loadingMore={loadingMore}
                  hasMore={!!nextCursor}
                  onLoadMore={handleLoadMore}
                  emptyStateMessage={emptyStateMessage}
                  showEmptyStateFiltered={filters.selectedStatus !== 'all' || !!debouncedQuery}
                  selectedTaskIds={selectedTaskIds}
                  onToggleTaskSelection={handleToggleTaskSelection}
                  workspaceId={user?.agencyId ?? null}
                  userId={user?.id ?? null}
                  userName={user?.name ?? null}
                  userRole={user?.role ?? null}
                  participants={taskParticipants}
                />
              )}

              {/* Results count */}
              {!initialLoading && !error && (
                <TaskResultsCount
                  sortedCount={filters.sortedTasks.length}
                  totalCount={tasks.length}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Create Task Sheet */}
        <CreateTaskSheet
          open={form.isCreateOpen}
          onOpenChange={form.handleCreateOpenChange}
          formState={form.formState}
          setFormState={form.setFormState}
          creating={form.creating}
          createError={form.createError}
          onSubmit={form.handleCreateSubmit}
          participants={taskParticipants}
          pendingAttachments={form.createAttachments}
          onAddAttachments={form.handleCreateAttachmentsAdd}
          onRemoveAttachment={form.handleCreateAttachmentRemove}
        />

        {/* Edit Task Sheet */}
        <EditTaskSheet
          open={form.isEditOpen}
          onOpenChange={handleEditDialogOpenChange}
          taskId={form.editingTask?.id ?? null}
          formState={form.editFormState}
          setFormState={form.setEditFormState}
          updating={form.updating}
          updateError={form.updateError}
          onSubmit={form.handleEditSubmit}
          currentWorkspaceId={user?.agencyId ?? null}
          currentUserId={user?.id ?? null}
          currentUserName={user?.name ?? null}
          currentUserRole={user?.role ?? null}
          participants={taskParticipants}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteTaskDialog
          open={form.isDeleteDialogOpen}
          onOpenChange={handleDeleteDialogOpenChange}
          task={form.deletingTask}
          deleting={form.deleting}
          onConfirm={handleConfirmDelete}
        />


      </div>
      </BoneyardSkeletonBoundary>
    </TooltipProvider>
  )
}
