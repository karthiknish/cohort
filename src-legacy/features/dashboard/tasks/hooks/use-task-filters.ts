'use client';
import { useCallback, useMemo, useState } from 'react';
import { TASK_STATUSES } from '@/types/tasks';
import type { TaskRecord, TaskStatus } from '@/types/tasks';
import { PRIORITY_ORDER, resolveAssigneeLabel } from '../task-types';
import type { SortField, SortDirection, TaskParticipant } from '../task-types';
import type { TaskListFiltersInput } from './task-list-filters';
const TASK_VIEW_MODE_STORAGE_KEY = 'dashboard:tasks:view-mode';
function getInitialTaskViewMode(): 'list' | 'grid' | 'board' {
    if (typeof window === 'undefined') {
        return 'list';
    }
    const persisted = window.localStorage.getItem(TASK_VIEW_MODE_STORAGE_KEY);
    if (persisted === 'list' || persisted === 'grid' || persisted === 'board') {
        return persisted;
    }
    return 'list';
}
export type UseTaskFiltersOptions = {
    tasks: TaskRecord[];
    userId: string | undefined;
    userName: string | undefined;
    participants?: TaskParticipant[];
    selectedClient: {
        id: string | null;
        name: string | null;
    } | null;
    selectedClientId: string | undefined;
    projectFilterId: string | null;
    projectFilterName: string | null;
    activeTab?: string;
    setActiveTab?: React.Dispatch<React.SetStateAction<string>>;
    /** When set, status/search/assignee/project filters are applied on the server. */
    serverListFilters?: TaskListFiltersInput;
    selectedStatus?: 'all' | TaskStatus;
    setSelectedStatus?: React.Dispatch<React.SetStateAction<'all' | TaskStatus>>;
    searchQuery?: string;
    setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
    selectedAssignee?: string;
    setSelectedAssignee?: React.Dispatch<React.SetStateAction<string>>;
};
export type UseTaskFiltersReturn = {
    // Filter state
    selectedStatus: 'all' | TaskStatus;
    setSelectedStatus: React.Dispatch<React.SetStateAction<'all' | TaskStatus>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    selectedAssignee: string;
    setSelectedAssignee: React.Dispatch<React.SetStateAction<string>>;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    // Sort state
    sortField: SortField;
    setSortField: React.Dispatch<React.SetStateAction<SortField>>;
    sortDirection: SortDirection;
    toggleSortDirection: () => void;
    // View state
    viewMode: 'list' | 'grid' | 'board';
    setViewMode: React.Dispatch<React.SetStateAction<'list' | 'grid' | 'board'>>;
    // Computed values
    tasksForClient: TaskRecord[];
    projectScopedTasks: TaskRecord[];
    filteredTasks: TaskRecord[];
    sortedTasks: TaskRecord[];
    taskCounts: Record<TaskStatus, number>;
    completionRate: number;
    assigneeOptions: string[];
    /** True when list filters (not tab) narrow the result set. */
    hasActiveFilters: boolean;
    /** Reset status, search, and assignee filters (not tab or view mode). */
    resetListFilters: () => void;
    // Handlers
    handleStatusChange: (value: string) => void;
    handleAssigneeChange: (value: string) => void;
};
export function useTaskFilters({ tasks, userId, userName, participants = [], selectedClient, selectedClientId, projectFilterId, projectFilterName, activeTab: controlledActiveTab, setActiveTab: controlledSetActiveTab, serverListFilters, selectedStatus: controlledSelectedStatus, setSelectedStatus: controlledSetSelectedStatus, searchQuery: controlledSearchQuery, setSearchQuery: controlledSetSearchQuery, selectedAssignee: controlledSelectedAssignee, setSelectedAssignee: controlledSetSelectedAssignee, }: UseTaskFiltersOptions): UseTaskFiltersReturn {
    const [selectedStatusInternal, setSelectedStatusInternal] = useState<'all' | TaskStatus>('all');
    const [searchQueryInternal, setSearchQueryInternal] = useState('');
    const [selectedAssigneeInternal, setSelectedAssigneeInternal] = useState('all');
    const selectedStatus = controlledSelectedStatus ?? selectedStatusInternal;
    const setSelectedStatus = controlledSetSelectedStatus ?? setSelectedStatusInternal;
    const searchQuery = controlledSearchQuery ?? searchQueryInternal;
    const setSearchQuery = controlledSetSearchQuery ?? setSearchQueryInternal;
    const selectedAssignee = controlledSelectedAssignee ?? selectedAssigneeInternal;
    const setSelectedAssignee = controlledSetSelectedAssignee ?? setSelectedAssigneeInternal;
    const [activeTabInternal, setActiveTabInternal] = useState('all-tasks');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'board'>(() => getInitialTaskViewMode());
    const activeTab = controlledActiveTab ?? activeTabInternal;
    const setActiveTab = controlledSetActiveTab ?? setActiveTabInternal;
    const toggleSortDirection = () => {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };
    const handleStatusChange = (value: string) => {
        setSelectedStatus(value as 'all' | TaskStatus);
    };
    const handleAssigneeChange = (value: string) => {
        setSelectedAssignee(value);
    };
    const hasActiveFilters = (() => {
        const hasSearch = searchQuery.trim().length > 0;
        const hasAssigneePick = activeTab === 'all-tasks' && selectedAssignee !== 'all';
        return selectedStatus !== 'all' || hasSearch || hasAssigneePick;
    })();
    const resetListFilters = () => {
        setSelectedStatus('all');
        setSearchQuery('');
        setSelectedAssignee('all');
    };
    // Filter tasks by client
    const tasksForClient = (() => {
        if (!selectedClientId && !selectedClient)
            return tasks;
        const normalizedClientName = selectedClient?.name?.toLowerCase() ?? null;
        return tasks.filter((task) => {
            if (selectedClientId) {
                if (task.clientId)
                    return task.clientId === selectedClientId;
                if (normalizedClientName && task.client) {
                    return task.client.toLowerCase() === normalizedClientName;
                }
                return false;
            }
            if (normalizedClientName) {
                return task.client?.toLowerCase() === normalizedClientName;
            }
            return true;
        });
    })();
    // Filter by project (skipped when project filter is applied server-side)
    const projectScopedTasks = (() => {
        if (serverListFilters?.projectId) {
            return tasksForClient;
        }
        if (!projectFilterId && !projectFilterName)
            return tasksForClient;
        const targetId = projectFilterId;
        const targetName = projectFilterName?.toLowerCase() ?? null;
        return tasksForClient.filter((task) => {
            if (targetId && task.projectId === targetId)
                return true;
            if (targetName && task.projectName && task.projectName.toLowerCase() === targetName) {
                return true;
            }
            return false;
        });
    })();
    // Apply list filters (server handles status/search/assignee/project when serverListFilters is set)
    const filteredTasks = (() => {
        if (serverListFilters) {
            return projectScopedTasks;
        }
        return projectScopedTasks.filter((task) => {
            const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
            const title = task.title.toLowerCase();
            const description = (task.description ?? '').toLowerCase();
            const query = searchQuery.toLowerCase();
            const matchesSearch = title.includes(query) || description.includes(query);
            let matchesAssignee = true;
            if (activeTab === 'my-tasks') {
                if (userName || userId) {
                    matchesAssignee = (task.assignedTo ?? []).some((assignee) => (userId ? assignee === userId : false) ||
                        (userName ? assignee.toLowerCase() === userName.toLowerCase() : false));
                }
                else {
                    matchesAssignee = false;
                }
            }
            else {
                matchesAssignee =
                    selectedAssignee === 'all' ||
                        (task.assignedTo ?? []).some((assignee) => {
                            const label = resolveAssigneeLabel(assignee, participants);
                            return (label.toLowerCase().includes(selectedAssignee.toLowerCase()) ||
                                assignee.toLowerCase().includes(selectedAssignee.toLowerCase()));
                        });
            }
            return matchesStatus && matchesSearch && matchesAssignee;
        });
    })();
    // Sort tasks
    const sortedTasks = (() => {
        const sorted = [...filteredTasks];
        sorted.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                case 'status':
                    comparison = TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status);
                    break;
                case 'priority':
                    comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
                    break;
                case 'dueDate': {
                    const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                    const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                    comparison = aDate - bDate;
                    break;
                }
                case 'createdAt':
                    comparison =
                        new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
                    break;
                case 'updatedAt':
                default:
                    comparison =
                        new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime();
                    break;
            }
            return sortDirection === 'desc' ? -comparison : comparison;
        });
        return sorted;
    })();
    // Task counts by status
    const taskCounts = (() => {
        const counts: Record<TaskStatus, number> = {
            todo: 0,
            'in-progress': 0,
            review: 0,
            completed: 0,
            archived: 0,
        };
        projectScopedTasks.forEach((task) => {
            counts[task.status] = (counts[task.status] ?? 0) + 1;
        });
        return counts;
    })();
    // Completion rate
    const completionRate = (() => {
        const total = projectScopedTasks.length;
        if (total === 0)
            return 0;
        return Math.round((taskCounts.completed / total) * 100);
    })();
    // Assignee options
    const assigneeOptions = (() => {
        const options = new Set<string>();
        projectScopedTasks.forEach((task) => {
            (task.assignedTo ?? []).forEach((member) => {
                const label = resolveAssigneeLabel(member, participants);
                if (label && label.trim().length > 0) {
                    options.add(label);
                }
            });
        });
        return Array.from(options).toSorted((a, b) => a.localeCompare(b));
    })();
    const effectiveSelectedAssignee = (() => {
        if (selectedAssignee !== 'all' && !assigneeOptions.includes(selectedAssignee)) {
            return 'all';
        }
        return selectedAssignee;
    })();
    const setViewModePersisted = (mode: 'list' | 'grid' | 'board' | ((current: 'list' | 'grid' | 'board') => 'list' | 'grid' | 'board')) => {
        setViewMode((current) => {
            const resolved = typeof mode === 'function' ? mode(current) : mode;
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(TASK_VIEW_MODE_STORAGE_KEY, resolved);
            }
            return resolved;
        });
    };
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
        setViewMode: setViewModePersisted,
        tasksForClient,
        projectScopedTasks,
        filteredTasks,
        sortedTasks,
        taskCounts,
        completionRate,
        assigneeOptions,
        hasActiveFilters,
        resetListFilters,
        handleStatusChange,
        handleAssigneeChange,
    };
}
