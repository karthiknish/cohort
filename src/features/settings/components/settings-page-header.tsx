'use client';
import type { ReactNode } from 'react';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/badge';
type SettingsPageHeaderProps = {
    isPreviewMode?: boolean;
    className?: string;
    children?: ReactNode;
};
export function SettingsPageHeader({ isPreviewMode, className, children }: SettingsPageHeaderProps) {
    return (<header className={cn('flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-primary shadow-sm">
          <Settings2 className="size-5" aria-hidden/>
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 id="settings-heading" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Settings
            </h1>
            {isPreviewMode ? (<Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
                Preview
              </Badge>) : null}
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Manage your profile, notifications, and account preferences for this workspace.
          </p>
        </div>
      </div>
      {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
    </header>);
}
