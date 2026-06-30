'use client';

import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { ProjectCard } from '../project-card';

export interface GridViewProps {
  projects: ProjectRecord[];
  pendingStatusUpdates: Set<string>;
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
  onEdit: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
  onViewDetails?: (project: ProjectRecord) => void;
}

export function GridView({
  projects,
  pendingStatusUpdates,
  onUpdateStatus,
  onEdit,
  onDelete,
  onViewDetails,
}: GridViewProps) {
  return (
    <div className="space-y-3 py-2">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
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
    </div>
  );
}
