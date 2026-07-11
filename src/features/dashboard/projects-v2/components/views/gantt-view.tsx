'use client';

import { useMemo, useState } from 'react';
import { FolderKanban, Pencil, Plus, RefreshCw, TriangleAlert, ZoomIn, ZoomOut } from 'lucide-react';
import type { ProjectRecord } from '@/types/projects';
import type { MilestoneRecord, MilestoneStatus } from '@/types/milestones';
import { MILESTONE_STATUSES } from '@/types/milestones';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { cn } from '@/lib/utils';
import { CreateMilestoneDialog } from '@/features/dashboard/projects/create-milestone-dialog';
import { EditMilestoneDialog } from '../edit-milestone-dialog';
import {
  computeTimelineRange,
  milestoneStatusColor,
  parseDate,
} from '../../utils/project-formatters';
import {
  type GanttFeature,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureRow,
  GanttHeader,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
  type GanttStatus,
  type Range,
} from '@/components/kibo-ui/gantt';

export interface GanttViewProps {
  projects: ProjectRecord[];
  milestones: Record<string, MilestoneRecord[]>;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onMilestoneCreated: (milestone: MilestoneRecord) => void;
  onMilestoneUpdated: (milestone: MilestoneRecord) => void;
  onMoveMilestone: (milestone: MilestoneRecord, startDate: Date, endDate: Date | null) => void;
  onUpdateMilestone: (
    milestone: MilestoneRecord,
    patch: {
      title?: string;
      status?: string;
      description?: string | null;
      startDateMs?: number | null;
      endDateMs?: number | null;
    },
  ) => Promise<void>;
}

const MILESTONE_STATUS_MAP: Record<MilestoneStatus, GanttStatus> = {
  planned: { id: 'planned', name: 'Planned', color: milestoneStatusColor('planned') },
  in_progress: { id: 'in_progress', name: 'In Progress', color: milestoneStatusColor('in_progress') },
  blocked: { id: 'blocked', name: 'Blocked', color: milestoneStatusColor('blocked') },
  completed: { id: 'completed', name: 'Completed', color: milestoneStatusColor('completed') },
};

function milestoneToFeature(milestone: MilestoneRecord): GanttFeature | null {
  const startAt = parseDate(milestone.startDate);
  const endAt = parseDate(milestone.endDate);
  if (!startAt) return null;
  return {
    id: milestone.id,
    name: milestone.title,
    startAt,
    endAt: endAt ?? startAt,
    status: MILESTONE_STATUS_MAP[milestone.status] ?? MILESTONE_STATUS_MAP.planned,
  };
}

const PROJECT_BAR_STATUS: GanttStatus = {
  id: 'project',
  name: 'Project span',
  color: 'hsl(var(--primary))',
};

function projectToFeature(project: ProjectRecord): GanttFeature | null {
  const startAt = parseDate(project.startDate);
  const endAt = parseDate(project.endDate);
  if (!startAt || !endAt) return null;
  return {
    id: `project-bar-${project.id}`,
    name: project.name,
    startAt,
    endAt,
    status: PROJECT_BAR_STATUS,
  };
}

