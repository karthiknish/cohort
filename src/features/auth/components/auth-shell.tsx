'use client';
import type { ReactNode } from 'react';
import { SiteLogo } from '@/shared/components/site-logo';
import { cn } from '@/lib/utils';
type AuthShellProps = {
    children: ReactNode;
    className?: string;
};
/** Centers auth content (card or panel) on a plain full-height canvas. */
export function AuthShell({ children, className }: AuthShellProps) {
    return (<div className={cn('flex min-h-dvh items-center justify-center bg-background px-5 py-10 sm:px-8', className)}>
      <div className="flex w-full max-w-md flex-col items-center gap-8 lg:max-w-120">
        <SiteLogo size="wordmarkLg" href="/" className="mx-auto"/>
        {children}
      </div>
    </div>);
}
