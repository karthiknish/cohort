'use client'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/shared/ui/badge'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { cn } from '@/lib/utils'

import { ProjectCard } from './project-card'
import { formatStatusLabel, STATUS_DOT_STYLES } from './utils'

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
    <div className="py-2">
      <ScrollArea className="w-full">
        <div className="flex min-h-[28rem] w-full gap-4 pb-4 pr-2">
          {columns.map(({ status, items }) => (
            <div
              key={status}
              className="flex min-w-[17.5rem] max-w-[22rem] flex-1 flex-col rounded-xl border border-border/60 bg-muted/15 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-2.5 rounded-full shadow-sm" style={STATUS_DOT_STYLES[status]} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {formatStatusLabel(status)}
                  </span>
                </div>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold tabular-nums">
                  {items.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-3 p-3">
                {items.length === 0 ? (
                  <div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/60 p-4 text-center">
                    <p className="text-xs font-medium text-muted-foreground">Empty column</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">Change status from the card menu</p>
                  </div>
                ) : (
                  items.map((project) => (
                    <div key={project.id} className={cn('motion-chromatic', 'active:scale-[0.99]')}>
                      <ProjectCard
                        project={project}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onUpdateStatus={onUpdateStatus}
                        isPendingUpdate={pendingStatusUpdates.has(project.id)}
                        compact
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
