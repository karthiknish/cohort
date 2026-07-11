'use client';
import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter } from '@/shared/ui/navigation';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
import { TASK_STATUSES } from '@/types/tasks';
import type { TaskRecord, TaskStatus, TaskPriority } from '@/types/tasks';
import { PRIORITY_ORDER, resolveAssigneeLabel } from '../task-types';
import type { SortField, SortDirection, TaskParticipant } from '../task-types';
import type { TaskListFiltersInput } from './task-list-filters';
const TASK_VIEW_MODE_STORAGE_KEY = 'dashboard:tasks:view-mode';
const TASK_VIEW_MODE_URL_PARAM = 'view';
const STATUS_ORDER: Record<TaskStatus, number> = Object.fromEntries(TASK_STATUSES.map((status, index) => [status, index])) as Record<TaskStatus, number>;
function getInitialTaskViewMode(): 'list' | 'board' {
    if (typeof window === 'undefined') {
        return 'list';
    }
    // Check URL first
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const fromUrl = urlParams.get(TASK_VIEW_MODE_URL_PARAM);
        if (fromUrl === 'list' || fromUrl === 'board') {
            return fromUrl;
        }
    }
    catch {
        // ignore
    }
    const persisted = window.localStorage.getItem(TASK_VIEW_MODE_STORAGE_KEY);
    if (persisted === 'list' || persisted === 'board') {
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
    selectedPriority?: 'all' | TaskPriority;
    setSelectedPriority?: React.Dispatch<React.SetStateAction<'all' | TaskPriority>>;
};
export type UseTaskFiltersReturn = {
    // Filter state
    selectedStatus: 'all' | TaskStatus;
    setSelectedStatus: React.Dispatch<React.SetStateAction<'all' | TaskStatus>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    selectedAssignee: string;
    setSelectedAssignee: React.Dispatch<React.SetStateAction<string>>;
    selectedPriority: 'all' | TaskPriority;
    setSelectedPriority: React.Dispatch<React.SetStateAction<'all' | TaskPriority>>;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    // Sort state
    sortField: SortField;
    setSortField: React.Dispatch<React.SetStateAction<SortField>>;
    sortDirection: SortDirection;
    toggleSortDirection: () => void;
    // View state
    viewMode: 'list' | 'board';
    setViewMode: React.Dispatch<React.SetStateAction<'list' | 'board'>>;
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
    /** Count of active list filters (for badge display). */
    activeFilterCount: number;
    /** Reset status, search, and assignee filters (not tab or view mode). */
    resetListFilters: () => void;
    // Handlers
    handleStatusChange: (value: string) => void;
    handleAssigneeChange: (value: string) => void;
};
export function useTaskFilters({ tasks, userId, userName, participants = [], selectedClient, selectedClientId, projectFilterId, projectFilterName, activeTab: controlledActiveTab, setActiveTab: controlledSetActiveTab, serverListFilters, selectedStatus: controlledSelectedStatus, setSelectedStatus: controlledSetSelectedStatus, searchQuery: controlledSearchQuery, setSearchQuery: controlledSetSearchQuery, selectedAssignee: controlledSelectedAssignee, setSelectedAssignee: controlledSetSelectedAssignee, selectedPriority: controlledSelectedPriority, setSelectedPriority: controlledSetSelectedPriority, }: UseTaskFiltersOptions): UseTaskFiltersReturn {
    const [selectedStatusInternal, setSelectedStatusInternal] = useState<'all' | TaskStatus>('all');
    const [searchQueryInternal, setSearchQueryInternal] = useState('');
    const [selectedAssigneeInternal, setSelectedAssigneeInternal] = useState('all');
    const [selectedPriorityInternal, setSelectedPriorityInternal] = useState<'all' | TaskPriority>('all');
    const selectedStatus = controlledSelectedStatus ?? selectedStatusInternal;
    const setSelectedStatus = controlledSetSelectedStatus ?? setSelectedStatusInternal;
    const searchQuery = controlledSearchQuery ?? searchQueryInternal;
    const setSearchQuery = controlledSetSearchQuery ?? setSearchQueryInternal;
    const selectedAssignee = controlledSelectedAssignee ?? selectedAssigneeInternal;
    const setSelectedAssignee = controlledSetSelectedAssignee ?? setSelectedAssigneeInternal;
    const selectedPriority = controlledSelectedPriority ?? selectedPriorityInternal;
    const setSelectedPriority = controlledSetSelectedPriority ?? setSelectedPriorityInternal;
    const [activeTabInternal, setActiveTabInternal] = useState('all-tasks');
    const [sortField, setSortField] = useState<SortField>('updatedAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [viewMode, setViewModeState] = useState<'list' | 'board'>(() => getInitialTaskViewMode());
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useUrlSearchParams();
    const setViewMode = useCallback((next: 'list' | 'board') => {
        setViewModeState(next);
        try {
            window.localStorage.setItem(TASK_VIEW_MODE_STORAGE_KEY, next);
        }
        catch {
            // ignore storage errors
        }
        const params = new URLSearchParams(searchParams.toString());
        params.set(TASK_VIEW_MODE_URL_PARAM, next);
        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, [router, pathname, searchParams]);
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
        const hasPriority = selectedPriority !== 'all';
        return selectedStatus !== 'all' || hasSearch || hasAssigneePick || hasPriority;
    })();
    const activeFilterCount = (() => {
        let count = 0;
        if (selectedStatus !== 'all')
            count += 1;
        if (searchQuery.trim().length > 0)
            count += 1;
        if (activeTab === 'all-tasks' && selectedAssignee !== 'all')
            count += 1;
        if (selectedPriority !== 'all')
            count += 1;
        return count;
    })();
    const resetListFilters = () => {
        setSelectedStatus('all');
        setSearchQuery('');
        setSelectedAssignee('all');
        setSelectedPriority('all');
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
    const priorityScopedTasks = (() => {
        if (selectedPriority === 'all')
            return projectScopedTasks;
        return projectScopedTasks.filter((task) => task.priority === selectedPriority);
    })();
    const filteredTasks = (() => {
        if (serverListFilters) {
            return priorityScopedTasks;
        }
        return priorityScopedTasks.filter((task) => {
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
                    comparison = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
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
    const assigneeOptionsSet = new Set(assigneeOptions);
    const effectiveSelectedAssignee = (() => {
        if (selectedAssignee !== 'all' && !assigneeOptionsSet.has(selectedAssignee)) {
            return 'all';
        }
        return selectedAssignee;
    })();
    return {
        selectedStatus,
        setSelectedStatus,
        searchQuery,
        setSearchQuery,
        selectedAssignee,
        setSelectedAssignee,
        selectedPriority,
        setSelectedPriority,
        activeTab,
        setActiveTab,
        sortField,
        setSortField,
        sortDirection,
        toggleSortDirection,
        viewMode,
        setViewMode: setViewMode as React.Dispatch<React.SetStateAction<'list' | 'board'>>,
        tasksForClient,
        projectScopedTasks,
        filteredTasks,
        sortedTasks,
        taskCounts,
        completionRate,
        assigneeOptions,
        hasActiveFilters,
        activeFilterCount,
        resetListFilters,
        handleStatusChange,
        handleAssigneeChange,
    };
}
