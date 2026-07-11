import { CircleCheck, FolderKanban, TriangleAlert } from 'lucide-react';
import { SEMANTIC_COLORS } from '@/lib/colors';
import { formatDateShort } from '@/lib/dates';
import { PROJECT_STATUSES, type ProjectRecord, type ProjectStatus } from '@/types/projects';
import type { StatusFilter } from '../types';

export const formatDate = formatDateShort;

export const STATUS_CLASSES: Record<ProjectStatus, string> = {
  planning: 'bg-muted/50 text-muted-foreground border-muted/40',
  active: 'bg-success/10 text-success border-success/20',
  on_hold: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-info/10 text-info border-info/20',
};

export const STATUS_ACCENT_COLORS: Record<ProjectStatus, string> = {
  planning: 'hsl(var(--muted-foreground))',
  active: 'hsl(var(--success))',
  on_hold: 'hsl(var(--warning))',
  completed: 'hsl(var(--info))',
};

export const STATUS_DOT_STYLES = Object.fromEntries(
  PROJECT_STATUSES.map((status) => [status, { backgroundColor: STATUS_ACCENT_COLORS[status] }]),
) as Record<ProjectStatus, { backgroundColor: string }>;

export const STATUS_ICONS: Record<ProjectStatus, React.ComponentType<{ className?: string }>> = {
  planning: FolderKanban,
  active: CircleCheck,
  on_hold: TriangleAlert,
  completed: CircleCheck,
};

export const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'taskCount', label: 'Task count' },
];

export const STATUS_FILTERS: StatusFilter[] = ['all', ...PROJECT_STATUSES];

export function formatStatusLabel(status: ProjectStatus | StatusFilter): string {
  if (status === 'all') return 'All statuses';
  return status
    .replace('_', ' ')
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export function formatTaskSummary(open: number, total: number): string {
  if (total === 0) return 'Create a task or import from a template';
  if (open === 0) return `${total} tasks • all closed`;
  return `${open} of ${total} open`;
}

export function formatDateRange(start: string | null, end: string | null): string {
  const startLabel = formatDateShort(start);
  const endLabel = formatDateShort(end);
  if (startLabel === '—' && endLabel === '—') return 'Timeline TBA';
  if (startLabel !== '—' && endLabel === '—') return `Started ${startLabel}`;
  if (startLabel === '—' && endLabel !== '—') return `Due ${endLabel}`;
  return `${startLabel} – ${endLabel}`;
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

export function formatShortDate(date: Date): string {
  return SHORT_DATE_FORMATTER.format(date);
}

export function milestoneStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return SEMANTIC_COLORS.status.success;
    case 'in_progress':
      return SEMANTIC_COLORS.status.info;
    case 'blocked':
      return SEMANTIC_COLORS.priority.high;
    default:
      return SEMANTIC_COLORS.status.pending;
  }
}

export function isProjectOverdue(project: Pick<ProjectRecord, 'status' | 'endDate'>): boolean {
  if (project.status === 'completed') return false;
  const end = parseDate(project.endDate);
  if (!end) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end.getTime() < today.getTime();
}

export function computeTimelineRange(
  projects: ProjectRecord[],
  milestones: { startDate?: string | null; endDate?: string | null }[],
) {
  const dates: Date[] = [];
  projects.forEach((project) => {
    const maybeStart = parseDate(project.startDate);
    const maybeEnd = parseDate(project.endDate);
    if (maybeStart) dates.push(maybeStart);
    if (maybeEnd) dates.push(maybeEnd);
  });
  milestones.forEach((milestone) => {
    const maybeStart = parseDate(milestone.startDate);
    const maybeEnd = parseDate(milestone.endDate);
    if (maybeStart) dates.push(maybeStart);
    if (maybeEnd) dates.push(maybeEnd);
  });
  const today = new Date();
  const start = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : today;
  const end = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(today, 30);
  const paddedStart = addDays(start, -7);
  const paddedEnd = addDays(end, 7);
  if (paddedEnd <= paddedStart) {
    return { start: paddedStart, end: addDays(paddedStart, 30) };
  }
  return { start: paddedStart, end: paddedEnd };
}
