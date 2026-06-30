'use client';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { SvglBrandLogo } from '@/shared/components/svgl-brand-logo';
import { cn } from '@/lib/utils';
import { DASHBOARD_THEME } from '@/lib/dashboard-theme';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
type SocialsPagePickerProps = {
    pages: Array<{
        id: string;
        name: string;
        instagramBusinessName: string | null;
    }>;
    selectedPageId: string;
    loading: boolean;
    confirming: boolean;
    error: string | null;
    setupComplete: boolean;
    instagramBusinessName?: string | null;
    onSelectPage: (pageId: string) => void;
    onConfirm: () => void;
    onReload: () => void;
};
export function SocialsPagePicker({ pages, selectedPageId, loading, confirming, error, setupComplete, instagramBusinessName, onSelectPage, onConfirm, onReload, }: SocialsPagePickerProps) {
    const selected = pages.find((p) => p.id === selectedPageId);
    const linkedIg = selected?.instagramBusinessName ?? instagramBusinessName;
    return (<div className="rounded-2xl border border-dashed border-info/25 bg-info/[0.03] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold tracking-tight text-foreground">Facebook Page</h4>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {setupComplete
            ? `Reporting from ${selected?.name ?? 'your selected Page'}. Switch below if this workspace should track a different Page.`
            : 'Choose the Page for this workspace. When Meta links a business Instagram account, it appears on the Instagram tab automatically.'}
          </p>
        </div>
        {linkedIg ? (<div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-foreground">
            <SvglBrandLogo brand="instagram" className="size-4 shrink-0" labeled={false}/>
            <span>
              Linked IG · <span className="font-medium">@{linkedIg}</span>
            </span>
          </div>) : null}
      </div>

      {error ? (<Alert variant="destructive" className="mt-4">
          <AlertTitle>Could not load Pages</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={selectedPageId} onValueChange={onSelectPage} disabled={loading || pages.length === 0}>
          <SelectTrigger className={cn(DASHBOARD_THEME.inputs.base, 'w-full sm:max-w-md')}>
            <SelectValue placeholder={loading ? 'Loading Pages…' : 'Choose a Facebook Page'}/>
          </SelectTrigger>
          <SelectContent>
            {pages.map((page) => (<SelectItem key={page.id} value={page.id}>
                {page.name}
                {page.instagramBusinessName ? ` · @${page.instagramBusinessName}` : ''}
              </SelectItem>))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onConfirm} disabled={confirming || !selectedPageId || loading}>
            {confirming ? <LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden/> : null}
            {setupComplete ? 'Update Page' : 'Confirm Page'}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onReload} disabled={loading}>
            {loading ? (<LoaderCircle className="mr-2 size-4 animate-spin" aria-hidden/>) : (<RefreshCw className="mr-2 size-4" aria-hidden/>)}
            Reload Pages
          </Button>
        </div>
      </div>
    </div>);
}
