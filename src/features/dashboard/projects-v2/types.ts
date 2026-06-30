import type { ProjectRecord, ProjectStatus, ProjectDetail } from '@/types/projects';
import type { MilestoneRecord } from '@/types/milestones';

// Re-export the canonical types so there is one source of truth.
export type { ProjectRecord, ProjectStatus, ProjectDetail };
export type { MilestoneRecord };

export type StatusFilter = 'all' | ProjectStatus;
export type SortField = 'updatedAt' | 'createdAt' | 'name' | 'status' | 'taskCount';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid' | 'board' | 'gantt';

export type ProjectPageCursor = {
  fieldValue: number;
  legacyId: string;
};

export type PaginatedProjectsResult = {
  items: unknown[];
  nextCursor: ProjectPageCursor | null;
};

export type SavedView = {
  id: string;
  name: string;
  statusFilter: StatusFilter;
  sortField: SortField;
  sortDirection: SortDirection;
  searchQuery: string;
  viewMode: ViewMode;
  createdAt: number;
};

export type ProjectDetailDrawerState = {
  open: boolean;
  projectId: string | null;
};

export type ProjectKanbanDragState = {
  draggedProjectId: string | null;
  draggedSourceStatus: ProjectStatus | null;
  dragOverStatus: ProjectStatus | null;
  boardAnnouncement: string;
};
