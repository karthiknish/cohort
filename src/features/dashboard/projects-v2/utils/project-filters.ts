import { PROJECT_STATUSES, type ProjectRecord, type ProjectStatus } from '@/types/projects';
import type { ProjectPageCursor, PaginatedProjectsResult, SortField, SortDirection, StatusFilter } from '../types';

const OPEN_TASK_STATUSES = new Set(['todo', 'in-progress', 'review']);

export function isOpenTaskStatus(status: unknown): boolean {
  return typeof status === 'string' && OPEN_TASK_STATUSES.has(status);
}

export function projectMatchesQuery(
  project: Pick<ProjectRecord, 'name' | 'description' | 'clientName' | 'tags'>,
  rawQuery: string,
): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  return (
    project.name.toLowerCase().includes(query) ||
    project.description?.toLowerCase().includes(query) === true ||
    project.clientName?.toLowerCase().includes(query) === true ||
    project.tags.some((tag) => tag.toLowerCase().includes(query))
  );
}

export function projectMatchesContext(
  project: Pick<ProjectRecord, 'id' | 'name'>,
  projectId?: string | null,
  projectName?: string | null,
): boolean {
  if (!projectId && !projectName) return true;
  const normalizedProjectName = projectName?.trim().toLowerCase() ?? '';
  const matchesId = projectId ? project.id === projectId : false;
  const matchesName = normalizedProjectName
    ? project.name.trim().toLowerCase() === normalizedProjectName
    : false;
  return matchesId || matchesName;
}

export function filterProjectsByQuery<
  T extends Pick<ProjectRecord, 'name' | 'description' | 'clientName' | 'tags'>,
>(projects: T[], rawQuery: string): T[] {
  const query = rawQuery.trim();
  if (!query) return projects;
  return projects.filter((project) => projectMatchesQuery(project, query));
}

export function sortProjects(
  projects: ProjectRecord[],
  sortField: SortField,
  sortDirection: SortDirection,
): ProjectRecord[] {
  const sorted = [...projects];
  sorted.sort((left, right) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = left.name.localeCompare(right.name);
        break;
      case 'status':
        comparison = PROJECT_STATUSES.indexOf(left.status) - PROJECT_STATUSES.indexOf(right.status);
        break;
      case 'taskCount':
        comparison = left.taskCount - right.taskCount;
        break;
      case 'createdAt':
        comparison = new Date(left.createdAt ?? 0).getTime() - new Date(right.createdAt ?? 0).getTime();
        break;
      default:
        comparison = new Date(left.updatedAt ?? 0).getTime() - new Date(right.updatedAt ?? 0).getTime();
        break;
    }
    return sortDirection === 'desc' ? -comparison : comparison;
  });
  return sorted;
}

export function buildTaskCountsByProject(
  tasks: Array<{ projectId?: string | null; status?: unknown }>,
): Record<string, { taskCount: number; openTaskCount: number }> {
  const counts: Record<string, { taskCount: number; openTaskCount: number }> = {};
  for (const task of tasks) {
    const projectId = typeof task.projectId === 'string' ? task.projectId : null;
    if (!projectId) continue;
    const entry = counts[projectId] ?? { taskCount: 0, openTaskCount: 0 };
    entry.taskCount += 1;
    if (isOpenTaskStatus(task.status)) entry.openTaskCount += 1;
    counts[projectId] = entry;
  }
  return counts;
}

export function mergeProjectTaskCounts(
  project: ProjectRecord,
  counts: Record<string, { taskCount: number; openTaskCount: number }>,
): ProjectRecord {
  const stats = counts[project.id];
  if (!stats) return project;
  return { ...project, taskCount: stats.taskCount, openTaskCount: stats.openTaskCount };
}

export function computeStatusCounts(projects: ProjectRecord[]): Record<ProjectStatus, number> {
  return projects.reduce<Record<ProjectStatus, number>>(
    (accumulator, project) => {
      accumulator[project.status] = (accumulator[project.status] ?? 0) + 1;
      return accumulator;
    },
    { planning: 0, active: 0, on_hold: 0, completed: 0 },
  );
}

export function computeCompletionRate(projects: ProjectRecord[], statusCounts: Record<ProjectStatus, number>): number {
  if (projects.length === 0) return 0;
  return Math.round((statusCounts.completed / projects.length) * 100);
}

export function hasActiveFilterState(
  statusFilter: StatusFilter,
  searchQuery: string,
  focusedProjectId: string | null,
  focusedProjectName: string | null,
): boolean {
  return (
    statusFilter !== 'all' ||
    searchQuery.trim().length > 0 ||
    Boolean(focusedProjectId || focusedProjectName)
  );
}

// Pagination helpers

export const PROJECTS_PAGE_SIZE = 50;

export function sortProjectsByUpdatedAt(projects: ProjectRecord[]): ProjectRecord[] {
  return projects.toSorted((left, right) => {
    const leftMs = left.updatedAt ? Date.parse(left.updatedAt) : 0;
    const rightMs = right.updatedAt ? Date.parse(right.updatedAt) : 0;
    return rightMs - leftMs;
  });
}

export function mergeProjectPages(firstPage: ProjectRecord[], olderPages: ProjectRecord[]): ProjectRecord[] {
  const byId = new Map<string, ProjectRecord>();
  for (const project of firstPage) byId.set(project.id, project);
  for (const project of olderPages) {
    if (!byId.has(project.id)) byId.set(project.id, project);
  }
  return sortProjectsByUpdatedAt(Array.from(byId.values()));
}

export function parsePaginatedProjectsQuery(value: unknown): PaginatedProjectsResult | null {
  if (!value || typeof value !== 'object') return null;
  if (!Array.isArray((value as { items?: unknown }).items)) return null;
  const nextCursor = (value as { nextCursor?: unknown }).nextCursor;
  const parsedCursor =
    nextCursor &&
    typeof nextCursor === 'object' &&
    typeof (nextCursor as ProjectPageCursor).fieldValue === 'number' &&
    typeof (nextCursor as ProjectPageCursor).legacyId === 'string'
      ? (nextCursor as ProjectPageCursor)
      : null;
  return {
    items: (value as { items: unknown[] }).items,
    nextCursor: parsedCursor,
  };
}

// Kanban helpers

export function resolveProjectKanbanMoveTarget(
  currentStatus: ProjectStatus,
  direction: 'previous' | 'next',
): ProjectStatus | null {
  const currentIndex = PROJECT_STATUSES.indexOf(currentStatus);
  if (currentIndex < 0) return null;
  return direction === 'previous'
    ? (PROJECT_STATUSES[currentIndex - 1] ?? null)
    : (PROJECT_STATUSES[currentIndex + 1] ?? null);
}

export function canDragProjectKanbanCard(project: ProjectRecord, pendingStatusUpdates: Set<string>): boolean {
  return !pendingStatusUpdates.has(project.id) && project.deletedAt == null;
}
