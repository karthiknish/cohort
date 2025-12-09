'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Briefcase, MessageSquare, Users } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useNavigationContext } from '@/contexts/navigation-context'
import { isFeatureEnabled } from '@/lib/features'
import { exportToCsv } from '@/lib/utils'


// Import task components and hooks
import {
  formatDate,
  ProjectFilter,
  useTasks,
  useTaskForm,
  useTaskFilters,
  useDebouncedValue,
  TasksHeader,
  TaskSummaryCards,
  TaskFilters,
  TaskList,
  ProjectFilterBanner,
  TaskViewControls,
  TaskResultsCount,
  CreateTaskSheet,
  EditTaskSheet,
  DeleteTaskDialog,
} from '@/components/tasks'

export default function TasksPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { setProjectContext } = useNavigationContext()

  // Project filter state
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>(() => ({
    id: searchParams.get('projectId'),
    name: searchParams.get('projectName'),
  }))

  // Sync project filter with URL
  useEffect(() => {
    const id = searchParams.get('projectId')
    const name = searchParams.get('projectName')
    setProjectFilter((prev) => (prev.id === id && prev.name === name ? prev : { id, name }))

    if (isFeatureEnabled('BIDIRECTIONAL_NAV') && id && name) {
      setProjectContext(id, name)
    }
  }, [searchParams, setProjectContext])

  const clearProjectFilter = useCallback(() => {
    setProjectFilter({ id: null, name: null })
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
    nextCursor,
    setError,
  } = useTasks({
    userId: user?.id,
    clientId: selectedClientId ?? undefined,
    authLoading,
  })

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
  })

  // Sync debounced search
  useEffect(() => {
    filters.setSearchQuery(debouncedQuery)
  }, [debouncedQuery, filters])

  // Form management hook
  const form = useTaskForm({
    selectedClient,
    selectedClientId: selectedClientId ?? undefined,
    userId: user?.id,
    onCreateTask: handleCreateTask,
    onUpdateTask: handleUpdateTask,
  })

  // Update form when client changes
  useEffect(() => {
    form.setFormState((prev) => ({
      ...prev,
      clientId: selectedClient?.id ?? null,
      clientName: selectedClient?.name ?? '',
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient?.id, selectedClient?.name])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('task-search')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Export handler
  const handleExport = useCallback(() => {
    if (filters.filteredTasks.length === 0) return

    const data = filters.filteredTasks.map((task) => ({
      Title: task.title,
      Status: task.status,
      Priority: task.priority,
      Client: task.client || 'Internal',
      'Assigned To': task.assignedTo.join(', '),
      'Due Date': task.dueDate ? formatDate(task.dueDate) : 'No due date',
      Tags: task.tags.join(', '),
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

  const initialLoading = loading && tasks.length === 0

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <TasksHeader
          loading={loading}
          retryCount={retryCount}
          onRefresh={handleRefresh}
          onNewTaskClick={() => form.handleCreateOpenChange(true)}
        />

        {/* Summary Cards */}
        <TaskSummaryCards
          taskCounts={filters.taskCounts}
          completionRate={filters.completionRate}
        />

        {/* Main Content */}
        <Tabs
          defaultValue="all-tasks"
          value={filters.activeTab}
          onValueChange={filters.setActiveTab}
          className="space-y-4"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <TabsList>
              <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
              <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            </TabsList>
            <TaskViewControls
              viewMode={filters.viewMode}
              onViewModeChange={filters.setViewMode}
              onExport={handleExport}
              canExport={filters.sortedTasks.length > 0}
            />
          </div>

          <Card className="border-muted/60 bg-background">
            <CardHeader className="border-b border-muted/40 pb-4">
              <CardTitle>
                {filters.activeTab === 'my-tasks' ? 'My Assignments' : 'All Tasks'}
              </CardTitle>
              <CardDescription>
                {filters.activeTab === 'my-tasks'
                  ? 'Tasks assigned specifically to you.'
                  : 'Search, filter, and monitor active work across the agency.'}
                <span className="ml-2 hidden text-xs text-muted-foreground/70 sm:inline">
                  (⌘K to search)
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

              {/* Task List */}
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
                emptyStateMessage="Get started by creating your first task."
                showEmptyStateFiltered={filters.selectedStatus !== 'all' || !!debouncedQuery}
              />

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
        />

        {/* Edit Task Sheet */}
        <EditTaskSheet
          open={form.isEditOpen}
          onOpenChange={(open) => !open && form.handleEditClose()}
          formState={form.editFormState}
          setFormState={form.setEditFormState}
          updating={form.updating}
          updateError={form.updateError}
          onSubmit={form.handleEditSubmit}
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