export function GanttView({
  projects,
  milestones,
  loading,
  error,
  onRefresh,
  onMilestoneCreated,
  onMilestoneUpdated,
  onMoveMilestone,
  onUpdateMilestone,
}: GanttViewProps) {
  const loadingSlots = ['loading-1', 'loading-2', 'loading-3', 'loading-4', 'loading-5'];

  const [editingMilestone, setEditingMilestone] = useState<MilestoneRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [range, setRange] = useState<Range>('monthly');

  const allMilestones = useMemo(() => Object.values(milestones).flat(), [milestones]);
  const datedMilestones = useMemo(
    () => allMilestones.filter((m) => parseDate(m.startDate) !== null),
    [allMilestones],
  );
  const undatedMilestones = useMemo(
    () => allMilestones.filter((m) => parseDate(m.startDate) === null),
    [allMilestones],
  );

  const timelineRange = useMemo(
    () => computeTimelineRange(projects, allMilestones),
    [projects, allMilestones],
  );

  const milestoneById = useMemo(() => {
    const map = new Map<string, MilestoneRecord>();
    for (const list of Object.values(milestones)) {
      for (const m of list) map.set(m.id, m);
    }
    return map;
  }, [milestones]);

  const projectById = useMemo(() => {
    const map = new Map<string, ProjectRecord>();
    for (const p of projects) map.set(p.id, p);
    return map;
  }, [projects]);

  const handleFeatureClick = (featureId: string) => {
    if (featureId.startsWith('project-bar-')) return;
    const milestone = milestoneById.get(featureId);
    if (milestone) {
      setEditingMilestone(milestone);
      setEditDialogOpen(true);
    }
  };

  const handleMove = (featureId: string, startDate: Date, endDate: Date | null) => {
    if (featureId.startsWith('project-bar-')) return;
    const milestone = milestoneById.get(featureId);
    if (milestone) {
      onMoveMilestone(milestone, startDate, endDate);
    }
  };

  const handleSaveEdit = async (
    milestone: MilestoneRecord,
    patch: {
      title?: string;
      status?: string;
      description?: string | null;
      startDateMs?: number | null;
      endDateMs?: number | null;
    },
  ) => {
    await onUpdateMilestone(milestone, patch);
  };

  const handleEditUndatedMilestone = (milestone: MilestoneRecord) => {
    setEditingMilestone(milestone);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {loadingSlots.map((slot) => (
          <div key={slot} className="flex items-center gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
        <TriangleAlert className="mx-auto size-10 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRefresh}>
          <RefreshCw className="mr-2 size-4" />
          Refresh data
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
        <FolderKanban className="mx-auto size-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No projects to chart</h3>
        <p className="mt-1 text-sm text-muted-foreground">Create a project to see it on the timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Showing {projects.length} project{projects.length !== 1 ? 's' : ''} with {allMilestones.length}{' '}
          milestone{allMilestones.length !== 1 ? 's' : ''}
          {undatedMilestones.length > 0 && (
            <span className="ml-1 text-warning">
              ({undatedMilestones.length} without {undatedMilestones.length === 1 ? 'a date' : 'dates'})
            </span>
          )}
        </span>
        <div className="flex items-center gap-2 text-xs">
          {MILESTONE_STATUSES.map((status) => (
            <div key={status} className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
              <MilestoneStatusIndicator status={status} />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-0.5">
          <Button
            variant={range === 'daily' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setRange('daily')}
          >
            Daily
          </Button>
          <Button
            variant={range === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setRange('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={range === 'quarterly' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setRange('quarterly')}
          >
            Quarterly
          </Button>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setZoom((z) => Math.max(40, z - 20))}
            disabled={zoom <= 40}
            aria-label="Zoom out"
          >
            <ZoomOut className="size-3.5" />
          </Button>
          <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums">{zoom}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setZoom((z) => Math.min(300, z + 20))}
            disabled={zoom >= 300}
            aria-label="Zoom in"
          >
            <ZoomIn className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="h-[70vh] overflow-hidden rounded-md border">
        <GanttProvider
          key={`gantt-${timelineRange.start.getTime()}-${timelineRange.end.getTime()}`}
          range={range}
          zoom={zoom}
          startDate={timelineRange.start}
          endDate={timelineRange.end}
        >
          <GanttSidebar>
            {projects.map((project) => {
              const projectMilestones = milestones[project.id] ?? [];
              const projectBar = projectToFeature(project);
              const milestoneFeatures = projectMilestones
                .map(milestoneToFeature)
                .filter((f): f is GanttFeature => f !== null);
              const features = projectBar ? [projectBar, ...milestoneFeatures] : milestoneFeatures;
              return (
                <GanttSidebarGroup key={project.id} name={project.name}>
                  {features.length > 0 ? (
                    features.map((feature) => (
                      <GanttSidebarItem
                        key={feature.id}
                        feature={feature}
                        onSelectItem={handleFeatureClick}
                      />
                    ))
                  ) : (
                    <div
                      className="flex items-center justify-between px-2.5 text-xs text-muted-foreground"
                      style={{ height: 'var(--gantt-row-height)' }}
                    >
                      <span>
                        {projectMilestones.length > 0
                          ? 'No milestones with dates'
                          : 'No milestones'}
                      </span>
                      <CreateMilestoneDialog
                        projects={[project]}
                        defaultProjectId={project.id}
                        onCreated={onMilestoneCreated}
                        trigger={
                          <Button variant="ghost" size="icon" className="size-7" aria-label="Add milestone">
                            <Plus className="size-3.5" />
                          </Button>
                        }
                      />
                    </div>
                  )}
                </GanttSidebarGroup>
              );
            })}
          </GanttSidebar>

          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {projects.map((project) => {
                const projectMilestones = milestones[project.id] ?? [];
                const projectBar = projectToFeature(project);
                const milestoneFeatures = projectMilestones
                  .map(milestoneToFeature)
                  .filter((f): f is GanttFeature => f !== null);
                const features = projectBar ? [projectBar, ...milestoneFeatures] : milestoneFeatures;
                return (
                  <GanttFeatureListGroup key={project.id}>
                    <GanttFeatureRow features={features} onMove={handleMove}>
                      {(feature) => {
                        const isProjectBar = feature.id.startsWith('project-bar-');
                        return (
                          <button
                            type="button"
                            className={cn(
                              'flex w-full items-center gap-2 text-left',
                              isProjectBar && 'font-semibold text-primary',
                            )}
                            onClick={() => handleFeatureClick(feature.id)}
                          >
                            <div
                              className={cn('shrink-0 rounded-full', isProjectBar ? 'size-2.5' : 'size-2')}
                              style={{ backgroundColor: feature.status.color }}
                            />
                            <p className="flex-1 truncate text-xs font-medium">
                              {isProjectBar ? 'Project span' : feature.name}
                            </p>
                          </button>
                        );
                      }}
                    </GanttFeatureRow>
                  </GanttFeatureListGroup>
                );
              })}
            </GanttFeatureList>
            <GanttToday className="bg-warning text-warning-foreground" />
          </GanttTimeline>
        </GanttProvider>
      </div>

      <EditMilestoneDialog
        milestone={editingMilestone}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
      />

      {undatedMilestones.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Milestones without dates
            </CardTitle>
            <CardDescription className="text-xs">
              Add a start date to these milestones so they appear on the timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {undatedMilestones.map((milestone) => {
              const project = projectById.get(milestone.projectId);
              return (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{milestone.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {project?.name ?? 'Unknown project'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={`Edit ${milestone.title}`}
                    onClick={() => handleEditUndatedMilestone(milestone)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MilestoneStatusIndicator({ status }: { status: MilestoneStatus }) {
  const indicatorStyle = { backgroundColor: milestoneStatusColor(status) };
  return <span className="size-2 rounded-full" style={indicatorStyle} />;
}
