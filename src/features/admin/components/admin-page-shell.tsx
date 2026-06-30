'use client';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { PageMotionShell } from '@/shared/components/page-motion-shell';
import { Badge } from '@/shared/ui/badge';
export type AdminPageShellProps = {
    title: string;
    description?: ReactNode;
    /** Toolbar on the right (buttons, dialogs triggers, etc.) */
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    /** Extra classes on the page header block */
    headerClassName?: string;
    isPreviewMode?: boolean;
};
/**
 * Shared admin page chrome: eyebrow, title, optional preview badge, description, actions, then main content.
 */
export function AdminPageShell({ title, description, actions, children, className, headerClassName, isPreviewMode, }: AdminPageShellProps) {
    return (<div className={cn('w-full space-y-6', className)}>
      <header className={cn('flex flex-col gap-3 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between', headerClassName)}>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {isPreviewMode ? (<Badge variant="secondary" className="shrink-0 text-[10px] font-medium uppercase">
                Preview
              </Badge>) : null}
          </div>
          {description ? (<p className="max-w-xl text-sm text-muted-foreground">{description}</p>) : null}
        </div>
        {actions ? (<div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>) : null}
      </header>
      <PageMotionShell reveal={false} className="space-y-6">
        {children}
      </PageMotionShell>
    </div>);
}
