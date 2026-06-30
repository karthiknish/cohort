'use client';
import { ArrowRightLeft, LoaderCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
export function SocialsMetaSourceSwitcherCard(props: {
    title: string;
    description: string;
    selectedMetaAccountId: string;
    selectedSourceLabel: string | null | undefined;
    metaAccountOptions: Array<{
        id: string;
        name: string;
    }>;
    loadingMetaAccountOptions: boolean;
    initializingMeta: boolean;
    onReloadAccounts: () => void;
    onSelectAccount: (accountId: string) => void;
    onConfirmSource: () => void;
    confirmationLabel: string;
}) {
    const { title, description, selectedMetaAccountId, selectedSourceLabel, metaAccountOptions, loadingMetaAccountOptions, initializingMeta, onReloadAccounts, onSelectAccount, onConfirmSource, confirmationLabel, } = props;
    const currentSourceLabel = metaAccountOptions.find((option) => option.id === selectedMetaAccountId)?.name ??
        selectedSourceLabel ??
        null;
    return (<div className="rounded-2xl border border-dashed border-accent/25 bg-accent/[0.03] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={DASHBOARD_THEME.badges.base}>
              Meta source
            </Badge>
            {currentSourceLabel ? (<Badge variant="secondary" className={DASHBOARD_THEME.badges.base}>
                Current: {currentSourceLabel}
              </Badge>) : null}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onReloadAccounts} disabled={loadingMetaAccountOptions}>
          {loadingMetaAccountOptions ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <RefreshCw className="mr-2 size-4"/>}
          Reload sources
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={selectedMetaAccountId} onValueChange={onSelectAccount} disabled={loadingMetaAccountOptions || metaAccountOptions.length === 0}>
          <SelectTrigger className={cn(DASHBOARD_THEME.inputs.base, 'w-full sm:max-w-md')}>
            <SelectValue placeholder={loadingMetaAccountOptions ? 'Loading sources…' : 'Choose a Meta source'}/>
          </SelectTrigger>
          <SelectContent>
            {metaAccountOptions.map((account) => (<SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>))}
          </SelectContent>
        </Select>

        <Button type="button" size="sm" onClick={onConfirmSource} disabled={initializingMeta || !selectedMetaAccountId}>
          {initializingMeta ? <LoaderCircle className="mr-2 size-4 animate-spin"/> : <ArrowRightLeft className="mr-2 size-4"/>}
          {confirmationLabel}
        </Button>
      </div>
    </div>);
}
