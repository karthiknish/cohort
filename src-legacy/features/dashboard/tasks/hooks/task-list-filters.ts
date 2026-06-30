import type { TaskStatus } from '@/types/tasks';
export type TaskListFiltersInput = {
    status?: string;
    searchQuery?: string;
    assigneeUserId?: string;
    assigneeMatch?: string;
    projectId?: string;
};
export function buildTaskListFilters(input: {
    selectedStatus: 'all' | TaskStatus;
    searchQuery: string;
    activeTab: string;
    userId?: string;
    selectedAssignee: string;
    projectId?: string | null;
}): TaskListFiltersInput | undefined {
    const filters: TaskListFiltersInput = {};
    let hasFilters = false;
    if (input.selectedStatus !== 'all') {
        filters.status = input.selectedStatus;
        hasFilters = true;
    }
    const search = input.searchQuery.trim();
    if (search) {
        filters.searchQuery = search;
        hasFilters = true;
    }
    if (input.projectId) {
        filters.projectId = input.projectId;
        hasFilters = true;
    }
    if (input.activeTab === 'my-tasks' && input.userId) {
        filters.assigneeUserId = input.userId;
        hasFilters = true;
    }
    else if (input.selectedAssignee !== 'all') {
        filters.assigneeMatch = input.selectedAssignee;
        hasFilters = true;
    }
    return hasFilters ? filters : undefined;
}
export function taskListFiltersScopeKey(filters: TaskListFiltersInput | undefined): string {
    if (!filters) {
        return '';
    }
    return [
        filters.status ?? '',
        filters.searchQuery ?? '',
        filters.assigneeUserId ?? '',
        filters.assigneeMatch ?? '',
        filters.projectId ?? '',
    ].join('|');
}
