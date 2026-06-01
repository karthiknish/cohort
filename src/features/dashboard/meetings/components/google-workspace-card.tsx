import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME, getButtonClasses } from '@/lib/dashboard-theme';
import { GoogleWorkspaceIcon } from './google-workspace-icon';
type GoogleWorkspaceCardProps = {
    connected: boolean;
    canSchedule: boolean;
    loading?: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
};
export function GoogleWorkspaceCard(props: GoogleWorkspaceCardProps) {
    const { connected, canSchedule, loading = false, onConnect, onDisconnect } = props;
    return (<Card className={cn(DASHBOARD_THEME.cards.base, 'flex h-full items-center gap-3 p-4')}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-muted/60 bg-background">
        <GoogleWorkspaceIcon className="size-5"/>
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-base font-semibold leading-tight text-foreground">Google Workspace</p>
          {loading ? (<Badge variant="outline" className="font-normal">
              Checking…
            </Badge>) : connected ? (<Badge variant="secondary" className="font-normal text-emerald-700 dark:text-emerald-400">
              Connected
            </Badge>) : (<Badge variant="outline" className="font-normal">
              Setup required
            </Badge>)}
        </div>
        <p className="text-sm text-muted-foreground text-pretty">
          {loading
            ? 'Checking whether this workspace already has Google Calendar invite support enabled.'
            : 'Connect a Google account to create Calendar invites for native Cohorts meeting rooms.'}
        </p>
      </div>

      <div className="shrink-0">
        {loading ? (<Skeleton className="h-9 w-24 rounded-md"/>) : connected ? (<Button type="button" variant="outline" className={getButtonClasses('outline')} disabled={!canSchedule} onClick={onDisconnect}>
            Manage
          </Button>) : (<Button type="button" className={getButtonClasses('primary')} disabled={!canSchedule} onClick={onConnect}>
            Connect
          </Button>)}
      </div>
    </Card>);
}
