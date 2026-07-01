'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Plus,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { ProjectRecord } from '@/types/projects';
import type { MilestoneRecord, MilestoneStatus } from '@/types/milestones';
import { MILESTONE_STATUSES } from '@/types/milestones';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { CreateMilestoneDialog } from '@/features/dashboard/projects/create-milestone-dialog';
import { EditMilestoneDialog } from '../edit-milestone-dialog';
import { cn } from '@/lib/utils';
import {
  milestoneStatusColor,
  parseDate,
} from '../../utils/project-formatters';

export interface CalendarViewProps {
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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalendarEvent = {
  milestone: MilestoneRecord;
  project: ProjectRecord;
  startAt: Date;
  endAt: Date;
};

type ProjectBarEvent = {
  project: ProjectRecord;
  startAt: Date;
  endAt: Date;
};

export function CalendarView({
  projects,
  milestones,
  loading,
  error,
  onRefresh,
  onMilestoneCreated,
  onUpdateMilestone,
}: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => new Date());
  const [editingMilestone, setEditingMilestone] = useState<MilestoneRecord | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const projectById = useMemo(() => {
    const map = new Map<string, ProjectRecord>();
    for (const p of projects) map.set(p.id, p);
    return map;
  }, [projects]);

  const milestoneById = useMemo(() => {
    const map = new Map<string, MilestoneRecord>();
    for (const list of Object.values(milestones)) {
      for (const m of list) map.set(m.id, m);
    }
    return map;
  }, [milestones]);

  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = [];
    for (const project of projects) {
      const projectMilestones = milestones[project.id] ?? [];
      for (const m of projectMilestones) {
        const startAt = parseDate(m.startDate);
        const endAt = parseDate(m.endDate);
        if (!startAt) continue;
        result.push({
          milestone: m,
          project,
          startAt,
          endAt: endAt ?? startAt,
        });
      }
    }
    return result;
  }, [projects, milestones]);

  const projectBars = useMemo<ProjectBarEvent[]>(() => {
    const result: ProjectBarEvent[] = [];
    for (const project of projects) {
      const startAt = parseDate(project.startDate);
      const endAt = parseDate(project.endDate);
      if (!startAt || !endAt) continue;
      result.push({ project, startAt, endAt });
    }
    return result;
  }, [projects]);

  const monthStart = useMemo(() => startOfMonth(cursor), [cursor]);
  const monthEnd = useMemo(() => endOfMonth(cursor), [cursor]);
  const gridStart = useMemo(() => startOfWeek(monthStart), [monthStart]);
  const gridEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd]);
  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      const dayEvents = events.filter(
        (e) => day >= startOfDay(e.startAt) && day <= endOfDayLocal(e.endAt),
      );
      if (dayEvents.length > 0) map.set(key, dayEvents);
    }
    return map;
  }, [days, events]);

  const projectBarsByDay = useMemo(() => {
    const map = new Map<string, ProjectBarEvent[]>();
    for (const day of days) {
      const key = format(day, 'yyyy-MM-dd');
      const dayBars = projectBars.filter(
        (b) => day >= startOfDay(b.startAt) && day <= endOfDayLocal(b.endAt),
      );
      if (dayBars.length > 0) map.set(key, dayBars);
    }
    return map;
  }, [days, projectBars]);

  const handleEventClick = (milestoneId: string) => {
    const milestone = milestoneById.get(milestoneId);
    if (milestone) {
      setEditingMilestone(milestone);
      setEditDialogOpen(true);
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
        {['loading-1', 'loading-2', 'loading-3', 'loading-4', 'loading-5'].map((slot) => (
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
        <h3 className="mt-4 text-lg font-medium text-foreground">No projects to display</h3>
        <p className="mt-1 text-sm text-muted-foreground">Create a project to see it on the calendar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-8" onClick={() => setCursor(addMonths(cursor, -1))} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
          <h3 className="ml-2 text-lg font-semibold text-foreground">{format(cursor, 'MMMM yyyy')}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {MILESTONE_STATUSES.map((status) => (
            <div key={status} className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: milestoneStatusColor(status) }} />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, cursor);
            const today = isToday(day);
            const col = index % 7;
            const isWeekend = col === 0 || col === 6;

            return (
              <div
                key={key}
                className={cn(
                  'min-h-[7rem] border-b border-r p-1.5',
                  !inMonth && 'bg-muted/20',
                  isWeekend && inMonth && 'bg-muted/[0.07]',
                  (index + 1) % 7 === 0 && 'border-r-0',
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-full text-xs font-medium',
                      today
                        ? 'bg-primary text-primary-foreground'
                        : inMonth
                          ? 'text-foreground'
                          : 'text-muted-foreground/50',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {inMonth && dayEvents.length === 0 && (
                    <CreateMilestoneDialog
                      projects={projects}
                      onCreated={onMilestoneCreated}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 opacity-0 transition-opacity hover:opacity-100"
                          aria-label="Add milestone"
                        >
                          <Plus className="size-3" />
                        </Button>
                      }
                    />
                  )}
                </div>
                <div className="space-y-1">
                  {(projectBarsByDay.get(key) ?? []).slice(0, 2).map((bar) => (
                    <div
                      key={`bar-${bar.project.id}`}
                      className="flex items-center gap-1.5 rounded border border-primary/20 bg-primary/8 px-1.5 py-0.5 text-[11px] font-medium text-primary"
                      title={`${bar.project.name} (${format(bar.startAt, 'MMM d')} – ${format(bar.endAt, 'MMM d')})`}
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="truncate">{bar.project.name}</span>
                    </div>
                  ))}
                  {dayEvents.slice(0, 4).map((event) => (
                    <button
                      key={event.milestone.id}
                      type="button"
                      onClick={() => handleEventClick(event.milestone.id)}
                      className={cn(
                        'flex w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[11px] transition-colors hover:bg-secondary',
                        !inMonth && 'opacity-50',
                      )}
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: milestoneStatusColor(event.milestone.status) }}
                      />
                      <span className="truncate font-medium text-foreground">{event.milestone.title}</span>
                    </button>
                  ))}
                  {(projectBarsByDay.get(key) ?? []).length + dayEvents.length > 6 && (
                    <p className="px-1.5 text-[10px] text-muted-foreground">
                      +{(projectBarsByDay.get(key) ?? []).length + dayEvents.length - 6} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDayLocal(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
