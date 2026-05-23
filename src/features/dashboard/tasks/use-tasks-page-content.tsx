'use client'


import { useQuery } from 'convex/react'
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error'
import dynamic from 'next/dynamic'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

import {
  formatAssigneeList,
  formatDate,
  clientRosterAssigneeNames,
  mergeTaskParticipants,
  resolveAssigneeUserIds,
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
import { PageMotionShell } from '@/shared/components/page-motion-shell'
import { Card, CardContent } from '@/shared/ui/card'
import { BoneyardSkeletonBoundary } from '@/shared/ui/boneyard-skeleton-boundary'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useNavigationContext } from '@/shared/contexts/navigation-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcuts'
import { usePersistedTab } from '@/shared/hooks/use-persisted-tab'
import { usersApi } from '@/lib/convex-api'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import {
  buildCategoryCountChart,
} from '@/lib/export/cohorts-spreadsheet-charts'
import { buildTaskListFilters } from './hooks/task-list-filters'
import { TASKS_THEME } from './tasks-theme'
import { isFeatureEnabled } from '@/lib/features'
import { exportToCsv } from '@/lib/export/export-to-spreadsheet'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/tasks'

import { useTasksDocumentImport } from './use-tasks-document-import'
import { TasksDocumentImportOverlay } from './tasks-document-import-overlay'
import { TasksDocumentImportReviewSheet } from './tasks-document-import-review-sheet'
import { TaskParticipantsProvider } from './task-participants-context'


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

export type TasksPageClientProps = {
  initialProjectId?: string | null
  initialProjectName?: string | null
  initialClientId?: string | null
  initialClientName?: string | null
  initialAction?: string | null
  initialSearchParamsString?: string
}

