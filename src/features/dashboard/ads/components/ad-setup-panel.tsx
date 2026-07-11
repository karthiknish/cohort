'use client';
import type { ReactNode } from 'react';
import { Link } from '@/shared/ui/link';
import { AlertTriangle, CheckCircle2, CircleAlert, Loader2, PlugZap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { cn } from '@/lib/utils';
import { PROVIDER_INFO, PROVIDER_IDS } from '@/features/dashboard/ads/components/constants';
import type { LinkedInAdAccountOption, TikTokAdAccountOption } from '../hooks/ads-connections-types';
type MetaAccountOption = {
    id: string;
    name: string;
    currency: string | null;
    accountStatus: number | null;
    isActive: boolean;
};
export type AdSetupPanelProps = {
    connectedCount: number;
    totalProviders: number;
    googleNeedsAccountSelection: boolean;
    googleSetupMessage: string | null;
    onOpenGoogleSetup: () => void;
    metaSetupMessage: string | null;
    metaNeedsAccountSelection: boolean;
    initializingMeta: boolean;
    onInitializeMeta: () => void;
    metaAccountOptions: MetaAccountOption[];
    selectedMetaAccountId: string;
    onMetaAccountSelectionChange: (accountId: string) => void;
    loadingMetaAccountOptions: boolean;
    onReloadMetaAccountOptions: () => void;
    tiktokSetupMessage: string | null;
    tiktokNeedsAccountSelection: boolean;
    initializingTikTok: boolean;
    onInitializeTikTok: () => void;
    tiktokAccountOptions: TikTokAdAccountOption[];
    selectedTikTokAccountId: string;
    onTikTokAccountSelectionChange: (accountId: string) => void;
    loadingTikTokAccountOptions: boolean;
    onReloadTikTokAccountOptions: () => void;
    linkedinSetupMessage: string | null;
    linkedinNeedsAccountSelection: boolean;
    initializingLinkedIn: boolean;
    onInitializeLinkedIn: () => void;
    linkedinAccountOptions: LinkedInAdAccountOption[];
    selectedLinkedInAccountId: string;
    onLinkedInAccountSelectionChange: (accountId: string) => void;
    loadingLinkedInAccountOptions: boolean;
    onReloadLinkedInAccountOptions: () => void;
    initializingGoogle?: boolean;
};
function SetupTaskRow({ children, done, title, description, }: {
    children?: ReactNode;
    done: boolean;
    title: string;
    description: string;
}) {
    return (<div className={cn('flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between', done ? 'border-success/25 bg-success/5' : 'border-primary/15 bg-primary/[0.03]')}>
      <div className="flex gap-3">
        <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', done ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary')} aria-hidden>
          {done ? <CheckCircle2 className="size-4"/> : <CircleAlert className="size-4"/>}
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children ? <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{children}</div> : null}
    </div>);
}
export function AdSetupPanel({ connectedCount, totalProviders, googleNeedsAccountSelection, googleSetupMessage, onOpenGoogleSetup, metaSetupMessage, metaNeedsAccountSelection, initializingMeta, onInitializeMeta, metaAccountOptions, selectedMetaAccountId, onMetaAccountSelectionChange, loadingMetaAccountOptions, onReloadMetaAccountOptions, tiktokSetupMessage, tiktokNeedsAccountSelection, initializingTikTok, onInitializeTikTok, tiktokAccountOptions, selectedTikTokAccountId, onTikTokAccountSelectionChange, loadingTikTokAccountOptions, onReloadTikTokAccountOptions, linkedinSetupMessage, linkedinNeedsAccountSelection, initializingLinkedIn, onInitializeLinkedIn, linkedinAccountOptions, selectedLinkedInAccountId, onLinkedInAccountSelectionChange, loadingLinkedInAccountOptions, onReloadLinkedInAccountOptions, initializingGoogle = false, }: AdSetupPanelProps) {
    const pendingTasks = [
        googleNeedsAccountSelection,
        metaNeedsAccountSelection,
        tiktokNeedsAccountSelection,
        linkedinNeedsAccountSelection,
    ].filter(Boolean).length;
    const hasSetupWork = pendingTasks > 0 ||
        Boolean(googleSetupMessage) ||
        Boolean(metaSetupMessage) ||
        Boolean(tiktokSetupMessage) ||
        Boolean(linkedinSetupMessage) ||
        initializingMeta ||
        initializingTikTok ||
        initializingLinkedIn ||
        initializingGoogle;
    if (!hasSetupWork && connectedCount >= totalProviders) {
        return null;
    }
    const progressValue = totalProviders > 0 ? Math.round((connectedCount / totalProviders) * 100) : 0;
    return (<Card className={ADS_PAGE_THEME.surfaceCardHighlight}>
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <PlugZap className="size-4 text-primary" aria-hidden/>
              <CardTitle className="text-base">Finish ad account setup</CardTitle>
              {pendingTasks > 0 ? (<Badge variant="secondary" className="font-normal">
                  {pendingTasks} step{pendingTasks === 1 ? '' : 's'} left
                </Badge>) : null}
            </div>
            <CardDescription className="text-pretty">
              {connectedCount === 0
            ? 'Connect a platform below, then complete any account selection steps here.'
            : `${connectedCount} of ${totalProviders} platforms linked. Complete remaining steps to start syncing.`}
            </CardDescription>
          </div>
          <div className="min-w-[10rem] space-y-1.5 sm:text-right">
            <p className="text-xs font-medium text-muted-foreground">
              {connectedCount} / {totalProviders} connected
            </p>
            <Progress value={progressValue} className="h-2" aria-label="Ad platforms connected"/>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {(initializingMeta || initializingTikTok || initializingLinkedIn || initializingGoogle) && !googleNeedsAccountSelection && !metaNeedsAccountSelection && !tiktokNeedsAccountSelection && !linkedinNeedsAccountSelection ? (<Alert className="border-accent/40 bg-accent/5">
            <Loader2 className="size-4 animate-spin text-primary"/>
            <AlertTitle className="text-sm font-semibold">Completing setup…</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Linking your ad account and queuing the first sync. This usually takes a few seconds.
            </AlertDescription>
          </Alert>) : null}

        {googleSetupMessage ? (<Alert variant="destructive">
            <AlertTriangle className="size-4"/>
            <AlertTitle className="text-sm">Google Ads setup issue</AlertTitle>
            <AlertDescription className="text-xs">{googleSetupMessage}</AlertDescription>
            <Button size="sm" variant="outline" className="mt-2" onClick={onOpenGoogleSetup}>
              Open account picker
            </Button>
          </Alert>) : null}

        {googleNeedsAccountSelection && !googleSetupMessage ? (<SetupTaskRow done={false} title="Select your Google Ads account" description="OAuth succeeded — pick which ads account to sync into this workspace.">
            <Button size="sm" onClick={onOpenGoogleSetup} disabled={initializingGoogle}>
              Select account
            </Button>
          </SetupTaskRow>) : null}

        {metaSetupMessage ? (<Alert variant="destructive">
            <AlertTriangle className="size-4"/>
            <AlertTitle className="text-sm">Meta Ads setup issue</AlertTitle>
            <AlertDescription className="text-xs">{metaSetupMessage}</AlertDescription>
            <Button size="sm" variant="outline" className="mt-2" onClick={onInitializeMeta}>
              Try again
            </Button>
          </Alert>) : null}

        {metaNeedsAccountSelection && !metaSetupMessage ? (<SetupTaskRow done={false} title="Select your Meta ad account" description={PROVIDER_INFO[PROVIDER_IDS.FACEBOOK].name +
                ' only — organic Facebook/Instagram pages use Socials, not this flow.'}>
            <>
              <select
                className="h-9 w-full min-w-[12rem] rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
                value={selectedMetaAccountId || ''}
                onChange={(e) => onMetaAccountSelectionChange(e.target.value)}
                disabled={loadingMetaAccountOptions || initializingMeta || metaAccountOptions.length === 0}
                aria-label="Meta ad account"
              >
                <option value="" disabled>
                  {loadingMetaAccountOptions ? 'Loading accounts…' : 'Meta ad account'}
                </option>
                {metaAccountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
                <Button size="sm" variant="outline" onClick={onReloadMetaAccountOptions} disabled={loadingMetaAccountOptions || initializingMeta}>
                  Reload
                </Button>
                <Button size="sm" onClick={onInitializeMeta} disabled={initializingMeta || loadingMetaAccountOptions || !selectedMetaAccountId}>
                  {initializingMeta ? (<>
                      <Loader2 className="mr-2 size-3 animate-spin"/>
                      Finishing…
                    </>) : ('Finish setup')}
                </Button>
            </>
          </SetupTaskRow>) : null}

        {!loadingMetaAccountOptions && metaNeedsAccountSelection && metaAccountOptions.length === 0 && !metaSetupMessage ? (<p className="text-xs text-warning">
            No Meta ad accounts found. Confirm Business Manager access, then reload accounts.
          </p>) : null}

        {tiktokSetupMessage ? (<Alert variant="destructive">
            <AlertTriangle className="size-4"/>
            <AlertTitle className="text-sm">TikTok Ads setup issue</AlertTitle>
            <AlertDescription className="text-xs">{tiktokSetupMessage}</AlertDescription>
            <Button size="sm" variant="outline" className="mt-2" onClick={onInitializeTikTok}>
              Try again
            </Button>
          </Alert>) : null}

        {tiktokNeedsAccountSelection && !tiktokSetupMessage ? (<SetupTaskRow done={false} title="Select your TikTok ad account" description="OAuth succeeded — pick which ad account to sync into this workspace.">
            <>
              <select
                className="h-9 w-full min-w-[12rem] rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
                value={selectedTikTokAccountId || ''}
                onChange={(e) => onTikTokAccountSelectionChange(e.target.value)}
                disabled={loadingTikTokAccountOptions || initializingTikTok || tiktokAccountOptions.length === 0}
                aria-label="TikTok ad account"
              >
                <option value="" disabled>
                  {loadingTikTokAccountOptions ? 'Loading accounts…' : 'TikTok ad account'}
                </option>
                {tiktokAccountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
                <Button size="sm" variant="outline" onClick={onReloadTikTokAccountOptions} disabled={loadingTikTokAccountOptions || initializingTikTok}>
                  Reload
                </Button>
                <Button size="sm" onClick={onInitializeTikTok} disabled={initializingTikTok || loadingTikTokAccountOptions || !selectedTikTokAccountId}>
                  {initializingTikTok ? (<>
                      <Loader2 className="mr-2 size-3 animate-spin"/>
                      Finishing…
                    </>) : ('Finish setup')}
                </Button>
            </>
          </SetupTaskRow>) : null}

        {!loadingTikTokAccountOptions && tiktokNeedsAccountSelection && tiktokAccountOptions.length === 0 && !tiktokSetupMessage ? (<p className="text-xs text-warning">
            No TikTok ad accounts found. Confirm your TikTok Ads access, then reload accounts.
          </p>) : null}

        {linkedinSetupMessage ? (<Alert variant="destructive">
            <AlertTriangle className="size-4"/>
            <AlertTitle className="text-sm">LinkedIn Ads setup issue</AlertTitle>
            <AlertDescription className="text-xs">{linkedinSetupMessage}</AlertDescription>
            <Button size="sm" variant="outline" className="mt-2" onClick={onInitializeLinkedIn}>
              Try again
            </Button>
          </Alert>) : null}

        {linkedinNeedsAccountSelection && !linkedinSetupMessage ? (<SetupTaskRow done={false} title="Select your LinkedIn ad account" description="OAuth succeeded — pick which ad account to sync into this workspace.">
            <>
              <select
                className="h-9 w-full min-w-[12rem] rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:max-w-xs"
                value={selectedLinkedInAccountId || ''}
                onChange={(e) => onLinkedInAccountSelectionChange(e.target.value)}
                disabled={loadingLinkedInAccountOptions || initializingLinkedIn || linkedinAccountOptions.length === 0}
                aria-label="LinkedIn ad account"
              >
                <option value="" disabled>
                  {loadingLinkedInAccountOptions ? 'Loading accounts…' : 'LinkedIn ad account'}
                </option>
                {linkedinAccountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
                <Button size="sm" variant="outline" onClick={onReloadLinkedInAccountOptions} disabled={loadingLinkedInAccountOptions || initializingLinkedIn}>
                  Reload
                </Button>
                <Button size="sm" onClick={onInitializeLinkedIn} disabled={initializingLinkedIn || loadingLinkedInAccountOptions || !selectedLinkedInAccountId}>
                  {initializingLinkedIn ? (<>
                      <Loader2 className="mr-2 size-3 animate-spin"/>
                      Finishing…
                    </>) : ('Finish setup')}
                </Button>
            </>
          </SetupTaskRow>) : null}

        {!loadingLinkedInAccountOptions && linkedinNeedsAccountSelection && linkedinAccountOptions.length === 0 && !linkedinSetupMessage ? (<p className="text-xs text-warning">
            No LinkedIn ad accounts found. Confirm your LinkedIn Ads access, then reload accounts.
          </p>) : null}

        {connectedCount === 0 ? (<p className="text-xs text-muted-foreground">
            Tip: connect Google, Meta, LinkedIn, and TikTok from the cards below. Each uses a secure
            redirect to the platform - you&apos;ll return here to finish setup.
          </p>) : null}

        <p className="text-xs text-muted-foreground">
          Organic social (Facebook/Instagram pages) lives on{' '}
          <Link href="/dashboard/socials" className="font-medium text-primary underline-offset-4 hover:underline">
            Socials
          </Link>
          , separate from Meta Ads above.
        </p>
      </CardContent>
    </Card>);
}
