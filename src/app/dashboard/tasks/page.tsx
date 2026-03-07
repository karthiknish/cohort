'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'

import {
  formatDate,
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
} from '@/components/tasks'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useNavigationContext } from '@/contexts/navigation-context'
import { usePreview } from '@/contexts/preview-context'
import { useKeyboardShortcut, KeyboardShortcutBadge } from '@/hooks/use-keyboard-shortcuts'
import { usePersistedTab } from '@/hooks/use-persisted-tab'
import { usersApi } from '@/lib/convex-api'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { isFeatureEnabled } from '@/lib/features'
import { exportToCsv } from '@/lib/utils'
import type { TaskStatus } from '@/types/tasks'

const TaskList = dynamic(() => import('@/components/tasks/task-list').then((mod) => mod.TaskList), {
  loading: () => <div className="p-6 text-sm text-muted-foreground">Loading tasks…</div>,
})

const TaskKanban = dynamic(
  () => import('@/components/tasks/task-kanban').then((mod) => mod.TaskKanban),
  {
    loading: () => <div className="p-6 text-sm text-muted-foreground">Loading board…</div>,
    ssr: false,
  }
)

const CreateTaskSheet = dynamic(
  () => import('@/components/tasks/task-form-sheets').then((mod) => mod.CreateTaskSheet),
  { ssr: false }
)

const EditTaskSheet = dynamic(
  () => import('@/components/tasks/task-form-sheets').then((mod) => mod.EditTaskSheet),
  { ssr: false }
)

const DeleteTaskDialog = dynamic(
  () => import('@/components/tasks/delete-task-dialog').then((mod) => mod.DeleteTaskDialog),
  { ssr: false }
)

export default function TasksPage() {
  const searchParams = useSearchParams()
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

  const projectFilter = useMemo(() => ({
    id: searchParams.get('projectId'),
    name: searchParams.get('projectName'),
  }), [searchParams])

  const routeClientContext = useMemo(() => {
    const clientId = searchParams.get('clientId')
    const clientName = searchParams.get('clientName')
    if (!clientId && !clientName) return null
    return {
      id: clientId,
      name: clientName,
    }
  }, [searchParams])

  const taskFormClient = selectedClient ?? routeClientContext
  const taskFormClientId = selectedClientId ?? routeClientContext?.id ?? undefined
  const actionParam = searchParams.get('action')
  const searchParamsString = searchParams.toString()

  // Sync navigation context from URL project filters.
  useEffect(() => {
    if (isFeatureEnabled('BIDIRECTIONAL_NAV') && projectFilter.id && projectFilter.name) {
      setProjectContext(projectFilter.id, projectFilter.name)
    }
  }, [projectFilter.id, projectFilter.name, setProjectContext])

  const clearProjectFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('projectId')
    params.delete('projectName')
    const next = params.toString()
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

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
          limit: 200,
        }
      : 'skip'
  ) as TaskParticipant[] | undefined

  const taskParticipants = useMemo(() => {
    const byName = new Map<string, TaskParticipant>()

    for (const member of selectedClient?.teamMembers ?? []) {
      const key = member.name.trim().toLowerCase()
      if (!key) continue
      byName.set(key, member)
    }

    for (const member of workspaceMembers ?? []) {
      const key = member.name.trim().toLowerCase()
      if (!key) continue
      const existing = byName.get(key)
      byName.set(key, {
        id: member.id ?? existing?.id,
        name: member.name,
        role: existing?.role ?? member.role,
        email: member.email,
      })
    }

    return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [selectedClient?.teamMembers, workspaceMembers])

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
    onCreateTask: handleCreateTask,
    onUpdateTask: handleUpdateTask,
  })
  const { setFormState, handleCreateOpenChange } = form

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

  // Auto-open create sheet when action=create is in URL
  useEffect(() => {
    if (actionParam === 'create') {
      handleCreateOpenChange(true)
      // Clean up the URL without refreshing
      const params = new URLSearchParams(searchParamsString)
      params.delete('action')
      const next = params.toString()
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [actionParam, handleCreateOpenChange, pathname, router, searchParamsString])

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
      Tags: (task.tags ?? []).join(', '),
      Description: task.description || '',
    }))

    exportToCsv(data, `tasks-export-${new Date().toISOString().split('T')[0]}.csv`)
  }, [filters.filteredTasks])

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    if (!form.deletingTask) return

    form.setDeleting(true)
    const success = await handleDeleteTask(form.deletingTask)
    form.setDeleting(false)

    if (success) {
      form.handleDeleteClose()
    }
  }

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

  const scopeLabel = selectedClient?.name ?? (selectedClientId ? 'Selected client' : 'All clients')
  const scopeHelper = selectedClient ? 'Scoped to the selected client' : 'Showing tasks across all clients'
  const emptyStateMessage = filters.activeTab === 'my-tasks'
    ? 'No tasks are assigned to you yet. Switch to All Tasks to see team-owned work.'
    : 'Get started by creating your first task.'

  return (
    <TooltipProvider>
      <div className={DASHBOARD_THEME.layout.container}>
        {/* Header */}
        <TasksHeader
          loading={loading}
          retryCount={retryCount}
          onRefresh={handleRefresh}
          onNewTaskClick={() => form.handleCreateOpenChange(true)}
          scopeLabel={scopeLabel}
          scopeHelper={scopeHelper}
        />

        {/* Summary Cards */}
        {initialLoading ? (
          <div className={DASHBOARD_THEME.stats.container}>
            {['task-stats-1', 'task-stats-2', 'task-stats-3', 'task-stats-4', 'task-stats-5'].map((key) => (
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
            completionRate={filters.completionRate}
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
          onOpenChange={(open) => !open && form.handleEditClose()}
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
          onOpenChange={(open) => !open && form.handleDeleteClose()}
          task={form.deletingTask}
          deleting={form.deleting}
          onConfirm={handleConfirmDelete}
        />


      </div>
    </TooltipProvider>
  )
}
