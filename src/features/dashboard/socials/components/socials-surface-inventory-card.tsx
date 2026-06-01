'use client';
import { useMemo } from 'react';
import { CheckCircle2, CopyPlus, RefreshCw } from 'lucide-react';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { Badge } from '@/shared/ui/badge';
import { EmptyState, NetworkErrorEmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { getSurfaceStatusLabel } from './socials-connection-panel-surface-status';
import type { SocialsSurfaceStatus } from './socials-state';
export function SocialsSurfaceInventoryCard(props: {
    title: string;
    connected: boolean;
    loading: boolean;
    error: string | null;
    count: number;
    status: SocialsSurfaceStatus;
    emptyConnectedMessage: string;
    emptyDisconnectedMessage: string;
    onRetry: () => void;
    items: Array<{
        id: string;
        name: string;
        subtitle: string;
    }>;
}) {
    const { title, connected, loading, error, count, status, emptyConnectedMessage, emptyDisconnectedMessage, onRetry, items, } = props;
    const retryDiscoveryAction = ({ label: 'Retry discovery', onClick: onRetry, icon: RefreshCw });
    return (<div className="rounded-2xl border border-muted/50 bg-background p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Badge variant="outline" className={DASHBOARD_THEME.badges.base}>
          {getSurfaceStatusLabel(status, count)}
        </Badge>
      </div>

      {error ? (<NetworkErrorEmptyState variant="card" title={`Unable to load ${title.toLowerCase()}`} description={error} action={retryDiscoveryAction} className="rounded-2xl px-4 py-6"/>) : items.length > 0 ? (<div className="space-y-2">
          {items.slice(0, 3).map((item) => (<div key={item.id} className="rounded-2xl border border-muted/50 bg-muted/[0.04] px-3 py-2">
              <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.subtitle}</p>
            </div>))}
        </div>) : loading ? (<div className="space-y-2">{[0, 1, 2].map((slot) => <Skeleton key={slot} className="h-14 w-full rounded-2xl"/>)}</div>) : (<EmptyState icon={connected ? CheckCircle2 : CopyPlus} title={status === 'source_required' ? `Choose a Meta source to load ${title.toLowerCase()}` : connected ? `No ${title.toLowerCase()} surfaced yet` : `Connect Meta to load ${title.toLowerCase()}`} description={connected ? emptyConnectedMessage : emptyDisconnectedMessage} action={connected && status !== 'source_required' ? retryDiscoveryAction : undefined} variant="card" className="rounded-2xl px-4 py-6"/>)}
    </div>);
}
