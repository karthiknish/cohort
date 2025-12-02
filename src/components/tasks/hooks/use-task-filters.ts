'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { TaskRecord, TaskStatus, TASK_STATUSES } from '@/types/tasks'
import { SortField, SortDirection, PRIORITY_ORDER } from '../task-types'

export type UseTaskFiltersOptions = {
  tasks: TaskRecord[]
  userName: string | undefined
  selectedClient: { id: string | null; name: string | null } | null
  selectedClientId: string | undefined
  projectFilterId: string | null
  projectFilterName: string | null
}

export type UseTaskFiltersReturn = {
  // Filter state
  selectedStatus: 'all' | TaskStatus
  setSelectedStatus: React.Dispatch<React.SetStateAction<'all' | TaskStatus>>
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  selectedAssignee: string
  setSelectedAssignee: React.Dispatch<React.SetStateAction<string>>
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>

  // Sort state
  sortField: SortField
  setSortField: React.Dispatch<React.SetStateAction<SortField>>
  sortDirection: SortDirection
  toggleSortDirection: () => void

  // View state
  viewMode: 'list' | 'grid'
  setViewMode: React.Dispatch<React.SetStateAction<'list' | 'grid'>>

  // Computed values
  tasksForClient: TaskRecord[]
  projectScopedTasks: TaskRecord[]
  filteredTasks: TaskRecord[]
  sortedTasks: TaskRecord[]
  taskCounts: Record<TaskStatus, number>
  completionRate: number
  assigneeOptions: string[]

  // Handlers
  handleStatusChange: (value: string) => void
  handleAssigneeChange: (value: string) => void
}

export function useTaskFilters({
  tasks,
  userName,
  selectedClient,
  selectedClientId,
  projectFilterId,
  projectFilterName,
}: UseTaskFiltersOptions): UseTaskFiltersReturn {
  const [selectedStatus, setSelectedStatus] = useState<'all' | TaskStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [activeTab, setActiveTab] = useState('all-tasks')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const toggleSortDirection = useCallback(() => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setSelectedStatus(value as 'all' | TaskStatus)
  }, [])

  const handleAssigneeChange = useCallback((value: string) => {
    setSelectedAssignee(value)
  }, [])

  // Filter tasks by client
  const tasksForClient = useMemo(() => {
    if (!selectedClientId && !selectedClient) return tasks

    const normalizedClientName = selectedClient?.name?.toLowerCase() ?? null

    return tasks.filter((task) => {
      if (selectedClientId) {
        if (task.clientId) return task.clientId === selectedClientId
        if (normalizedClientName && task.client) {
          return task.client.toLowerCase() === normalizedClientName
        }
        return false
      }
      if (normalizedClientName) {
        return task.client?.toLowerCase() === normalizedClientName
      }
      return true
    })
  }, [tasks, selectedClientId, selectedClient])

  // Filter by project
  const projectScopedTasks = useMemo(() => {
    if (!projectFilterId && !projectFilterName) return tasksForClient

    const targetId = projectFilterId
    const targetName = projectFilterName?.toLowerCase() ?? null

    return tasksForClient.filter((task) => {
      if (targetId && task.projectId === targetId) return true
      if (targetName && task.projectName && task.projectName.toLowerCase() === targetName) {
        return true
      }
      return false
    })
  }, [projectFilterId, projectFilterName, tasksForClient])

  // Apply all filters
  const filteredTasks = useMemo(() => {
    return projectScopedTasks.filter((task) => {
      const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
      const title = task.title.toLowerCase()
      const description = (task.description ?? '').toLowerCase()
      const query = searchQuery.toLowerCase()
      const matchesSearch = title.includes(query) || description.includes(query)

      let matchesAssignee = true
      if (activeTab === 'my-tasks') {
        if (userName) {
          matchesAssignee = task.assignedTo.some(
            (a) => a.toLowerCase() === userName.toLowerCase()
          )
        } else {
          matchesAssignee = false
        }
      } else {
        matchesAssignee =
          selectedAssignee === 'all' ||
          task.assignedTo.some((a) => a.toLowerCase().includes(selectedAssignee.toLowerCase()))
      }

      return matchesStatus && matchesSearch && matchesAssignee
    })
  }, [projectScopedTasks, selectedStatus, searchQuery, selectedAssignee, activeTab, userName])

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks]
    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'status':
          comparison = TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status)
          break
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          break
        case 'dueDate': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
          comparison = aDate - bDate
          break
        }
        case 'createdAt':
          comparison =
            new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
          break
        case 'updatedAt':
        default:
          comparison =
            new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime()
          break
      }

      return sortDirection === 'desc' ? -comparison : comparison
    })
    return sorted
  }, [filteredTasks, sortField, sortDirection])

  // Task counts by status
  const taskCounts = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      completed: 0,
    }
    projectScopedTasks.forEach((task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1
    })
    return counts
  }, [projectScopedTasks])

  // Completion rate
  const completionRate = useMemo(() => {
    const total = projectScopedTasks.length
    if (total === 0) return 0
    return Math.round((taskCounts.completed / total) * 100)
  }, [projectScopedTasks.length, taskCounts.completed])

  // Assignee options
  const assigneeOptions = useMemo(() => {
    const options = new Set<string>()
    projectScopedTasks.forEach((task) => {
      task.assignedTo.forEach((member) => {
        if (member && member.trim().length > 0) {
          options.add(member)
        }
      })
    })
    return Array.from(options).sort((a, b) => a.localeCompare(b))
  }, [projectScopedTasks])

  // Reset assignee if no longer valid
  useEffect(() => {
    if (selectedAssignee !== 'all' && !assigneeOptions.includes(selectedAssignee)) {
      setSelectedAssignee('all')
    }
  }, [assigneeOptions, selectedAssignee])

  return {
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    selectedAssignee,
    setSelectedAssignee,
    activeTab,
    setActiveTab,
    sortField,
    setSortField,
    sortDirection,
    toggleSortDirection,
    viewMode,
    setViewMode,
    tasksForClient,
    projectScopedTasks,
    filteredTasks,
    sortedTasks,
    taskCounts,
    completionRate,
    assigneeOptions,
    handleStatusChange,
    handleAssigneeChange,
  }
}
