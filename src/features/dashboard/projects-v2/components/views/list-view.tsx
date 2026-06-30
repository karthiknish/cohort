'use client';

import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { ProjectRow } from '../project-row';

export interface ListViewProps {
  projects: ProjectRecord[];
  pendingStatusUpdates: Set<string>;
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
  onEdit: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
  onViewDetails?: (project: ProjectRecord) => void;
}

export function ListView({
  projects,
  pendingStatusUpdates,
  onUpdateStatus,
  onEdit,
  onDelete,
  onViewDetails,
}: ListViewProps) {
  return (
    <div className="space-y-3 py-2">
      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdateStatus={onUpdateStatus}
          onViewDetails={onViewDetails}
          isPendingUpdate={pendingStatusUpdates.has(project.id)}
        />
      ))}
    </div>
  );
}