export function useTasksPageContent({ initialAction, initialClientId, initialClientName, initialProjectId, initialProjectName, initialSearchParamsString }: TasksPageClientProps) {
  const { replace } = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const { selectedClient, selectedClientId, clients } = useClientContext()
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

  const effectiveTaskClient = useMemo(() => {
    if (selectedClient) return selectedClient
    const routeId = routeClientContext?.id
    if (!routeId) return null
    return clients.find((client) => client.id === routeId) ?? null
  }, [clients, routeClientContext?.id, selectedClient])

  const taskFormClient = effectiveTaskClient ?? routeClientContext
  const taskFormClientId = effectiveTaskClient?.id ?? selectedClientId ?? routeClientContext?.id ?? undefined
  const taskWorkspaceId = effectiveTaskClient?.workspaceId ?? user?.agencyId ?? null
  const newTaskDisabledReason = useMemo(() => {
    if (authLoading) return null
    if (!user?.id) return 'Sign in to create tasks.'
    if (!taskFormClientId) {
      return 'Select a client from the workspace switcher, or open Tasks from a client record, before creating a task.'
    }
    return null
  }, [authLoading, taskFormClientId, user?.id])
  const actionParam = normalizedAction
  const searchParamsString = normalizedSearchParamsString

  const projectContextKey =
    isFeatureEnabled('BIDIRECTIONAL_NAV') && projectFilter.id && projectFilter.name
      ? `${projectFilter.id}|${projectFilter.name}`
      : null

  useEffect(() => {
    if (!projectContextKey || !projectFilter.id || !projectFilter.name) return
    setProjectContext(projectFilter.id, projectFilter.name)
  }, [projectContextKey, projectFilter.id, projectFilter.name, setProjectContext])

  const clearProjectFilter = useCallback(() => {
    const params = new URLSearchParams(searchParamsString)
    params.delete('projectId')
    params.delete('projectName')
    const next = params.toString()
    replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [pathname, replace, searchParamsString])

  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [rawSearchQuery, setRawSearchQuery] = useState('')
  const debouncedQuery = useDebouncedValue(rawSearchQuery, 300)

  const listFilters = useMemo(
    () =>
      buildTaskListFilters({
        selectedStatus,
        searchQuery: debouncedQuery,
        activeTab: taskTabs.value,
        userId: user?.id,
        selectedAssignee,
        projectId: projectFilter.id,
      }),
    [debouncedQuery, projectFilter.id, selectedAssignee, selectedStatus, taskTabs.value, user?.id],
  )

  // Tasks data hook
  const {
    tasks,
    loading,
    loadingMore,
    error,
    retryCount,
    pendingStatusUpdates,
    nextCursor,
    handleLoadMore,
    handleRefresh,
    handleQuickStatusChange,
    handleDeleteTask,
    handleCreateTask,
    handleUpdateTask,
    handleBulkUpdate,
    handleBulkDelete,
  } = useTasks({
    userId: user?.id,
    clientId: taskFormClientId ?? undefined,
    authLoading,
    isPreviewMode,
    workspaceId: taskWorkspaceId,
    listFilters,
  })

  const workspaceMembers = useQuery(
    usersApi.listWorkspaceMembers,
    taskWorkspaceId && !isPreviewMode
      ? {
          workspaceId: taskWorkspaceId,
          limit: 500,
        }
      : 'skip'
  ) as TaskParticipant[] | undefined

  const clientRosterNames = useMemo(
    () => clientRosterAssigneeNames(effectiveTaskClient ?? selectedClient),
    [effectiveTaskClient, selectedClient],
  )

  const rosterProfiles = useQuery(
    usersApi.resolveProfilesForNames,
    taskWorkspaceId && clientRosterNames.length > 0 && !isPreviewMode
      ? {
          workspaceId: taskWorkspaceId,
          names: clientRosterNames,
        }
      : 'skip',
  ) as TaskParticipant[] | undefined

  const workspaceMembersQueryError = useConvexQueryError({
    data: workspaceMembers,
    skipped: !taskWorkspaceId || isPreviewMode,
    fallbackMessage: 'Unable to load workspace members.',
  })
  const rosterProfilesQueryError = useConvexQueryError({
    data: rosterProfiles,
    skipped: !taskWorkspaceId || clientRosterNames.length === 0 || isPreviewMode,
    fallbackMessage: 'Unable to load client assignees.',
  })
  const participantsQueryError = mergeQueryErrors(workspaceMembersQueryError, rosterProfilesQueryError)
  const displayError = mergeQueryErrors(error, participantsQueryError)

  const taskParticipants = useMemo(() => {
    const clientTeamMembers = (effectiveTaskClient?.teamMembers ?? selectedClient?.teamMembers ?? []).map(
      (member) => ({
        name: member.name,
        role: member.role,
      }),
    )

    if (clientTeamMembers.length > 0 || (rosterProfiles?.length ?? 0) > 0) {
      return mergeTaskParticipants([
        clientTeamMembers,
        workspaceMembers ?? [],
        rosterProfiles ?? [],
      ])
    }

    return mergeTaskParticipants([workspaceMembers ?? []])
  }, [effectiveTaskClient?.teamMembers, rosterProfiles, selectedClient?.teamMembers, workspaceMembers])

  // Filters hook
  const filters = useTaskFilters({
    tasks,
    userId: user?.id,
    userName: user?.name,
    participants: taskParticipants,
    selectedClient,
    selectedClientId: selectedClientId ?? undefined,
    projectFilterId: projectFilter.id,
    projectFilterName: projectFilter.name,
    activeTab: taskTabs.value,
    setActiveTab: (next) => taskTabs.setValue(next as 'all-tasks' | 'my-tasks'),
    serverListFilters: listFilters,
    selectedStatus,
    setSelectedStatus,
    searchQuery: debouncedQuery,
    setSearchQuery: setRawSearchQuery,
    selectedAssignee,
    setSelectedAssignee,
  })

  const [rawSelectedTaskIds, setRawSelectedTaskIds] = useState<Set<string>>(new Set())
  const [bulkState, setBulkState] = useState<{ active: boolean; label: string; progress: number }>({
    active: false,
    label: '',
    progress: 0,
  })

  // Form management hook
  const form = useTaskForm({
    selectedClient: taskFormClient,
    selectedClientId: taskFormClientId,
    projectContext: projectFilter,
    userId: user?.id,
    participants: taskParticipants,
    initialCreateOpen: actionParam === 'create',
    onCreateOpenChange: (open) => {
      if (open || actionParam !== 'create') return

      const params = new URLSearchParams(searchParamsString)
      params.delete('action')
      const next = params.toString()
      replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    },
    onCreateTask: handleCreateTask,
    onUpdateTask: handleUpdateTask,
  })
  // Keyboard shortcuts
  useKeyboardShortcut({
    combo: 'mod+k',
    callback: () => {
      document.getElementById('task-search')?.focus()
    },
  })

  useKeyboardShortcut({
    combo: 'mod+n',
    callback: () => {
      if (newTaskDisabledReason) return
      form.handleCreateOpenChange(true)
    },
    enabled: !form.isCreateOpen && !newTaskDisabledReason,
  })

  // Export handler
  const handleExport = useCallback(() => {
    if (filters.filteredTasks.length === 0) return

    const exportRows = filters.filteredTasks.map((task) => ({
      Title: task.title,
      Status: task.status,
      Priority: task.priority,
      Client: task.client || 'Internal',
      'Assigned To': formatAssigneeList(task.assignedTo ?? [], taskParticipants),
      'Due Date': task.dueDate ? formatDate(task.dueDate) : 'No due date',
      Description: task.description || '',
    }))

    const charts = [
      buildCategoryCountChart(exportRows, 'Status', 'Tasks by status', 'pie'),
      buildCategoryCountChart(exportRows, 'Priority', 'Tasks by priority', 'bar'),
    ].filter((chart): chart is NonNullable<typeof chart> => chart !== null)

    void exportToCsv(
      exportRows,
      `tasks-export-${new Date().toISOString().split('T')[0]}.xlsx`,
      undefined,
      {
        title: 'Tasks export',
        subtitle: `${filters.filteredTasks.length} task${filters.filteredTasks.length === 1 ? '' : 's'}`,
        charts,
      },
    )
  }, [filters.filteredTasks, taskParticipants])

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
      const ok = await handleBulkUpdate(ids, { status })
      setBulkState({ active: false, label: '', progress: 0 })
      if (ok) setRawSelectedTaskIds(new Set())
    },
    [handleBulkUpdate, hasSelection, selectedTaskIds],
  )

  const handleBulkAssign = useCallback(
    async (assignees: string[]) => {
      if (!hasSelection) return
      const normalized = assignees.flatMap((entry) => {
        const trimmed = entry.trim()
        if (trimmed.length === 0) return []

        const byId = taskParticipants.find((participant) => participant.id === trimmed)
        if (byId?.id) return [byId.id]

        const byName = taskParticipants.find(
          (participant) => participant.name.trim().toLowerCase() === trimmed.toLowerCase(),
        )
        if (byName?.id) return [byName.id]

        return resolveAssigneeUserIds(`@[${trimmed}]`, taskParticipants)
      })
      const ids = Array.from(selectedTaskIds)
      setBulkState({ active: true, label: 'Updating assignees', progress: 0 })
      const ok = await handleBulkUpdate(ids, { assignedTo: normalized })
      setBulkState({ active: false, label: '', progress: 0 })
      if (ok) setRawSelectedTaskIds(new Set())
    },
    [handleBulkUpdate, hasSelection, selectedTaskIds, taskParticipants],
  )

  const handleBulkDueDate = useCallback(
    async (date: string | null) => {
      if (!hasSelection) return
      const normalized = date && !Number.isNaN(Date.parse(date)) ? date : null
      const ids = Array.from(selectedTaskIds)
      setBulkState({ active: true, label: 'Updating due dates', progress: 0 })
      const ok = await handleBulkUpdate(ids, { dueDate: normalized ?? undefined })
      setBulkState({ active: false, label: '', progress: 0 })
      if (ok) setRawSelectedTaskIds(new Set())
    },
    [handleBulkUpdate, hasSelection, selectedTaskIds],
  )

  const handleBulkDeleteAction = useCallback(async () => {
    if (!hasSelection) return
    const ids = Array.from(selectedTaskIds)
    setBulkState({ active: true, label: 'Deleting tasks', progress: 0 })
    const ok = await handleBulkDelete(ids)
    setBulkState({ active: false, label: '', progress: 0 })
    if (ok) setRawSelectedTaskIds(new Set())
  }, [handleBulkDelete, hasSelection, selectedTaskIds])


  const initialLoading = loading && tasks.length === 0
  const scopeLabel = selectedClient?.name ?? (selectedClientId ? 'Selected client' : null)
  const scopeHelper = selectedClient
    ? `Tasks for ${selectedClient.name}`
    : 'All clients in this workspace'
  const emptyStateMessage = filters.activeTab === 'my-tasks'
    ? 'No tasks are assigned to you yet. Switch to All Tasks to see team-owned work.'
    : 'Get started by creating your first task.'

  const showFilteredEmpty = useMemo(
    () =>
      filters.selectedStatus !== 'all' ||
      debouncedQuery.trim().length > 0 ||
      (filters.activeTab === 'all-tasks' && filters.selectedAssignee !== 'all'),
    [debouncedQuery, filters.activeTab, filters.selectedAssignee, filters.selectedStatus],
  )

  const handleClearListFilters = useCallback(() => {
    filters.resetListFilters()
    setRawSearchQuery('')
  }, [filters])

  const handleSummaryStatusClick = useCallback(
    (status: TaskStatus) => {
      if (filters.selectedStatus === status) {
        filters.handleStatusChange('all')
      } else {
        filters.handleStatusChange(status)
      }
    },
    [filters],
  )

  const documentImport = useTasksDocumentImport({
    workspaceId: taskWorkspaceId ? String(taskWorkspaceId) : null,
    userId: user?.id,
    participants: taskParticipants,
    clientId: taskFormClientId,
    clientName: taskFormClient?.name ?? undefined,
    projectId: projectFilter.id ?? undefined,
    projectName: projectFilter.name ?? undefined,
    disabledReason: newTaskDisabledReason,
    isPreviewMode,
    onCreateTask: handleCreateTask,
  })

  return (
    <TooltipProvider>
      <TaskParticipantsProvider participants={taskParticipants}>
      <BoneyardSkeletonBoundary
        name="dashboard-tasks-page"
        loading={initialLoading}
      >
      <div
        className={cn(DASHBOARD_THEME.layout.container, TASKS_THEME.page, 'relative')}
        {...documentImport.importDragHandlers}
      >
        <TasksDocumentImportOverlay
          phase={documentImport.phase}
          statusMessage={documentImport.statusMessage}
          errorMessage={documentImport.errorMessage}
          visible={documentImport.overlayVisible}
          onCancel={documentImport.handleCancel}
        />

        <TasksDocumentImportReviewSheet
          open={documentImport.reviewOpen}
          documentSummary={documentImport.documentSummary}
          proposedTasks={documentImport.proposedTasks}
          participants={taskParticipants}
          attachSourceDocuments={documentImport.attachSourceDocuments}
          onAttachSourceDocumentsChange={documentImport.setAttachSourceDocuments}
          onUpdateTask={documentImport.updateProposedTask}
          onConfirm={documentImport.handleConfirmReview}
          onDiscard={documentImport.handleDismissReview}
        />

        <TasksHeader
          loading={loading}
          retryCount={retryCount}
          onRefresh={handleRefresh}
          onNewTaskClick={handleNewTaskClick}
          scopeLabel={scopeLabel}
          scopeHelper={scopeHelper}
          newTaskDisabledReason={newTaskDisabledReason}
        />

        {initialLoading ? (
          <Skeleton className={cn(TASKS_THEME.summaryCard, 'h-24')} />
        ) : (
          <TaskSummaryCards
            taskCounts={filters.taskCounts}
            selectedStatus={filters.selectedStatus}
            onStatusCardClick={handleSummaryStatusClick}
          />
        )}

        <Tabs
          defaultValue="all-tasks"
          value={filters.activeTab}
          onValueChange={filters.setActiveTab}
          className="space-y-0"
        >
          <div className={TASKS_THEME.workspace}>
            <div className={cn(TASKS_THEME.rail, 'sticky top-0 z-10 backdrop-blur-md')}>
              <TabsList className={TASKS_THEME.tabList}>
                <TabsTrigger value="all-tasks" className={TASKS_THEME.tabTrigger}>
                  All tasks
                </TabsTrigger>
                <TabsTrigger value="my-tasks" className={TASKS_THEME.tabTrigger}>
                  My tasks
                </TabsTrigger>
              </TabsList>
              <TaskViewControls
                viewMode={filters.viewMode}
                onViewModeChange={filters.setViewMode}
                onExport={handleExport}
                canExport={filters.sortedTasks.length > 0}
              />
            </div>

            <div>
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
                hasActiveFilters={filters.hasActiveFilters}
                onClearFilters={handleClearListFilters}
              />

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

              <div
                className={cn(
                  TASKS_THEME.content,
                  filters.viewMode === 'list' && TASKS_THEME.contentList,
                )}
              >
              {filters.viewMode === 'board' ? (
                <TaskKanban
                  tasks={filters.sortedTasks}
                  loading={loading}
                  initialLoading={initialLoading}
                  error={displayError}
                  pendingStatusUpdates={pendingStatusUpdates}
                  onEdit={form.handleEditOpen}
                  onDelete={form.handleDeleteClick}
                  onQuickStatusChange={handleQuickStatusChange}
                  onRefresh={handleRefresh}
                  loadingMore={loadingMore}
                  hasMore={Boolean(nextCursor)}
                  onLoadMore={handleLoadMore}
                  emptyStateMessage={emptyStateMessage}
                  showEmptyStateFiltered={showFilteredEmpty}
                  onEmptyClearFilters={handleClearListFilters}
                  onEmptyCreateTask={handleNewTaskClick}
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
                  error={displayError}
                  pendingStatusUpdates={pendingStatusUpdates}
                  onEdit={form.handleEditOpen}
                  onDelete={form.handleDeleteClick}
                  onQuickStatusChange={handleQuickStatusChange}
                  onRefresh={handleRefresh}
                  loadingMore={loadingMore}
                  hasMore={Boolean(nextCursor)}
                  onLoadMore={handleLoadMore}
                  emptyStateMessage={emptyStateMessage}
                  showEmptyStateFiltered={showFilteredEmpty}
                  onEmptyClearFilters={handleClearListFilters}
                  onEmptyCreateTask={handleNewTaskClick}
                  selectedTaskIds={selectedTaskIds}
                  onToggleTaskSelection={handleToggleTaskSelection}
                  workspaceId={user?.agencyId ?? null}
                  userId={user?.id ?? null}
                  userName={user?.name ?? null}
                  userRole={user?.role ?? null}
                  participants={taskParticipants}
                />
              )}
              </div>

              {!initialLoading && !displayError && (
                <TaskResultsCount
                  sortedCount={filters.sortedTasks.length}
                  totalCount={tasks.length}
                  loading={loading && !loadingMore}
                />
              )}
            </div>
          </div>
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
      </TaskParticipantsProvider>
    </TooltipProvider>
  )
}
