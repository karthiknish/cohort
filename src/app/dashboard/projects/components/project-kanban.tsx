'use client'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/components/ui/badge'
import { STATUS_ICONS, formatStatusLabel, STATUS_ACCENT_COLORS } from './utils'
import { ProjectCard } from './project-card'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    <div className="space-y-6">
      <ScrollArea className="w-full">
        <div className="flex w-full gap-5 pb-6 pr-4 min-h-[500px]">
          {columns.map(({ status, items }) => {
            return (
              <div key={status} className="group flex min-w-[300px] max-w-[380px] flex-1 flex-col rounded-2xl border bg-muted/10 transition-colors hover:bg-muted/15">
                <div className="flex items-center justify-between gap-2 px-4 py-4.5 border-b border-muted/20">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: STATUS_ACCENT_COLORS[status] }}
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                      {formatStatusLabel(status)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold bg-muted/40 group-hover:bg-muted/60 transition-colors">
                    {items.length}
                  </Badge>
                </div>

                <div className="flex-1 space-y-4 p-4">
                  {items.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-muted/40 bg-background/40 p-4 text-center">
                      <p className="text-xs font-medium text-muted-foreground/60 italic">No projects here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {items.map((project) => (
                        <div key={project.id} className="transition-all duration-200 active:scale-[0.98]">
                          <ProjectCard
                            project={project}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onUpdateStatus={onUpdateStatus}
                            isPendingUpdate={pendingStatusUpdates.has(project.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
