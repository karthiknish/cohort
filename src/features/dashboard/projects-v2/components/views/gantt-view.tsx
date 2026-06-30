'use client';

import { useMemo, useState } from 'react';
import { FolderKanban, Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import type { ProjectRecord } from '@/types/projects';
import type { MilestoneRecord, MilestoneStatus } from '@/types/milestones';
import { MILESTONE_STATUSES } from '@/types/milestones';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { CreateMilestoneDialog } from '@/features/dashboard/projects/create-milestone-dialog';
import { EditMilestoneDialog } from '../edit-milestone-dialog';
import {
  milestoneStatusColor,
  parseDate,
} from '../../utils/project-formatters';
import {
  GanttFeature,
  GanttFeatureList,
  GanttFeatureRow,
  GanttHeader,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
  type GanttStatus,
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
  const allMilestones = Object.values(milestones).flat();
  const loadingSlots = ['loading-1', 'loading-2', 'loading-3', 'loading-4', 'loading-5'];

  const [editingMilestone, setEditingMilestone] = useState<MilestoneRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const milestoneById = useMemo(() => {
    const map = new Map<string, MilestoneRecord>();
    for (const list of Object.values(milestones)) {
      for (const m of list) map.set(m.id, m);
    }
    return map;
  }, [milestones]);

  const handleFeatureClick = (featureId: string) => {
    const milestone = milestoneById.get(featureId);
    if (milestone) {
      setEditingMilestone(milestone);
      setEditDialogOpen(true);
    }
  };

  const handleMove = (featureId: string, startDate: Date, endDate: Date | null) => {
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
          milestones
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

      <div className="h-[70vh] overflow-hidden rounded-md border">
        <GanttProvider range="monthly" zoom={100}>
          <GanttSidebar>
            {projects.map((project) => {
              const projectMilestones = milestones[project.id] ?? [];
              const features = projectMilestones
                .map(milestoneToFeature)
                .filter((f): f is GanttFeature => f !== null);
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
                    <div className="flex items-center justify-between p-2.5 text-xs text-muted-foreground">
                      <span>No milestones</span>
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
                const features = projectMilestones
                  .map(milestoneToFeature)
                  .filter((f): f is GanttFeature => f !== null);
                return (
                  <GanttFeatureRow key={project.id} features={features} onMove={handleMove}>
                    {(feature) => (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 text-left"
                        onClick={() => handleFeatureClick(feature.id)}
                      >
                        <div
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: feature.status.color }}
                        />
                        <p className="flex-1 truncate text-xs font-medium">{feature.name}</p>
                      </button>
                    )}
                  </GanttFeatureRow>
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
    </div>
  );
}

function MilestoneStatusIndicator({ status }: { status: MilestoneStatus }) {
  const indicatorStyle = { backgroundColor: milestoneStatusColor(status) };
  return <span className="size-2 rounded-full" style={indicatorStyle} />;
}
