'use client';
import { Link } from '@/shared/ui/link';
import { useCallback, useMemo, useState } from 'react';
import { useClientNowMs } from '@/lib/hooks/use-client-relative-time';
import { formatDistanceToNow } from 'date-fns';
import { useConvexAuth, useQuery } from 'convex/react';
import { Bell, CheckSquare, CircleCheck, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { notificationsApi, tasksApi } from '@/lib/convex-api';
import { getPreviewNotifications, getPreviewTasks } from '@/lib/preview-data';
import { cn, getWorkspaceId } from '@/lib/utils';
import type { TaskRecord } from '@/types/tasks';
import type { WorkspaceNotification } from '@/types/notifications';
import { Skeleton } from '@/shared/ui/skeleton';
type WhatsNextTab = 'tasks' | 'updates';
type WhatsNextItem = {
    id: string;
    href: string;
    title: string;
    source: string;
    meta: string;
    pill: string;
    pillVariant: 'default' | 'secondary' | 'warning' | 'destructive' | 'success' | 'info';
    icon: LucideIcon;
    iconClass: string;
    sortMs: number;
};
function mapConvexTask(raw: unknown): TaskRecord | null {
    if (!raw || typeof raw !== 'object')
        return null;
    const r = raw as Record<string, unknown>;
    return {
        id: String(r.legacyId ?? ''),
        title: String(r.title ?? ''),
        description: typeof r.description === 'string' ? r.description : null,
        status: (r.status as TaskRecord['status']) ?? 'todo',
        priority: (r.priority as TaskRecord['priority']) ?? 'medium',
        assignedTo: Array.isArray(r.assignedTo) ? (r.assignedTo as string[]) : [],
        clientId: typeof r.clientId === 'string' ? r.clientId : null,
        client: typeof r.client === 'string' ? r.client : null,
        projectId: typeof r.projectId === 'string' ? r.projectId : null,
        projectName: typeof r.projectName === 'string' ? r.projectName : null,
        dueDate: typeof r.dueDateMs === 'number' ? new Date(r.dueDateMs).toISOString() : null,
        createdAt: typeof r.createdAtMs === 'number' ? new Date(r.createdAtMs).toISOString() : null,
        updatedAt: typeof r.updatedAtMs === 'number' ? new Date(r.updatedAtMs).toISOString() : null,
    };
}
function isOpenTask(task: TaskRecord): boolean {
    return task.status !== 'completed' && task.status !== 'archived';
}
function taskDueMeta(dueDate: string | null | undefined, nowMs: number): {
    label: string;
    pill: string;
    variant: WhatsNextItem['pillVariant'];
    sortMs: number;
} {
    if (!dueDate) {
        return { label: 'No due date', pill: 'TO DO', variant: 'secondary', sortMs: Number.MAX_SAFE_INTEGER };
    }
    const dueMs = Date.parse(dueDate);
    if (!Number.isFinite(dueMs)) {
        return { label: 'No due date', pill: 'TO DO', variant: 'secondary', sortMs: Number.MAX_SAFE_INTEGER };
    }
    const diffMs = dueMs - nowMs;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffMs < 0) {
        return {
            label: diffDays === 0 ? 'Overdue today' : `${Math.abs(diffDays)}d overdue`,
            pill: 'OVERDUE',
            variant: 'destructive',
            sortMs: dueMs,
        };
    }
    if (diffDays === 0) {
        return { label: 'Due today', pill: 'DUE TODAY', variant: 'warning', sortMs: dueMs };
    }
    if (diffDays === 1) {
        return { label: 'Due tomorrow', pill: 'UPCOMING', variant: 'info', sortMs: dueMs };
    }
    return { label: `Due in ${diffDays}d`, pill: 'UPCOMING', variant: 'secondary', sortMs: dueMs };
}
function statusPill(status: TaskRecord['status']): string {
    if (status === 'in-progress')
        return 'IN PROGRESS';
    if (status === 'review')
        return 'IN REVIEW';
    return 'TO DO';
}
function notificationIcon(kind: WorkspaceNotification['kind']): LucideIcon {
    if (kind === 'collaboration.mention' || kind === 'task.mention' || kind === 'task.comment') {
        return MessageSquare;
    }
    if (kind === 'task.created' || kind === 'task.updated') {
        return CircleCheck;
    }
    return Bell;
}
function tasksToItems(tasks: TaskRecord[], nowMs: number): WhatsNextItem[] {
    return tasks.map((task) => {
        const due = taskDueMeta(task.dueDate, nowMs);
        const sourceParts = ['Tasks'];
        if (task.client)
            sourceParts.push(task.client);
        else if (task.projectName)
            sourceParts.push(task.projectName);
        return {
            id: `task-${task.id}`,
            href: `/dashboard/tasks?taskId=${task.id}`,
            title: task.title,
            source: sourceParts.join(' · '),
            meta: due.label,
            pill: task.dueDate && Date.parse(task.dueDate) < nowMs ? due.pill : statusPill(task.status),
            pillVariant: due.variant,
            icon: CheckSquare,
            iconClass: 'bg-sky-50 text-sky-700',
            sortMs: due.sortMs,
        };
    });
}
function notificationsToItems(notifications: WorkspaceNotification[]): WhatsNextItem[] {
    return notifications.map((notification) => {
        const Icon = notificationIcon(notification.kind);
        const createdMs = notification.createdAt ? Date.parse(notification.createdAt) : 0;
        const meta = notification.createdAt
            ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
            : '';
        return {
            id: `notif-${notification.id}`,
            href: notification.navigationUrl ?? '/dashboard/notifications',
            title: notification.title,
            source: notification.body || (notification.actor.name ? `${notification.actor.name}` : 'Workspace'),
            meta,
            pill: notification.read ? 'READ' : 'NEW',
            pillVariant: notification.read ? 'secondary' : 'default',
            icon: Icon,
            iconClass: 'bg-muted text-muted-foreground',
            sortMs: createdMs || 0,
        };
    });
}
function WhatsNextRow({ item }: {
    item: WhatsNextItem;
}) {
    const Icon = item.icon;
    return (<li>
      <Link href={item.href} className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/40">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', item.iconClass)}>
          <Icon className="size-5" aria-hidden/>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.source}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <Badge variant={item.pillVariant} className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            {item.pill}
          </Badge>
          <span className="w-20 text-right text-xs text-muted-foreground">{item.meta}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 sm:hidden">
          <Badge variant={item.pillVariant} className="rounded-md px-1.5 py-0 text-[9px] font-semibold uppercase">
            {item.pill}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{item.meta}</span>
        </div>
      </Link>
    </li>);
}
function TabButton({ active, label, onClick, }: {
    active: boolean;
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
    return (<button type="button" onClick={onClick} className={cn('rounded-md px-3 py-1.5 text-sm font-medium transition-colors', active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground')}>
      {label}
    </button>);
}
export function ForYouWhatsNext() {
    const { user } = useAuth();
    const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const { isPreviewMode } = usePreview();
    const [tab, setTab] = useState<WhatsNextTab>('tasks');
    const nowMs = useClientNowMs();
    const workspaceId = getWorkspaceId(user);
    const canQuery = isAuthenticated && !isConvexLoading && !!workspaceId && !!user?.id;
    const rawTasks = useQuery(tasksApi.listForUser, canQuery ? { workspaceId, userId: user?.id ?? '' } : 'skip') as unknown[] | undefined;
    const liveNotifications = useQuery(notificationsApi.list, canQuery && !isPreviewMode
        ? { workspaceId, pageSize: 15, role: user?.role ?? undefined }
        : 'skip') as {
        notifications?: WorkspaceNotification[];
    } | undefined;
    const taskItems = (() => {
        const tasks = isPreviewMode
            ? getPreviewTasks(null).filter(isOpenTask)
            : (rawTasks ?? []).flatMap((row) => {
                const task = mapConvexTask(row);
                return task && isOpenTask(task) ? [task] : [];
            });
        return tasksToItems(tasks, nowMs).sort((a, b) => a.sortMs - b.sortMs);
    })();
    const updateItems = (() => {
        const notifications = isPreviewMode
            ? getPreviewNotifications(null)
            : (liveNotifications?.notifications ?? []);
        return notificationsToItems(notifications).sort((a, b) => b.sortMs - a.sortMs);
    })();
    const items = tab === 'tasks' ? taskItems : updateItems;
    const loadingTasks = !isPreviewMode && rawTasks === undefined;
    const loadingUpdates = !isPreviewMode && liveNotifications === undefined;
    const loading = tab === 'tasks' ? loadingTasks : loadingUpdates;
    const selectTasksTab = () => setTab('tasks');
    const selectUpdatesTab = () => setTab('updates');
    const handleTasksTabClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        selectTasksTab();
    };
    const handleUpdatesTabClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        selectUpdatesTab();
    };
    return (<section aria-labelledby="for-you-whats-next-heading">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="for-you-whats-next-heading" className="text-base font-semibold text-foreground">
          What&apos;s next
        </h2>
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
          <TabButton active={tab === 'tasks'} label="Tasks" onClick={handleTasksTabClick}/>
          <TabButton active={tab === 'updates'} label="Updates" onClick={handleUpdatesTabClick}/>
        </div>
      </div>

      {loading ? (<div className="space-y-2 rounded-xl border border-border/60 bg-card p-2">
          {['w1', 'w2', 'w3', 'w4', 'w5'].map((key) => (<div key={key} className="flex gap-3 px-2 py-3">
              <Skeleton className="size-10 rounded-lg"/>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4"/>
                <Skeleton className="h-3 w-1/2"/>
              </div>
            </div>))}
        </div>) : items.length === 0 ? (<div className="rounded-xl border border-dashed border-border/60 bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          {tab === 'tasks' ? 'No open tasks assigned to you.' : 'No recent updates.'}
        </div>) : (<ul className="divide-y divide-border/50 rounded-xl border border-border/60 bg-card">
          {items.map((item) => (<WhatsNextRow key={item.id} item={item}/>))}
        </ul>)}
    </section>);
}
