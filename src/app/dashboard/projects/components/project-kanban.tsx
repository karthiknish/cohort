'use client'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/components/ui/badge'
import { STATUS_ICONS, formatStatusLabel } from './utils'
import { ProjectCard } from './project-card'

export interface ProjectKanbanProps {
  projects: ProjectRecord[]
  pendingStatusUpdates: Set<string>
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  onEdit: (project: ProjectRecord) => void
  onDelete: (project: ProjectRecord) => void
}

export function ProjectKanban({ projects, pendingStatusUpdates, onUpdateStatus, onEdit, onDelete }: ProjectKanbanProps) {
  const columns = PROJECT_STATUSES.map((status) => {
    const items = projects.filter((project) => project.status === status)
    return { status, items }
  })

  return (
    <div className="space-y-4 pr-2">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map(({ status, items }) => {
          const StatusIcon = STATUS_ICONS[status]
          return (
            <div key={status} className="flex flex-col gap-3 rounded-md border border-muted/50 bg-muted/10 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <StatusIcon className="h-4 w-4 text-muted-foreground" />
                  {formatStatusLabel(status)}
                </div>
                <Badge variant="outline" className="bg-background text-xs">
                  {items.length}
                </Badge>
              </div>

              {items.length === 0 ? (
                <div className="rounded-md border border-dashed border-muted/50 bg-background px-3 py-6 text-center text-xs text-muted-foreground">
                  No projects in this column
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      onUpdateStatus={onUpdateStatus}
                      isPendingUpdate={pendingStatusUpdates.has(project.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
