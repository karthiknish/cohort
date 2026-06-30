'use client';

import { Link } from '@/shared/ui/link';
import { useMemo } from 'react';
import {
  Calendar,
  Eye,
  ListChecks,
  LoaderCircle,
  MessageSquare,
  Pencil,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import type { MilestoneRecord } from '@/types/milestones';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { PROJECT_STATUSES } from '@/types/projects';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { buildProjectTasksRoute } from '@/lib/project-routes';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '../../collaboration/utils';
import { ProjectTaskProgress } from './project-task-progress';
import {
  STATUS_ACCENT_COLORS,
  STATUS_CLASSES,
  STATUS_ICONS,
  formatDate,
  formatDateRange,
  formatStatusLabel,
  isProjectOverdue,
  milestoneStatusColor,
  parseDate,
} from '../utils/project-formatters';

export interface ProjectDetailDrawerProps {
  project: ProjectRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: ProjectRecord) => void;
  onDelete: (project: ProjectRecord) => void;
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
  milestones?: MilestoneRecord[];
  pendingStatusUpdate?: boolean;
}

export function ProjectDetailDrawer({
  project,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onUpdateStatus,
  milestones,
  pendingStatusUpdate,
}: ProjectDetailDrawerProps) {
  const tasksHref = project
    ? buildProjectTasksRoute({
        projectId: project.id,
        projectName: project.name,
        clientId: project.clientId,
        clientName: project.clientName,
      })
    : '#';
  const collaborationHref = project
    ? `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
    : '#';

  const sortedMilestones = useMemo(() => {
    if (!milestones) return [];
    return [...milestones].sort((a, b) => {
      const aDate = parseDate(a.startDate)?.getTime() ?? 0;
      const bDate = parseDate(b.startDate)?.getTime() ?? 0;
      return aDate - bDate;
    });
  }, [milestones]);

  if (!project) return null;

  const StatusIcon = STATUS_ICONS[project.status];
  const overdue = isProjectOverdue(project);

  const statusAccentStyles = Object.fromEntries(
    Object.entries(STATUS_ACCENT_COLORS).map(([status, backgroundColor]) => [
      status,
      { backgroundColor },
    ]),
  ) as Record<ProjectStatus, { backgroundColor: string }>;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex size-full flex-col border-l border-border/70 bg-card p-0 shadow-xl sm:max-w-lg">
        <SheetHeader className="shrink-0 space-y-2 border-b border-border/60 bg-gradient-to-br from-card via-card to-muted/25 p-5 pr-12">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                STATUS_CLASSES[project.status],
              )}
            >
              <StatusIcon className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <SheetTitle className="text-lg font-semibold leading-tight">{project.name}</SheetTitle>
              <SheetDescription className="text-xs">
                {project.clientName ? (
                  project.clientId ? (
                    <Link
                      href={`/dashboard/clients?clientId=${project.clientId}`}
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {project.clientName}
                    </Link>
                  ) : (
                    project.clientName
                  )
                ) : (
                  'No client assigned'
                )}
              </SheetDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn(STATUS_CLASSES[project.status], 'h-6 gap-1.5 border px-2 py-0')}>
              {pendingStatusUpdate ? (
                <LoaderCircle className="size-3 animate-spin" />
              ) : (
                <StatusIcon className="size-3" />
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {formatStatusLabel(project.status)}
              </span>
            </Badge>
            {overdue ? (
              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[10px]">
                Overdue
              </Badge>
            ) : null}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-5">
            {/* Description */}
            {project.description ? (
              <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </h3>
                <p className="text-sm leading-relaxed text-foreground/90">{project.description}</p>
              </section>
            ) : null}

            {/* Task progress */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Task progress
              </h3>
              <ProjectTaskProgress project={project} />
            </section>

            {/* Timeline */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Timeline
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                {formatDateRange(project.startDate, project.endDate)}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-muted-foreground/70">Start date</p>
                  <p className="mt-0.5 text-foreground">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground/70">End date</p>
                  <p className="mt-0.5 text-foreground">{formatDate(project.endDate)}</p>
                </div>
              </div>
            </section>

            {/* Tags */}
            {project.tags.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="inline-flex h-6 items-center gap-1 px-2 text-[11px] font-medium"
                    >
                      <Tag className="size-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Status changer */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Change status
              </h3>
              <div className="flex flex-wrap gap-2">
                {PROJECT_STATUSES.map((status) => {
                  const isActive = project.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      disabled={isActive || pendingStatusUpdate}
                      onClick={() => onUpdateStatus(project, status)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isActive
                          ? 'border-primary/30 bg-primary/8 text-foreground shadow-sm'
                          : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground',
                        pendingStatusUpdate && 'opacity-50',
                      )}
                      aria-pressed={isActive}
                    >
                      <span className="size-2 rounded-full" style={statusAccentStyles[status]} />
                      {formatStatusLabel(status)}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Milestones */}
            {sortedMilestones.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Milestones ({sortedMilestones.length})
                </h3>
                <div className="space-y-2">
                  {sortedMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: milestoneStatusColor(milestone.status) }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{milestone.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateRange(milestone.startDate, milestone.endDate)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {milestone.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Metadata */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-muted-foreground/70">Created</p>
                  <p className="mt-0.5 text-foreground tabular-nums">{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground/70">Last updated</p>
                  <p className="mt-0.5 text-foreground tabular-nums">{formatDate(project.updatedAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground/70">Recent activity</p>
                  <p className="mt-0.5 text-foreground">
                    {project.recentActivityAt ? formatRelativeTime(project.recentActivityAt) : 'No activity'}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Quick actions */}
            <section className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" className="h-9 gap-2 text-xs">
                  <Link href={tasksHref} prefetch>
                    <ListChecks className="size-4" />
                    View tasks
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-9 gap-2 text-xs">
                  <Link href={collaborationHref} prefetch>
                    <MessageSquare className="size-4" />
                    Discussion
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-xs"
                  onClick={() => onEdit(project)}
                >
                  <Pencil className="size-4" />
                  Edit project
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
