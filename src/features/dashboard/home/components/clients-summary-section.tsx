'use client';
import { Link } from '@/shared/ui/link';
import { useCallback, useMemo } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { ArrowUpRight, Briefcase, CheckSquare, Megaphone, Video, } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { clientsApi } from '@/lib/convex-api';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { getPreviewClientSummaries } from '@/lib/preview-data';
import { cn, getWorkspaceId } from '@/lib/utils';
type ClientSummary = {
    legacyId: string;
    name: string;
    accountManager: string;
    teamMembersCount: number;
    openTaskCount: number;
    activeProjectCount: number;
    nextMeetingMs: number | null;
};
function formatNextMeeting(ms: number | null): string {
    if (!ms)
        return 'None scheduled';
    const date = new Date(ms);
    const now = new Date();
    // Same day
    if (date.toDateString() === now.toDateString()) {
        return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // Tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function getInitials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}
// Deterministic color assignment — uses same tokens as badge semantic variants
const AVATAR_COLORS = [
    'bg-success/10 text-success',
    'bg-warning/10 text-warning',
    'bg-info/10 text-info',
    'bg-secondary/80 text-foreground',
];
function avatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
    return color ?? 'bg-muted/50 text-muted-foreground';
}
function ClientSummaryCard({ client }: {
    client: ClientSummary;
}) {
    const { selectClient } = useClientContext();
    const handleNavigate = () => {
        selectClient(client.legacyId);
    };
    const hasMeeting = client.nextMeetingMs !== null;
    const meetingLabel = formatNextMeeting(client.nextMeetingMs);
    return (<div className="group flex flex-col rounded-2xl border border-border/70 bg-background/80 shadow-sm transition-all hover:border-border hover:shadow-md">
      {/* Card header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold shadow-md ring-1 ring-foreground/10', avatarColor(client.name))}>
          {getInitials(client.name)}
        </div>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={handleNavigate} className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary">
            {client.name}
          </button>
          <p className="truncate text-xs text-muted-foreground">{client.accountManager}</p>
        </div>
        <Link href={`/dashboard/clients?clientId=${client.legacyId}`} onClick={handleNavigate} className="shrink-0 rounded-lg p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted" title="Open client dashboard">
          <ArrowUpRight className="size-4 text-muted-foreground"/>
        </Link>
      </div>

      {/* Metrics row */}
      <div className="mx-4 mb-3 grid grid-cols-3 divide-x divide-border/60 rounded-xl border border-border/50 bg-muted/30">
        <div className="flex flex-col items-center p-2.5">
          <span className="text-base font-semibold tabular-nums text-foreground">{client.openTaskCount}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Tasks</span>
        </div>
        <div className="flex flex-col items-center p-2.5">
          <span className="text-base font-semibold tabular-nums text-foreground">{client.activeProjectCount}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Projects</span>
        </div>
        <div className="flex flex-col items-center p-2.5">
          <span className="flex items-center gap-1">
            <span className={cn('size-1.5 rounded-full', hasMeeting ? 'bg-success' : 'bg-muted-foreground/40')}/>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {hasMeeting ? 'Has meeting' : 'No meeting'}
            </span>
          </span>
          <span className="mt-0.5 truncate text-[10px] text-muted-foreground" title={meetingLabel}>
            {hasMeeting ? meetingLabel : '—'}
          </span>
        </div>
      </div>

      {/* Quick-nav buttons */}
      <div className="mt-auto flex items-center gap-1 border-t border-border/50 p-3">
        <Link href={`/dashboard/projects?clientId=${client.legacyId}`} onClick={handleNavigate} title="Projects" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          <Briefcase className="size-3.5"/>
          <span>Projects</span>
        </Link>
        <Link href={`/dashboard/tasks?clientId=${client.legacyId}`} onClick={handleNavigate} title="Tasks" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          <CheckSquare className="size-3.5"/>
          <span>Tasks</span>
        </Link>
        <Link href={`/dashboard/meetings?clientId=${client.legacyId}`} onClick={handleNavigate} title="Meetings" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          <Video className="size-3.5"/>
          <span>Meetings</span>
        </Link>
        <Link href={`/dashboard/ads?clientId=${client.legacyId}`} onClick={handleNavigate} title="Ads" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
          <Megaphone className="size-3.5"/>
          <span>Ads</span>
        </Link>
      </div>
    </div>);
}
const SKELETON_KEYS = ['skeleton-a', 'skeleton-b', 'skeleton-c', 'skeleton-d'] as const;
function ClientCardSkeleton() {
    return (<div className="flex flex-col rounded-2xl border border-border/50 bg-background/80 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-xl"/>
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4"/>
          <Skeleton className="h-3 w-1/2"/>
        </div>
      </div>
      <Skeleton className="mt-3 h-14 rounded-xl"/>
      <Skeleton className="mt-3 h-5 w-24 rounded-full"/>
      <Skeleton className="mt-3 h-9 rounded-lg"/>
    </div>);
}
export function ClientsSummarySection() {
    const { user } = useAuth();
    const { clients } = useClientContext();
    const { isPreviewMode } = usePreview();
    const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const workspaceId = getWorkspaceId(user);
    const canQuery = isAuthenticated && !isConvexLoading && !!workspaceId;
    const shouldUsePreviewData = isPreviewMode || !canQuery;
    const summaries = useQuery(clientsApi.getClientSummaries, shouldUsePreviewData ? 'skip' : { workspaceId }) as ClientSummary[] | undefined;
    const summariesError = useConvexQueryError({ data: summaries, skipped: shouldUsePreviewData, fallbackMessage: 'Unable to load client summaries.' });
    const resolvedSummaries = shouldUsePreviewData
        ? getPreviewClientSummaries()
        : summaries ?? [];
    const showEmptySummaries = !shouldUsePreviewData && summaries !== undefined && summaries.length === 0;
    const isLoading = !shouldUsePreviewData && summaries === undefined;
    return (<Card className={DASHBOARD_THEME.cards.base}>
      <CardHeader className={cn(DASHBOARD_THEME.cards.header, 'pb-4')}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-base">All clients</CardTitle>
            <CardDescription>
              Live snapshot across every client workspace: tasks, projects, and upcoming meetings.
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="w-fit">
            <Link href="/admin/clients">Manage clients</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {summariesError ? (<Alert variant="destructive"><AlertDescription>{summariesError}</AlertDescription></Alert>) : isLoading ? (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SKELETON_KEYS.map((k) => (<ClientCardSkeleton key={k}/>))}
          </div>) : resolvedSummaries.length === 0 ? (<div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {showEmptySummaries && clients.length > 0
                ? 'Client summaries are not available yet. Open a client workspace or try again shortly.'
                : (<>
                  No clients yet.{' '}
                  <Link href="/admin/clients" className="font-medium text-primary hover:underline">
                    Add your first client
                  </Link>{' '}
                  to get started.
                </>)}
          </div>) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {resolvedSummaries.map((client) => (<ClientSummaryCard key={client.legacyId} client={client}/>))}
          </div>)}
      </CardContent>
    </Card>);
}
